/**
 * Legal Document Marketing Image Templates
 *
 * Branded image prompts specifically for legal document marketing campaigns.
 * Designed for use with the MuAPI image generation API via muapi-client.ts.
 */

import type { Platform } from './brand-config'

// ─── Court type visual configurations ─────────────────────────────────────────

export type CourtType = 'family' | 'bankruptcy' | 'ip' | 'immigration'

export interface CourtStyle {
  id: CourtType
  label: string
  color: string        // hex for prompt reference
  badge: string        // CSS class for UI badges
  gradient: string     // Tailwind gradient for cards
  borderColor: string  // Tailwind border color
  icon: string         // textual description for AI prompt
}

export const COURT_STYLES: Record<CourtType, CourtStyle> = {
  family: {
    id: 'family',
    label: 'Family Law',
    color: '#3B82F6',
    badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    gradient: 'from-blue-600/20 to-blue-400/5',
    borderColor: 'border-blue-500/30',
    icon: 'scales of justice with a heart symbol',
  },
  bankruptcy: {
    id: 'bankruptcy',
    label: 'Bankruptcy',
    color: '#F59E0B',
    badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    gradient: 'from-amber-600/20 to-amber-400/5',
    borderColor: 'border-amber-500/30',
    icon: 'shield with dollar sign and upward arrow',
  },
  ip: {
    id: 'ip',
    label: 'IP / Trademark',
    color: '#A855F7',
    badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    gradient: 'from-purple-600/20 to-purple-400/5',
    borderColor: 'border-purple-500/30',
    icon: 'lightning bolt intertwined with a trademark symbol',
  },
  immigration: {
    id: 'immigration',
    label: 'Immigration',
    color: '#10B981',
    badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    gradient: 'from-emerald-600/20 to-emerald-400/5',
    borderColor: 'border-emerald-500/30',
    icon: 'globe with a passport and stars',
  },
}

// ─── Legal marketing image templates ─────────────────────────────────────────

export interface LegalImageTemplate {
  id: string
  name: string
  description: string
  courtType: CourtType
  /** Visual style of the generated image */
  style: 'product-shot' | 'document-mockup' | 'comparison' | 'stat' | 'testimonial' | 'social-proof'
  contexts: Array<{
    platform: Platform
    /** The main headline that will appear as overlay text in the image */
    headline: string
    /** Secondary line below headline */
    subheadline?: string
    /** Body copy (used in prompt, not as overlay) */
    bodyText?: string
    /** CTA badge text */
    ctaText?: string
    /** Whether to include the brand logo */
    includeLogo?: boolean
  }>
  /** Additional instructions appended to the base prompt (e.g. specific visual elements) */
  visualModifiers?: string[]
}

export const LEGAL_IMAGE_TEMPLATES: LegalImageTemplate[] = [
  // ── FAMILY LAW ──────────────────────────────────────────────────────────────

  {
    id: 'legal-family-custody-agreement',
    name: 'Custody Agreement Document',
    description: 'Marketing image for child custody agreement document generation',
    courtType: 'family',
    style: 'document-mockup',
    contexts: [
      {
        platform: 'linkedin',
        headline: 'Custody Agreements, Generated in Minutes',
        subheadline: 'AI drafts custody documents that courts accept — no lawyer visit required.',
        ctaText: 'Generate Free',
        includeLogo: true,
      },
      {
        platform: 'twitter',
        headline: 'Custody docs without the attorney fees',
        subheadline: 'FrontDesk Agents generates court-ready custody agreements automatically.',
        ctaText: 'Try Now',
        includeLogo: true,
      },
      {
        platform: 'instagram',
        headline: 'Custody Agreement, Sorted.',
        subheadline: 'Generate professional custody documents — ready for court.',
        ctaText: 'Learn More',
        includeLogo: true,
      },
    ],
    visualModifiers: [
      'Show a glowing document icon with a family silhouette watermark',
      'Blue (#3B82F6) accent lighting on document edges',
    ],
  },

  {
    id: 'legal-family-divorce-filing',
    name: 'Divorce Filing Assistant',
    description: 'Marketing image for AI-assisted divorce filing document generation',
    courtType: 'family',
    style: 'product-shot',
    contexts: [
      {
        platform: 'linkedin',
        headline: 'Divorce Filing Without the Drama',
        subheadline: 'AI generates completed divorce forms — ready to file, backed by legal precedents.',
        ctaText: 'Start Filing',
        includeLogo: true,
      },
      {
        platform: 'facebook',
        headline: 'Your Divorce Forms, Done Right.',
        subheadline: 'FrontDesk Agents handles the paperwork so you can focus on moving forward.',
        ctaText: 'Get Started',
        includeLogo: true,
      },
    ],
    visualModifiers: [
      'Clean document with a subtle heart-breaking-into-two graphic',
      'Professional blue accent glow',
    ],
  },

  {
    id: 'legal-family-child-support',
    name: 'Child Support Calculator & Forms',
    description: 'Marketing image for child support document generation',
    courtType: 'family',
    style: 'stat',
    contexts: [
      {
        platform: 'linkedin',
        headline: 'Stop Guessing Child Support Amounts',
        subheadline: 'AI calculates support figures and generates the forms — state-compliant.',
        ctaText: 'Calculate Now',
        includeLogo: true,
      },
    ],
    visualModifiers: [
      'Show calculator UI integrated into document mockup',
      'Blue accent with a subtle calculator icon',
    ],
  },

  // ── BANKRUPTCY ──────────────────────────────────────────────────────────────

  {
    id: 'legal-bankruptcy-chapter-13',
    name: 'Chapter 13 Repayment Plan',
    description: 'Marketing image for Chapter 13 bankruptcy document generation',
    courtType: 'bankruptcy',
    style: 'document-mockup',
    contexts: [
      {
        platform: 'linkedin',
        headline: 'Chapter 13 Plans, Without the Attorney',
        subheadline: 'AI generates your repayment plan document — court-filed and state-compliant.',
        ctaText: 'Generate Plan',
        includeLogo: true,
      },
      {
        platform: 'twitter',
        headline: 'Bankruptcy filing without the $5,000 attorney fee',
        subheadline: 'Chapter 13 repayment plan generated in minutes, not weeks.',
        ctaText: 'File Now',
        includeLogo: true,
      },
    ],
    visualModifiers: [
      'Document with amber shield and upward-trending chart icon',
      'Amber (#F59E0B) accent lighting — financial trust colors',
    ],
  },

  {
    id: 'legal-bankruptcy-chapter-7',
    name: 'Chapter 7 Discharge Forms',
    description: 'Marketing image for Chapter 7 bankruptcy document generation',
    courtType: 'bankruptcy',
    style: 'product-shot',
    contexts: [
      {
        platform: 'linkedin',
        headline: 'Chapter 7 Discharge, Simplified',
        subheadline: 'Get your debt discharged — AI handles the legal forms, timeline, and filing.',
        ctaText: 'Start Free',
        includeLogo: true,
      },
    ],
    visualModifiers: [
      'Document mockup with a shield icon and "debt-free" subtle watermark',
      'Amber gradient with a clean financial aesthetic',
    ],
  },

  {
    id: 'legal-bankruptcy-means-test',
    name: 'Means Test Calculator',
    description: 'Marketing image for bankruptcy means test document generation',
    courtType: 'bankruptcy',
    style: 'stat',
    contexts: [
      {
        platform: 'facebook',
        headline: 'Do You Qualify for Chapter 7? Find Out in 60 Seconds.',
        subheadline: 'AI means test calculator + auto-generated filing documents — free.',
        ctaText: 'Take the Test',
        includeLogo: true,
      },
    ],
    visualModifiers: [
      'Calculator UI with checkmark and document icons',
      'Amber color scheme, professional and trustworthy',
    ],
  },

  // ── IP / TRADEMARK ──────────────────────────────────────────────────────────

  {
    id: 'legal-ip-trademark-application',
    name: 'Trademark Registration',
    description: 'Marketing image for trademark registration document generation',
    courtType: 'ip',
    style: 'document-mockup',
    contexts: [
      {
        platform: 'linkedin',
        headline: 'Register Your Trademark — Done Right.',
        subheadline: 'AI generates your trademark application — USPTO-aligned, ready to file.',
        ctaText: 'Register Now',
        includeLogo: true,
      },
      {
        platform: 'twitter',
        headline: 'Trademark registration without the lawyer',
        subheadline: 'FrontDesk Agents generates USPTO-ready trademark applications instantly.',
        ctaText: 'File Now',
        includeLogo: true,
      },
      {
        platform: 'instagram',
        headline: 'Protect Your Brand Identity.',
        subheadline: 'AI trademark registration — fast, accurate, legally sound.',
        ctaText: 'Get Protected',
        includeLogo: true,
      },
    ],
    visualModifiers: [
      'Document with purple lightning bolt and trademark symbol icon',
      'Purple (#A855F7) accent glow — innovation and IP protection colors',
    ],
  },

  {
    id: 'legal-ip-cease-desist',
    name: 'Cease and Desist Generator',
    description: 'Marketing image for cease and desist document generation',
    courtType: 'ip',
    style: 'comparison',
    contexts: [
      {
        platform: 'linkedin',
        headline: 'Stop Infringers With One Click',
        subheadline: 'AI generates a legally-grounded cease and desist letter — ready to send.',
        ctaText: 'Generate Letter',
        includeLogo: true,
      },
    ],
    visualModifiers: [
      'Document with gavel and warning shield icon',
      'Purple accent with authoritative, firm visual tone',
    ],
  },

  {
    id: 'legal-ip-copyright-filing',
    name: 'Copyright Registration',
    description: 'Marketing image for copyright registration document generation',
    courtType: 'ip',
    style: 'product-shot',
    contexts: [
      {
        platform: 'youtube',
        headline: 'Copyright Your Work Before Someone Else Does',
        subheadline: 'AI generates copyright registration documents — for code, content, designs, and more.',
        ctaText: 'Register Copyright',
        includeLogo: true,
      },
    ],
    visualModifiers: [
      'Document with copyright symbol (©) integrated into design',
      'Purple and indigo gradient — creative and protected',
    ],
  },

  // ── IMMIGRATION ─────────────────────────────────────────────────────────────

  {
    id: 'legal-immigration-visa-application',
    name: 'Visa Application Assistant',
    description: 'Marketing image for visa application document generation',
    courtType: 'immigration',
    style: 'document-mockup',
    contexts: [
      {
        platform: 'linkedin',
        headline: 'Visa Applications, Finally Simplified.',
        subheadline: 'AI generates complete visa application packages — error-free, USCIS-aligned.',
        ctaText: 'Apply Now',
        includeLogo: true,
      },
      {
        platform: 'facebook',
        headline: 'Work Visa. Family Visa. Student Visa.',
        subheadline: 'FrontDesk Agents handles the paperwork for all major US visa types.',
        ctaText: 'See Visa Types',
        includeLogo: true,
      },
    ],
    visualModifiers: [
      'Document with globe icon and US flag subtle watermark',
      'Emerald (#10B981) accent — hope, growth, new beginnings',
    ],
  },

  {
    id: 'legal-immigration-green-card',
    name: 'Green Card Application',
    description: 'Marketing image for green card application document generation',
    courtType: 'immigration',
    style: 'social-proof',
    contexts: [
      {
        platform: 'linkedin',
        headline: 'Your Green Card Journey Starts Here.',
        subheadline: 'AI generates complete adjustment of status documents — step by step.',
        ctaText: 'Start Application',
        includeLogo: true,
      },
    ],
    visualModifiers: [
      'Document with green card icon and stars motif',
      'Emerald and deep slate — premium, official, trustworthy',
    ],
  },

  {
    id: 'legal-immigration-deportation-defense',
    name: 'Deportation Defense Letter',
    description: 'Marketing image for immigration defense document generation',
    courtType: 'immigration',
    style: 'testimonial',
    contexts: [
      {
        platform: 'linkedin',
        headline: 'Know Your Rights. Protect Your Family.',
        subheadline: 'AI generates declaration and defense documents — critical when it matters most.',
        ctaText: 'Get Help Now',
        includeLogo: true,
      },
    ],
    visualModifiers: [
      'Document with shield and family icon, empathetic tone',
      'Emerald accent with a protective, supportive visual language',
    ],
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Get all templates for a specific court type.
 */
export function getTemplatesByCourt(court: CourtType): LegalImageTemplate[] {
  return LEGAL_IMAGE_TEMPLATES.filter(t => t.courtType === court)
}

/**
 * Get a specific template by ID.
 */
export function getLegalTemplate(id: string): LegalImageTemplate | undefined {
  return LEGAL_IMAGE_TEMPLATES.find(t => t.id === id)
}

/**
 * Get all template IDs grouped by court type.
 * Useful for batch generation.
 */
export function getTemplatesByCourtGrouped(): Record<CourtType, LegalImageTemplate[]> {
  return {
    family: getTemplatesByCourt('family'),
    bankruptcy: getTemplatesByCourt('bankruptcy'),
    ip: getTemplatesByCourt('ip'),
    immigration: getTemplatesByCourt('immigration'),
  }
}