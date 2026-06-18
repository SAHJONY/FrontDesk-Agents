import { NextResponse } from "next/server";
import { customerFromCookies } from "@/lib/customer-auth";
import { getActiveSubscriptionForCustomer, getUsage } from "@/lib/store";
import { getPlan } from "@/lib/plans";

export const runtime = "nodejs";

export async function GET() {
  const customer = await customerFromCookies();
  if (!customer) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const sub = await getActiveSubscriptionForCustomer(customer.id);
  const plan = (sub ? getPlan(sub.planId) : null) ?? getPlan("free");
  const used = await getUsage(customer.id);

  return NextResponse.json({
    customer: { id: customer.id, email: customer.email, name: customer.name, business: customer.business },
    plan: plan ? { id: plan.id, name: plan.name, price: plan.price, cap: plan.monthlyCallCap } : null,
    subscription: sub ? { status: sub.status, provider: sub.provider, renews: sub.currentPeriodEnd } : null,
    usage: { used, cap: plan?.monthlyCallCap ?? 20 },
  });
}
