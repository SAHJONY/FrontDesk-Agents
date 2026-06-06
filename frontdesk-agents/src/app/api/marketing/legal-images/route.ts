/**
 * Legal Marketing Image Generation API
 *
 * REST API route that generates AI-powered marketing images for legal documents.
 * Uses MuAPI's REST API (submit-then-poll pattern) to generate branded images
 * for legal document marketing campaigns.
 *
 * Endpoints:
 *   POST /api/marketing/legal-images          — Generate images
 *   GET  /api/marketing/legal-images/templates — List available templates
 */

import { NextRequest, NextResponse } from 'next/server'
import { createMuAPIClient, type ImageGenerationOptions } from '@/lib/marketing-content/muapi-client'
import {
  LEGAL_IMAGE_TEMPLATES,
  getTemplatesByCourt,
  getLegalTemplate,
  type CourtType,
} from '@/lib/marketing-content/legal-marketing-templates'
import { BRAND_COLORS } from '@/lib/marketing-content/brand-config'
import { getOwnerSession } from '@/lib/owner-session'

export const dynamic = 'force-dynamic'

// ─── Platform dimensions (matches brand-config.ts) ───────────────────────────

const PLATFORM_DIMS: Record<string, { w: number; h: number }> = {
  linkedin: { w: 1200, h: 627 },
  twitter: { w: 1600, h: 900 },
  instagram: { w: 1080, h: 1080 },
  facebook: { w: 1200, h: 628 },
  youtube: { w: 1280, h: 720 },
  blog: { w: 1200, h: 628 },
}

// ─── Court visual styles ──────────────────────────────────────────────────────

const COURT_STYLES: Record<CourtType, { color: string; icon: string }> = {
  family: { color: '#3B82F6', icon: 'scales of justice with a heart symbol' },
  bankruptcy: { color: '#F59E0B', icon: 'shield with dollar sign and upward arrow' },
  ip: { color: '#A855F7', icon: 'lightning bolt intertwined with a trademark symbol' },
  immigration: { color: '#10B981', icon: 'globe with a passport and stars' },
}

// ─── Build image prompt from template ────────────────────────────────────────

function buildLegalImagePrompt(params: {
  templateId: string
  courtType: CourtType
  platform: string
  headline: string
  subheadline?: string
  bodyText?: string
  ctaText?: string
  includeLogo?: boolean
  visualModifiers?: string[]
}): string {
  const { courtType, platform, headline, subheadline, ctaText, visualModifiers } = params
  const dims = PLATFORM_DIMS[platform] ?? { w: 1200, h: 627 }
  const courtStyle = COURT_STYLES[courtType]

  // Build parts array — conditional items use undefined (filtered out later)
  const parts = [
    `Dark slate background (#0F172A), cinematic legal product-shot style`,
    `${courtStyle.icon} rendered in ${courtStyle.color} as a holographic accent element — top-left corner`,
    `Indigo (#${BRAND_COLORS.primary}) key light from upper-left, ${courtStyle.color} rim highlight on right edge`,
    `Soft volumetric glow on accent elements, centered composition`,
    `Ultra-clean layout, generous whitespace, professional SaaS aesthetic`,
    `No busy gradients or cluttered backgrounds — minimalist and premium`,
    `Bold headline: "${headline}"`,
    subheadline ? `Subheadline: "${subheadline}"` : undefined,
    ctaText ? `Call-to-action badge: "${ctaText}"` : undefined,
    `Brand watermark: "FrontDesk Agents AI" in bottom-right corner, subtle and small`,
    `${dims.w}×${dims.h}px aspect ratio`,
    `Professional UI mockup / cinematic product shot style`,
    `High contrast, premium feel`,
    `No text overlay except what is explicitly specified above`,
  ]

  if (visualModifiers?.length) {
    parts.push(...visualModifiers)
  }

  return parts.filter(Boolean).join('. ') + '.'
}

// ─── GET: list templates ──────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  if (action === 'templates') {
    // Return all legal image templates organized by court type
    const courts: CourtType[] = ['family', 'bankruptcy', 'ip', 'immigration']
    const byCourt = courts.reduce((acc, court) => {
      acc[court] = getTemplatesByCourt(court).map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        courtType: t.courtType,
        style: t.style,
        platforms: [...new Set(t.contexts.map(c => c.platform))],
        contextCount: t.contexts.length,
      }))
      return acc
    }, {} as Record<string, unknown>)

    return NextResponse.json({
      success: true,
      templates: byCourt,
      total: LEGAL_IMAGE_TEMPLATES.length,
    })
  }

  if (action === 'balance') {
    // Owner-only: protects MuAPI credit balance from customer visibility
    const session = await getOwnerSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Owner authentication required' }, { status: 401 })
    }
    try {
      const client = createMuAPIClient(process.env.MUAPI_API_KEY ?? '')
      const balance = await client.getBalance()
      return NextResponse.json({ success: true, balance })
    } catch (err) {
      return NextResponse.json(
        { success: false, error: err instanceof Error ? err.message : 'Balance check failed' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({
    success: false,
    error: 'Invalid action. Use ?action=templates or ?action=balance',
  }, { status: 400 })
}

// ─── POST: generate images ────────────────────────────────────────────────────

interface GenerateBody {
  templateId?: string
  courtType?: CourtType
  platform?: string
  platforms?: string[]
  /** Override headline text */
  headline?: string
  /** Override subheadline */
  subheadline?: string
  /** Override CTA text */
  ctaText?: string
  /** Model override (default: flux-dev) */
  model?: string
  /** Custom freeform prompt (bypasses template) */
  prompt?: string
  /** Poll timeout override in seconds */
  timeout?: number
  /** Generate all templates for the court/template */
  batch?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.MUAPI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'MUAPI_API_KEY is not configured' },
        { status: 500 }
      )
    }

    const body: GenerateBody = await request.json()
    const client = createMuAPIClient(apiKey)

    // ── Batch mode: all templates for a court ─────────────────────────────────
    if (body.batch && body.courtType) {
      const templates = getTemplatesByCourt(body.courtType as CourtType)
      if (!templates.length) {
        return NextResponse.json({ success: false, error: `No templates for court: ${body.courtType}` }, { status: 400 })
      }

      const platforms: string[] = body.platforms ?? ['linkedin', 'twitter', 'instagram']
      const results: unknown[] = []
      const errors: string[] = []

      for (const tmpl of templates) {
        for (const ctx of tmpl.contexts) {
          if (!platforms.includes(ctx.platform)) continue

          const prompt = buildLegalImagePrompt({
            templateId: tmpl.id,
            courtType: tmpl.courtType,
            platform: ctx.platform,
            headline: body.headline ?? ctx.headline,
            subheadline: body.subheadline ?? ctx.subheadline,
            ctaText: body.ctaText ?? ctx.ctaText,
            includeLogo: ctx.includeLogo,
            visualModifiers: tmpl.visualModifiers,
          })

          const dims = PLATFORM_DIMS[ctx.platform] ?? { w: 1200, h: 627 }

          try {
            const result = await client.generateImage({
              prompt,
              model: body.model ?? 'flux-dev',
              width: dims.w,
              height: dims.h,
            }, body.timeout ?? 120)
            results.push({ templateId: tmpl.id, platform: ctx.platform, ...result })
          } catch (err) {
            errors.push(`${tmpl.id}/${ctx.platform}: ${err instanceof Error ? err.message : String(err)}`)
          }

          // Brief delay between API calls to avoid hammering
          await new Promise(r => setTimeout(r, 500))
        }
      }

      return NextResponse.json({
        success: errors.length === 0,
        results,
        errors: errors.length ? errors : undefined,
        summary: { total: results.length, failed: errors.length },
      })
    }

    // ── Single template mode ───────────────────────────────────────────────────
    const templateId = body.templateId
    if (!templateId) {
      return NextResponse.json({ success: false, error: 'templateId is required' }, { status: 400 })
    }

    const template = getLegalTemplate(templateId)
    if (!template) {
      return NextResponse.json({ success: false, error: `Unknown template: ${templateId}` }, { status: 404 })
    }

    const platform = body.platform ?? template.contexts[0]?.platform ?? 'linkedin'
    const ctx = template.contexts.find(c => c.platform === platform)
    if (!ctx) {
      return NextResponse.json(
        { success: false, error: `No context for platform ${platform} in template ${templateId}` },
        { status: 400 }
      )
    }

    // Custom prompt takes precedence over template-based prompt
    const prompt = body.prompt
      ?? buildLegalImagePrompt({
        templateId: template.id,
        courtType: template.courtType,
        platform,
        headline: body.headline ?? ctx.headline,
        subheadline: body.subheadline ?? ctx.subheadline,
        ctaText: body.ctaText ?? ctx.ctaText,
        includeLogo: ctx.includeLogo,
        visualModifiers: template.visualModifiers,
      })

    const dims = PLATFORM_DIMS[platform] ?? { w: 1200, h: 627 }

    const result = await client.generateImage({
      prompt,
      model: body.model ?? 'flux-dev',
      width: dims.w,
      height: dims.h,
    }, body.timeout ?? 120)

    return NextResponse.json({
      success: true,
      templateId,
      platform,
      ...result,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Image generation failed'
    console.error('[legal-images API]', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}