// Shared "house style" for the website builder. One source of truth so the
// design brain (HTML/CSS) and the visual engines (Higgsfield images + video)
// produce a coherent, ultra-premium, Tesla-grade result.
//
// Design language: Tesla / Apple — cinematic, minimal, lots of negative space,
// deep blacks with a single luminous accent, oversized type, glass + subtle
// motion. Everything reads "top of the line."

// Style preamble injected into every IMAGE prompt (hero shots, sections).
export const CINEMATIC_IMAGE_STYLE =
  "cinematic 8K ultra-premium commercial photography, hyper-detailed, photorealistic, " +
  "dramatic volumetric lighting, shallow depth of field, rich contrast, deep blacks, " +
  "polished reflective surfaces, Tesla/Apple advertising aesthetic, sleek minimal composition, " +
  "color-graded, award-winning, editorial, no text, no watermark, no logo";

// Style preamble injected into every VIDEO prompt (hero loops, b-roll).
export const CINEMATIC_VIDEO_STYLE =
  "cinematic 8K ultra-premium product film, slow smooth camera motion (dolly/orbit), " +
  "dramatic volumetric lighting, glossy reflective surfaces, shallow depth of field, " +
  "Tesla/Apple commercial aesthetic, seamless loop, color-graded, no text, no watermark";

// Wrap a raw subject into a fully art-directed cinematic image prompt.
export function cinematicImagePrompt(subject: string): string {
  const s = (subject || "premium local service business").trim();
  // Avoid double-applying the style if a caller already enriched the prompt.
  if (/cinematic 8K ultra-premium/i.test(s)) return s;
  return `${s}. ${CINEMATIC_IMAGE_STYLE}.`;
}

export function cinematicVideoPrompt(subject: string): string {
  const s = (subject || "premium local service business").trim();
  if (/cinematic 8K ultra-premium/i.test(s)) return s;
  return `${s}. ${CINEMATIC_VIDEO_STYLE}.`;
}

// The design-system contract handed to the HTML brain. Enforces the
// Tesla-grade, ultra-premium UI/UX the operator wants on every generated site.
export const TESLA_DESIGN_SYSTEM = `DESIGN LANGUAGE — TESLA / APPLE GRADE, ULTRA-PREMIUM (non-negotiable):
- Aesthetic: cinematic, minimal, confident. Vast negative space. Deep near-black
  backgrounds (#0a0a0c / #050507) with ONE luminous accent color drawn from the
  brand. Think Tesla.com / Apple product pages.
- Typography: a premium pairing — a tight geometric/grotesk display face for huge
  hero headlines (clamp() responsive, e.g. 3rem→6rem, tight letter-spacing) and a
  clean humanist sans for body. Load via Google Fonts (e.g. Inter/Sora/Manrope +
  Space Grotesk). Generous line-height, refined hierarchy.
- Color & surfaces: subtle glassmorphism (backdrop-filter: blur), 1px hairline
  borders at low opacity, soft glows around the accent, tasteful gradients. No
  flat bootstrap looks, no clip-art, no garish colors.
- Layout: a sticky translucent top nav with smooth-scroll TAB navigation to each
  section (Home · Services · About · Gallery · Reviews · Contact). Full-bleed
  cinematic hero with the provided hero image/video as background, gradient
  overlay, oversized headline, and a single high-contrast primary CTA.
- Motion: tasteful, performant. Scroll-reveal fade/slide via IntersectionObserver,
  hover micro-interactions, parallax on the hero, smooth-scroll behavior. Never
  janky, never gratuitous.
- Components: premium pricing/feature cards with hover lift, a logo/stat strip,
  testimonial cards, an image gallery grid, an accessible contact form, and a
  refined footer. Rounded-2xl corners, layered shadows.
- Quality bar: pixel-perfect spacing on an 8pt grid, fully responsive/mobile-first,
  AA-contrast accessible, fast (no heavy frameworks). It must look like a
  $50k agency build — "top of the line."`;
