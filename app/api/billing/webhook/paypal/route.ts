import { NextRequest, NextResponse } from "next/server";
import {
  paypalConfigured,
  retrieveSubscription,
  mapPaypalStatus,
  verifyWebhookSignature,
} from "@/lib/billing/paypal";
import { listSubscriptions, upsertSubscription, upsertCustomerByEmail } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!paypalConfigured()) {
    return NextResponse.json({ error: "PayPal not configured" }, { status: 503 });
  }
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    return NextResponse.json({ error: "PAYPAL_WEBHOOK_ID not configured" }, { status: 503 });
  }

  const raw = await req.text();

  // Convert headers to a plain object for signature verification.
  const headers: Record<string, string> = {};
  req.headers.forEach((v, k) => {
    headers[k.toLowerCase()] = v;
  });

  const ok = await verifyWebhookSignature({ headers, webhookId, rawBody: raw });
  if (!ok) return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });

  let event: { event_type?: string; resource?: { id?: string; status?: string; subscriber?: { email_address?: string }; custom_id?: string } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const type = event.event_type ?? "";
  if (!type.startsWith("BILLING.SUBSCRIPTION.")) {
    return NextResponse.json({ received: true });
  }

  const subId = event.resource?.id;
  if (!subId) return NextResponse.json({ received: true });

  try {
    const sub = await retrieveSubscription(subId);
    const subs = await listSubscriptions();
    const existing = subs.find((s) => s.provider === "paypal" && s.providerSubId === sub.id);

    let customerId = existing?.customerId;
    let planId = existing?.planId ?? event.resource?.custom_id ?? "unknown";

    const subscriberEmail = sub.subscriber?.email_address;
    if (subscriberEmail) {
      const name = [sub.subscriber?.name?.given_name, sub.subscriber?.name?.surname]
        .filter(Boolean)
        .join(" ");
      const customer = await upsertCustomerByEmail({ email: subscriberEmail, name: name || undefined });
      customerId = customer.id;
    }

    if (!customerId) {
      console.warn("paypal-webhook: cannot map subscription to a customer", sub.id);
      return NextResponse.json({ received: true });
    }

    const periodEnd = sub.billing_info?.next_billing_time;
    await upsertSubscription({
      customerId,
      planId,
      provider: "paypal",
      providerSubId: sub.id,
      providerCustomerId: subscriberEmail || undefined,
      status: mapPaypalStatus(sub.status),
      currentPeriodEnd: periodEnd ? new Date(periodEnd).toISOString() : undefined,
    });
  } catch (err) {
    console.error("paypal-webhook processing error", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
