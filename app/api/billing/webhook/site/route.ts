import { NextRequest, NextResponse } from "next/server";
import { getSite, setSiteStatus, loadFactorySecrets } from "@/lib/site-store";
import { recordEvent } from "@/lib/store";

export const runtime = "nodejs";

// Website payment-gated delivery webhook (ISOLATED from the subscription webhook
// at /api/billing/webhook/stripe — do not merge them). On payment, the site
// named in Stripe metadata.slug goes LIVE; on failure/cancel it suspends.
// Authenticity: every event is re-fetched from Stripe with the secret key, so
// forged events fail. Optionally gate with ?token=CRON_SECRET|WEBHOOK_TOKEN.
//
// Configure this URL in Stripe for: checkout.session.completed, invoice.paid,
// invoice.payment_failed, customer.subscription.deleted.

async function stripeKey(): Promise<string> {
  if (process.env.STRIPE_SECRET_KEY) return process.env.STRIPE_SECRET_KEY;
  return (await loadFactorySecrets()).STRIPE_SECRET_KEY || "";
}

async function stripeGet(sk: string, path: string): Promise<any> {
  const r = await fetch(`https://api.stripe.com/v1/${path}`, { headers: { Authorization: `Bearer ${sk}` } });
  const j = await r.json();
  return { ok: r.ok, j };
}

async function activate(slug: string, status: "active" | "suspended"): Promise<boolean> {
  const clean = String(slug || "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 60);
  if (!clean) return false;
  const rec = await getSite(clean);
  if (!rec) return false;
  await setSiteStatus(clean, status);
  recordEvent("site:published", { slug: clean, status, via: "payment" });
  return true;
}

export async function POST(req: NextRequest) {
  const gate = process.env.WEBHOOK_TOKEN || process.env.CRON_SECRET;
  if (gate && new URL(req.url).searchParams.get("token") !== gate) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sk = await stripeKey();
  if (!sk) return NextResponse.json({ received: true, note: "Stripe not configured" });

  let event: any = await req.json().catch(() => ({}));

  try {
    if (event?.type === "checkout.session.completed") {
      const id = event.data?.object?.id;
      if (id) {
        const { ok, j: s } = await stripeGet(sk, `checkout/sessions/${encodeURIComponent(id)}`);
        const paid = ok && (s.payment_status === "paid" || s.status === "complete");
        if (paid && s.metadata?.slug) await activate(s.metadata.slug, "active");
      }
    } else if (event?.type === "invoice.paid" || event?.type === "invoice.payment_succeeded") {
      const inv = event.data?.object || {};
      let slug = inv.subscription_details?.metadata?.slug || "";
      if (!slug && inv.subscription) {
        const { ok, j } = await stripeGet(sk, `subscriptions/${encodeURIComponent(inv.subscription)}`);
        slug = (ok && j.metadata?.slug) || "";
      }
      if (slug) await activate(slug, "active");
    } else if (event?.type === "invoice.payment_failed") {
      const inv = event.data?.object || {};
      let slug = inv.subscription_details?.metadata?.slug || "";
      if (!slug && inv.subscription) {
        const { ok, j } = await stripeGet(sk, `subscriptions/${encodeURIComponent(inv.subscription)}`);
        slug = (ok && j.metadata?.slug) || "";
      }
      if (slug) await activate(slug, "suspended");
    } else if (event?.type === "customer.subscription.deleted") {
      const slug = event.data?.object?.metadata?.slug;
      if (slug) await activate(slug, "suspended");
    }
    return NextResponse.json({ received: true });
  } catch (e) {
    // Always 200 so Stripe doesn't retry forever on our errors.
    return NextResponse.json({ received: true, error: e instanceof Error ? e.message : "error" });
  }
}
