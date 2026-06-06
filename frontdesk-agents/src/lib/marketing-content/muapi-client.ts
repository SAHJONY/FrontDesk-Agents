/**
 * MuAPI REST Client for FrontDesk Agents
 *
 * Native HTTP client using the submit-then-poll pattern.
 * Base URL: https://api.muapi.ai/api/v1
 * Auth: x-api-key header
 *
 * Reference: https://muapi.ai/docs/api-reference
 */

const BASE_URL = 'https://api.muapi.ai/api/v1'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MuAPIJobResult {
  id: string
  status: 'queued' | 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  outputs: string[]
  cost?: {
    amount_usd: number
    amount_credits: number
    bonus_credits_used: number
    refunded: boolean
  }
}

export interface MuAPISubmitResponse {
  request_id: string
  status: string
  cost: {
    amount_usd: number
    amount_credits: number
    bonus_credits_used: number
    refunded: boolean
  }
}

export interface ImageGenerationOptions {
  prompt: string
  model?: string       // default: 'flux-dev'
  width?: number       // default: 1024
  height?: number      // default: 1024
  seed?: number
  num_inference_steps?: number
  guidance_scale?: number
  /** Override the endpoint path (e.g. 'flux-dev' → '/flux-dev') */
  endpoint?: string
  /** Webhook URL for async callback instead of polling */
  webhook?: string
}

export interface ImageGenerationResult {
  requestId: string
  outputUrls: string[]
  status: string
  costUsd: number
  costCredits: number
  /** Present when a batch item fails */
  error?: string
}

// ─── Client ───────────────────────────────────────────────────────────────────

export class MuAPIClient {
  private apiKey: string
  private defaultModel: string

  constructor(apiKey: string, defaultModel = 'flux-dev') {
    if (!apiKey) throw new Error('MuAPI API key is required')
    this.apiKey = apiKey
    this.defaultModel = defaultModel
  }

  private headers(): Record<string, string> {
    return {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
    }
  }

  // ─── Account ────────────────────────────────────────────────────────────────

  /**
   * Check account credit balance.
   * Returns balance in USD.
   */
  async getBalance(): Promise<number> {
    const res = await fetch(`${BASE_URL}/account/balance`, {
      headers: this.headers(),
    })
    if (!res.ok) throw new Error(`Balance check failed: ${res.status} ${res.statusText}`)
    const data = await res.json() as { balance?: number; amount_usd?: number }
    return data.balance ?? data.amount_usd ?? 0
  }

  // ─── Image Generation (submit) ──────────────────────────────────────────────

  /**
   * Submit an image generation job.
   * Returns the request_id for polling.
   */
  async submitImageGeneration(opts: ImageGenerationOptions): Promise<MuAPISubmitResponse> {
    const model = opts.model ?? this.defaultModel
    const body: Record<string, unknown> = {
      prompt: opts.prompt,
      ...(opts.width && { width: opts.width }),
      ...(opts.height && { height: opts.height }),
      ...(opts.seed && { seed: opts.seed }),
      ...(opts.num_inference_steps && { num_inference_steps: opts.num_inference_steps }),
      ...(opts.guidance_scale && { guidance_scale: opts.guidance_scale }),
    }

    // Endpoint is the model name directly — e.g. "flux-dev-image", "flux-schnell-image"
    // Per MuAPI docs: POST https://api.muapi.ai/api/v1/{model-endpoint}
    const endpoint = opts.endpoint ?? `/${model}`

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Image generation submission failed: ${res.status} — ${text}`)
    }

    return res.json() as Promise<MuAPISubmitResponse>
  }

  // ─── Poll Result ────────────────────────────────────────────────────────────

  /**
   * Poll for job completion.
   * Throws if status is 'failed' or 'cancelled'.
   */
  async pollResult(requestId: string, maxWaitSec = 120): Promise<MuAPIJobResult> {
    const start = Date.now()
    const interval = 3000

    while (Date.now() - start < maxWaitSec * 1000) {
      const res = await fetch(`${BASE_URL}/predictions/${requestId}/result`, {
        headers: this.headers(),
      })

      if (!res.ok) {
        // Non-200 still might have useful body — read it
        const text = await res.text().catch(() => '')
        throw new Error(`Poll failed: ${res.status} — ${text}`)
      }

      const data = await res.json() as MuAPIJobResult

      if (data.status === 'completed') return data
      if (data.status === 'failed' || data.status === 'cancelled') {
        throw new Error(`Job ${requestId} ${data.status}`)
      }

      // still pending/processing — wait and retry
      await new Promise(r => setTimeout(r, interval))
    }

    throw new Error(`Polling timed out after ${maxWaitSec}s for request ${requestId}`)
  }

  // ─── Convenience: generate image and wait ───────────────────────────────────

  /**
   * Submit an image generation job and poll until completion.
   * Returns output URLs and cost info.
   */
  async generateImage(opts: ImageGenerationOptions, maxWaitSec = 120): Promise<ImageGenerationResult> {
    const submitted = await this.submitImageGeneration(opts)

    let result: MuAPIJobResult
    try {
      result = await this.pollResult(submitted.request_id, maxWaitSec)
    } catch (err) {
      // If polling failed with a non-image error, surface it cleanly
      throw new Error(`Image generation failed for prompt "${opts.prompt.slice(0, 60)}...": ${err instanceof Error ? err.message : String(err)}`)
    }

    return {
      requestId: submitted.request_id,
      outputUrls: result.outputs ?? [],
      status: result.status,
      costUsd: result.cost?.amount_usd ?? 0,
      costCredits: result.cost?.amount_credits ?? 0,
    }
  }

  // ─── Legal document marketing images ───────────────────────────────────────

  /**
   * Generate a branded legal marketing image for a specific document type.
   * Returns the image URL and metadata.
   */
  async generateLegalMarketingImage(params: {
    documentType: string
    courtType: 'family' | 'bankruptcy' | 'ip' | 'immigration'
    platform: 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'youtube' | 'blog'
    accentText?: string    // e.g. "Custody Agreement" — overrides the default
    subheadline?: string
  }): Promise<ImageGenerationResult> {
    const { documentType, courtType, platform, accentText, subheadline } = params

    // Platform dimensions
    const dims: Record<string, { w: number; h: number }> = {
      linkedin: { w: 1200, h: 627 },
      twitter: { w: 1600, h: 900 },
      instagram: { w: 1080, h: 1080 },
      facebook: { w: 1200, h: 628 },
      youtube: { w: 1280, h: 720 },
      blog: { w: 1200, h: 628 },
    }
    const { w, h } = dims[platform] ?? { w: 1200, h: 627 }

    // Court-specific visual language
    const courtStyles: Record<string, { color: string; icon: string; label: string }> = {
      family: {
        color: '#3B82F6', // blue
        icon: 'scales of justice',
        label: 'Family Law',
      },
      bankruptcy: {
        color: '#F59E0B', // amber
        icon: 'shield with dollar sign',
        label: 'Bankruptcy',
      },
      ip: {
        color: '#A855F7', // purple
        icon: 'lightning bolt / trademark symbol',
        label: 'IP / Trademark',
      },
      immigration: {
        color: '#10B981', // emerald
        icon: 'globe with passport',
        label: 'Immigration',
      },
    }

    const style = courtStyles[courtType] ?? courtStyles.family

    const prompt = [
      `Dark slate background (#0F172A), cinematic legal product-shot style.`,
      `${style.icon} rendered in ${style.color} as a holographic accent element — top-left corner.`,
      `Indigo (#6366F1) key light from upper-left, emerald (#10B981) rim highlight on right edge.`,
      `Soft volumetric glow on accent elements, centered composition.`,
      `Ultra-clean layout, generous whitespace, professional SaaS aesthetic.`,
      `No busy gradients or cluttered backgrounds — minimalist and premium.`,
      accentText
        ? `Bold headline: "${accentText}"`
        : `Bold headline: "Generate ${documentType.replace(/-/g, ' ')} Documents Instantly"`,
      subheadline
        ? `Subheadline: "${subheadline}"`
        : `Subheadline: "AI-powered legal document generation for ${style.label} cases — courts accepted, professionally formatted."`,
      `Call-to-action badge: "Try Free" in indigo.`,
      `Brand watermark: "FrontDesk Agents AI" in bottom-right corner, subtle.`,
      `${w}×${h}px aspect ratio.`,
      `Professional UI mockup / cinematic product shot style.`,
      `High contrast, premium feel.`,
      `No text overlay except what is specified above.`,
    ].join('. ')

    return this.generateImage({
      prompt,
      model: 'flux-dev',
      width: w,
      height: h,
    })
  }

  // ─── Batch generation ───────────────────────────────────────────────────────

  /**
   * Generate multiple images sequentially with a brief delay between each.
   * Returns all results.
   */
  async generateBatch(
    options: ImageGenerationOptions[],
    delayBetweenMs = 500,
    maxWaitSec = 120
  ): Promise<ImageGenerationResult[]> {
    const results: ImageGenerationResult[] = []
    for (const opts of options) {
      try {
        const result = await this.generateImage(opts, maxWaitSec)
        results.push(result)
      } catch (err) {
        results.push({
          requestId: '',
          outputUrls: [],
          status: 'failed',
          costUsd: 0,
          costCredits: 0,
          error: err instanceof Error ? err.message : String(err),
        })
      }
      if (delayBetweenMs > 0) {
        await new Promise(r => setTimeout(r, delayBetweenMs))
      }
    }
    return results
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

let _client: MuAPIClient | null = null

export function getMuAPIClient(): MuAPIClient {
  if (!_client) {
    const key = process.env.MUAPI_API_KEY
    if (!key) throw new Error('MUAPI_API_KEY environment variable is not set')
    _client = new MuAPIClient(key)
  }
  return _client
}

export function createMuAPIClient(apiKey: string): MuAPIClient {
  return new MuAPIClient(apiKey)
}