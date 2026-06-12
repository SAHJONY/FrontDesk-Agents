// Whole-site translation engine. The UI ships in English; HERMES translates
// any batch of UI strings into the visitor's language on demand. Every
// translation is cached permanently in Blob (translations/{lang}.json), so
// each string costs one LLM call ever, per language — after that it's free.
import { createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { put, head } from "@vercel/blob";

const DATA_DIR = process.env.VERCEL ? "/tmp/frontdesk-data" : path.join(process.cwd(), "data");

export const SUPPORTED_LANGS: Record<string, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
  pt: "Português",
  nl: "Nederlands",
  pl: "Polski",
  sv: "Svenska",
  da: "Dansk",
  no: "Norsk",
  fi: "Suomi",
  ru: "Русский",
  uk: "Українська",
  tr: "Türkçe",
  el: "Ελληνικά",
  he: "עברית",
  ar: "العربية",
  hi: "हिन्दी",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
  vi: "Tiếng Việt",
  th: "ไทย",
  id: "Bahasa Indonesia",
  ms: "Bahasa Melayu",
  ro: "Română",
  cs: "Čeština",
  hu: "Magyar",
  bg: "Български",
};

function hashText(t: string): string {
  return createHash("sha1").update(t).digest("hex").slice(0, 16);
}

function cachePath(lang: string) {
  return `translations/${lang}.json`;
}

async function readCache(lang: string): Promise<Record<string, string>> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const meta = await head(cachePath(lang));
      const res = await fetch(meta.url, { cache: "no-store" });
      if (res.ok) return (await res.json()) as Record<string, string>;
    } catch {
      /* cache miss */
    }
    return {};
  }
  try {
    return JSON.parse(await fs.readFile(path.join(DATA_DIR, `translations-${lang}.json`), "utf8"));
  } catch {
    return {};
  }
}

async function writeCache(lang: string, cache: Record<string, string>) {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await put(cachePath(lang), JSON.stringify(cache), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    }).catch(() => {});
    return;
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(path.join(DATA_DIR, `translations-${lang}.json`), JSON.stringify(cache));
}

async function llmTranslate(lang: string, texts: string[]): Promise<string[] | null> {
  const language = SUPPORTED_LANGS[lang] ?? lang;
  const system = `You are a professional UI translator. Translate each string in the JSON array from English into ${language} (${lang}). Return ONLY a JSON array of the translated strings — same order, same length, no commentary, no code fences. Keep brand names (FrontDesk Agents, FrontDeskAgents.com, AVA, Ava Sterling, HERMES, BUFFY, Bland.ai, NVIDIA, Stripe), numbers, prices, emoji, and the word "dot" in domains unchanged. Translations must be natural and concise — these are website labels and marketing copy.`;
  const user = JSON.stringify(texts);

  const tryParse = (raw: string | null): string[] | null => {
    if (!raw) return null;
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]");
    if (start === -1 || end === -1) return null;
    try {
      const arr = JSON.parse(cleaned.slice(start, end + 1));
      if (Array.isArray(arr) && arr.length === texts.length && arr.every((x) => typeof x === "string")) {
        return arr as string[];
      }
    } catch {
      /* fall through */
    }
    return null;
  };

  // NIM first (fast, cheap), then Anthropic Haiku — independent of the
  // receptionist persona cascade.
  if (process.env.NIM_BASE_URL && process.env.NIM_API_KEY && process.env.NIM_MODEL) {
    try {
      const res = await fetch(`${process.env.NIM_BASE_URL.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.NIM_API_KEY}` },
        body: JSON.stringify({
          model: process.env.NIM_MODEL,
          max_tokens: 4000,
          temperature: 0.2,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
        signal: AbortSignal.timeout(20000),
      });
      if (res.ok) {
        const data = await res.json();
        const out = tryParse(
          (data?.choices?.[0]?.message?.content ?? "").replace(/<think>[\s\S]*?<\/think>/g, "")
        );
        if (out) return out;
      }
    } catch {
      /* fall through */
    }
  }
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 4000,
          system,
          messages: [{ role: "user", content: user }],
        }),
        signal: AbortSignal.timeout(20000),
      });
      if (res.ok) {
        const data = await res.json();
        const out = tryParse(data?.content?.[0]?.text ?? "");
        if (out) return out;
      }
    } catch {
      /* fall through */
    }
  }
  return null;
}

// Translate a batch with caching. Unknown strings go to the LLM in chunks;
// anything that fails comes back as the original English so the page never
// shows holes.
export async function translateBatch(lang: string, texts: string[]): Promise<string[]> {
  if (lang === "en" || texts.length === 0) return texts;
  const cache = await readCache(lang);
  const result: string[] = new Array(texts.length);
  const missing: { idx: number; text: string }[] = [];

  texts.forEach((t, i) => {
    const hit = cache[hashText(t)];
    if (hit) result[i] = hit;
    else missing.push({ idx: i, text: t });
  });

  if (missing.length > 0) {
    const CHUNK = 60;
    let cacheDirty = false;
    for (let c = 0; c < missing.length; c += CHUNK) {
      const chunk = missing.slice(c, c + CHUNK);
      const translated = await llmTranslate(lang, chunk.map((m) => m.text));
      chunk.forEach((m, j) => {
        const value = translated?.[j] ?? m.text;
        result[m.idx] = value;
        if (translated?.[j]) {
          cache[hashText(m.text)] = value;
          cacheDirty = true;
        }
      });
    }
    if (cacheDirty) await writeCache(lang, cache);
  }
  return result;
}
