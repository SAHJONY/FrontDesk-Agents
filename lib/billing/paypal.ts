// PayPal Subscriptions API wrapper. Plans must be pre-created in PayPal — the
// product owner creates a Product, then a Plan per tier, and pastes the plan
// IDs into PAYPAL_PLAN_STARTER / _PROFESSIONAL / _GROWTH env vars.

const ENV = (process.env.PAYPAL_ENVIRONMENT || "live").toLowerCase();
const BASE = ENV === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";

export function paypalConfigured(): boolean {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) return cachedToken.token;
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) throw new Error("PayPal not configured");
  const auth = Buffer.from(`${id}:${secret}`).toString("base64");
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`PayPal auth failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.token;
}

async function paypalFetch<T>(path: string, init: RequestInit): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // leave null
  }
  if (!res.ok) {
    const msg =
      (data as { message?: string; details?: Array<{ description?: string }> } | null)?.message ||
      (data as { details?: Array<{ description?: string }> } | null)?.details?.[0]?.description ||
      `PayPal API ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

type PaypalLink = { href: string; rel: string; method: string };
type PaypalSubscription = {
  id: string;
  status: string;
  links: PaypalLink[];
  plan_id?: string;
  subscriber?: { email_address?: string; name?: { given_name?: string; surname?: string } };
  billing_info?: { next_billing_time?: string };
};

export async function createSubscription(input: {
  planId: string;
  returnUrl: string;
  cancelUrl: string;
  brandName?: string;
  customId?: string;
}): Promise<PaypalSubscription> {
  return paypalFetch<PaypalSubscription>("/v1/billing/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      plan_id: input.planId,
      custom_id: input.customId,
      application_context: {
        brand_name: input.brandName ?? "FrontDesk Agents",
        locale: "en-US",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        return_url: input.returnUrl,
        cancel_url: input.cancelUrl,
      },
    }),
  });
}

export async function retrieveSubscription(subscriptionId: string): Promise<PaypalSubscription> {
  return paypalFetch<PaypalSubscription>(`/v1/billing/subscriptions/${subscriptionId}`, { method: "GET" });
}

export function approvalUrl(sub: PaypalSubscription): string | null {
  return sub.links.find((l) => l.rel === "approve")?.href ?? null;
}

export function mapPaypalStatus(status: string): "active" | "trialing" | "past_due" | "canceled" | "incomplete" {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "active";
    case "APPROVAL_PENDING":
    case "APPROVED":
      return "incomplete";
    case "SUSPENDED":
      return "past_due";
    case "CANCELLED":
    case "EXPIRED":
      return "canceled";
    default:
      return "incomplete";
  }
}

export async function verifyWebhookSignature(input: {
  headers: Record<string, string>;
  webhookId: string;
  rawBody: string;
}): Promise<boolean> {
  try {
    const result = await paypalFetch<{ verification_status: string }>(
      "/v1/notifications/verify-webhook-signature",
      {
        method: "POST",
        body: JSON.stringify({
          auth_algo: input.headers["paypal-auth-algo"],
          cert_url: input.headers["paypal-cert-url"],
          transmission_id: input.headers["paypal-transmission-id"],
          transmission_sig: input.headers["paypal-transmission-sig"],
          transmission_time: input.headers["paypal-transmission-time"],
          webhook_id: input.webhookId,
          webhook_event: JSON.parse(input.rawBody),
        }),
      }
    );
    return result.verification_status === "SUCCESS";
  } catch (err) {
    console.warn("paypal verifyWebhookSignature error", err);
    return false;
  }
}
