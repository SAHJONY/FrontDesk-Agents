import { NextRequest, NextResponse } from "next/server";
import { listBookings, listLeads, listSubscriptions, listCustomers } from "@/lib/store";
import { buildIntelligenceReport } from "@/lib/intelligence";
import { emailDailyOwnerReport, emailConfigured } from "@/lib/email";
import { loadSecretOverrides } from "@/lib/secrets";

export const runtime = "nodejs";

// Daily Owner Report cron. Wired in vercel.json. Vercel Cron attaches
// `Authorization: Bearer ${CRON_SECRET}` when CRON_SECRET is set — we require
// it so the endpoint can't be triggered by anyone who guesses the path.
function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // no secret configured → allow (set CRON_SECRET to lock down)
  const header = req.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await loadSecretOverrides();

  if (!emailConfigured()) {
    return NextResponse.json({ ok: false, reason: "email_not_configured" }, { status: 200 });
  }

  const [bookings, leads, subscriptions, customers] = await Promise.all([
    listBookings(),
    listLeads(),
    listSubscriptions(),
    listCustomers(),
  ]);
  const report = buildIntelligenceReport({ bookings, leads, subscriptions, customers });
  const sent = await emailDailyOwnerReport(report);

  return NextResponse.json({
    ok: sent,
    insights: report.insights.length,
    mrr: report.health.mrr,
    generatedAt: report.generatedAt,
  });
}
