import { NextResponse } from "next/server";
import { isOwner } from "@/lib/auth";
import { listBookings, listLeads } from "@/lib/store";
import { availableBrains } from "@/lib/receptionist";
import { blandConfigured } from "@/lib/bland";
import { PLANS } from "@/lib/plans";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isOwner())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [bookings, leads] = await Promise.all([listBookings(), listLeads()]);

  // Finances: live signups valued at their chosen plan, demo bookings at avg client value.
  const planPrice = Object.fromEntries(PLANS.map((p) => [p.id, p.price]));
  const mrr = leads.reduce((sum, l) => sum + (l.plan ? planPrice[l.plan] ?? 0 : 0), 0);
  const pipeline = bookings.length * 250 + leads.length * 180;

  return NextResponse.json({
    bookings,
    leads,
    finances: {
      mrr,
      arr: mrr * 12,
      pipeline,
      planPrices: planPrice,
    },
    integrations: {
      brains: availableBrains(),
      bland: blandConfigured(),
    },
    time: new Date().toISOString(),
  });
}
