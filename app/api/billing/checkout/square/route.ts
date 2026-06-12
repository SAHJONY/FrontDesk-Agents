import { NextRequest, NextResponse } from "next/server";
import { getPlan } from "@/lib/plans";
import { squareConfigured, findOrCreateCustomer, createSubscription, mapSquareStatus } from "@/lib/billing/square";
import { upsertCustomerByEmail, upsertSubscription } from "@/lib/store";
import { appUrl } from "@/lib/billing/stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!squareConfigured()) {
    return NextResponse.json(
      { error: "Square checkout isn't configured yet. Try Stripe or PayPal." },
      { status: 503 }
    );
  }

  let body: { planId?: string; email?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const plan = getPlan(String(body.planId ?? ""));
  if (!plan) return NextResponse.json({ error: "Unknown plan" }, { status: 404 });
  if (plan.price === 0) return NextResponse.json({ error: "Free plan does not require checkout" }, { status: 400 });
  if (!plan.providers.squarePlanId) {
    return NextResponse.json(
      { error: `Square plan for the ${plan.name} plan is not configured.` },
      { status: 503 }
    );
  }

  const email = String(body.email ?? "").trim();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email is required for Square checkout." }, { status: 400 });
  }

  try {
    const squareCustomer = await findOrCreateCustomer(email, body.name);
    const subscription = await createSubscription({
      customerId: squareCustomer.id,
      planVariationId: plan.providers.squarePlanId,
    });

    const customer = await upsertCustomerByEmail({ email, name: body.name });
    await upsertSubscription({
      customerId: customer.id,
      planId: plan.id,
      provider: "square",
      providerSubId: subscription.id,
      providerCustomerId: squareCustomer.id,
      status: mapSquareStatus(subscription.status),
      currentPeriodEnd: subscription.charged_through_date
        ? new Date(subscription.charged_through_date).toISOString()
        : undefined,
    });

    // Square automatically emails the first invoice with a Pay button. There's
    // no hosted Square checkout URL to redirect to, so we send the user to our
    // own success page that explains what happens next.
    return NextResponse.json({
      url: `${appUrl()}/checkout/success?provider=square&plan=${plan.id}&email=${encodeURIComponent(email)}`,
      subscriptionId: subscription.id,
    });
  } catch (err) {
    console.error("square-checkout error", err);
    const message = err instanceof Error ? err.message : "Square checkout failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
