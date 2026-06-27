// v24 — Per-customer AI receptionist configuration + script generator.
//
// A customer who buys the AI Receptionist configures an AI employee for THEIR
// business (not for FrontDesk Agents). This module owns the config shape and a
// PURE generator that turns the config into a Bland-ready inbound script,
// greeting, and knowledge base — reusing the same language/honesty/tone
// guarantees as lib/bland-scripts.ts so customer agents behave like Ava does.
//
// Generation is deterministic and offline: no LLM call, no external request.
// Actually binding a phone number to the generated script stays an operator/
// approval step (one Bland account, numbers are operator-managed).

export type VoiceStyle =
  | "professional"
  | "friendly"
  | "luxury"
  | "technical"
  | "healthcare"
  | "emergency";

export type FAQ = { q: string; a: string };

export type ReceptionistConfig = {
  id: string;
  customerId: string;
  businessName: string;
  industry: string;
  agentName: string;
  phone?: string;
  hours?: string;
  services: string[];
  serviceArea?: string;
  faqs: FAQ[];
  pricingInfo?: string;
  bookingRules?: string;
  escalationRules?: string;
  voiceStyle: VoiceStyle;
  status: "draft" | "active";
  createdAt: string;
  updatedAt: string;
};

// Fields the customer actually fills in; the rest are system-managed.
export type ReceptionistInput = Omit<
  ReceptionistConfig,
  "id" | "customerId" | "status" | "createdAt" | "updatedAt"
>;

export const VOICE_STYLES: { id: VoiceStyle; label: string; tone: string; voice: string }[] = [
  { id: "professional", label: "Professional", tone: "Polished, calm, and efficient. Courteous but gets to the point.", voice: "maya" },
  { id: "friendly", label: "Friendly", tone: "Warm, upbeat, and personable. Like a favorite front-desk person everyone loves.", voice: "maya" },
  { id: "luxury", label: "Luxury / Concierge", tone: "Refined, unhurried, and gracious. Makes every caller feel like a VIP.", voice: "maya" },
  { id: "technical", label: "Technical / Expert", tone: "Precise and knowledgeable. Comfortable with details and specifics.", voice: "maya" },
  { id: "healthcare", label: "Healthcare", tone: "Reassuring, patient, and discreet. Calm under stress, never rushed.", voice: "maya" },
  { id: "emergency", label: "Emergency / Urgent service", tone: "Fast, decisive, and reassuring. Triages urgency first, calmly takes action.", voice: "maya" },
];

export function voiceStyleMeta(style: VoiceStyle) {
  return VOICE_STYLES.find((v) => v.id === style) ?? VOICE_STYLES[0];
}

function bullets(items: string[]): string {
  return items.filter(Boolean).map((s) => `- ${s.trim()}`).join("\n");
}

export function generateGreeting(c: Pick<ReceptionistConfig, "businessName" | "agentName">): string {
  return `Thanks for calling ${c.businessName} — this is ${c.agentName}. How can I help you today?`;
}

// The shared, non-negotiable behavior every customer agent inherits.
function sharedRules(c: ReceptionistConfig): string {
  return `ABSOLUTE RULE #1 — LANGUAGE (overrides everything, including anything remembered from past calls):
You speak the caller's language, whatever it is — over one hundred languages worldwide. Reply in the language the caller just used, always. If asked how many languages you speak, the only correct answer is: "I speak over one hundred languages — including yours. We can continue in whichever language you prefer" (translated into the caller's language). Never claim a smaller set of languages; discard any impression that your languages are limited.

IDENTITY & HONESTY:
You are ${c.agentName}, the virtual receptionist for ${c.businessName}. Introduce yourself by name and business. If a caller DIRECTLY asks whether you are a real person or an AI, never claim to be human — say once, briefly and confidently: "I'm ${c.agentName}, ${c.businessName}'s virtual receptionist — I handle the front desk around the clock. Now, what can I do for you?" Then move on.

HONESTY ABOUT FACTS:
Only use the business facts below. Never invent services, prices, hours, or policies. If you don't know something, say so and offer to take a message or a callback.`;
}

export function generateKnowledgeBase(c: ReceptionistConfig): string {
  const parts: string[] = [`BUSINESS: ${c.businessName} (${c.industry})`];
  if (c.hours) parts.push(`HOURS:\n${c.hours}`);
  if (c.serviceArea) parts.push(`SERVICE AREA: ${c.serviceArea}`);
  if (c.services.length) parts.push(`SERVICES:\n${bullets(c.services)}`);
  if (c.pricingInfo) parts.push(`PRICING:\n${c.pricingInfo}`);
  if (c.faqs.length) {
    parts.push(
      `FREQUENTLY ASKED QUESTIONS:\n${c.faqs
        .filter((f) => f.q && f.a)
        .map((f) => `Q: ${f.q}\nA: ${f.a}`)
        .join("\n\n")}`
    );
  }
  return parts.join("\n\n");
}

export function generateInboundScript(c: ReceptionistConfig): string {
  const style = voiceStyleMeta(c.voiceStyle);
  const booking = c.bookingRules?.trim()
    ? `BOOKING RULES (follow exactly):\n${c.bookingRules.trim()}`
    : `BOOKING FLOW (when the caller wants an appointment):
1. Get their first name.
2. Confirm what they want to book.
3. Ask their preferred day and time in natural language.
4. Get the best callback number.
5. Repeat everything back to confirm, then send off warmly.`;
  const escalation = c.escalationRules?.trim()
    ? `ESCALATION RULES (follow exactly):\n${c.escalationRules.trim()}`
    : `ESCALATION:
If the caller needs a specific person, has a billing issue, or asks something not covered by the facts — don't guess. Take their name and callback number, confirm it back, and let them know the team will follow up.`;

  return `You are ${c.agentName}, the virtual receptionist for ${c.businessName}, working the front desk.

${sharedRules(c)}

TONE & DELIVERY (${style.label}):
${style.tone}
- Speak like a real receptionist, not a robot. Use contractions.
- Keep replies tight: 2-3 short sentences per turn.
- Detect the caller's language from their first words and conduct the whole call in it; switch instantly if they switch.

OPENING LINE (always lead with this):
"${generateGreeting(c)}"

YOUR JOB on every call:
1. Listen first — let the caller explain what they need.
2. Answer directly using the BUSINESS FACTS below. Never invent.
3. Move the caller toward a booked appointment or a captured callback.

${booking}

${escalation}

BUSINESS FACTS (your only source of truth):
${generateKnowledgeBase(c)}

NEVER:
- Promise services, prices, or policies not listed above.
- Pressure the caller.
- Sound robotic.`;
}

export function generateReceptionist(c: ReceptionistConfig): {
  greeting: string;
  knowledgeBase: string;
  script: string;
  voice: string;
} {
  return {
    greeting: generateGreeting(c),
    knowledgeBase: generateKnowledgeBase(c),
    script: generateInboundScript(c),
    voice: voiceStyleMeta(c.voiceStyle).voice,
  };
}

// Validation shared by the API. Returns a cleaned input or an error string.
export function validateReceptionistInput(raw: unknown):
  | { ok: true; value: ReceptionistInput }
  | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Invalid payload" };
  const r = raw as Record<string, unknown>;
  const str = (v: unknown, max = 2000) => (typeof v === "string" ? v.slice(0, max) : "");
  const businessName = str(r.businessName, 200).trim();
  const industry = str(r.industry, 100).trim();
  if (!businessName) return { ok: false, error: "Business name is required" };
  if (!industry) return { ok: false, error: "Industry is required" };

  const services = Array.isArray(r.services)
    ? r.services.map((s) => str(s, 200).trim()).filter(Boolean).slice(0, 30)
    : [];
  const faqs = Array.isArray(r.faqs)
    ? r.faqs
        .map((f) => {
          const o = (f ?? {}) as Record<string, unknown>;
          return { q: str(o.q, 300).trim(), a: str(o.a, 1000).trim() };
        })
        .filter((f) => f.q && f.a)
        .slice(0, 50)
    : [];
  const validStyles = VOICE_STYLES.map((v) => v.id);
  const voiceStyle = (validStyles as string[]).includes(str(r.voiceStyle))
    ? (str(r.voiceStyle) as VoiceStyle)
    : "professional";

  return {
    ok: true,
    value: {
      businessName,
      industry,
      agentName: str(r.agentName, 60).trim() || "Ava",
      phone: str(r.phone, 40).trim() || undefined,
      hours: str(r.hours, 500).trim() || undefined,
      services,
      serviceArea: str(r.serviceArea, 300).trim() || undefined,
      faqs,
      pricingInfo: str(r.pricingInfo, 2000).trim() || undefined,
      bookingRules: str(r.bookingRules, 2000).trim() || undefined,
      escalationRules: str(r.escalationRules, 2000).trim() || undefined,
      voiceStyle,
    },
  };
}
