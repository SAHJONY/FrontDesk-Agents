import { NextRequest, NextResponse } from "next/server";
import { getPlan } from "@/lib/plans";
import { paypalConfigured, createSubscription, approvalUrl, mapPaypalStatus } from "@/lib/billing/paypal";
import { upsertSubscription, upsertCustomerByEmail } from "@/lib/store";
import { appUrl } from "@/lib/billing/stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!paypalConfigured()) {
    return NextResponse.json(
      { error: "PayPal checkout isn't configured yet. Try Stripe or Square." },
      { status: 503 }
    );
  }

  let body: { planId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const plan = getPlan(String(body.planId ?? ""));
  if (!plan) return NextResponse.json({ error: "Unknown plan" }, { status: 404 });
  if (plan.price === 0) return NextResponse.json({ error: "Free plan does not require checkout" }, { status: 400 });
  if (!plan.providers.paypalPlanId) {
    return NextResponse.json(
      { error: `PayPal plan for the ${plan.name} plan is not configured.` },
      { status: 503 }
    );
  }

  try {
    const base = appUrl();
    const subscription = await createSubscription({
      planId: plan.providers.paypalPlanId,
      brandName: "FrontDesk Agents",
      customId: plan.id, // surfaces back on webhooks
      returnUrl: `${base}/checkout/success?provider=paypal&plan=${plan.id}`,
      cancelUrl: `${base}/checkout/cancel?provider=paypal&plan=${plan.id}`,
    });
    const url = approvalUrl(subscription);
    if (!url) {
      return NextResponse.json({ error: "PayPal did not return an approval URL." }, { status: 502 });
    }

    // We don't yet have the subscriber's email — PayPal collects it after the
    // user approves. Store a placeholder so the webhook can backfill the link.
    const placeholderEmail = `pending+${subscription.id}@paypal.frontdeskagents.local`;
    const customer = await upsertCustomerByEmail({ email: placeholderEmail });
    await upsertSubscription({
      customerId: customer.id,
      planId: plan.id,
      provider: "paypal",
      providerSubId: subscription.id,
      status: mapPaypalStatus(subscription.status),
    });

    return NextResponse.json({ url, subscriptionId: subscription.id });
  } catch (err) {
    console.error("paypal-checkout error", err);
    const message = err instanceof Error ? err.message : "PayPal checkout failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
