import { NextResponse } from "next/server";
import { isOwner } from "@/lib/auth";
import { listBookings, listLeads, listSubscriptions, listCustomers } from "@/lib/store";
import { buildIntelligenceReport } from "@/lib/intelligence";
import { loadSecretOverrides } from "@/lib/secrets";

export const runtime = "nodejs";

// Autonomous Decision Engine — owner-only. Returns a derived business report
// (health, funnel, and prioritized Problem → Impact → Action insights).
export async function GET() {
  await loadSecretOverrides();
  if (!(await isOwner())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [bookings, leads, subscriptions, customers] = await Promise.all([
    listBookings(),
    listLeads(),
    listSubscriptions(),
    listCustomers(),
  ]);

  const report = buildIntelligenceReport({ bookings, leads, subscriptions, customers });
  return NextResponse.json(report);
}
