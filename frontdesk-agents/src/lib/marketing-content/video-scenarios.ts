/**
 * Video demo scenarios for FrontDesk Agents AI receptionist.
 * Each scenario is a storyboard: a sequence of scenes that form a compelling demo video.
 */

export type VideoStyle = 'cinematic' | 'ugc' | 'product' | 'explainer'
export type VideoDuration = 'short' | 'medium' | 'long' // ~5s, ~10s, ~20s

export interface VideoScene {
  /** Scene number within the scenario */
  id: string
  /** Visual description of the scene — passed to the image/video generator */
  visualPrompt: string
  /** What narration/voiceover says during this scene (for captioning) */
  narration?: string
  /** Scene duration in seconds (approximate) */
  durationSec: number
  /** Image-to-video: start from this image. Text-to-video: undefined */
  startImage?: boolean
  /** Transition to next scene */
  transition: 'cut' | 'dissolve' | 'fade'
}

export interface VideoScenario {
  id: string
  name: string
  description: string
  /** One of: 'call-inbound', 'appointment-booking', 'multilingual', 'analytics-dashboard', 'comparison', 'testimonial' */
  type: string
  style: VideoStyle
  /** Total approximate duration in seconds */
  totalDuration: number
  scenes: VideoScene[]
  /** Tags for filtering */
  tags: string[]
  /** Recommended platform (youtube, twitter, linkedin, tiktok) */
  platform: string
  /** CTA text shown in final scene */
  ctaText?: string
}

// ─── SCENARIO 1: Inbound Call Handler ────────────────────────────────────────

const SCENARIO_INBOUND_CALL: VideoScenario = {
  id: 'demo-inbound-call',
  name: "AI Answers When You Can't",
  description: 'Shows an AI receptionist seamlessly handling an inbound call — the phone rings, AI picks up, takes the caller\u2019s info, and books an appointment — all while the business owner is free to focus.',
  type: 'call-inbound',
  style: 'cinematic',
  totalDuration: 18,
  tags: ['product', 'inbound-call', 'appointment', 'ai-voice'],
  platform: 'youtube',
  ctaText: 'Book Your Free Demo',
  scenes: [
    {
      id: 's1-phone-rings',
      visualPrompt: `Dark modern office at night, a smartphone screen glowing with an inbound call notification, the screen shows "Unknown Caller", soft indigo (#6366F1) ambient light from monitor glow, cinematic shallow depth of field, high-end SaaS aesthetic, ultra-clean`,
      durationSec: 2,
      transition: 'cut',
    },
    {
      id: 's2-ai-picks-up',
      visualPrompt: `Cinematic split-screen: left side shows a busy business owner in a meeting unable to answer, right side shows an AI phone agent interface picking up the call with a pulsing waveform, emerald green (#10B981) status indicator, clean dark dashboard aesthetic`,
      durationSec: 3,
      transition: 'dissolve',
    },
    {
      id: 's3-transcription',
      visualPrompt: `AI receptionist dashboard showing real-time call transcription: "Caller: Hi, I'd like to book an appointment for my son." AI response appearing in emerald text: "Of course! What day works best for you?" Dark slate UI with indigo accent highlights, professional SaaS aesthetic, screen capture style`,
      durationSec: 4,
      transition: 'dissolve',
    },
    {
      id: 's4-appointment-booked',
      visualPrompt: `Calendar confirmation screen: "Appointment Booked — Dr. Martinez, Thursday 2pm" with AI-generated confirmation email preview, the business owner's phone shows the notification, indigo gradient glow, clean confirmation dialog`,
      durationSec: 3,
      transition: 'dissolve',
    },
    {
      id: 's5-owner-relief',
      visualPrompt: `Business owner glances at phone, sees the booked appointment notification, smiles and nods, returns to their meeting confidently, warm cinematic lighting, dark modern office, the AI has handled everything seamlessly`,
      durationSec: 4,
      transition: 'fade',
    },
    {
      id: 's6-cta-card',
      visualPrompt: `FrontDesk Agents AI logo on dark slate (#0F172A) background, indigo to emerald gradient subtle glow, tagline "AI Receptionists That Never Miss a Call" in clean white typography, minimal elegant layout, centered composition`,
      durationSec: 2,
      transition: 'cut',
    },
  ],
}

// ─── SCENARIO 2: Multilingual AI ─────────────────────────────────────────────

const SCENARIO_MULTILINGUAL: VideoScenario = {
  id: 'demo-multilingual',
  name: '200+ Languages, One AI',
  description: 'Showcases the multilingual capability — the same AI handles calls in Spanish, Mandarin, and Arabic, showing real-time translation and booking.',
  type: 'multilingual',
  style: 'cinematic',
  totalDuration: 20,
  tags: ['feature', 'multilingual', 'global', 'ai-voice'],
  platform: 'youtube',
  ctaText: 'Try Free for 14 Days',
  scenes: [
    {
      id: 's1-world-map',
      visualPrompt: `Dark cinematic world map visualization with glowing connection lines from a central US hub to Spain, China, Dubai, France, and Brazil, indigo (#6366F1) pulsing nodes at each location, data network aesthetic, global connectivity theme`,
      durationSec: 3,
      transition: 'dissolve',
    },
    {
      id: 's2-spanish-call',
      visualPrompt: `Split screen: left shows caller in Madrid speaking Spanish, right shows FrontDesk Agents AI transcribing and responding in Spanish with real-time translation overlay, emerald/indigo UI elements, professional multilingual call center aesthetic`,
      durationSec: 4,
      transition: 'dissolve',
    },
    {
      id: 's3-mandarin-call',
      visualPrompt: `Split screen: left shows caller in Beijing speaking Mandarin Chinese, right shows AI responding in Mandarin with Chinese character transcription and translation, dark slate UI with cultural authenticity, glowing accent elements`,
      durationSec: 4,
      transition: 'dissolve',
    },
    {
      id: 's4-arabic-call',
      visualPrompt: `Split screen: left shows caller in Dubai speaking Arabic, right shows AI responding in Arabic with RTL text transcription, elegant dark interface with warm amber (#F59E0B) accent highlights showing language diversity`,
      durationSec: 4,
      transition: 'dissolve',
    },
    {
      id: 's5-all-booked',
      visualPrompt: `Business dashboard showing 3 appointments booked from 3 different language calls, each showing the language flag and confirmed time, clean dark UI with emerald confirmation badges, professional global SaaS product shot`,
      durationSec: 3,
      transition: 'fade',
    },
    {
      id: 's6-cta',
      visualPrompt: `FrontDesk Agents AI logo on dark slate background, tagline "Speak to Every Client in Their Language" in clean white, subtle world map glow behind logo, minimal elegant design, indigo accent gradient`,
      durationSec: 2,
      transition: 'cut',
    },
  ],
}

// ─── SCENARIO 3: Analytics Dashboard ────────────────────────────────────────

const SCENARIO_ANALYTICS: VideoScenario = {
  id: 'demo-analytics',
  name: 'See Every Call. Know Every Opportunity.',
  description: 'Owner analytics dashboard — shows call volumes, sentiment analysis, revenue attribution, and AI decision insights in a cinematic product reveal.',
  type: 'analytics-dashboard',
  style: 'product',
  totalDuration: 16,
  tags: ['feature', 'analytics', 'owner', 'dashboard'],
  platform: 'linkedin',
  ctaText: 'Explore the Dashboard',
  scenes: [
    {
      id: 's1-dashboard-overview',
      visualPrompt: `Cinematic reveal of FrontDesk Agents owner dashboard: dark slate (#0F172A) UI with real-time metrics cards, "127 Calls Today" prominent in center with emerald green trend arrow, call volume chart on left, indigo accent gradient on key metrics, ultra-clean SaaS design`,
      durationSec: 4,
      transition: 'cut',
    },
    {
      id: 's2-sentiment-analysis',
      visualPrompt: `AI sentiment analysis panel showing call transcripts with color-coded sentiment indicators: green for positive, amber for neutral, red for needs attention, emerald highlight on "High-value lead detected — booking tendency: 89%", clean data visualization aesthetic`,
      durationSec: 4,
      transition: 'dissolve',
    },
    {
      id: 's3-ai-decisions',
      visualPrompt: `AI Decision Engine panel showing autonomous actions: "Escalated: 3 calls", "Retained: 12 customers", "Upsell opportunity: 5 calls flagged", each with indigo/amber/emerald color coding, dark UI with clean iconography, professional analytics aesthetic`,
      durationSec: 4,
      transition: 'dissolve',
    },
    {
      id: 's4-revenue-attribution',
      visualPrompt: `Revenue dashboard panel showing "Calls → Revenue" funnel: "84 calls converted to bookings", "$12,400 MRR attributed to AI receptionist", clean bar chart with indigo bars on dark background, professional CFO-style analytics interface`,
      durationSec: 4,
      transition: 'fade',
    },
  ],
}

// ─── SCENARIO 4: Comparison (AI vs Human) ────────────────────────────────────

const SCENARIO_COMPARISON: VideoScenario = {
  id: 'demo-comparison',
  name: 'AI vs Human Receptionist',
  description: 'Side-by-side comparison showing AI handling 24/7 calls in 200+ languages at a fraction of the cost of a human receptionist.',
  type: 'comparison',
  style: 'product',
  totalDuration: 18,
  tags: ['comparison', 'pricing', 'roi', 'sales'],
  platform: 'linkedin',
  ctaText: 'Compare Plans',
  scenes: [
    {
      id: 's1-vs-header',
      visualPrompt: `Split screen cinematic comparison: left side labeled "Traditional Receptionist" with photo of stressed receptionist at desk with phone, right side labeled "FrontDesk Agents AI" with sleek AI phone agent interface, dark aesthetic, professional comparison layout`,
      durationSec: 3,
      transition: 'cut',
    },
    {
      id: 's2-24-7-comparison',
      visualPrompt: `Comparison matrix visual: "24/7 Coverage" row — left side shows red X and "8am-6pm only", right side shows emerald checkmark and "Always on", clean table layout on dark slate background, professional SaaS comparison chart style`,
      durationSec: 3,
      transition: 'dissolve',
    },
    {
      id: 's3-languages-comparison',
      visualPrompt: `Comparison matrix visual: "Languages" row — left side shows red X and "1-2 languages max", right side shows emerald checkmark and "200+ languages", globe icon with connection lines, clean comparison table on dark background`,
      durationSec: 3,
      transition: 'dissolve',
    },
    {
      id: 's4-cost-comparison',
      visualPrompt: `Comparison matrix visual: "Monthly Cost" row — left side shows amber warning and "$4,500/month salary + training + benefits", right side shows emerald checkmark and "$349/month flat rate", clean cost comparison table, dark background with accent colors`,
      durationSec: 3,
      transition: 'dissolve',
    },
    {
      id: 's5-missed-calls-comparison',
      visualPrompt: `Comparison matrix visual: "Missed Calls" row — left side shows red X and "62% of calls missed during busy hours", right side shows emerald checkmark and "0 missed calls — AI answers every time", emotional impact comparison visual`,
      durationSec: 3,
      transition: 'fade',
    },
    {
      id: 's6-verdict',
      visualPrompt: `Cinematic verdict screen: "The verdict is clear." large white text on dark slate, emerald glow behind the text, FrontDesk Agents AI logo centered below, minimal bold typography, strong emotional closing`,
      durationSec: 3,
      transition: 'cut',
    },
  ],
}

// ─── SCENARIO 5: UGC Social Proof ─────────────────────────────────────────────

const SCENARIO_UGC: VideoScenario = {
  id: 'demo-ugc-style',
  name: 'Real Businesses, Real Results',
  description: 'UGC-style video ad showing a business owner checking their phone and celebrating as the AI books a new client — authentic, social-native style.',
  type: 'testimonial',
  style: 'ugc',
  totalDuration: 12,
  tags: ['social', 'ugc', 'testimonial', 'social-proof'],
  platform: 'tiktok',
  ctaText: 'Start Free Today',
  scenes: [
    {
      id: 's1-busy-owner',
      visualPrompt: `Authentic UGC style: business owner (dental practice manager) in scrubs doing paperwork, looking stressed, phone buzzes with missed call notification showing "2 missed calls today", natural warm indoor lighting, candid documentary feel`,
      durationSec: 3,
      startImage: true,
      transition: 'cut',
    },
    {
      id: 's2-ai-wakes-up',
      visualPrompt: `Same business owner glances at phone screen, sees FrontDesk Agents dashboard showing "3 appointments booked automatically today", eyes widen with surprise and relief, authentic UGC reaction shot, warm natural lighting, candid style`,
      durationSec: 3,
      startImage: true,
      transition: 'dissolve',
    },
    {
      id: 's3-celebration',
      visualPrompt: `Business owner shows phone to colleague pointing at the booked appointments, both react with surprise and delight, authentic celebration moment, warm office lighting, genuine emotional UGC content, natural framing`,
      durationSec: 3,
      startImage: true,
      transition: 'dissolve',
    },
    {
      id: 's4-cta-card',
      visualPrompt: `FrontDesk Agents brand card: dark slate background, tagline "Never Miss Another Client" in clean white bold text, "Start Free" button in indigo, authentic UGC overlay style with timestamp "2 hours ago" suggesting recent activity`,
      durationSec: 3,
      transition: 'cut',
    },
  ],
}

// ─── SCENARIO 6: Appointment Booking Flow ────────────────────────────────────

const SCENARIO_BOOKING: VideoScenario = {
  id: 'demo-appointment-booking',
  name: 'From Call to Calendar in 60 Seconds',
  description: 'Close-up cinematic of the full booking flow: caller requests appointment → AI checks availability → books it → both parties get confirmation.',
  type: 'appointment-booking',
  style: 'cinematic',
  totalDuration: 20,
  tags: ['product', 'booking', 'calendar', 'automation'],
  platform: 'youtube',
  ctaText: 'See It in Action',
  scenes: [
    {
      id: "s1-callers-need",
      visualPrompt: `Close-up of smartphone screen showing an incoming call from "New Patient — Dr. Chen's Office", cinematic shallow depth of field on phone, dark moody background, professional healthcare aesthetic, indigo screen glow`,
      durationSec: 2,
      transition: 'cut',
    },
    {
      id: 's2-ai-greets',
      visualPrompt: `AI receptionist audio waveform visualization with text: "Hi! I'm your AI receptionist at Dr. Chen's office. How can I help you today?" in clean white text on dark background, emerald accent waveform bars animated, cinematic and sleek`,
      durationSec: 3,
      transition: 'dissolve',
    },
    {
      id: 's3-caller-requests',
      visualPrompt: `Real-time transcription panel: "Patient: I'd like to book a cleaning appointment for next week if possible" — AI immediately shows "Checking availability..." in indigo with animated dots, clean professional healthcare AI interface`,
      durationSec: 3,
      transition: 'dissolve',
    },
    {
      id: 's4-availability-check',
      visualPrompt: `Calendar interface panel within AI dashboard: available slots highlighted in emerald green, AI scanning next 7 days, "Tuesday 2pm available — shall I book it?" response in clean UI, professional healthcare scheduling aesthetic`,
      durationSec: 3,
      transition: 'dissolve',
    },
    {
      id: 's5-confirmed',
      visualPrompt: `Dual confirmation screen: left shows patient's phone with SMS confirmation "Your appointment is confirmed: Tuesday at 2pm with Dr. Chen's office", right shows practice management system auto-updated, emerald green confirmation checkmarks, seamless automation`,
      durationSec: 4,
      transition: 'dissolve',
    },
    {
      id: 's6-owner-view',
      visualPrompt: `Practice owner checking their phone at a coffee shop, sees the new appointment in their calendar app, smiles with satisfaction knowing the AI is handling intake while they enjoy their day off, warm cinematic outdoor lighting`,
      durationSec: 3,
      transition: 'fade',
    },
    {
      id: 's7-cta',
      visualPrompt: `FrontDesk Agents logo on dark slate, "From Call to Calendar — Auto-Booked" tagline, indigo to emerald gradient glow, clean minimal design, centered elegant layout`,
      durationSec: 2,
      transition: 'cut',
    },
  ],
}

// ─── ALL SCENARIOS ────────────────────────────────────────────────────────────

export const VIDEO_SCENARIOS: VideoScenario[] = [
  SCENARIO_INBOUND_CALL,
  SCENARIO_MULTILINGUAL,
  SCENARIO_ANALYTICS,
  SCENARIO_COMPARISON,
  SCENARIO_UGC,
  SCENARIO_BOOKING,
]

export function getScenario(id: string): VideoScenario | undefined {
  return VIDEO_SCENARIOS.find(s => s.id === id)
}

export function getScenariosByTag(tag: string): VideoScenario[] {
  return VIDEO_SCENARIOS.filter(s => s.tags.includes(tag))
}

export function getScenariosByPlatform(platform: string): VideoScenario[] {
  return VIDEO_SCENARIOS.filter(s => s.platform === platform)
}

export function getAllScenarioIds(): string[] {
  return VIDEO_SCENARIOS.map(s => s.id)
}

/**
 * Returns recommended video generation model for a given scenario style.
 */
export function recommendedModel(scenario: VideoScenario): string {
  switch (scenario.style) {
    case 'cinematic': return 'kling-v3.0-pro'
    case 'ugc':       return 'seedance-2.0-vip'   // Doubao — good for realistic people
    case 'product':   return 'kling-master'
    case 'explainer': return 'kling-v3.0-pro'
    default:          return 'kling-v3.0-pro'
  }
}

/**
 * Returns aspect ratio for platform.
 */
export function platformAspectRatio(platform: string): string {
  switch (platform) {
    case 'youtube':  return '16:9'
    case 'tiktok':
    case 'shorts':
    case 'reels':    return '9:16'
    case 'linkedin': return '16:9'
    case 'twitter':  return '16:9'
    default:         return '16:9'
  }
}