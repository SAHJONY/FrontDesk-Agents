// FrontDesk Agents — agentic receptionist engine.
// Hybrid architecture: an LLM brain (NVIDIA NIM, OpenAI-compatible) when
// credentials are configured, layered over a deterministic multi-agent core
// (intent routing + slot-filling) that runs with zero external dependencies,
// so the live demo can never go down.

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
  action?: { type: "booking_confirmed"; booking: Required<BookingDraft> } | { type: "lead_captured"; phone: string };
};

export const FRESH_STATE: SessionState = { stage: "idle", booking: {}, lang: "en" };

const BUSINESS = {
  name: "FrontDesk Agents",
  hours: "We're available 24 hours a day, 7 days a week — that's the whole point of an AI receptionist.",
  pricing:
    "Plans start at $99/mo (Starter, 100 calls), $299/mo (Professional, 500 calls), $799/mo (Enterprise, unlimited calls), and $1,999/mo (Ultimate, white-label + API). Every plan includes 24/7 coverage, instant answer, and appointment booking.",
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
      "I handle everything a world-class front desk does: I answer calls and chats 24/7, book and reschedule appointments, answer pricing and FAQ questions in 50+ languages, qualify leads, and route urgent matters to a human instantly. Want to see me book an appointment?",
    hours: BUSINESS.hours,
    pricing: BUSINESS.pricing + " Would you like me to book a live demo?",
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
      "Great question! FrontDesk Agents replaces missed calls with booked revenue: our AI answers every call in under 2 seconds, books appointments, and qualifies leads around the clock. I can share pricing, explain features, or book you a live demo — which would you like?",
  },
  es: {
    greet: "¡Hola! Bienvenido a FrontDesk Agents — soy AVA, su recepcionista de IA. Puedo responder preguntas, compartir precios o agendar una cita ahora mismo. ¿Cómo puedo ayudarle?",
    capabilities:
      "Hago todo lo que hace una recepción de clase mundial: contesto llamadas y chats 24/7, agendo citas, respondo preguntas en más de 50 idiomas, califico clientes potenciales y transfiero asuntos urgentes a un humano al instante. ¿Quiere que le agende una cita?",
    hours: "Estamos disponibles 24 horas al día, 7 días a la semana — esa es la magia de una recepcionista de IA.",
    pricing:
      "Los planes comienzan en $99/mes (Starter), $299/mes (Professional), $799/mes (Enterprise) y $1,999/mes (Ultimate con marca blanca y API). ¿Le gustaría agendar una demostración en vivo?",
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
      "¡Buena pregunta! FrontDesk Agents convierte llamadas perdidas en ingresos: nuestra IA contesta cada llamada en menos de 2 segundos, agenda citas y califica clientes 24/7. Puedo compartir precios o agendarle una demostración — ¿qué prefiere?",
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

// ---------------------------------------------------------------------------
// LLM brain (NVIDIA NIM, OpenAI-compatible). Used for free-form turns when the
// deterministic core isn't mid-booking; falls back silently on any failure.
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are AVA, the flagship AI receptionist of FrontDesk Agents — the world's most advanced agentic AI receptionist platform. You are warm, concise (2-4 sentences), professional, and you always move the conversation toward helping the caller: answering questions, sharing pricing, or booking an appointment.

Facts you know:
- ${BUSINESS.hours}
- Pricing: ${BUSINESS.pricing}
- The platform answers calls/chats in under 2 seconds, 24/7, in 50+ languages, books appointments, qualifies leads, and escalates to humans when needed.
- It serves every industry: healthcare, legal, real estate, hospitality, home services, dental, automotive, and more.

Rules:
- Reply in the same language the user writes in.
- If the user wants to book an appointment or demo, reply with EXACTLY the token [START_BOOKING] and nothing else.
- Never invent features or prices beyond the facts above.`;

type Provider = { name: string; call: (history: ChatMessage[], message: string) => Promise<string | null> };

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

async function callAnthropic(history: ChatMessage[], message: string): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  const res = await timedFetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: buildMessages(history, message),
    }),
  });
  if (!res?.ok) return null;
  const data = await res.json();
  const text: string | undefined = data?.content?.[0]?.text;
  return text?.trim() || null;
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
  const data = await res.json();
  const text: string | undefined = data?.choices?.[0]?.message?.content;
  if (!text) return null;
  // Strip reasoning traces some models emit.
  return text.replace(/<think>[\s\S]*?<\/think>/g, "").trim() || null;
}

// HERMES aggregates every configured AI brain — Claude first, then OpenAI,
// then NVIDIA NIM — and silently falls through to the next on any failure.
export function availableBrains(): string[] {
  const brains: string[] = [];
  if (process.env.ANTHROPIC_API_KEY) brains.push("Claude");
  if (process.env.OPENAI_API_KEY) brains.push("OpenAI");
  if (process.env.NIM_BASE_URL && process.env.NIM_API_KEY && process.env.NIM_MODEL) brains.push("NVIDIA NIM");
  return brains;
}

export async function runLLMBrain(history: ChatMessage[], message: string): Promise<{ text: string; brain: string } | null> {
  const providers: Provider[] = [
    { name: "Claude", call: callAnthropic },
    {
      name: "OpenAI",
      call: (h, m) =>
        process.env.OPENAI_API_KEY
          ? callOpenAICompatible(
              process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
              process.env.OPENAI_API_KEY,
              process.env.OPENAI_MODEL || "gpt-4o-mini",
              h,
              m
            )
          : Promise.resolve(null),
    },
    {
      name: "NVIDIA NIM",
      call: (h, m) =>
        process.env.NIM_BASE_URL && process.env.NIM_API_KEY && process.env.NIM_MODEL
          ? callOpenAICompatible(process.env.NIM_BASE_URL, process.env.NIM_API_KEY, process.env.NIM_MODEL, h, m)
          : Promise.resolve(null),
    },
  ];
  for (const p of providers) {
    const text = await p.call(history, message);
    if (text) return { text, brain: p.name };
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

  const llmReply = await runLLMBrain(history, message);
  if (llmReply) {
    if (llmReply.text.includes("[START_BOOKING]")) {
      const lang = detectLang(message) === "es" || state.lang === "es" ? "es" : "en";
      return { reply: T[lang].askName, state: { ...state, stage: "booking_name", lang }, agent: "Scheduling Agent" };
    }
    return { reply: llmReply.text, state, agent: `HERMES · ${llmReply.brain}` };
  }
  return runDeterministicAgent(message, state);
}
