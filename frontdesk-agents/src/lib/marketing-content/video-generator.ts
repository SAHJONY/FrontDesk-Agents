/**
 * Video Demo Generator for FrontDesk Agents AI
 *
 * Orchestrates AI receptionist showcase video generation using muapi-cli.
 * Takes a scenario (storyboard) → generates scene images → animates with i2v →
 * assembles into final video → outputs with caption.
 *
 * Usage:
 *   npx ts-node --esm src/lib/marketing-content/video-generator.ts generate --scenario demo-inbound-call
 *   npx ts-node --esm src/lib/marketing-content/video-generator.ts list-scenarios
 *   npx ts-node --esm src/lib/marketing-content/video-generator.ts generate --scenario demo-ugc-style --platform tiktok
 *   npx ts-node --esm src/lib/marketing-content/video-generator.ts dry-run --scenario demo-analytics
 */

import {
  VIDEO_SCENARIOS,
  getScenario,
  recommendedModel,
  platformAspectRatio,
  type VideoScenario,
  type VideoScene,
} from './video-scenarios'

// ─── Output paths ─────────────────────────────────────────────────────────────

const OUTPUT_DIR = process.env.VIDEO_OUTPUT_DIR ?? './video-output'
const ASSETS_DIR  = process.env.CONTENT_ASSETS_DIR  ?? './assets/brand'
const TEMP_DIR    = process.env.VIDEO_TEMP_DIR       ?? './video-temp'

// ─── Model defaults ───────────────────────────────────────────────────────────

const DEFAULT_IMAGE_MODEL = 'flux-dev'
const DEFAULT_VIDEO_MODEL = 'kling-v3.0-pro'

// ─── CLI helpers ──────────────────────────────────────────────────────────────

function log(msg: string) { console.log(`[video-gen] ${msg}`) }
function logStep(step: string, msg: string) { console.log(`  ${step.padEnd(10)} ${msg}`) }
function error(msg: string, err?: unknown) {
  console.error(`[video-gen] ERROR: ${msg}`)
  if (err instanceof Error) console.error(`  → ${err.message}`)
}

function ensureDir(dir: string) {
  const fs = require('fs')
  fs.mkdirSync(dir, { recursive: true })
}

// ─── muapi CLI wrapper ────────────────────────────────────────────────────────

function execMuapi(cmd: string, timeoutMs = 90_000): string {
  const { execSync } = require('child_process')
  try {
    return execSync(cmd, { encoding: 'utf-8', timeout: timeoutMs }) as string
  } catch (err) {
    error(`muapi command failed: ${cmd.slice(0, 80)}...`, err)
    throw err
  }
}

async function pollUntilDone(requestId: string, maxWaitSec = 180): Promise<string[]> {
  const start = Date.now()
  const interval = 4000

  while (Date.now() - start < maxWaitSec * 1000) {
    try {
      const raw = execMuapi(`muapi predict wait "${requestId}" --output-json`)
      const parsed = JSON.parse(raw)
      if (parsed.status === 'success' || parsed.status === 'completed') {
        return Array.isArray(parsed.outputs) ? parsed.outputs : []
      }
    } catch {
      // still pending
    }
    await new Promise(r => setTimeout(r, interval))
    logStep('WAIT', `${Math.round((Date.now() - start) / 1000)}s — still processing...`)
  }
  throw new Error(`Timed out after ${maxWaitSec}s for request ${requestId}`)
}

// ─── Image generation (keyframe for i2v) ─────────────────────────────────────

async function generateSceneImage(prompt: string, outputPath: string): Promise<string> {
  ensureDir(OUTPUT_DIR)
  const safePrompt = prompt.replace(/"/g, '\\"')
  const jsonPath = `${outputPath}.json`

  // Try JSON mode first (stdout capture won't work in cross-platform exec — write to file)
  let imgUrl: string | null = null
  try {
    const cmd = `muapi image generate "${safePrompt}" --model ${DEFAULT_IMAGE_MODEL} --output-json`
    logStep('IMG', prompt.slice(0, 70) + (prompt.length > 70 ? '...' : ''))
    const raw = execMuapi(cmd, 60_000)
    const parsed = JSON.parse(raw)
    imgUrl = parsed?.outputs?.[0] ?? null
  } catch {
    // Fallback: parse JSON from a redirected output file if muapi wrote one
    try {
      const fallback = JSON.parse(require('fs').readFileSync(jsonPath, 'utf-8'))
      imgUrl = fallback?.outputs?.[0] ?? null
    } catch {
      // last resort: scan the output dir for the most recent image
    }
  }

  if (imgUrl) {
    await downloadFile(imgUrl, outputPath)
  }

  // If download failed or URL was empty, scan temp dir for the latest image
  if (!require('fs').existsSync(outputPath)) {
    const fs = require('fs')
    const files = (fs.readdirSync(TEMP_DIR) as string[])
      .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
      .map(f => ({ f, t: fs.statSync(`${TEMP_DIR}/${f}`).mtimeMs }))
      .sort((a, b) => b.t - a.t)
    if (files.length > 0) {
      fs.copyFileSync(`${TEMP_DIR}/${files[0].f}`, outputPath)
    }
  }

  return outputPath
}

// ─── Video clip generation ────────────────────────────────────────────────────

async function generateVideoClip(
  prompt: string,
  options: {
    model?: string
    duration?: number
    aspectRatio?: string
    startImagePath?: string
    outputPath?: string
  } = {}
): Promise<{ requestId: string; outputPath: string }> {
  const model = options.model ?? DEFAULT_VIDEO_MODEL
  const duration = options.duration ?? 5
  const ar = options.aspectRatio ?? '16:9'
  const safePrompt = prompt.replace(/"/g, '\\"')

  let cmd: string
  if (options.startImagePath) {
    const imgPath = options.startImagePath.replace(/\\/g, '/')
    cmd = `muapi video from-image "${imgPath}" "${safePrompt}" --model ${model} --duration ${duration} --aspect ${ar} --output-json --no-wait`
  } else {
    cmd = `muapi video generate "${safePrompt}" --model ${model} --duration ${duration} --aspect ${ar} --output-json --no-wait`
  }

  logStep('VID', prompt.slice(0, 70) + (prompt.length > 70 ? '...' : ''))
  const raw = execMuapi(cmd, 30_000)
  const parsed = JSON.parse(raw)
  const requestId = parsed.request_id ?? parsed.id ?? ''

  return { requestId, outputPath: options.outputPath ?? `${TEMP_DIR}/${requestId}.mp4` }
}

// ─── Download helper ─────────────────────────────────────────────────────────

async function downloadFile(url: string, destPath: string): Promise<void> {
  if (!url) return
  const fs = require('fs')
  if (url.startsWith('file://') || url.startsWith('/')) {
    fs.copyFileSync(url.replace(/^file:\/\//, ''), destPath)
    return
  }
  execMuapi(`curl -L --fail --progress-bar "${url}" -o "${destPath}"`, 60_000)
}

// ─── Single scene processing ─────────────────────────────────────────────────

export interface SceneResult {
  sceneId: string
  imagePath?: string
  videoPath?: string
  requestId?: string
  success: boolean
  error?: string
}

async function processScene(
  scene: VideoScene,
  scenario: VideoScenario,
  sceneIndex: number,
  opts: { model?: string; platform?: string; timeoutOverride?: number }
): Promise<SceneResult> {
  const ar = platformAspectRatio(opts.platform ?? scenario.platform)
  const model = opts.model ?? recommendedModel(scenario)
  const timeout = opts.timeoutOverride ?? 180

  try {
    let imagePath: string | undefined

    if (scene.startImage) {
      imagePath = `${TEMP_DIR}/scene-${String(sceneIndex).padStart(3,'0')}-img.png`
      await generateSceneImage(scene.visualPrompt, imagePath)
      logStep('I2V', `animating keyframe for scene ${scene.id}`)
    }

    const videoOutputPath = `${TEMP_DIR}/scene-${String(sceneIndex).padStart(3,'0')}-vid.mp4`
    const { requestId } = await generateVideoClip(scene.visualPrompt, {
      model,
      duration: scene.durationSec,
      aspectRatio: ar,
      startImagePath: imagePath,
      outputPath: videoOutputPath,
    })

    logStep('WAIT', `polling scene ${scene.id} (${scene.durationSec}s @ ${ar})...`)
    const outputs = await pollUntilDone(requestId, timeout)

    if (!outputs[0]) throw new Error(`No output URL returned after polling`)

    await downloadFile(outputs[0], videoOutputPath)

    return { sceneId: scene.id, imagePath, videoPath: videoOutputPath, requestId, success: true }
  } catch (err) {
    error(`Scene ${scene.id} failed`)
    return {
      sceneId: scene.id,
      success: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

// ─── FFmpeg assembly ─────────────────────────────────────────────────────────

/**
 * Assemble video clips using ffmpeg concat.
 *
 * NOTE: Transitions defined in the storyboard (cut/dissolve/fade) are informational
 * only. This concat implementation uses ffmpeg's concat demuxer which performs
 * stream-copy concatenation — no filter chain, no dissolve/fade effects. All scenes
 * are joined with hard cuts. To support real transitions, this would need to be
 * rebuilt with ffmpeg's xfade filter and per-scene duration accounting.
 */
async function assembleClips(clips: string[], outputPath: string, totalDuration: number): Promise<void> {
  const fs = require('fs')

  if (clips.length === 0) throw new Error('No clips to assemble')
  if (clips.length === 1) {
    fs.copyFileSync(clips[0], outputPath)
    return
  }

  const listPath = `${TEMP_DIR}/concat-list.txt`
  const listContent = clips.map(c => `file '${c.replace(/\\/g, '/')}'`).join('\n')
  fs.writeFileSync(listPath, listContent)

  logStep('FFMPEG', `concatenating ${clips.length} clips...`)
  try {
    execMuapi(
      `ffmpeg -y -f concat -safe 0 -i "${listPath}" -c:v libx264 -crf 23 -preset fast -c:a copy "${outputPath}"`,
      Math.max(60_000, totalDuration * 100)
    )
  } catch (err) {
    error('ffmpeg concat failed — outputting first clip', err)
    fs.copyFileSync(clips[0], outputPath)
  }
}

// ─── Full scenario generation ────────────────────────────────────────────────

export interface VideoGenerationOptions {
  scenarioId: string
  platform?: string
  modelOverride?: string
  outputDir?: string
  /** If true, generate clips but skip ffmpeg assembly */
  skipAssembly?: boolean
  /** Override poll timeout in seconds (default: 180) */
  timeoutOverride?: number
}

export interface VideoGenerationResult {
  scenarioId: string
  platform: string
  videoPath?: string
  clips: SceneResult[]
  totalDuration: number
  success: boolean
  error?: string
}

export async function generateVideoDemo(
  opts: VideoGenerationOptions
): Promise<VideoGenerationResult> {
  const scenario = getScenario(opts.scenarioId)
  if (!scenario) throw new Error(`Unknown scenario: ${opts.scenarioId}`)

  const platform   = opts.platform ?? scenario.platform
  const model      = opts.modelOverride ?? recommendedModel(scenario)
  const outDir     = opts.outputDir ?? OUTPUT_DIR
  const timeout    = opts.timeoutOverride ?? 180

  ensureDir(outDir)
  ensureDir(TEMP_DIR)

  log(`\nGenerating "${scenario.name}" for ${platform} using ${model}`)
  log(`  ${scenario.scenes.length} scenes, ~${scenario.totalDuration}s total`)

  const sceneResults: SceneResult[] = []
  const successfulClips: string[] = []

  for (let i = 0; i < scenario.scenes.length; i++) {
    const scene = scenario.scenes[i]
    log(`\nScene ${i + 1}/${scenario.scenes.length} [${scene.id}]`)

    const result = await processScene(scene, scenario, i, { model, platform, timeoutOverride: timeout })
    sceneResults.push(result)

    if (result.success && result.videoPath) {
      successfulClips.push(result.videoPath)
    }

    if (!result.success && result.imagePath) {
      try { require('fs').unlinkSync(result.imagePath) } catch {}
    }

    if (i < scenario.scenes.length - 1) {
      await new Promise(r => setTimeout(r, 1500))
    }
  }

  // Assembly
  let videoPath: string | undefined
  if (!opts.skipAssembly && successfulClips.length > 0) {
    const finalPath = `${outDir}/${scenario.id}-${platform}-${Date.now()}.mp4`
    log('\nAssembling final video...')
    try {
      await assembleClips(successfulClips, finalPath, scenario.totalDuration)
      videoPath = finalPath
      logStep('DONE', finalPath)
    } catch (err) {
      error('Assembly failed', err)
      videoPath = successfulClips[0]
    }
  } else if (successfulClips.length > 0) {
    videoPath = successfulClips[0]
  }

  const succeeded = sceneResults.filter(r => r.success).length
  return {
    scenarioId: opts.scenarioId,
    platform,
    videoPath,
    clips: sceneResults,
    totalDuration: scenario.totalDuration,
    success: sceneResults.every(r => r.success),
    error: succeeded < sceneResults.length ? `${sceneResults.length - succeeded} scene(s) failed` : undefined,
  }
}

// ─── CLI entrypoint ──────────────────────────────────────────────────────────

function printUsage() {
  console.log(`
FrontDesk Agents — AI Receptionist Video Demo Generator
Usage:
  npx ts-node src/lib/marketing-content/video-generator.ts <command>

Commands:
  list-scenarios                          List all available video scenarios
  generate [options]                      Generate a video demo

    --scenario <id>    (-s)  Scenario ID (required)
    --platform <name>  (-p)  Override platform: youtube|tiktok|linkedin|twitter
    --model <model>          Override video model (e.g. kling-v3.0-pro, seedance-2.0-vip)
    --output-dir <dir>       Output directory (default: ./video-output)
    --skip-assembly          Generate clips only, skip ffmpeg assembly
    --timeout <seconds>      Poll timeout (default: 180s, increase for long videos)

  dry-run --scenario <id>    Preview storyboard without generating

Examples:
  npx ts-node src/lib/marketing-content/video-generator.ts generate -s demo-inbound-call
  npx ts-node src/lib/marketing-content/video-generator.ts generate -s demo-ugc-style -p tiktok
  npx ts-node src/lib/marketing-content/video-generator.ts generate -s demo-comparison -p linkedin --timeout 300
  npx ts-node src/lib/marketing-content/video-generator.ts dry-run -s demo-multilingual

Environment:
  MUAPI_API_KEY       Your muapi.ai API key (required)
  VIDEO_OUTPUT_DIR    Output directory (default: ./video-output)
  VIDEO_TEMP_DIR      Temp clip directory (default: ./video-temp)
`)
}

export async function main() {
  const args = process.argv.slice(2)
  if (args.length === 0) { printUsage(); return }

  const command = args[0]

  if (command === 'list-scenarios') {
    console.log('\nAvailable video demo scenarios:\n')
    for (const s of VIDEO_SCENARIOS) {
      const sceneDurs = s.scenes.map(sc => `${sc.durationSec}s`).join(' + ')
      console.log(`  ${s.id.padEnd(28)} [${s.style}] ${s.totalDuration}s — ${s.name}`)
      console.log(`    ${s.description}`)
      console.log(`    Platform: ${s.platform} | Tags: ${s.tags.join(', ')}`)
      console.log(`    Scenes: ${s.scenes.length} × ${sceneDurs}\n`)
    }
    console.log(`Total: ${VIDEO_SCENARIOS.length} scenarios\n`)
    return
  }

  if (command === 'dry-run') {
    let scenarioId: string | undefined
    for (let i = 1; i < args.length; i++) {
      if (args[i] === '--scenario' || args[i] === '-s') scenarioId = args[++i]
    }
    if (!scenarioId) { console.error('Error: --scenario required'); process.exit(1) }
    const scenario = getScenario(scenarioId)
    if (!scenario) { console.error(`Unknown scenario: ${scenarioId}`); process.exit(1) }

    console.log(`\n── Storyboard: ${scenario.name} ──────────────────`)
    console.log(`  ID       : ${scenario.id}`)
    console.log(`  Style    : ${scenario.style} | Platform: ${scenario.platform}`)
    console.log(`  Duration : ~${scenario.totalDuration}s total\n`)

    for (let i = 0; i < scenario.scenes.length; i++) {
      const scene = scenario.scenes[i]
      const ar = platformAspectRatio(scenario.platform)
      console.log(`  Scene ${i + 1} [${scene.id}]`)
      console.log(`    Visual : ${scene.visualPrompt.slice(0, 100)}...`)
      console.log(`    Duration: ${scene.durationSec}s | Transition: ${scene.transition} | i2v: ${scene.startImage ? 'YES' : 'no'}`)
      console.log(`    Model  : ${recommendedModel(scenario)} @ ${ar}\n`)
    }
    console.log(`  → Run: npx ts-node ... video-generator.ts generate -s ${scenario.id}\n`)
    return
  }

  if (command === 'generate') {
    let scenarioId: string | undefined
    let platform: string | undefined
    let modelOverride: string | undefined
    let outputDir = OUTPUT_DIR
    let skipAssembly = false
    let timeoutOverride: number | undefined

    for (let i = 1; i < args.length; i++) {
      const arg = args[i]
      if (arg === '--scenario' || arg === '-s')         { scenarioId = args[++i] }
      else if (arg === '--platform' || arg === '-p')    { platform = args[++i] }
      else if (arg === '--model' || arg === '-m')       { modelOverride = args[++i] }
      else if (arg === '--output-dir')                  { outputDir = args[++i] }
      else if (arg === '--skip-assembly')               { skipAssembly = true }
      else if (arg === '--timeout')                     { timeoutOverride = parseInt(args[++i], 10) }
    }

    if (!scenarioId) {
      console.error('Error: --scenario <id> is required')
      printUsage()
      process.exit(1)
    }

    const result = await generateVideoDemo({ scenarioId, platform, modelOverride, outputDir, skipAssembly, timeoutOverride })

    console.log(`\n── Video Generation Summary ─────────────`)
    console.log(`  Scenario : ${result.scenarioId}`)
    console.log(`  Platform : ${result.platform}`)
    console.log(`  Scenes   : ${result.clips.filter(r => r.success).length}/${result.clips.length} succeeded`)
    if (result.videoPath) console.log(`  Video    : ${result.videoPath}`)
    console.log(`  Duration : ~${result.totalDuration}s\n`)

    if (!result.success) {
      for (const c of result.clips.filter(r => !r.success)) {
        console.log(`  FAILED ${c.sceneId}: ${c.error}`)
      }
      process.exit(1)
    }
    return
  }

  printUsage()
}

// Run directly
if (require.main === module) {
  main().catch(err => { error('Fatal error', err); process.exit(1) })
}