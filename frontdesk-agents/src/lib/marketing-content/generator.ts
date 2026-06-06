/**
 * Marketing Content Generator
 *
 * Orchestrates branded image generation for FrontDesk Agents using muapi-cli.
 * Usage:
 *   npx ts-node --esm src/lib/marketing-content/generator.ts generate --template product-ai-receptionist --platform linkedin
 *   npx ts-node --esm src/lib/marketing-content/generator.ts generate --platform all --category feature
 *   npx ts-node --esm src/lib/marketing-content/generator.ts list-templates
 */

import { BRAND, BRAND_COLORS, PLATFORM_DIMS, type Platform, type ContentCategory, type PromptContext, buildPrompt, buildCaption } from './brand-config'
import { CONTENT_TEMPLATES, getTemplate, getTemplatesByCategory, getAllTemplateIds, type ContentTemplate } from './content-templates'

// ─── Output paths ─────────────────────────────────────────────────────────────

const OUTPUT_DIR = process.env.CONTENT_OUTPUT_DIR ?? './content-output'
const ASSETS_DIR = process.env.CONTENT_ASSETS_DIR ?? './assets/brand'

// ─── muapi model selection ────────────────────────────────────────────────────

/**
 * Model to use per content type. flux-dev = best quality, flux-schnell = fastest.
 */
const MODEL_FOR_TYPE: Record<ContentCategory, string> = {
  product: 'flux-dev',
  testimonial: 'flux-dev',
  feature: 'flux-dev',
  stat: 'flux-dev',
  industry: 'flux-dev',
  comparison: 'flux-dev',
  howto: 'flux-dev',
}

// ─── CLI helpers ──────────────────────────────────────────────────────────────

function log(msg: string) {
  console.log(`[content-gen] ${msg}`)
}

function logStep(step: string, msg: string) {
  console.log(`  ${step.padEnd(12)} ${msg}`)
}

function error(msg: string, err?: unknown) {
  console.error(`[content-gen] ERROR: ${msg}`)
  if (err instanceof Error) console.error(`  → ${err.message}`)
}

function ensureOutputDir() {
  const { execSync } = require('child_process')
  try {
    execSync(`mkdir -p "${OUTPUT_DIR}"`, { stdio: 'ignore' })
  } catch {
    // cross-platform fallback
    const fs = require('fs')
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }
}

// ─── muapi wrapper ────────────────────────────────────────────────────────────

interface GenerationResult {
  requestId: string
  outputs: string[]
  status: 'success' | 'pending' | 'failed'
}

/**
 * Generate an image using muapi-cli.
 * Returns the output URLs or throws on failure.
 */
async function generateImage(
  prompt: string,
  model: string,
  outputPath?: string
): Promise<GenerationResult> {
  const { execSync } = require('child_process')

  logStep('MODEL', model)
  logStep('PROMPT', prompt.slice(0, 80) + (prompt.length > 80 ? '...' : ''))

  const outFile = outputPath ? ` > "${outputPath}"` : ''
  const cmd = `muapi image generate "${prompt.replace(/"/g, '\\"')}" --model ${model} --output-json${outFile}`.trim()

  try {
    const raw = execSync(cmd, { encoding: 'utf-8', timeout: 60_000 })
    const parsed = JSON.parse(raw)

    const result: GenerationResult = {
      requestId: parsed.request_id ?? parsed.id ?? '',
      outputs: Array.isArray(parsed.outputs) ? parsed.outputs : [],
      status: parsed.status ?? 'success',
    }

    // If status is pending, poll
    if (result.status === 'pending' && result.requestId) {
      logStep('POLLING', `request ${result.requestId} — waiting...`)
      const waited = await pollResult(result.requestId)
      result.outputs = waited
      result.status = 'success'
    }

    return result
  } catch (err) {
    error('muapi image generate failed', err)
    throw err
  }
}

async function pollResult(requestId: string, maxWaitSec = 120): Promise<string[]> {
  const { execSync } = require('child_process')
  const start = Date.now()
  const interval = 3000

  while (Date.now() - start < maxWaitSec * 1000) {
    try {
      const raw = execSync(
        `muapi predict wait "${requestId}" --output-json`,
        { encoding: 'utf-8', timeout: 30_000 }
      )
      const parsed = JSON.parse(raw)
      if (parsed.status === 'success' || parsed.status === 'completed') {
        return Array.isArray(parsed.outputs) ? parsed.outputs : []
      }
    } catch {
      // still pending
    }
    await new Promise(r => setTimeout(r, interval))
  }

  throw new Error(`Polling timed out after ${maxWaitSec}s for request ${requestId}`)
}

// ─── Single image generation ──────────────────────────────────────────────────

export interface GenerationOptions {
  platform: Platform
  template: ContentTemplate
  contextIndex: number
  modelOverride?: string
  outputDir?: string
}

export interface GenerationOutput {
  templateId: string
  platform: Platform
  outputPath: string
  prompt: string
  caption: string
  requestId: string
  success: boolean
  error?: string
}

export async function generateSingleImage(opts: GenerationOptions): Promise<GenerationOutput> {
  const ctx = opts.template.contexts[opts.contextIndex]
  if (!ctx) throw new Error(`No context at index ${opts.contextIndex} for template ${opts.template.id}`)

  const prompt = buildPrompt({ ...ctx, category: opts.template.category, platform: opts.platform })
  const caption = buildCaption({ ...ctx, category: opts.template.category, platform: opts.platform })
  const model = opts.modelOverride ?? MODEL_FOR_TYPE[opts.template.category]
  const outDir = opts.outputDir ?? OUTPUT_DIR

  const filename = `${opts.template.id}-${opts.platform}-${Date.now()}.png`
  const outputPath = `${outDir}/${filename}`

  ensureOutputDir()

  try {
    log(`\nGenerating ${opts.template.name} → ${opts.platform}`)
    const result = await generateImage(prompt, model)

    // Download if URLs returned
    if (result.outputs.length > 0) {
      await downloadOutput(result.outputs[0], outputPath)
    }

    logStep('DONE', outputPath)

    return {
      templateId: opts.template.id,
      platform: opts.platform,
      outputPath,
      prompt,
      caption,
      requestId: result.requestId,
      success: true,
    }
  } catch (err) {
    error(`Failed to generate ${opts.template.id}/${opts.platform}`)
    return {
      templateId: opts.template.id,
      platform: opts.platform,
      outputPath,
      prompt,
      caption,
      requestId: '',
      success: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

// ─── Download helper ─────────────────────────────────────────────────────────

async function downloadOutput(url: string, destPath: string): Promise<void> {
  const fs = require('fs')
  const path = require('path')

  if (url.startsWith('file://') || url.startsWith('/')) {
    // local file — copy it
    const src = url.replace(/^file:\/\//, '')
    fs.copyFileSync(src, destPath)
    return
  }

  // Download from URL
  const { execSync } = require('child_process')
  try {
    execSync(`curl -L --fail --progress-bar "${url}" -o "${destPath}"`, { stdio: 'inherit', timeout: 60_000 })
  } catch (err) {
    error(`Failed to download ${url}`, err)
    throw err
  }
}

// ─── Batch generation ─────────────────────────────────────────────────────────

export interface BatchOptions {
  templateIds?: string[]
  categories?: ContentCategory[]
  platforms?: Platform[]
  outputDir?: string
  modelOverride?: string
  /** If true, print prompts & captions without calling the API */
  dryRun?: boolean
}

export async function generateBatch(opts: BatchOptions): Promise<GenerationOutput[]> {
  const results: GenerationOutput[] = []

  // Resolve templates
  let templates: ContentTemplate[] = CONTENT_TEMPLATES
  if (opts.templateIds?.length) {
    templates = opts.templateIds.map(id => getTemplate(id)).filter((t): t is ContentTemplate => !!t)
  } else if (opts.categories?.length) {
    templates = opts.categories.flatMap(cat => getTemplatesByCategory(cat))
  }

  if (templates.length === 0) {
    throw new Error('No templates matched the given criteria')
  }

  // Resolve platforms
  const platforms: Platform[] = opts.platforms ?? (['linkedin', 'twitter', 'instagram', 'facebook', 'youtube', 'blog'] as Platform[])

  log(`\nBatch generation: ${templates.length} templates × ${platforms.length} platforms = ${templates.length * platforms.length} images`)

  for (const template of templates) {
    for (const platform of platforms) {
      // Find matching context for this platform, or skip if none
      const ctxIdx = template.contexts.findIndex(c => c.platform === platform)
      if (ctxIdx === -1) continue

      const output = await generateSingleImage({
        platform,
        template,
        contextIndex: ctxIdx,
        modelOverride: opts.modelOverride,
        outputDir: opts.outputDir,
      })
      results.push(output)

      // Brief delay to avoid hammering the API
      await new Promise(r => setTimeout(r, 500))
    }
  }

  return results
}

// ─── CLI entrypoint ───────────────────────────────────────────────────────────

export async function main() {
  const args = process.argv.slice(2)
  if (args.length === 0) {
    printUsage()
    return
  }

  const command = args[0]

  switch (command) {
    case 'list-templates': {
      console.log('\nAvailable content templates:\n')
      for (const t of CONTENT_TEMPLATES) {
        const platforms = [...new Set(t.contexts.map(c => c.platform))].join(', ')
        console.log(`  ${t.id.padEnd(35)} [${t.category}] — ${t.name}`)
        console.log(`    ${t.description}`)
        console.log(`    Platforms: ${platforms}\n`)
      }
      console.log(`\nTotal: ${CONTENT_TEMPLATES.length} templates\n`)
      break
    }

    case 'generate': {
      ensureOutputDir()

      let templateIds: string[] = []
      let categories: ContentCategory[] = []
      let platforms: Platform[] = []
      let modelOverride: string | undefined

      // Parse remaining args
      let outputDir = OUTPUT_DIR
      for (let i = 1; i < args.length; i++) {
        const arg = args[i]
        if (arg === '--template' || arg === '-t') {
          templateIds.push(args[++i])
        } else if (arg === '--platform' || arg === '-p') {
          const p = args[++i] as string
          if (p === 'all') {
            platforms = ['linkedin', 'twitter', 'instagram', 'facebook', 'youtube', 'blog'] as Platform[]
          } else if (PLATFORM_DIMS[p as Platform]) {
            platforms.push(p as Platform)
          }
        } else if (arg === '--category' || arg === '-c') {
          categories.push(args[++i] as ContentCategory)
        } else if (arg === '--model' || arg === '-m') {
          modelOverride = args[++i]
        } else if (arg === '--output-dir' || arg === '-o') {
          outputDir = args[++i]
        } else if (arg === '--dry-run') {
          // handled below via dryRun flag
        }
      }

      // Resolve templates early (needed for both dry-run and actual generation)
      let templates: ContentTemplate[] = CONTENT_TEMPLATES
      if (templateIds.length) {
        templates = templateIds.map(id => getTemplate(id)).filter((t): t is ContentTemplate => !!t)
      } else if (categories.length) {
        templates = categories.flatMap(cat => getTemplatesByCategory(cat))
      }

      if (templates.length === 0) {
        console.error('Error: no templates matched the given criteria')
        process.exit(1)
      }

      // Handle --dry-run: print prompts without generating
      if (args.includes('--dry-run')) {
        console.log('\n── Dry Run Preview ───────────────────────\n')
        for (const tmpl of templates) {
          for (const plat of platforms) {
            const ctxIdx = tmpl.contexts.findIndex((c: typeof tmpl.contexts[0]) => c.platform === plat)
            if (ctxIdx === -1) continue
            const ctx = tmpl.contexts[ctxIdx]
            const prompt = buildPrompt({ ...ctx, category: tmpl.category, platform: plat })
            const caption = buildCaption({ ...ctx, category: tmpl.category, platform: plat })
            const dims = PLATFORM_DIMS[plat]
            console.log(`Template : ${tmpl.id}`)
            console.log(`Platform : ${plat} (${dims.width}×${dims.height})`)
            console.log(`Prompt   : ${prompt.slice(0, 120)}...`)
            console.log(`Caption  : ${caption.slice(0, 80)}...`)
            console.log('')
          }
        }
        console.log(`Dry run complete — no images generated.\n`)
        return
      }

      if (!templateIds.length && !categories.length) {
        console.error('Error: specify --template or --category')
        printUsage()
        process.exit(1)
      }

      const results = await generateBatch({ templateIds, categories, platforms, modelOverride, outputDir })

      // Summary
      const succeeded = results.filter(r => r.success).length
      const failed = results.filter(r => !r.success).length
      console.log(`\n── Generation Summary ──────────────────`)
      console.log(`  Succeeded: ${succeeded}`)
      console.log(`  Failed:    ${failed}`)
      console.log(`  Output:    ${OUTPUT_DIR}\n`)

      if (failed > 0) {
        console.log('Failures:')
        for (const r of results.filter(r => !r.success)) {
          console.log(`  ${r.templateId}/${r.platform}: ${r.error}`)
        }
        process.exit(1)
      }
      break
    }

    case 'caption': {
      // Print caption for a given template+platform without generating
      if (args.length < 3) {
        console.error('Usage: content-gen caption <template-id> <platform>')
        process.exit(1)
      }
      const [, , templateId, platform] = args as [string, string, string, string]
      const template = getTemplate(templateId)
      if (!template) { console.error(`Unknown template: ${templateId}`); process.exit(1) }
      if (!PLATFORM_DIMS[platform as Platform]) { console.error(`Unknown platform: ${platform}`); process.exit(1) }

      const ctxIdx = template.contexts.findIndex(c => c.platform === platform)
      if (ctxIdx === -1) { console.error(`No context for ${platform} in template ${templateId}`); process.exit(1) }

      const ctx = template.contexts[ctxIdx]
      const caption = buildCaption({ ...ctx, category: template.category, platform: platform as Platform })
      console.log(`\n${caption}\n`)
      break
    }

    default:
      printUsage()
  }
}

function printUsage() {
  console.log(`
FrontDesk Agents — Marketing Content Generator
Usage:
  npx ts-node src/lib/marketing-content/generator.ts <command>

Commands:
  list-templates                        List all available content templates
  generate [options]                    Generate images for one or more templates

    --template <id>    (-t)  Specify template ID (repeat for multiple)
    --category <cat>   (-c)  Specify category (repeat for multiple)
    --platform <name>  (-p)  Specify platform: linkedin|twitter|instagram|
                              facebook|youtube|blog  (or 'all')
    --model <model>    (-m)  Override default model (e.g. flux-dev, hidream-fast)
    --output-dir <dir>        Output directory (default: ./content-output)

  caption <template-id> <platform>   Print caption for a template+platform combo

Examples:
  # Generate one template for LinkedIn
  npx ts-node src/lib/marketing-content/generator.ts generate -t product-ai-receptionist -p linkedin

  # Generate all feature templates for all platforms
  npx ts-node src/lib/marketing-content/generator.ts generate -c feature --platform all

  # Generate all templates for Twitter
  npx ts-node src/lib/marketing-content/generator.ts generate --platform twitter

  # Print a caption without generating
  npx ts-node src/lib/marketing-content/generator.ts caption stat-missed-calls linkedin

Environment:
  MUAPI_API_KEY          Your muapi.ai API key (required)
  CONTENT_OUTPUT_DIR     Output directory (default: ./content-output)
  CONTENT_ASSETS_DIR     Brand assets directory (default: ./assets/brand)
`)
}

// Run if executed directly
if (require.main === module) {
  main().catch(err => {
    error('Fatal error', err)
    process.exit(1)
  })
}