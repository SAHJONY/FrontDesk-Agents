import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { retrieveSubscription, mapSquareStatus } from "@/lib/billing/square";
import { upsertSubscription, listSubscriptions, listCustomers } from "@/lib/store";

export const runtime = "nodejs";

function verify(rawBody: string, signature: string, url: string) {
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  if (!key) return false;
  const payload = `${url}${rawBody}`;
  const expected = createHmac("sha256", key).update(payload).digest("base64");
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

type SquareWebhookEvent = {
  type: string;
  data?: {
    type?: string;
    id?: string;
    object?: { subscription?: { id: string; status: string; charged_through_date?: string; plan_variation_id?: string; customer_id?: string } };
  };
};

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-square-hmacsha256-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const raw = await req.text();
  // Square signs using the full notification URL. Vercel forwards the original
  // path; we rebuild the public URL from request headers.
  const host = req.headers.get("host") ?? "";
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const url = `${proto}://${host}${req.nextUrl.pathname}`;

  if (!verify(raw, signature, url)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: SquareWebhookEvent;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  try {
    if (event.type?.startsWith("subscription.")) {
      const inner = event.data?.object?.subscription;
      const subscriptionId = inner?.id ?? event.data?.id;
      if (!subscriptionId) return NextResponse.json({ ok: true });

      // Refetch authoritative state from Square.
      const sub = await retrieveSubscription(subscriptionId);

      // Look up our existing record to recover customerId / planId without
      // re-deriving them from Square — webhook data may not contain them.
      const subs = await listSubscriptions();
      const existing = subs.find((s) => s.provider === "square" && s.providerSubId === sub.id);
      if (!existing) {
        // No local record yet. Try to map by Square customer id → email → our customer.
        const customers = await listCustomers();
        const inner = event.data?.object?.subscription;
        const squareCustId = inner?.customer_id;
        const match = squareCustId
          ? customers.find((c) => c.id === squareCustId) // unlikely; our ids ≠ Square's
          : undefined;
        if (!match) {
          console.warn("square-webhook: no local subscription found for", sub.id);
          return NextResponse.json({ ok: true });
        }
        await upsertSubscription({
          customerId: match.id,
          planId: "unknown",
          provider: "square",
          providerSubId: sub.id,
          status: mapSquareStatus(sub.status),
          currentPeriodEnd: sub.charged_through_date ? new Date(sub.charged_through_date).toISOString() : undefined,
        });
        return NextResponse.json({ ok: true });
      }

      await upsertSubscription({
        customerId: existing.customerId,
        planId: existing.planId,
        provider: "square",
        providerSubId: sub.id,
        providerCustomerId: existing.providerCustomerId,
        status: mapSquareStatus(sub.status),
        currentPeriodEnd: sub.charged_through_date ? new Date(sub.charged_through_date).toISOString() : undefined,
      });
    }
  } catch (err) {
    console.error("square-webhook processing error", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
