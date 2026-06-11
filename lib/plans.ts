export type Plan = {
  id: string;
  name: string;
  price: number;
  tagline: string;
  features: string[];
  highlight?: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    tagline: "Try AVA on your own line, forever free",
    features: [
      "20 AI-answered calls / month",
      "24/7 instant answering",
      "Web chat widget",
      "Email summaries",
      "Community support",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: 99,
    tagline: "For solo practices getting started",
    features: [
      "100 AI-answered calls / month",
      "24/7 instant answering",
      "Appointment booking",
      "Email summaries & transcripts",
      "1 business location",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: 299,
    tagline: "The growth engine for busy teams",
    highlight: true,
    features: [
      "500 AI-answered calls / month",
      "Full multi-agent AI suite",
      "Lead qualification & CRM export",
      "50+ languages",
      "SMS confirmations",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 799,
    tagline: "Unlimited scale for multi-location ops",
    features: [
      "Unlimited calls",
      "Custom AI training on your scripts",
      "Multi-location routing",
      "Dedicated account manager",
      "Advanced analytics & API access",
    ],
  },
  {
    id: "ultimate",
    name: "Ultimate",
    price: 1999,
    tagline: "White-label the platform as your own",
    features: [
      "Everything in Enterprise",
      "Full white-label branding",
      "Resell to your own clients",
      "Commercial API license",
      "SLA & onboarding concierge",
    ],
  },
];

export const INDUSTRIES = [
  { icon: "🏥", name: "Healthcare & Medical", blurb: "HIPAA-conscious intake, appointment scheduling, and after-hours triage routing." },
  { icon: "⚖️", name: "Legal & Law Firms", blurb: "Client intake that captures case details and books consultations while you're in court." },
  { icon: "🏠", name: "Real Estate", blurb: "Never miss a buyer — instant property answers and showing bookings, day or night." },
  { icon: "🏨", name: "Hospitality & Hotels", blurb: "Reservations, concierge questions, and upsells handled in the guest's own language." },
  { icon: "🦷", name: "Dental Practices", blurb: "Fill the schedule automatically: recalls, new-patient intake, and reminders." },
  { icon: "🔧", name: "Home Services", blurb: "Emergency dispatch and job booking while your crews stay on the tools." },
  { icon: "🚗", name: "Automotive", blurb: "Service appointments, parts questions, and status updates without hold music." },
  { icon: "🏢", name: "Corporate & Enterprise", blurb: "A flawless front desk for every office, in every timezone, at once." },
];

export const AGENTS = [
  { name: "BUFFY", role: "Strategic Orchestrator", desc: "The mastermind. Routes every conversation to the right specialist agent and learns from each interaction." },
  { name: "HERMES", role: "Communications Engine", desc: "The AI brain aggregator — drives Claude, OpenAI, and NVIDIA inference simultaneously with sub-2-second response times." },
  { name: "Greeting Agent", role: "First Impressions", desc: "Warm, on-brand welcomes that make every caller feel like your only caller." },
  { name: "Scheduling Agent", role: "Calendar Command", desc: "Books, reschedules, and confirms appointments straight into your calendar." },
  { name: "Information Agent", role: "Instant Answers", desc: "Encyclopedic knowledge of your business: pricing, services, policies, FAQs." },
  { name: "Escalation Agent", role: "Human Handoff", desc: "Detects urgency and routes VIPs or emergencies to your team in seconds." },
  { name: "ARIA", role: "Voice Synthesis", desc: "Natural, human-grade voice on every phone call — powered by the Bland.ai telephony layer." },
  { name: "ATLAS", role: "CRM Sync", desc: "Pushes every lead, transcript, and booking into your CRM the moment a call ends." },
  { name: "NOVA", role: "Lead Qualifier", desc: "Scores intent, budget, and urgency in real time so your team calls the hottest leads first." },
  { name: "SAGE", role: "Knowledge Base", desc: "Continuously learns your documents, menus, and policies to keep answers perfectly current." },
  { name: "ECHO", role: "Follow-Up & SMS", desc: "Automatic confirmations, reminders, and re-engagement texts that slash no-shows." },
  { name: "ORION", role: "Analytics Intelligence", desc: "Turns every conversation into dashboards: conversion rates, peak hours, revenue per call." },
  { name: "LUNA", role: "Multilingual Mastery", desc: "Detects the caller's language mid-sentence and switches across 50+ languages flawlessly." },
  { name: "TITAN", role: "Billing & Payments", desc: "Quotes prices, takes deposits, and reconciles payments without a human touching a keypad." },
  { name: "IRIS", role: "Sentiment Radar", desc: "Reads caller emotion live and adapts tone — or escalates — before frustration ever builds." },
  { name: "PULSE", role: "Emergency Dispatch", desc: "Recognizes true emergencies instantly and triggers your on-call protocol in seconds." },
];
