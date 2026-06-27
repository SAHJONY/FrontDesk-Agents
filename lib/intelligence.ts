// Autonomous Decision Engine — derives an owner-facing business report from the
// data the platform already persists (bookings, leads, subscriptions,
// customers). Every number here is computed from real records; nothing is
// synthesized. Each insight follows the mandated Problem → Impact →
// Recommended action → Priority shape so the owner can act without digging.
import { getPlan } from "@/lib/plans";
import type { Booking, Lead, Subscription, Customer } from "@/lib/store";

export type Severity = "opportunity" | "risk" | "healthy";
export type Priority = "high" | "medium" | "low";

export type Insight = {
  id: string;
  severity: Severity;
  title: string;
  problem: string;
  impact: string;
  action: string;
  actionHref?: string;
  priority: Priority;
  /** Monthly recurring dollars at stake, when quantifiable. */
  estValue?: number;
};

export type IntelligenceReport = {
  generatedAt: string;
  health: {
    mrr: number;
    arr: number;
    activeSubscribers: number;
    customers: number;
    leads: number;
    bookings: number;
    newLeads7d: number;
    newLeads7dPrev: number;
    newCustomers7d: number;
    bookings7d: number;
    /** Week-over-week change in combined activity, as a signed percentage. */
    activityWoWPct: number | null;
  };
  funnel: {
    leads: number;
    customers: number;
    paidSubscribers: number;
    leadToCustomerPct: number | null;
    customerToPaidPct: number | null;
  };
  insights: Insight[];
  summary: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function withinDays(iso: string, days: number, now: number): boolean {
  const t = new Date(iso).getTime();
  return Number.isFinite(t) && now - t <= days * DAY_MS;
}

function inWindow(iso: string, startDaysAgo: number, endDaysAgo: number, now: number): boolean {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return false;
  const age = now - t;
  return age > endDaysAgo * DAY_MS && age <= startDaysAgo * DAY_MS;
}

function isLiveSub(s: Subscription): boolean {
  return s.status === "active" || s.status === "trialing";
}

function pct(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return Math.round((numerator / denominator) * 1000) / 10;
}

const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export function buildIntelligenceReport(input: {
  bookings: Booking[];
  leads: Lead[];
  subscriptions: Subscription[];
  customers: Customer[];
  now?: number;
}): IntelligenceReport {
  const now = input.now ?? Date.now();
  const { bookings, leads, subscriptions, customers } = input;

  const liveSubs = subscriptions.filter(isLiveSub);
  const mrr = liveSubs.reduce((sum, s) => sum + (getPlan(s.planId)?.price ?? 0), 0);

  // Week-over-week activity (bookings + leads + new subs).
  const stamp = [
    ...bookings.map((b) => b.createdAt),
    ...leads.map((l) => l.createdAt),
    ...subscriptions.map((s) => s.createdAt),
  ];
  const thisWeek = stamp.filter((iso) => withinDays(iso, 7, now)).length;
  const lastWeek = stamp.filter((iso) => inWindow(iso, 14, 7, now)).length;
  const activityWoWPct = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : null;

  const newLeads7d = leads.filter((l) => withinDays(l.createdAt, 7, now)).length;
  const newLeads7dPrev = leads.filter((l) => inWindow(l.createdAt, 14, 7, now)).length;
  const newCustomers7d = customers.filter((c) => withinDays(c.createdAt, 7, now)).length;
  const bookings7d = bookings.filter((b) => withinDays(b.createdAt, 7, now)).length;

  const paidSubscribers = liveSubs.length;

  // ---- Insight rules (all derived, none fabricated) ------------------------
  const insights: Insight[] = [];

  // Customers with an email matching an active subscription, for fast lookup.
  const paidEmails = new Set(
    liveSubs
      .map((s) => customers.find((c) => c.id === s.customerId)?.email)
      .filter((e): e is string => Boolean(e))
  );

  // 1. High-intent leads: chose a paid plan but never converted to a paid sub.
  const hotLeads = leads.filter((l) => {
    const plan = l.plan ? getPlan(l.plan) : undefined;
    if (!plan || plan.price <= 0) return false;
    const email = l.email?.trim().toLowerCase();
    return !(email && paidEmails.has(email));
  });
  if (hotLeads.length > 0) {
    const potential = hotLeads.reduce((sum, l) => sum + (getPlan(l.plan!)?.price ?? 0), 0);
    insights.push({
      id: "hot-leads-uncontacted",
      severity: "opportunity",
      title: `${hotLeads.length} high-intent lead${hotLeads.length === 1 ? "" : "s"} picked a paid plan but haven't subscribed`,
      problem: "These visitors selected a paid tier yet no active subscription is on file for them.",
      impact: `Up to ${fmt(potential)}/mo (${fmt(potential * 12)}/yr) in unconverted demand sitting in the pipeline.`,
      action: "Work the Leads tab top-down — call or email each within 24h while intent is fresh.",
      actionHref: "/admin",
      priority: "high",
      estValue: potential,
    });
  }

  // 2. Past-due subscriptions — revenue actively leaking.
  const pastDue = subscriptions.filter((s) => s.status === "past_due");
  if (pastDue.length > 0) {
    const atRisk = pastDue.reduce((sum, s) => sum + (getPlan(s.planId)?.price ?? 0), 0);
    insights.push({
      id: "past-due-subs",
      severity: "risk",
      title: `${pastDue.length} subscription${pastDue.length === 1 ? "" : "s"} past due`,
      problem: "Payment failed and the subscription has not recovered.",
      impact: `${fmt(atRisk)}/mo at immediate risk of churn.`,
      action: "Trigger dunning: confirm the processor is retrying and reach out to update the card on file.",
      actionHref: "/admin",
      priority: "high",
      estValue: atRisk,
    });
  }

  // 3. Recent cancellations — churn signal.
  const canceled30d = subscriptions.filter(
    (s) => s.status === "canceled" && withinDays(s.updatedAt, 30, now)
  );
  if (canceled30d.length > 0) {
    const lost = canceled30d.reduce((sum, s) => sum + (getPlan(s.planId)?.price ?? 0), 0);
    insights.push({
      id: "recent-churn",
      severity: "risk",
      title: `${canceled30d.length} cancellation${canceled30d.length === 1 ? "" : "s"} in the last 30 days`,
      problem: "Paying customers left recently — churn erodes the MRR base faster than new sales can refill it.",
      impact: `${fmt(lost)}/mo of recurring revenue lost in the trailing 30 days.`,
      action: "Run win-back outreach and review exit reasons; fix the top recurring complaint.",
      actionHref: "/admin",
      priority: canceled30d.length > 1 ? "high" : "medium",
      estValue: lost,
    });
  }

  // 4. Top-of-funnel stalled — no new leads or bookings in a week.
  if (newLeads7d === 0 && bookings7d === 0 && (leads.length > 0 || bookings.length > 0)) {
    insights.push({
      id: "funnel-stalled",
      severity: "risk",
      title: "No new leads or bookings in the last 7 days",
      problem: "Top-of-funnel demand has gone quiet — the acquisition engine is not feeding the pipeline.",
      impact: "Without fresh leads, MRR growth stalls within one sales cycle.",
      action: "Launch outbound (use the call launcher), publish content, or run a campaign to reopen the funnel.",
      actionHref: "/admin",
      priority: "high",
    });
  }

  // 5. Customers without any active plan — upsell surface.
  const unpaidCustomers = customers.filter((c) => !paidEmails.has(c.email));
  if (unpaidCustomers.length >= 3) {
    insights.push({
      id: "free-customers-upsell",
      severity: "opportunity",
      title: `${unpaidCustomers.length} customers have no active paid plan`,
      problem: "These accounts engaged enough to register but never moved onto a paid tier.",
      impact: `Even a ${pct(10, 100)}% conversion at the ${fmt(getPlan("starter")?.price ?? 399)}/mo Starter tier adds ${fmt(Math.round(unpaidCustomers.length * 0.1) * (getPlan("starter")?.price ?? 399))}/mo.`,
      action: "Send a targeted upgrade nudge highlighting the paid-tier features they're missing.",
      actionHref: "/admin",
      priority: "medium",
    });
  }

  // 6. Momentum callout (positive) — week-over-week acceleration.
  if (activityWoWPct !== null && activityWoWPct >= 20 && thisWeek >= 3) {
    insights.push({
      id: "momentum-up",
      severity: "healthy",
      title: `Activity up ${activityWoWPct}% week over week`,
      problem: "—",
      impact: `${thisWeek} pipeline events this week vs ${lastWeek} last week.`,
      action: "Double down on whatever drove the lift — keep the winning channel funded.",
      priority: "low",
    });
  }

  // 7. No paying customers yet — earliest-stage focus.
  if (paidSubscribers === 0) {
    insights.push({
      id: "no-revenue-yet",
      severity: "opportunity",
      title: "No paying subscribers yet — convert the first one",
      problem: "The platform is live and capturing interest but has not closed a paid subscription.",
      impact: "First revenue validates the offer and unlocks reinvestment in acquisition.",
      action: leads.length > 0
        ? "You already have leads — call the warmest one today and close it manually."
        : "Drive first traffic to the pricing page and the demo to generate leads.",
      actionHref: leads.length > 0 ? "/admin" : "/pricing",
      priority: "high",
    });
  }

  insights.sort((a, b) => {
    const sev = severityRank(a.severity) - severityRank(b.severity);
    if (sev !== 0) return sev;
    const p = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (p !== 0) return p;
    return (b.estValue ?? 0) - (a.estValue ?? 0);
  });

  const report: IntelligenceReport = {
    generatedAt: new Date(now).toISOString(),
    health: {
      mrr,
      arr: mrr * 12,
      activeSubscribers: paidSubscribers,
      customers: customers.length,
      leads: leads.length,
      bookings: bookings.length,
      newLeads7d,
      newLeads7dPrev,
      newCustomers7d,
      bookings7d,
      activityWoWPct,
    },
    funnel: {
      leads: leads.length,
      customers: customers.length,
      paidSubscribers,
      leadToCustomerPct: pct(customers.length, leads.length),
      customerToPaidPct: pct(paidSubscribers, customers.length),
    },
    insights,
    summary: buildSummary({
      mrr,
      newLeads7d,
      bookings7d,
      newCustomers7d,
      paidSubscribers,
      activityWoWPct,
      topInsight: insights[0],
    }),
  };

  return report;
}

function severityRank(s: Severity): number {
  // Risks first (act now), then opportunities (capture upside), then healthy.
  return s === "risk" ? 0 : s === "opportunity" ? 1 : 2;
}

function buildSummary(d: {
  mrr: number;
  newLeads7d: number;
  bookings7d: number;
  newCustomers7d: number;
  paidSubscribers: number;
  activityWoWPct: number | null;
  topInsight?: Insight;
}): string {
  const trend =
    d.activityWoWPct === null
      ? "Not enough history yet to compute a week-over-week trend."
      : d.activityWoWPct >= 0
        ? `Activity is up ${d.activityWoWPct}% versus last week.`
        : `Activity is down ${Math.abs(d.activityWoWPct)}% versus last week.`;
  const base = `MRR is ${fmt(d.mrr)} across ${d.paidSubscribers} paid subscriber${d.paidSubscribers === 1 ? "" : "s"}. In the last 7 days: ${d.newLeads7d} new lead${d.newLeads7d === 1 ? "" : "s"}, ${d.bookings7d} booking${d.bookings7d === 1 ? "" : "s"}, ${d.newCustomers7d} new customer${d.newCustomers7d === 1 ? "" : "s"}. ${trend}`;
  const next = d.topInsight
    ? ` Top priority: ${d.topInsight.title} — ${d.topInsight.action}`
    : " No action items detected — keep feeding the funnel.";
  return base + next;
}

function fmt(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}
