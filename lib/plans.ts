// Pricing reflects what the platform actually delivers today. Tiers are tied
// to provider-side product IDs via env vars; create the product in Stripe /
// Square / PayPal once, then paste the IDs into Vercel.

export type PlanId = "free" | "starter" | "professional" | "growth";

export type ProviderRefs = {
  stripePriceId?: string;
  squarePlanId?: string;
  paypalPlanId?: string;
};

export type Plan = {
  id: PlanId;
  name: string;
  price: number;
  monthlyCallCap: number;
  tagline: string;
  features: string[];
  highlight?: boolean;
  providers: ProviderRefs;
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    monthlyCallCap: 20,
    tagline: "Try AVA on your site, free forever",
    features: [
      "20 AI chats / month",
      "Web chat widget",
      "Email summary on every conversation",
      "English + Spanish",
      "Booking flow with calendar export",
      "Community support",
    ],
    providers: {},
  },
  {
    id: "starter",
    name: "Starter",
    price: 29,
    monthlyCallCap: 200,
    tagline: "For solo operators getting their first wins",
    features: [
      "200 AI chats / month",
      "Web chat widget",
      "Email summary + full transcript",
      "Lead capture form",
      "Branded widget (your colors & logo)",
      "Email support",
    ],
    providers: {
      stripePriceId: process.env.STRIPE_PRICE_STARTER,
      squarePlanId: process.env.SQUARE_PLAN_STARTER,
      paypalPlanId: process.env.PAYPAL_PLAN_STARTER,
    },
  },
  {
    id: "professional",
    name: "Professional",
    price: 79,
    monthlyCallCap: 1000,
    tagline: "For growing practices and busy teams",
    highlight: true,
    features: [
      "1,000 AI chats / month",
      "Everything in Starter",
      "Outbound demo calls (powered by Bland.ai)",
      "Lead-qualification scoring",
      "Webhook export to your tools",
      "Priority email + chat support",
    ],
    providers: {
      stripePriceId: process.env.STRIPE_PRICE_PROFESSIONAL,
      squarePlanId: process.env.SQUARE_PLAN_PROFESSIONAL,
      paypalPlanId: process.env.PAYPAL_PLAN_PROFESSIONAL,
    },
  },
  {
    id: "growth",
    name: "Growth",
    price: 249,
    monthlyCallCap: 5000,
    tagline: "For multi-location ops and agencies",
    features: [
      "5,000 AI chats / month",
      "Everything in Professional",
      "White-label branding",
      "API access (beta)",
      "Dedicated onboarding session",
      "SLA & priority support",
    ],
    providers: {
      stripePriceId: process.env.STRIPE_PRICE_GROWTH,
      squarePlanId: process.env.SQUARE_PLAN_GROWTH,
      paypalPlanId: process.env.PAYPAL_PLAN_GROWTH,
    },
  },
];

export function getPlan(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

export function paidPlans(): Plan[] {
  return PLANS.filter((p) => p.price > 0);
}

// Industry blurbs reflect only what the platform can actually do today: chat
// answering, booking, lead capture, EN/ES. No HIPAA / CRM / SMS claims.
export const INDUSTRIES = [
  { icon: "🦷", name: "Dental Practices", blurb: "After-hours chat that books recalls, new-patient intake, and consults." },
  { icon: "⚖️", name: "Legal & Law Firms", blurb: "Capture case details and book consultations when the office is dark." },
  { icon: "🏠", name: "Real Estate", blurb: "Instant property answers and showing requests, no matter the hour." },
  { icon: "🔧", name: "Home Services", blurb: "Job intake, callback scheduling, and lead capture while crews are on jobs." },
  { icon: "🏨", name: "Hospitality", blurb: "Reservation help and guest questions in English and Spanish." },
  { icon: "🚗", name: "Automotive", blurb: "Service appointment requests and parts questions, 24/7." },
  { icon: "🏥", name: "Medical Offices", blurb: "Non-PHI intake and appointment booking. (No HIPAA tier yet.)" },
  { icon: "🏢", name: "Professional Services", blurb: "Consultation booking and lead qualification for any service business." },
];

// The receptionist engine has four real specialists today. The site lists them
// as such — no mythical agent roster.
export const AGENTS = [
  {
    name: "Greeting Agent",
    role: "First impressions",
    desc: "Warm, on-brand welcomes that route every visitor to the right place.",
  },
  {
    name: "Information Agent",
    role: "Instant answers",
    desc: "Answers questions about your business — pricing, hours, services — in English and Spanish.",
  },
  {
    name: "Scheduling Agent",
    role: "Bookings",
    desc: "Walks the visitor through a slot-filled booking flow and captures the appointment.",
  },
  {
    name: "Escalation Agent",
    role: "Human handoff",
    desc: "Detects when a real person is needed and captures a callback number for your team.",
  },
];
