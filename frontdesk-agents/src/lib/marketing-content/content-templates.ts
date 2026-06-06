/**
 * Pre-built content templates for FrontDesk Agents marketing.
 * Each template is a PromptContext ready for generation.
 */

import type { Platform, ContentCategory } from './brand-config'
import { BRAND } from './brand-config'

export interface ContentTemplate {
  id: string
  name: string
  description: string
  category: ContentCategory
  contexts: Array<{
    platform: Platform
    headline: string
    subheadline?: string
    bodyText?: string
    ctaText?: string
    includeLogo?: boolean
  }>
}

// ─── PRODUCT SHOWCASE ────────────────────────────────────────────────────────

const PRODUCT_SHOWCASE: ContentTemplate = {
  id: 'product-ai-receptionist',
  name: 'AI Receptionist Demo',
  description: 'Show the AI receptionist answering a call with real-time transcription',
  category: 'product',
  contexts: [
    {
      platform: 'linkedin',
      headline: 'Your 24/7 AI Receptionist Never Sleeps',
      subheadline: 'Handles 200+ languages, books appointments, and qualifies leads — while you sleep.',
      ctaText: 'Book a Demo',
      includeLogo: true,
    },
    {
      platform: 'twitter',
      headline: 'AI that actually sounds human',
      subheadline: 'FrontDesk Agents handles calls in 200+ languages with real-time voice AI.',
      ctaText: 'Try Free',
      includeLogo: true,
    },
    {
      platform: 'instagram',
      headline: 'Never Miss Another Call',
      subheadline: 'AI receptionist answering, booking, and qualifying — 24/7.',
      ctaText: 'Learn More',
      includeLogo: true,
    },
  ],
}

// ─── FEATURE ANNOUNCEMENT ────────────────────────────────────────────────────

const FEATURE_MULTI_LANG: ContentTemplate = {
  id: 'feature-multilingual',
  name: '200+ Languages Feature',
  description: 'Announce the multilingual capability across platforms',
  category: 'feature',
  contexts: [
    {
      platform: 'linkedin',
      headline: 'Speak to Clients in 200+ Languages',
      subheadline: 'FrontDesk Agents speaks Spanish, Mandarin, Arabic, French, and 197 more — fluently.',
      ctaText: 'See It In Action',
      includeLogo: true,
    },
    {
      platform: 'youtube',
      headline: 'AI Receptionist in 200+ Languages',
      bodyText: 'Watch FrontDesk Agents handle calls in Spanish, Mandarin, Arabic, French and more — fluently and in real-time.',
      ctaText: 'Watch Demo',
      includeLogo: true,
    },
    {
      platform: 'blog',
      headline: 'Break Language Barriers with AI Receptionists',
      subheadline: 'How multilingual AI is revolutionizing client intake for healthcare, legal, and service businesses.',
      ctaText: 'Read the Guide',
      includeLogo: true,
    },
  ],
}

const FEATURE_ANALYTICS: ContentTemplate = {
  id: 'feature-analytics',
  name: 'AI Analytics Dashboard',
  description: 'Show the owner analytics dashboard with AI decision insights',
  category: 'feature',
  contexts: [
    {
      platform: 'linkedin',
      headline: 'See Every Call. Know Every Opportunity.',
      subheadline: 'AI-powered analytics for your reception — call volumes, sentiment, revenue attribution.',
      ctaText: 'Explore Analytics',
      includeLogo: true,
    },
    {
      platform: 'twitter',
      headline: 'AI that gives you data, not just logs',
      subheadline: 'FrontDesk Agents analytics: see every missed call, every conversion, every dollar.',
      ctaText: 'Start Free',
      includeLogo: true,
    },
  ],
}

// ─── INDUSTRY TEMPLATES ──────────────────────────────────────────────────────

const INDUSTRY_HEALTHCARE: ContentTemplate = {
  id: 'industry-healthcare',
  name: 'Healthcare Industry',
  description: 'HIPAA-compliant patient intake and appointment scheduling',
  category: 'industry',
  contexts: [
    {
      platform: 'linkedin',
      headline: 'Reduce No-Shows by 60% with AI Patient Intake',
      subheadline: 'FrontDesk Agents calls confirm appointments, collects intake forms, and handles cancellations — automatically.',
      ctaText: 'For Healthcare',
      includeLogo: true,
    },
    {
      platform: 'facebook',
      headline: 'Your Patients Can Now Book 24/7',
      subheadline: 'AI receptionist handles appointment requests, insurance verification, and follow-ups — no staff needed.',
      ctaText: 'Get a Demo',
      includeLogo: true,
    },
  ],
}

const INDUSTRY_LEGAL: ContentTemplate = {
  id: 'industry-legal',
  name: 'Legal Industry',
  description: 'Legal intake, case status inquiries, and appointment scheduling for law firms',
  category: 'industry',
  contexts: [
    {
      platform: 'linkedin',
      headline: 'Stop Missing Potential Clients at Night',
      subheadline: 'AI legal intake handles consultations, collects case details, and books intake appointments — 24/7.',
      ctaText: 'For Law Firms',
      includeLogo: true,
    },
    {
      platform: 'twitter',
      headline: 'Legal AI that works nights & weekends',
      subheadline: 'FrontDesk Agents qualifies leads, books consultations, and handles case status calls — no receptionist needed.',
      ctaText: 'Free Trial',
      includeLogo: true,
    },
  ],
}

const INDUSTRY_REAL_ESTATE: ContentTemplate = {
  id: 'industry-realestate',
  name: 'Real Estate Industry',
  description: 'Property inquiries, showing scheduling, and lead qualification',
  category: 'industry',
  contexts: [
    {
      platform: 'linkedin',
      headline: 'Answer Every Property Inquiry in Seconds',
      subheadline: 'AI receptionist schedules showings, qualifies buyers, and captures lead info — while you close deals.',
      ctaText: 'For Real Estate',
      includeLogo: true,
    },
  ],
}

const INDUSTRY_DENTAL: ContentTemplate = {
  id: 'industry-dental',
  name: 'Dental Industry',
  description: 'Appointment booking, recall reminders, and insurance verification',
  category: 'industry',
  contexts: [
    {
      platform: 'facebook',
      headline: 'Fill Your Schedule Without Front Desk Burnout',
      subheadline: 'AI receptionist books appointments, sends recalls, and handles insurance questions — automatically.',
      ctaText: 'Book a Demo',
      includeLogo: true,
    },
  ],
}

// ─── STAT / SOCIAL PROOF ─────────────────────────────────────────────────────

const STAT_MISSED_CALLS: ContentTemplate = {
  id: 'stat-missed-calls',
  name: 'Missed Calls Stat',
  description: 'Industry stat about the cost of missed calls',
  category: 'stat',
  contexts: [
    {
      platform: 'linkedin',
      headline: '62% of callers hang up after waiting 3 minutes',
      subheadline: `That's ${BRAND.name} — never miss a call again.`,
      ctaText: 'Stop Losing Clients',
      includeLogo: true,
    },
    {
      platform: 'twitter',
      headline: '3 minutes. That’s all it takes to lose a client forever.',
      subheadline: 'Most businesses lose 62% of callers who wait longer than 3 minutes. Not anymore.',
      ctaText: 'AI That Answers Instantly',
      includeLogo: true,
    },
  ],
}

const STAT_REVENUE: ContentTemplate = {
  id: 'stat-revenue',
  name: 'Revenue Recovery Stat',
  description: 'How much revenue AI recovers from missed calls',
  category: 'stat',
  contexts: [
    {
      platform: 'linkedin',
      headline: 'The Average Practice Loses $120K/Year to Missed Calls',
      subheadline: 'FrontDesk Agents recovers it — answering every call, booking every opportunity.',
      ctaText: 'Calculate Your Loss',
      includeLogo: true,
    },
  ],
}

// ─── COMPARISON ──────────────────────────────────────────────────────────────

const COMPARISON_VS_RECEPTIONIST: ContentTemplate = {
  id: 'comparison-vs-receptionist',
  name: 'vs Traditional Receptionist',
  description: 'AI vs human receptionist comparison visual',
  category: 'comparison',
  contexts: [
    {
      platform: 'linkedin',
      headline: 'AI vs Human Receptionist — The Verdict',
      subheadline: 'AI works 24/7, speaks 200+ languages, costs 80% less, and never takes a sick day.',
      ctaText: 'Compare Plans',
      includeLogo: true,
    },
  ],
}

// ─── TESTIMONIAL ─────────────────────────────────────────────────────────────

const TESTIMONIAL_TEMPLATE: ContentTemplate = {
  id: 'testimonial-generic',
  name: 'Customer Testimonial',
  description: 'Testimonial-style social proof graphic',
  category: 'testimonial',
  contexts: [
    {
      platform: 'linkedin',
      headline: '"Our missed calls dropped by 80% in the first month."',
      subheadline: `— Operations Director, ${BRAND.name} Customer`,
      ctaText: 'Read Case Study',
      includeLogo: true,
    },
    {
      platform: 'twitter',
      headline: '"Best investment we made for our practice."',
      subheadline: '⭐⭐⭐⭐⭐ — Dental Practice Owner',
      ctaText: 'See Reviews',
      includeLogo: true,
    },
  ],
}

// ─── HOW-TO / EDUCATIONAL ─────────────────────────────────────────────────────

const HOWTO_AI_INTAKE: ContentTemplate = {
  id: 'howto-ai-intake',
  name: 'AI Patient Intake Guide',
  description: 'Educational content about AI-powered intake',
  category: 'howto',
  contexts: [
    {
      platform: 'blog',
      headline: 'How to Automate Patient Intake Without Losing the Human Touch',
      subheadline: 'A step-by-step guide to AI-powered intake that patients love and staff actually use.',
      ctaText: 'Download Guide',
      includeLogo: true,
    },
  ],
}

// ─── ALL TEMPLATES ────────────────────────────────────────────────────────────

export const CONTENT_TEMPLATES: ContentTemplate[] = [
  PRODUCT_SHOWCASE,
  FEATURE_MULTI_LANG,
  FEATURE_ANALYTICS,
  INDUSTRY_HEALTHCARE,
  INDUSTRY_LEGAL,
  INDUSTRY_REAL_ESTATE,
  INDUSTRY_DENTAL,
  STAT_MISSED_CALLS,
  STAT_REVENUE,
  COMPARISON_VS_RECEPTIONIST,
  TESTIMONIAL_TEMPLATE,
  HOWTO_AI_INTAKE,
]

export function getTemplate(id: string): ContentTemplate | undefined {
  return CONTENT_TEMPLATES.find(t => t.id === id)
}

export function getTemplatesByCategory(category: ContentCategory): ContentTemplate[] {
  return CONTENT_TEMPLATES.filter(t => t.category === category)
}

export function getAllTemplateIds(): string[] {
  return CONTENT_TEMPLATES.map(t => t.id)
}