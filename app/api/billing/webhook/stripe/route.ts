import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, stripeConfigured } from "@/lib/billing/stripe";
import { upsertCustomerByEmail, upsertSubscription, type SubStatus } from "@/lib/store";

export const runtime = "nodejs";

function mapStatus(status: Stripe.Subscription.Status): SubStatus {
  switch (status) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
      return "canceled";
    default:
      return "incomplete";
  }
}

export async function POST(req: NextRequest) {
  if (!stripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });

  // Raw body is required for signature verification.
  const raw = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, signature, secret);
  } catch (err) {
    console.warn("stripe-webhook signature failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
        if (!subscriptionId) break;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await persistFromSubscription(subscription, session.customer_details?.email ?? null);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await persistFromSubscription(subscription, null);
        break;
      }
      default:
        // Other event types are intentionally ignored.
        break;
    }
  } catch (err) {
    console.error("stripe-webhook processing error", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function persistFromSubscription(subscription: Stripe.Subscription, fallbackEmail: string | null) {
  const planId = subscription.metadata?.planId;
  if (!planId) {
    console.warn("stripe-webhook missing planId metadata on subscription", subscription.id);
    return;
  }

  const stripe = getStripe();
  let email = fallbackEmail;
  let providerCustomerId: string | undefined;
  if (typeof subscription.customer === "string") {
    providerCustomerId = subscription.customer;
    if (!email) {
      const customer = await stripe.customers.retrieve(subscription.customer);
      if (customer && !("deleted" in customer && customer.deleted)) {
        email = (customer as Stripe.Customer).email;
      }
    }
  } else if (subscription.customer && !("deleted" in subscription.customer && subscription.customer.deleted)) {
    providerCustomerId = subscription.customer.id;
    email = (subscription.customer as Stripe.Customer).email ?? email;
  }

  if (!email) {
    console.warn("stripe-webhook could not resolve customer email", subscription.id);
    return;
  }

  const customer = await upsertCustomerByEmail({ email });
  const periodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end;
  await upsertSubscription({
    customerId: customer.id,
    planId,
    provider: "stripe",
    providerSubId: subscription.id,
    providerCustomerId,
    status: mapStatus(subscription.status),
    currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000).toISOString() : undefined,
  });
}
