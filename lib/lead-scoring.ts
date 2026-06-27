// Lead Scoring Engine (v25 core) — deterministic, derived, dependency-free.
// Scores a lead 0-100 across three categories and assigns a priority tier and a
// recommended offer. Pure logic only: NO scraping, NO external calls, NO PII
// collection beyond what the lead already volunteered. Enrichment signals are
// optional — the model degrades gracefully to an industry-informed baseline
// when only the basics are known, so it is safe to run on every existing lead.
//
// Category caps: Digital Need 40 · Business Value 30 · AI Opportunity 30 = 100.

export type LeadTier = "hot" | "qualified" | "marketing" | "cold";

// Optional enrichment signals. None are required; absence = unknown, not zero
// where an industry default is more honest.
export type LeadSignals = {
  hasWebsite?: boolean;
  outdatedWebsite?: boolean;
  poorMobile?: boolean;
  noBookingAutomation?: boolean;
  weakOnlinePresence?: boolean;
  highTicket?: boolean;
  multiLocation?: boolean;
  establishedBusiness?: boolean;
  highCallVolume?: boolean;
  appointmentBased?: boolean;
  afterHoursDemand?: boolean;
};

export type ScoreBreakdown = {
  digitalNeed: number; // 0-40
  businessValue: number; // 0-30
  aiOpportunity: number; // 0-30
};

export type LeadScore = {
  score: number; // 0-100
  tier: LeadTier;
  breakdown: ScoreBreakdown;
  recommendedOffer: string;
  reasons: string[];
  /** True when scoring leaned on industry defaults rather than real signals. */
  inferred: boolean;
};

// Industry profiles: which categories an industry tends to imply when we have
// nothing but the industry label. Keys are matched case-insensitively against
// substrings of the lead's industry/business text.
type IndustryProfile = Partial<Pick<LeadSignals, "highTicket" | "appointmentBased" | "highCallVolume" | "afterHoursDemand" | "multiLocation">>;

const INDUSTRY_PROFILES: { match: string[]; profile: IndustryProfile }[] = [
  { match: ["dental", "dentist", "orthodont"], profile: { appointmentBased: true, highCallVolume: true, highTicket: true } },
  { match: ["legal", "law", "attorney", "lawyer"], profile: { appointmentBased: true, highTicket: true, afterHoursDemand: true } },
  { match: ["medical", "clinic", "doctor", "chiro", "wellness", "med spa", "medspa"], profile: { appointmentBased: true, highCallVolume: true, afterHoursDemand: true } },
  { match: ["plumb", "hvac", "roof", "electric", "construction", "landscap", "pest", "home service", "contractor"], profile: { appointmentBased: true, highCallVolume: true, afterHoursDemand: true, highTicket: true } },
  { match: ["real estate", "realtor", "broker", "property"], profile: { appointmentBased: true, highTicket: true, afterHoursDemand: true } },
  { match: ["auto", "mechanic", "dealership", "repair"], profile: { appointmentBased: true, highCallVolume: true } },
  { match: ["hotel", "hospitality", "restaurant", "salon", "spa"], profile: { appointmentBased: true, highCallVolume: true, afterHoursDemand: true, multiLocation: true } },
  { match: ["insurance", "account", "consult", "financial", "advisor"], profile: { appointmentBased: true, highTicket: true } },
];

function clamp(n: number, max: number): number {
  return Math.max(0, Math.min(max, n));
}

function profileFor(industryText?: string): IndustryProfile {
  if (!industryText) return {};
  const t = industryText.toLowerCase();
  for (const { match, profile } of INDUSTRY_PROFILES) {
    if (match.some((m) => t.includes(m))) return profile;
  }
  return {};
}

export function tierFor(score: number): LeadTier {
  if (score >= 80) return "hot";
  if (score >= 60) return "qualified";
  if (score >= 40) return "marketing";
  return "cold";
}

function offerFor(score: number, s: LeadSignals): string {
  if (score >= 80) return "AI Receptionist + Website (full package)";
  if (score >= 60) return s.hasWebsite === false ? "Professional Website + AI Receptionist" : "AI Receptionist";
  if (score >= 40) return s.hasWebsite === false ? "Professional Website" : "Website Care Plan";
  return "Nurture — content campaign only";
}

export function scoreLead(input: {
  industry?: string;
  business?: string;
  plan?: string;
  signals?: LeadSignals;
}): LeadScore {
  const profile = profileFor(input.industry || input.business);
  const s: LeadSignals = { ...profile, ...input.signals }; // explicit signals win
  const hasRealSignals = Boolean(input.signals && Object.keys(input.signals).length);
  const reasons: string[] = [];

  // ---- Digital Need (cap 40) ----------------------------------------------
  let digitalNeed = 0;
  if (s.hasWebsite === false) {
    digitalNeed += 30;
    reasons.push("No website detected (+30)");
  } else if (s.outdatedWebsite) {
    digitalNeed += 25;
    reasons.push("Outdated website (+25)");
  }
  if (s.poorMobile) {
    digitalNeed += 15;
    reasons.push("Poor mobile experience (+15)");
  }
  if (s.noBookingAutomation) {
    digitalNeed += 15;
    reasons.push("No booking/contact automation (+15)");
  }
  if (s.weakOnlinePresence) {
    digitalNeed += 10;
    reasons.push("Weak online presence (+10)");
  }
  // If a paid plan was already selected, that itself is strong digital intent.
  if (input.plan && input.plan !== "free") {
    digitalNeed += 15;
    reasons.push(`Selected the ${input.plan} plan (+15)`);
  }
  digitalNeed = clamp(digitalNeed, 40);

  // ---- Business Value (cap 30) --------------------------------------------
  let businessValue = 0;
  if (s.highTicket) {
    businessValue += 18;
    reasons.push("High-ticket service (+18)");
  }
  if (s.multiLocation) {
    businessValue += 12;
    reasons.push("Multiple locations (+12)");
  }
  if (s.establishedBusiness) {
    businessValue += 8;
    reasons.push("Established business (+8)");
  }
  businessValue = clamp(businessValue, 30);

  // ---- AI Opportunity (cap 30) --------------------------------------------
  let aiOpportunity = 0;
  if (s.highCallVolume) {
    aiOpportunity += 16;
    reasons.push("High call volume (+16)");
  }
  if (s.appointmentBased) {
    aiOpportunity += 10;
    reasons.push("Appointment-based (+10)");
  }
  if (s.afterHoursDemand) {
    aiOpportunity += 8;
    reasons.push("After-hours opportunity (+8)");
  }
  aiOpportunity = clamp(aiOpportunity, 30);

  const score = clamp(digitalNeed + businessValue + aiOpportunity, 100);
  const tier = tierFor(score);

  if (reasons.length === 0) reasons.push("Insufficient data — baseline score only");

  return {
    score,
    tier,
    breakdown: { digitalNeed, businessValue, aiOpportunity },
    recommendedOffer: offerFor(score, s),
    reasons,
    inferred: !hasRealSignals,
  };
}

export const TIER_META: Record<LeadTier, { label: string; action: string }> = {
  hot: { label: "HOT", action: "Immediate outreach" },
  qualified: { label: "QUALIFIED", action: "Automated nurture" },
  marketing: { label: "MARKETING", action: "Content campaign" },
  cold: { label: "COLD", action: "Do not prioritize" },
};
