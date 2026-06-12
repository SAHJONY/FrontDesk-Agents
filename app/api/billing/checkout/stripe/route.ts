import { NextRequest, NextResponse } from "next/server";
import { getPlan } from "@/lib/plans";
import { getStripe, stripeConfigured, appUrl } from "@/lib/billing/stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!stripeConfigured()) {
    return NextResponse.json(
      { error: "Card checkout isn't configured yet. Try Square or PayPal, or contact support." },
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
  if (!plan.providers.stripePriceId) {
    return NextResponse.json(
      { error: `Stripe price for the ${plan.name} plan is not configured.` },
      { status: 503 }
    );
  }

  try {
    const stripe = getStripe();
    const base = appUrl();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: plan.providers.stripePriceId, quantity: 1 }],
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      customer_creation: "always",
      // Pass the plan id through so the webhook can map the resulting subscription
      // back to one of our four plans without trusting any client-supplied state.
      subscription_data: { metadata: { planId: plan.id } },
      metadata: { planId: plan.id, provider: "stripe" },
      success_url: `${base}/checkout/success?provider=stripe&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/checkout/cancel?provider=stripe&plan=${plan.id}`,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Stripe did not return a checkout URL" }, { status: 502 });
    }
    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("stripe-checkout error", err);
    return NextResponse.json({ error: "Could not start Stripe checkout. Please try again." }, { status: 502 });
  }
}
