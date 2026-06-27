// FrontDesk Agents — agentic receptionist engine.
//
// Architecture:
//   1. Deterministic multi-agent core (intent routing + slot-filling) — always
//      on. Runs with zero external dependencies so the live demo can never go
//      down, and mid-booking turns always use it (LLMs are too unreliable for
//      strict slot filling).
//
//   2. HERMES — the LLM orchestrator. A configured cascade of (provider, model)
//      pairs that runs free-form turns. Order:
//          (a) NVIDIA NIM, across every model in NIM_MODELS  (primary brain)
//          (b) Anthropic Claude, across every model in ANTHROPIC_MODELS
//          (c) OpenAI, across every model in OPENAI_MODELS
//      Any failure (HTTP error, timeout, empty body) falls through to the next
//      (provider, model) pair, then ultimately to the deterministic core.

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type BookingDraft = {
  name?: string;
  service?: string;
  datetime?: string;
  phone?: string;
};

export type SessionState = {
  stage: "idle" | "booking_name" | "booking_service" | "booking_time" | "booking_phone" | "booking_confirm";
  booking: BookingDraft;
  lang: "en" | "es";
};

export type EngineResult = {
  reply: string;
  state: SessionState;
  agent: string;
  // Internal-only — full provider/model string for telemetry. Never sent
  // to the public-facing API response; consumed by the event log only.
  internalBrain?: string;
  latencyMs?: number;
  action?: { type: "booking_confirmed"; booking: Required<BookingDraft> } | { type: "lead_captured"; phone: string };
};

export const FRESH_STATE: SessionState = { stage: "idle", booking: {}, lang: "en" };

const BUSINESS = {
  name: "FrontDesk Agents",
  hours: "We're available 24 hours a day, 7 days a week — that's the whole point of an AI receptionist.",
  pricing:
    "Plans start at Free (20 chats/month), Starter $399/mo (200 chats), Professional $599/mo (1,000 chats), and Growth $899/mo (5,000 chats). Every plan includes 24/7 chat answering, the booking flow, and email summaries.",
  services: ["a live product demo", "a sales consultation", "an onboarding session", "a technical deep-dive"],
};

function detectLang(text: string): "en" | "es" {
  const t = ` ${text.toLowerCase()} `;
  const esHits = ["hola", "cita", "precio", "gracias", "necesito", "quiero", "buenos", "buenas", "ayuda", "por favor", "hablar", "español", "espanol", "cuánto", "cuanto", "reservar"].filter(
    (w) => t.includes(` ${w}`)
  ).length;
  return esHits >= 1 ? "es" : "en";
}

type IntentId = "greet" | "book" | "pricing" | "hours" | "human" | "capabilities" | "cancel" | "thanks" | "other";

function detectIntent(text: string): IntentId {
  const t = text.toLowerCase();
  const has = (...ws: string[]) => ws.some((w) => t.includes(w));
  if (has("cancel", "never mind", "nevermind", "olvida", "cancela")) return "cancel";
  if (has("book", "appointment", "schedule", "reserve", "cita", "reservar", "agendar", "demo")) return "book";
  if (has("price", "pricing", "cost", "how much", "plan", "precio", "cuánto", "cuanto", "tarifa")) return "pricing";
  if (has("hour", "open", "close", "when are you", "horario", "abierto")) return "hours";
  if (has("human", "person", "agent", "representative", "manager", "humano", "persona")) return "human";
  if (has("what can you", "capabilities", "help me with", "qué puedes", "que puedes", "features")) return "capabilities";
  if (has("thank", "gracias")) return "thanks";
  if (has("hello", "hi ", "hey", "hola", "good morning", "good afternoon", "buenos", "buenas") || t.trim().length < 8) return "greet";
  return "other";
}

const T = {
  en: {
    greet: "Hello! Welcome to FrontDesk Agents — I'm AVA, your AI receptionist. I can answer questions, share pricing, or book an appointment for you right now. How can I help?",
    capabilities:
      "I handle the heart of a front desk: I answer chats 24/7 in any language worldwide — I detect yours automatically — book appointments, capture leads, and flag urgent matters so a human can follow up. Want to see me book an appointment?",
    hours: BUSINESS.hours,
    pricing: BUSINESS.pricing + " Would you like me to book a live demo so you can see it in action?",
    human: "Of course — I'm flagging a specialist right now. Could you share your phone number so our team can call you back within minutes?",
    askName: "Wonderful, I'd love to set that up. May I have your name?",
    askService: (name: string) => `Great to meet you, ${name}! What would you like to book — ${BUSINESS.services.join(", ")}?`,
    askTime: "Perfect. What day and time work best for you? (For example: tomorrow at 2pm)",
    askPhone: "Almost done — what's the best phone number to confirm your appointment?",
    confirm: (b: Required<BookingDraft>) =>
      `You're all set, ${b.name}! ✅ I've booked ${b.service} for ${b.datetime}. A confirmation will be sent to ${b.phone}. Anything else I can do for you?`,
    cancelled: "No problem, I've cleared that. Is there anything else I can help you with?",
    thanks: "You're very welcome! I'm here 24/7 whenever you need me.",
    leadThanks: (phone: string) => `Thank you! A specialist will call you at ${phone} shortly. Anything else I can help with meanwhile?`,
    fallback:
      "Great question! FrontDesk Agents turns missed inquiries into booked revenue: AVA answers chats 24/7 in 100+ languages (she detects the visitor's language automatically), books appointments, and captures leads. I can share pricing, explain features, or book you a live demo — which would you like?",
  },
  es: {
    greet: "¡Hola! Bienvenido a FrontDesk Agents — soy AVA, su recepcionista de IA. Puedo responder preguntas, compartir precios o agendar una cita ahora mismo. ¿Cómo puedo ayudarle?",
    capabilities:
      "Lo esencial de una recepción: contesto chats 24/7 en más de 100 idiomas (detecto el suyo automáticamente), agendo citas, capturo clientes potenciales y aviso al equipo cuando algo es urgente. ¿Quiere que le agende una cita?",
    hours: "Estamos disponibles 24 horas al día, 7 días a la semana — esa es la magia de una recepcionista de IA.",
    pricing:
      "Los planes comienzan Gratis (20 chats/mes), Starter $399/mes (200 chats), Professional $599/mes (1,000 chats), y Growth $899/mes (5,000 chats). ¿Le gustaría agendar una demostración en vivo?",
    human: "Por supuesto — estoy notificando a un especialista. ¿Me comparte su número de teléfono para que le devuelvan la llamada en minutos?",
    askName: "Excelente, con gusto lo agendo. ¿Me puede dar su nombre?",
    askService: (name: string) => `¡Mucho gusto, ${name}! ¿Qué le gustaría reservar — una demostración en vivo, una consulta de ventas o una sesión técnica?`,
    askTime: "Perfecto. ¿Qué día y hora le convienen? (Por ejemplo: mañana a las 2pm)",
    askPhone: "Casi listo — ¿cuál es el mejor número de teléfono para confirmar su cita?",
    confirm: (b: Required<BookingDraft>) =>
      `¡Listo, ${b.name}! ✅ He agendado ${b.service} para ${b.datetime}. Enviaremos la confirmación al ${b.phone}. ¿Algo más en lo que pueda ayudarle?`,
    cancelled: "No hay problema, lo he cancelado. ¿Puedo ayudarle con algo más?",
    thanks: "¡Con mucho gusto! Estoy aquí 24/7 cuando me necesite.",
    leadThanks: (phone: string) => `¡Gracias! Un especialista le llamará al ${phone} en breve. ¿Algo más mientras tanto?`,
    fallback:
      "¡Buena pregunta! FrontDesk Agents convierte consultas perdidas en ingresos: AVA contesta chats 24/7 en más de 100 idiomas, agenda citas y captura clientes potenciales. Puedo compartir precios o agendarle una demostración — ¿qué prefiere?",
  },
};

const PHONE_RE = /(\+?\d[\d\s().-]{6,}\d)/;

export function runDeterministicAgent(message: string, state: SessionState): EngineResult {
  const lang = detectLang(message) === "es" || state.lang === "es" ? "es" : "en";
  const t = T[lang];
  const s: SessionState = { ...state, booking: { ...state.booking }, lang };
  const intent = detectIntent(message);

  // Slot-filling booking flow takes priority over intent chatter.
  if (s.stage === "booking_name") {
    if (intent === "cancel") return { reply: t.cancelled, state: { ...FRESH_STATE, lang }, agent: "Scheduling Agent" };
    const name = message.replace(/^(my name is|i am|i'm|soy|me llamo)\s+/i, "").trim().split(/\s+/).slice(0, 3).join(" ");
    s.booking.name = name.charAt(0).toUpperCase() + name.slice(1);
    s.stage = "booking_service";
    return { reply: t.askService(s.booking.name), state: s, agent: "Scheduling Agent" };
  }
  if (s.stage === "booking_service") {
    if (intent === "cancel") return { reply: t.cancelled, state: { ...FRESH_STATE, lang }, agent: "Scheduling Agent" };
    s.booking.service = message.trim();
    s.stage = "booking_time";
    return { reply: t.askTime, state: s, agent: "Scheduling Agent" };
  }
  if (s.stage === "booking_time") {
    if (intent === "cancel") return { reply: t.cancelled, state: { ...FRESH_STATE, lang }, agent: "Scheduling Agent" };
    s.booking.datetime = message.trim();
    s.stage = "booking_phone";
    return { reply: t.askPhone, state: s, agent: "Scheduling Agent" };
  }
  if (s.stage === "booking_phone") {
    if (intent === "cancel") return { reply: t.cancelled, state: { ...FRESH_STATE, lang }, agent: "Scheduling Agent" };
    const m = message.match(PHONE_RE);
    s.booking.phone = m ? m[1].trim() : message.trim();
    const booking = s.booking as Required<BookingDraft>;
    return {
      reply: t.confirm(booking),
      state: { ...FRESH_STATE, lang },
      agent: "Scheduling Agent",
      action: { type: "booking_confirmed", booking },
    };
  }

  switch (intent) {
    case "greet":
      return { reply: t.greet, state: s, agent: "Greeting Agent" };
    case "capabilities":
      return { reply: t.capabilities, state: s, agent: "Information Agent" };
    case "hours":
      return { reply: t.hours, state: s, agent: "Information Agent" };
    case "pricing":
      return { reply: t.pricing, state: s, agent: "Information Agent" };
    case "book":
      s.stage = "booking_name";
      return { reply: t.askName, state: s, agent: "Scheduling Agent" };
    case "human": {
      const m = message.match(PHONE_RE);
      if (m) return { reply: t.leadThanks(m[1]), state: s, agent: "Escalation Agent", action: { type: "lead_captured", phone: m[1] } };
      return { reply: t.human, state: s, agent: "Escalation Agent" };
    }
    case "thanks":
      return { reply: t.thanks, state: s, agent: "Greeting Agent" };
    case "cancel":
      return { reply: t.cancelled, state: { ...FRESH_STATE, lang }, agent: "Greeting Agent" };
    default: {
      const m = message.match(PHONE_RE);
      if (m) return { reply: t.leadThanks(m[1]), state: s, agent: "Escalation Agent", action: { type: "lead_captured", phone: m[1] } };
      return { reply: t.fallback, state: s, agent: "Information Agent" };
    }
  }
}

// ============================================================================
// HERMES — the LLM orchestrator
// ============================================================================

const SYSTEM_PROMPT = `You are AVA, the AI receptionist of FrontDesk Agents. You are warm, concise (2-4 sentences), professional, and you always move the conversation toward helping the visitor: answering questions, sharing pricing, or booking an appointment.

Facts you know:
- ${BUSINESS.hours}
- Pricing: ${BUSINESS.pricing}
- The platform autonomously detects the user's language and answers in it — 100+ languages worldwide, 24/7 — books appointments, captures leads, and escalates to a human when needed.
- It serves any service business: dental, legal, real estate, home services, hospitality, automotive, and more.

Rules:
- Reply in the same language the user writes in.
- If the user wants to book an appointment or demo AND is writing in English or Spanish, reply with EXACTLY the token [START_BOOKING] and nothing else.
- If the user wants to book but is writing in ANY OTHER language, run the booking yourself in their language: collect (1) their name, (2) what they want to book, (3) preferred day and time, (4) phone number — one question at a time. Once you have all four, confirm the details back to them warmly in their language and append this machine token on its own line at the very end of that confirmation message: [BOOKING_JSON]{"name":"...","service":"...","datetime":"...","phone":"..."}[/BOOKING_JSON]
- Never invent features or prices beyond the facts above. Do not claim HIPAA compliance, SMS, CRM integration, or sentiment analysis.`;

// ----- Provider type & helpers ----------------------------------------------

export type ProviderId = "nim" | "anthropic" | "openai";

export type HermesModel = {
  provider: ProviderId;
  model: string;
  label: string; // e.g. "NVIDIA NIM · meta/llama-3.3-70b-instruct"
};

// Default NIM model cascade — curated free-tier models hosted on
// build.nvidia.com (OpenAI-compatible). Listed in roughly descending quality;
// HERMES walks the list and uses whichever is reachable.
const DEFAULT_NIM_MODELS = [
  "meta/llama-3.3-70b-instruct",
  "nvidia/llama-3.1-nemotron-70b-instruct",
  "meta/llama-3.1-405b-instruct",
  "mistralai/mixtral-8x22b-instruct-v0.1",
  "qwen/qwen2.5-72b-instruct",
  "deepseek-ai/deepseek-r1",
  "google/gemma-2-27b-it",
  "meta/llama-3.1-70b-instruct",
  "microsoft/phi-3-medium-128k-instruct",
];

// Primary brain models — newest first: Opus 4.8 → Opus 4.7 → Sonnet 4.6 → Haiku 4.5.
const DEFAULT_ANTHROPIC_MODELS = [
  "claude-opus-4-8",
  "claude-opus-4-7",
  "claude-sonnet-4-6",
  "claude-haiku-4-5-20251001",
];

// OpenAI fallback — cheap to expensive.
const DEFAULT_OPENAI_MODELS = ["gpt-4o-mini", "gpt-4o"];

function parseList(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

function nimBaseUrl() {
  return (process.env.NIM_BASE_URL || "https://integrate.api.nvidia.com/v1").replace(/\/$/, "");
}

function nimModels(): string[] {
  const explicit = parseList(process.env.NIM_MODELS);
  if (explicit.length) return explicit;
  if (process.env.NIM_MODEL) return [process.env.NIM_MODEL];
  return DEFAULT_NIM_MODELS;
}

function anthropicModels(): string[] {
  const explicit = parseList(process.env.ANTHROPIC_MODELS);
  if (explicit.length) return explicit;
  if (process.env.ANTHROPIC_MODEL) return [process.env.ANTHROPIC_MODEL];
  return DEFAULT_ANTHROPIC_MODELS;
}

function openaiModels(): string[] {
  const explicit = parseList(process.env.OPENAI_MODELS);
  if (explicit.length) return explicit;
  if (process.env.OPENAI_MODEL) return [process.env.OPENAI_MODEL];
  return DEFAULT_OPENAI_MODELS;
}

// configuredCascade returns the full ordered list of (provider, model) pairs
// HERMES will walk through for each user turn.
//
// Brain policy: CLAUDE is the primary brain/engine; the rest (NVIDIA NIM free
// models = "HERMES" tier, then OpenAI) are secondary fallbacks. Set
// HERMES_PRIMARY=nim to put the free NIM models first instead (cost-saving for
// very high chat volume).
export function configuredCascade(): HermesModel[] {
  const claude: HermesModel[] = process.env.ANTHROPIC_API_KEY
    ? anthropicModels().map((model) => ({ provider: "anthropic" as const, model, label: `Claude · ${model}` }))
    : [];
  const nim: HermesModel[] = process.env.NIM_API_KEY
    ? nimModels().map((model) => ({ provider: "nim" as const, model, label: `NVIDIA NIM · ${model}` }))
    : [];
  const openai: HermesModel[] = process.env.OPENAI_API_KEY
    ? openaiModels().map((model) => ({ provider: "openai" as const, model, label: `OpenAI · ${model}` }))
    : [];

  // Default: Claude primary → NIM (HERMES free tier) → OpenAI.
  const claudePrimary = (process.env.HERMES_PRIMARY || "claude").toLowerCase() !== "nim";
  return claudePrimary ? [...claude, ...nim, ...openai] : [...nim, ...claude, ...openai];
}

// Back-compat: return the list of unique provider names (used by the health
// endpoint and admin dashboard for human-readable summaries).
export function availableBrains(): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of configuredCascade()) {
    const label = m.provider === "nim" ? "NVIDIA NIM" : m.provider === "anthropic" ? "Claude" : "OpenAI";
    if (!seen.has(label)) {
      seen.add(label);
      out.push(label);
    }
  }
  return out;
}

// Detailed status surface for /api/health and the admin Integrations tab.
export function hermesStatus() {
  const cascade = configuredCascade();
  return {
    online: cascade.length > 0,
    totalModels: cascade.length,
    providers: availableBrains(),
    primary: cascade[0]?.label ?? "deterministic core",
    models: cascade.map((m) => m.label),
    byProvider: {
      nim: cascade.filter((m) => m.provider === "nim").map((m) => m.model),
      anthropic: cascade.filter((m) => m.provider === "anthropic").map((m) => m.model),
      openai: cascade.filter((m) => m.provider === "openai").map((m) => m.model),
    },
  };
}

// ----- Wire calls ------------------------------------------------------------

function buildMessages(history: ChatMessage[], message: string) {
  return [
    ...history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
    { role: "user" as const, content: message },
  ];
}

async function timedFetch(url: string, init: RequestInit, ms = 9000): Promise<Response | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    const res = await fetch(url, { ...init, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch {
    return null;
  }
}

function stripReasoningArtifacts(text: string): string {
  return text
    .replace(/<think>[\s\S]*?<\/think>/g, "")
    .replace(/<reasoning>[\s\S]*?<\/reasoning>/g, "")
    .trim();
}

async function callAnthropic(model: string, history: ChatMessage[], message: string): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  const res = await timedFetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model,
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: buildMessages(history, message),
    }),
  });
  if (!res?.ok) return null;
  const data = await res.json().catch(() => null);
  const text: string | undefined = data?.content?.[0]?.text;
  if (!text) return null;
  const cleaned = stripReasoningArtifacts(text);
  return cleaned || null;
}

async function callOpenAICompatible(
  baseUrl: string,
  apiKey: string,
  model: string,
  history: ChatMessage[],
  message: string
): Promise<string | null> {
  const res = await timedFetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      max_tokens: Number(process.env.NIM_MAX_TOKENS || 300),
      temperature: 0.6,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...buildMessages(history, message)],
    }),
  });
  if (!res?.ok) return null;
  const data = await res.json().catch(() => null);
  const text: string | undefined = data?.choices?.[0]?.message?.content;
  if (!text) return null;
  const cleaned = stripReasoningArtifacts(text);
  return cleaned || null;
}

async function callForModel(brain: HermesModel, history: ChatMessage[], message: string): Promise<string | null> {
  switch (brain.provider) {
    case "nim":
      return callOpenAICompatible(nimBaseUrl(), process.env.NIM_API_KEY!, brain.model, history, message);
    case "anthropic":
      return callAnthropic(brain.model, history, message);
    case "openai":
      return callOpenAICompatible(
        process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
        process.env.OPENAI_API_KEY!,
        brain.model,
        history,
        message
      );
  }
}

// runLLMBrain walks the entire (provider, model) cascade in order. The first
// non-empty reply wins; everything else silently falls through.
export async function runLLMBrain(
  history: ChatMessage[],
  message: string
): Promise<{ text: string; brain: string } | null> {
  for (const brain of configuredCascade()) {
    const text = await callForModel(brain, history, message);
    if (text) return { text, brain: brain.label };
  }
  return null;
}

export async function runReceptionist(
  message: string,
  history: ChatMessage[],
  state: SessionState
): Promise<EngineResult> {
  // Mid-booking: deterministic slot-filling is more reliable than an LLM.
  if (state.stage !== "idle") return runDeterministicAgent(message, state);

  const t0 = Date.now();
  const llmReply = await runLLMBrain(history, message);
  const latencyMs = Date.now() - t0;
  if (llmReply) {
    if (llmReply.text.includes("[START_BOOKING]")) {
      const lang = detectLang(message) === "es" || state.lang === "es" ? "es" : "en";
      return {
        reply: T[lang].askName,
        state: { ...state, stage: "booking_name", lang },
        agent: "Scheduling Agent",
        internalBrain: llmReply.brain,
        latencyMs,
      };
    }
    // Multilingual LLM-run bookings arrive as a machine token appended to the
    // confirmation message — capture it and strip it from the visible reply.
    const bookingMatch = llmReply.text.match(/\[BOOKING_JSON\]([\s\S]*?)\[\/BOOKING_JSON\]/);
    if (bookingMatch) {
      const reply = llmReply.text.replace(bookingMatch[0], "").trim();
      try {
        const b = JSON.parse(bookingMatch[1]);
        if (b.name && b.datetime) {
          return {
            reply,
            state,
            agent: "Scheduling Agent",
            internalBrain: llmReply.brain,
            latencyMs,
            action: {
              type: "booking_confirmed",
              booking: {
                name: String(b.name).slice(0, 120),
                service: String(b.service ?? "appointment").slice(0, 200),
                datetime: String(b.datetime).slice(0, 120),
                phone: String(b.phone ?? "").slice(0, 40),
              },
            },
          };
        }
      } catch {
        // Malformed token — fall through with the cleaned reply.
      }
      return { reply, state, agent: "HERMES", internalBrain: llmReply.brain, latencyMs };
    }
    // Public-facing agent label hides the underlying provider/model — the
    // detailed brain label is preserved on the server for logging/admin use.
    return {
      reply: llmReply.text,
      state,
      agent: "HERMES",
      internalBrain: llmReply.brain,
      latencyMs,
    };
  }
  return runDeterministicAgent(message, state);
}
