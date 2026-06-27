import { NextResponse } from "next/server";
import { isOwner } from "@/lib/auth";
import { listBookings, listLeads, listSubscriptions, listCustomers, type Subscription } from "@/lib/store";
import { hermesStatus } from "@/lib/receptionist";
import { blandConfigured } from "@/lib/bland";
import { stripeConfigured } from "@/lib/billing/stripe";
import { squareConfigured } from "@/lib/billing/square";
import { paypalConfigured } from "@/lib/billing/paypal";
import { siteStoreConfigured } from "@/lib/site-store";
import { placesConfigured } from "@/lib/leads-find";
import { imageConfigured } from "@/lib/site-image";
import { PLANS, getPlan } from "@/lib/plans";
import { loadSecretOverrides } from "@/lib/secrets";

export const runtime = "nodejs";

function dayKey(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function buildSparkline(timestamps: string[], days = 14): { day: string; count: number }[] {
  const buckets = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    buckets.set(dayKey(d), 0);
  }
  for (const iso of timestamps) {
    const key = dayKey(new Date(iso));
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return [...buckets.entries()].map(([day, count]) => ({ day, count }));
}

function isLiveSub(s: Subscription) {
  return s.status === "active" || s.status === "trialing";
}

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

  const liveSubs = subscriptions.filter(isLiveSub);
  const mrr = liveSubs.reduce((sum, s) => sum + (getPlan(s.planId)?.price ?? 0), 0);

  // Per-plan and per-provider breakdowns of live subscribers.
  const subsByPlan = PLANS.filter((p) => p.price > 0).map((p) => {
    const count = liveSubs.filter((s) => s.planId === p.id).length;
    return { planId: p.id, planName: p.name, price: p.price, count, mrr: count * p.price };
  });
  const subsByProvider = (["stripe", "square", "paypal"] as const).map((provider) => ({
    provider,
    count: liveSubs.filter((s) => s.provider === provider).length,
    mrr: liveSubs
      .filter((s) => s.provider === provider)
      .reduce((sum, s) => sum + (getPlan(s.planId)?.price ?? 0), 0),
  }));

  // Activity feed — newest first across bookings + leads + subscription events.
  type Activity = {
    id: string;
    type: "booking" | "lead" | "subscription";
    title: string;
    subtitle: string;
    createdAt: string;
    badge?: string;
  };
  const activity: Activity[] = [];
  for (const b of bookings.slice(0, 50)) {
    activity.push({
      id: `b:${b.id ?? b.createdAt}`,
      type: "booking",
      title: `New booking — ${b.name}`,
      subtitle: `${b.service} · ${b.datetime}`,
      createdAt: b.createdAt,
      badge: "Booking",
    });
  }
  for (const l of leads.slice(0, 50)) {
    activity.push({
      id: `l:${l.id}`,
      type: "lead",
      title: `Lead — ${l.business || l.email || l.phone || "Anonymous"}`,
      subtitle: `${l.industry ? l.industry + " · " : ""}${l.plan ?? l.source}`,
      createdAt: l.createdAt,
      badge: "Lead",
    });
  }
  for (const s of subscriptions.slice(0, 50)) {
    const plan = getPlan(s.planId);
    const customer = customers.find((c) => c.id === s.customerId);
    activity.push({
      id: `s:${s.id}`,
      type: "subscription",
      title: `${plan?.name ?? s.planId} · ${s.provider}`,
      subtitle: `${customer?.email ?? "—"} · ${s.status}`,
      createdAt: s.createdAt,
      badge: s.status === "active" ? "New paid" : s.status,
    });
  }
  activity.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  // 14-day activity sparkline (bookings + leads + subs combined).
  const allTimestamps = [
    ...bookings.map((b) => b.createdAt),
    ...leads.map((l) => l.createdAt),
    ...subscriptions.map((s) => s.createdAt),
  ];
  const sparkline = buildSparkline(allTimestamps, 14);

  return NextResponse.json({
    time: new Date().toISOString(),
    bookings,
    leads,
    subscriptions,
    customers: customers.length,
    finances: {
      mrr,
      arr: mrr * 12,
      activeSubscribers: liveSubs.length,
      subsByPlan,
      subsByProvider,
    },
    activity: activity.slice(0, 25),
    sparkline,
    hermes: hermesStatus(),
    integrations: {
      bland: blandConfigured(),
      stripe: stripeConfigured(),
      square: squareConfigured(),
      paypal: paypalConfigured(),
      websiteHosting: siteStoreConfigured(),
      prospecting: await placesConfigured(),
      imageGen: await imageConfigured(),
    },
  });
}
