// Website generation brain (Phase 2 of the merge). Multi-engine cascade ported
// from the factory's api/generate.js: FAST hosted engines first, slow free
// models as a backstop, each capped so the whole chain returns before timeout.
// Keys resolve from env first, then the factory's Upstash secrets.
import { loadFactorySecrets } from "@/lib/site-store";

const ENGINE_TIMEOUT_MS = Number(process.env.ENGINE_TIMEOUT_MS || 18000);
const REQUEST_BUDGET_MS = Number(process.env.GEN_BUDGET_MS || 52000);

const DEFAULT_NVIDIA_MODELS = [
  "meta/llama-3.3-70b-instruct",
  "nvidia/llama-3.1-nemotron-70b-instruct",
  "meta/llama-3.1-405b-instruct",
  "mistralai/mixtral-8x22b-instruct-v0.1",
  "google/gemma-2-27b-it",
  "deepseek-ai/deepseek-r1",
];
let rotationCursor = 0;

function nvidiaModels(): string[] {
  const csv = process.env.NVIDIA_MODELS || process.env.NIM_MODEL;
  if (csv && csv.trim()) return csv.split(",").map((s) => s.trim()).filter(Boolean);
  return DEFAULT_NVIDIA_MODELS;
}

type GetKey = (name: string) => string;
type EngineResult = { text: string; engine: string };

let requestDeadline = 0;

async function fetchT(url: string, opts: RequestInit, ms?: number): Promise<Response> {
  const cap = ms || ENGINE_TIMEOUT_MS;
  const remaining = requestDeadline ? requestDeadline - Date.now() : cap;
  const wait = Math.max(1500, Math.min(cap, remaining));
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), wait);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

async function chatCompletions(url: string, key: string, model: string, prompt: string, maxTokens: number): Promise<string> {
  const r = await fetchT(url, {
    method: "POST",
    headers: { "content-type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, max_tokens: maxTokens, temperature: 0.6, messages: [{ role: "user", content: prompt }] }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error?.message || data?.error || "API error");
  const text = data?.choices?.[0]?.message?.content || "";
  if (!text) throw new Error("Empty response");
  return text;
}

async function tryClaude(prompt: string, maxTokens: number, getKey: GetKey): Promise<EngineResult | null> {
  const key = getKey("ANTHROPIC_API_KEY");
  if (!key) return null;
  const model = process.env.CLAUDE_MODEL || process.env.ANTHROPIC_MODEL || "claude-opus-4-8";
  const r = await fetchT("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model, max_tokens: maxTokens, messages: [{ role: "user", content: prompt }] }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error?.message || "Claude API error");
  const text = data?.content?.[0]?.text || "";
  if (!text) throw new Error("Claude returned empty text");
  return { text, engine: `claude:${model}` };
}

async function tryNvidia(prompt: string, maxTokens: number, getKey: GetKey): Promise<EngineResult | null> {
  const key = getKey("NVIDIA_API_KEY") || getKey("NIM_API_KEY");
  if (!key) return null;
  const models = nvidiaModels();
  const attempts = Math.min(models.length, Number(process.env.NVIDIA_MAX_ATTEMPTS || 2));
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    const model = models[(rotationCursor + i) % models.length];
    try {
      const text = await chatCompletions("https://integrate.api.nvidia.com/v1/chat/completions", key, model, prompt, maxTokens);
      rotationCursor = (rotationCursor + i + 1) % models.length;
      return { text, engine: `nvidia:${model}` };
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("All NVIDIA models failed");
}

async function tryOpenAI(prompt: string, maxTokens: number, getKey: GetKey): Promise<EngineResult | null> {
  const key = getKey("OPENAI_API_KEY");
  if (!key) return null;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  return { text: await chatCompletions("https://api.openai.com/v1/chat/completions", key, model, prompt, maxTokens), engine: `openai:${model}` };
}

async function tryGrok(prompt: string, maxTokens: number, getKey: GetKey): Promise<EngineResult | null> {
  const key = getKey("XAI_API_KEY");
  if (!key) return null;
  const model = process.env.XAI_MODEL || "grok-2-latest";
  return { text: await chatCompletions("https://api.x.ai/v1/chat/completions", key, model, prompt, maxTokens), engine: `grok:${model}` };
}

async function tryGLM(prompt: string, maxTokens: number, getKey: GetKey): Promise<EngineResult | null> {
  const key = getKey("ZAI_API_KEY");
  if (!key) return null;
  const model = process.env.ZAI_MODEL || "glm-4.6";
  const base = (process.env.ZAI_BASE_URL || "https://api.z.ai/api/paas/v4").replace(/\/$/, "");
  return { text: await chatCompletions(`${base}/chat/completions`, key, model, prompt, maxTokens), engine: `glm:${model}` };
}

async function tryGemini(prompt: string, maxTokens: number, getKey: GetKey): Promise<EngineResult | null> {
  const key = getKey("GEMINI_API_KEY");
  if (!key) return null;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
  const r = await fetchT(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: maxTokens } }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error?.message || "Gemini API error");
  const parts = data?.candidates?.[0]?.content?.parts;
  const text = (parts && parts.map((p: { text?: string }) => p.text || "").join("")) || "";
  if (!text) throw new Error("Gemini returned empty text");
  return { text, engine: `gemini:${model}` };
}

export type GenerateOutcome =
  | { ok: true; text: string; engine: string }
  | { ok: false; status: number; error: string; detail?: string[] };

export async function generateWebsite(prompt: string, maxTokens = 2000): Promise<GenerateOutcome> {
  requestDeadline = Date.now() + REQUEST_BUDGET_MS;
  const secrets = await loadFactorySecrets();
  const getKey: GetKey = (name) => process.env[name] || secrets[name] || "";

  // CLAUDE primary; secondary chain per brain policy: OpenAI → x.AI (Grok) →
  // Gemini → NVIDIA NIM free models (the "HERMES" tier). GLM kept as a final
  // bonus fallback.
  const engines = [tryClaude, tryOpenAI, tryGrok, tryGemini, tryNvidia, tryGLM];
  const errors: string[] = [];
  let configured = 0;

  for (const engine of engines) {
    try {
      const result = await engine(prompt, maxTokens, getKey);
      if (!result) continue;
      return { ok: true, text: result.text, engine: result.engine };
    } catch (e) {
      configured++;
      errors.push(e instanceof Error ? e.message : "engine failed");
    }
  }

  if (configured === 0) {
    return { ok: false, status: 500, error: "No AI engine is configured. Add ANTHROPIC / NVIDIA / OPENAI / XAI / GEMINI / ZAI key." };
  }
  return { ok: false, status: 502, error: "All AI engines failed", detail: errors };
}
