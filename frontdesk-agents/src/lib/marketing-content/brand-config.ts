/**
 * Brand configuration for FrontDesk Agents marketing content pipeline.
 * Centralizes all brand identity elements used across content generation.
 */

export const BRAND = {
  name: 'FrontDesk Agents AI',
  shortName: 'FrontDesk Agents',
  tagline: 'AI Receptionists That Never Miss a Call',
  website: 'frontdeskagents.ai',
  email: 'hello@frontdeskagents.ai',
} as const

export const BRAND_COLORS = {
  primary: '#6366F1',      // Indigo - main brand
  primaryDark: '#4F46E5',  // Darker indigo for gradients
  secondary: '#10B981',    // Emerald - success/AI
  accent: '#F59E0B',       // Amber - highlights
  background: '#0F172A',   // Dark slate - app-like feel
  surface: '#1E293B',      // Slightly lighter slate
  text: '#F8FAFC',         // Near white
  textMuted: '#94A3B8',    // Slate gray
  gradient1: '#6366F1',    // Indigo
  gradient2: '#8B5CF6',    // Violet
  gradient3: '#06B6D4',    // Cyan
} as const

export const BRAND_FONTS = {
  heading: 'Inter',
  body: 'Inter',
  mono: 'JetBrains Mono',
} as const

export type Platform = 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'youtube' | 'blog'

export const PLATFORM_DIMS: Record<Platform, { width: number; height: number; label: string }> = {
  linkedin: { width: 1200, height: 627, label: 'LinkedIn Post' },
  twitter: { width: 1600, height: 900, label: 'Twitter/X Post' },
  instagram: { width: 1080, height: 1080, label: 'Instagram Square' },
  facebook: { width: 1200, height: 628, label: 'Facebook Post' },
  youtube: { width: 1280, height: 720, label: 'YouTube Thumbnail' },
  blog: { width: 1200, height: 628, label: 'Blog Header' },
}

export type ContentCategory = 'product' | 'testimonial' | 'feature' | 'stat' | 'industry' | 'comparison' | 'howto'

export const CONTENT_CATEGORIES: { id: ContentCategory; label: string; icon: string }[] = [
  { id: 'product', label: 'Product Showcase', icon: '🤖' },
  { id: 'testimonial', label: 'Customer Testimonial', icon: '💬' },
  { id: 'feature', label: 'Feature Announcement', icon: '⚡' },
  { id: 'stat', label: 'Industry Stat', icon: '📊' },
  { id: 'industry', label: 'Industry Insight', icon: '🏥' },
  { id: 'comparison', label: 'vs Competition', icon: '⚔️' },
  { id: 'howto', label: 'How-To / Educational', icon: '📚' },
]

export interface BrandAsset {
  name: string
  path: string
  description: string
}

/**
 * Local brand assets (logos, product screenshots, etc.)
 * These would be uploaded to CDN before generation.
 */
export const BRAND_ASSETS: BrandAsset[] = [
  {
    name: 'logo-light',
    path: './assets/brand/logo-light.png',
    description: 'FrontDesk Agents logo on light background',
  },
  {
    name: 'logo-dark',
    path: './assets/brand/logo-dark.png',
    description: 'FrontDesk Agents logo on dark background',
  },
  {
    name: 'product-screenshot',
    path: './assets/brand/product-dashboard.png',
    description: 'AI receptionist dashboard screenshot',
  },
]

export interface PromptContext {
  category: ContentCategory
  platform: Platform
  headline: string
  subheadline?: string
  bodyText?: string
  ctaText?: string
  includeLogo?: boolean
  colorScheme?: Partial<typeof BRAND_COLORS>
}

/**
 * Builds a brand-aware generation prompt from a PromptContext.
 * Returns structured data for the muapi image generation call.
 */
export function buildPrompt(ctx: PromptContext): string {
  const platform = PLATFORM_DIMS[ctx.platform]
  const colors = ctx.colorScheme ?? BRAND_COLORS

  const parts: string[] = []

  // Style & composition — drives brand-consistent visuals
  parts.push(`Dark slate background (#0F172A), cinematic product-shot style`)
  parts.push(`Indigo (#${colors.primary}) key light from upper-left, emerald (#${colors.secondary}) rim highlight on right edge`)
  parts.push(`Soft volumetric glow on accent elements, centered composition`)
  parts.push(`Ultra-clean layout, generous whitespace, professional SaaS aesthetic`)
  parts.push(`No busy gradients or cluttered backgrounds — minimalist and premium`)

  // Logo
  if (ctx.includeLogo !== false) {
    parts.push(`Brand logo: FrontDesk Agents AI in top-left corner`)
  }

  // Main content
  if (ctx.headline) {
    parts.push(`Bold headline: "${ctx.headline}"`)
  }
  if (ctx.subheadline) {
    parts.push(`Subheadline: "${ctx.subheadline}"`)
  }
  if (ctx.bodyText) {
    parts.push(`Body text: "${ctx.bodyText}"`)
  }
  if (ctx.ctaText) {
    parts.push(`Call-to-action badge: "${ctx.ctaText}"`)
  }

  // Platform specs
  parts.push(`${platform.width}x${platform.height}px aspect ratio`)
  parts.push(`Professional UI mockup / cinematic product shot style`)
  parts.push(`No text overlay except what is specified above`)
  parts.push(`High contrast, premium feel`)

  return parts.join('. ') + '.'
}

export function buildCaption(ctx: PromptContext): string {
  const tag = BRAND.tagline
  const parts = [ctx.headline ?? '', ctx.bodyText ?? ''].filter(Boolean)
  const body = parts.join('\n\n')
  const cta = ctx.ctaText ?? `Learn more at ${BRAND.website}`
  return `${body}\n\n${cta}\n\n${tag}\n\n#AI #Receptionist #FrontDeskAgents #${capitalize(ctx.category)}`
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}