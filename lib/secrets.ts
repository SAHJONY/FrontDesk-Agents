// Runtime secrets manager.
//
// Stores operator-provided env var overrides in the same Vercel Blob store the
// rest of the platform uses, encrypted with AES-256-GCM under a key derived
// from SECRETS_ENCRYPTION_KEY (or BLOB_READ_WRITE_TOKEN as a fallback so a
// fresh deploy can still encrypt). Overrides are applied to process.env at the
// top of each API request via loadSecretOverrides(), so changes take effect
// immediately without a Vercel redeploy.
//
// Forbidden secrets (BLOB_READ_WRITE_TOKEN, NODE_ENV, VERCEL_*) are not
// settable at runtime — they're either needed to bootstrap this very module or
// are baked in by the platform.

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { put, head } from "@vercel/blob";
import { recordEvent } from "@/lib/store";

type SecretRecord = { name: string; value: string; updatedAt: string };

export type KnownSecret = {
  name: string;
  category:
    | "Owner"
    | "Storage"
    | "LLM (HERMES)"
    | "Voice (FrontDesk Agents)"
    | "Payments"
    | "Deploy"
    | "Secrets";
  description: string;
  required?: boolean;
  link?: string;
  // If true, the value is read at module init and changing it at runtime has
  // no effect (e.g. BLOB_READ_WRITE_TOKEN).
  deployTimeOnly?: boolean;
};

export const KNOWN_SECRETS: KnownSecret[] = [
  // Owner login
  { name: "OWNER_EMAIL", category: "Owner", description: "Operator email for admin login.", required: true },
  { name: "OWNER_PASSWORD", category: "Owner", description: "Operator password for admin login.", required: true },

  // Storage (deploy-time only)
  {
    name: "BLOB_READ_WRITE_TOKEN",
    category: "Storage",
    description: "Vercel Blob token. Required for durable storage. Set in Vercel project env.",
    required: true,
    deployTimeOnly: true,
    link: "https://vercel.com/dashboard/stores",
  },
  {
    name: "SECRETS_ENCRYPTION_KEY",
    category: "Secrets",
    description: "Random 32+ char string used to encrypt the secrets override store. Set in Vercel for production.",
    deployTimeOnly: true,
  },

  // HERMES — NIM (primary)
  {
    name: "NIM_API_KEY",
    category: "LLM (HERMES)",
    description: "NVIDIA NIM API key. Primary HERMES brain — drives the free-model cascade.",
    link: "https://build.nvidia.com",
  },
  {
    name: "NIM_BASE_URL",
    category: "LLM (HERMES)",
    description: "Override the NIM endpoint. Default: https://integrate.api.nvidia.com/v1",
  },
  {
    name: "NIM_MODELS",
    category: "LLM (HERMES)",
    description:
      "Comma-separated NIM model IDs. Defaults to a curated free-tier cascade (Llama 3.3, Nemotron, Mixtral, Qwen, DeepSeek R1, Gemma, Phi-3).",
  },

  // HERMES — Anthropic (fallback)
  {
    name: "ANTHROPIC_API_KEY",
    category: "LLM (HERMES)",
    description: "Anthropic Claude API key. Fallback when NIM is unavailable.",
    link: "https://console.anthropic.com",
  },
  {
    name: "ANTHROPIC_MODELS",
    category: "LLM (HERMES)",
    description: "Comma-separated Claude model IDs. Defaults to Opus 4.7 → Sonnet 4.6 → Haiku 4.5.",
  },

  // HERMES — OpenAI (last resort)
  {
    name: "OPENAI_API_KEY",
    category: "LLM (HERMES)",
    description: "OpenAI API key. Last-resort fallback in the HERMES cascade.",
    link: "https://platform.openai.com/api-keys",
  },
  {
    name: "OPENAI_BASE_URL",
    category: "LLM (HERMES)",
    description: "Override the OpenAI endpoint. Default: https://api.openai.com/v1",
  },
  {
    name: "OPENAI_MODELS",
    category: "LLM (HERMES)",
    description: "Comma-separated OpenAI model IDs. Defaults to gpt-4o-mini → gpt-4o.",
  },

  // Voice
  {
    name: "BLAND_API_KEY",
    category: "Voice (FrontDesk Agents)",
    description: "FrontDesk Agents API key. Activates inbound + outbound phone calls.",
    link: "https://www.bland.ai",
  },
  {
    name: "BLAND_INBOUND_NUMBER",
    category: "Voice (FrontDesk Agents)",
    description: "The number callers dial to reach Ava (e.g. +12164804413). Configure the matching number in your FrontDesk Agents dashboard with the inbound script from the admin Voice panel.",
  },
  {
    name: "BLAND_OUTBOUND_NUMBER",
    category: "Voice (FrontDesk Agents)",
    description: "Caller-ID number used for outbound calls (e.g. +13465214387). Must be a Bland-purchased or verified number.",
  },
  {
    name: "BLAND_AGENT_NAME",
    category: "Voice (FrontDesk Agents)",
    description: "The first name Ava uses when introducing herself. Default: Ava.",
  },
  {
    name: "BLAND_VOICE",
    category: "Voice (FrontDesk Agents)",
    description: "FrontDesk Agents voice ID. Defaults to maya. See Bland's voice library for alternatives.",
  },
  {
    name: "BLAND_DEFAULT_LANGUAGE",
    category: "Voice (FrontDesk Agents)",
    description: "Default language code (en, es, fr, …). Default: en. Ava still auto-switches per call when the caller speaks another supported language.",
  },
  {
    name: "BLAND_WEBHOOK_URL",
    category: "Voice (FrontDesk Agents)",
    description: "Per-call webhook URL. Overrides the org-level webhook for calls we initiate. Leave empty to fall back to Bland's org-level webhook.",
  },
  {
    name: "BLAND_WEBHOOK_SECRET",
    category: "Voice (FrontDesk Agents)",
    description: "FrontDesk Agents webhook signing secret. When set, /api/bland/webhook verifies the HMAC signature on incoming Bland call events. Get this from Bland → Settings → Webhook Signing Secret.",
  },

  // Stripe
  {
    name: "STRIPE_SECRET_KEY",
    category: "Payments",
    description: "Stripe secret key (sk_live_… or sk_test_…). Enables card checkout.",
    link: "https://dashboard.stripe.com/apikeys",
  },
  { name: "STRIPE_WEBHOOK_SECRET", category: "Payments", description: "Stripe webhook signing secret (whsec_…)." },
  { name: "STRIPE_PRICE_STARTER", category: "Payments", description: "Stripe recurring price ID for the Starter plan." },
  { name: "STRIPE_PRICE_PROFESSIONAL", category: "Payments", description: "Stripe recurring price ID for Professional." },
  { name: "STRIPE_PRICE_GROWTH", category: "Payments", description: "Stripe recurring price ID for Growth." },

  // Square
  {
    name: "SQUARE_ACCESS_TOKEN",
    category: "Payments",
    description: "Square access token. Enables Square subscription checkout.",
    link: "https://developer.squareup.com/apps",
  },
  { name: "SQUARE_LOCATION_ID", category: "Payments", description: "Square location ID where subscriptions are created." },
  { name: "SQUARE_APPLICATION_ID", category: "Payments", description: "Square application ID." },
  { name: "SQUARE_ENVIRONMENT", category: "Payments", description: "sandbox or production. Default: production." },
  { name: "SQUARE_WEBHOOK_SIGNATURE_KEY", category: "Payments", description: "Square webhook HMAC signature key." },
  { name: "SQUARE_PLAN_STARTER", category: "Payments", description: "Square plan variation ID for Starter." },
  { name: "SQUARE_PLAN_PROFESSIONAL", category: "Payments", description: "Square plan variation ID for Professional." },
  { name: "SQUARE_PLAN_GROWTH", category: "Payments", description: "Square plan variation ID for Growth." },

  // PayPal
  {
    name: "PAYPAL_CLIENT_ID",
    category: "Payments",
    description: "PayPal client ID. Enables PayPal subscription approvals.",
    link: "https://developer.paypal.com/dashboard/applications",
  },
  { name: "PAYPAL_CLIENT_SECRET", category: "Payments", description: "PayPal client secret." },
  { name: "PAYPAL_ENVIRONMENT", category: "Payments", description: "live or sandbox. Default: live." },
  { name: "PAYPAL_WEBHOOK_ID", category: "Payments", description: "PayPal webhook ID for signature verification." },
  { name: "PAYPAL_PLAN_STARTER", category: "Payments", description: "PayPal plan ID for Starter." },
  { name: "PAYPAL_PLAN_PROFESSIONAL", category: "Payments", description: "PayPal plan ID for Professional." },
  { name: "PAYPAL_PLAN_GROWTH", category: "Payments", description: "PayPal plan ID for Growth." },

  // Deploy
  {
    name: "NEXT_PUBLIC_APP_URL",
    category: "Deploy",
    description: "Public URL of this deployment. Used to build webhook and checkout-redirect URLs.",
  },
];

const STORE_FILE = "secrets-overrides.json";

// Forbidden secrets — cannot be set or removed via the UI.
const FORBIDDEN = new Set([
  "BLOB_READ_WRITE_TOKEN", // needed to load this very file
  "SECRETS_ENCRYPTION_KEY", // changing this would orphan all existing ciphertext
  "VERCEL",
  "VERCEL_URL",
  "VERCEL_PROJECT_PRODUCTION_URL",
  "NODE_ENV",
  "PATH",
]);

function encryptionKey(): Buffer {
  const seed =
    process.env.SECRETS_ENCRYPTION_KEY ||
    process.env.BLOB_READ_WRITE_TOKEN ||
    "frontdesk-secrets-v1-no-key-set";
  return createHash("sha256").update(seed).digest();
}

function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${ct.toString("base64")}`;
}

function decrypt(blob: string): string | null {
  try {
    const [ivB, tagB, ctB] = blob.split(".");
    if (!ivB || !tagB || !ctB) return null;
    const iv = Buffer.from(ivB, "base64");
    const tag = Buffer.from(tagB, "base64");
    const ct = Buffer.from(ctB, "base64");
    const dec = createDecipheriv("aes-256-gcm", encryptionKey(), iv);
    dec.setAuthTag(tag);
    return Buffer.concat([dec.update(ct), dec.final()]).toString("utf8");
  } catch {
    return null;
  }
}

const DATA_DIR = process.env.VERCEL ? "/tmp/frontdesk-data" : path.join(process.cwd(), "data");

function blobEnabled() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function blobPath() {
  const seed = process.env.BLOB_READ_WRITE_TOKEN as string;
  const secret = createHash("sha256").update(seed).digest("hex").slice(0, 16);
  return `frontdesk-${secret}/${STORE_FILE}`;
}

async function loadAllPlaintext(): Promise<Record<string, SecretRecord>> {
  let raw: Record<string, SecretRecord> = {};
  if (blobEnabled()) {
    try {
      const meta = await head(blobPath());
      const res = await fetch(meta.url, { cache: "no-store" });
      if (res.ok) raw = (await res.json()) as Record<string, SecretRecord>;
    } catch {
      // missing blob is fine
    }
  } else {
    try {
      const text = await fs.readFile(path.join(DATA_DIR, STORE_FILE), "utf8");
      raw = JSON.parse(text);
    } catch {
      // missing local file is fine
    }
  }
  const out: Record<string, SecretRecord> = {};
  for (const [k, v] of Object.entries(raw)) {
    const plain = decrypt(v.value);
    if (plain !== null) out[k] = { ...v, value: plain };
  }
  return out;
}

async function saveAll(records: Record<string, SecretRecord>): Promise<void> {
  const enc: Record<string, SecretRecord> = {};
  for (const [k, v] of Object.entries(records)) {
    enc[k] = { ...v, value: encrypt(v.value) };
  }
  if (blobEnabled()) {
    await put(blobPath(), JSON.stringify(enc), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    return;
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(path.join(DATA_DIR, STORE_FILE), JSON.stringify(enc, null, 2));
}

let cache: { loadedAt: number; data: Record<string, SecretRecord> } | null = null;
const CACHE_MS = 5000;

// loadSecretOverrides — call at the top of any API route that reads env vars
// that the operator might have set via the UI. Cached 5s to avoid hammering
// the blob store under load.
export async function loadSecretOverrides(): Promise<void> {
  const now = Date.now();
  if (cache && now - cache.loadedAt < CACHE_MS) {
    // Re-apply from cache (process.env can be reset by serverless reuse).
    for (const [name, rec] of Object.entries(cache.data)) {
      if (!FORBIDDEN.has(name)) process.env[name] = rec.value;
    }
    return;
  }
  const data = await loadAllPlaintext().catch(() => ({}));
  cache = { loadedAt: now, data };
  for (const [name, rec] of Object.entries(data)) {
    if (!FORBIDDEN.has(name)) process.env[name] = rec.value;
  }
}

export function invalidateOverrideCache() {
  cache = null;
}

export function isForbidden(name: string) {
  return FORBIDDEN.has(name);
}

function maskValue(value: string | undefined | null): string {
  if (!value) return "";
  const v = String(value);
  if (v.length <= 8) return "•".repeat(v.length);
  return `${v.slice(0, 4)}${"•".repeat(Math.min(v.length - 8, 16))}${v.slice(-4)}`;
}

export type SecretListing = {
  name: string;
  category: KnownSecret["category"] | "Custom";
  description?: string;
  link?: string;
  required?: boolean;
  deployTimeOnly?: boolean;
  hasValue: boolean;
  masked: string;
  source: "process.env" | "override" | "unset";
  updatedAt?: string;
};

export async function listAllSecrets(): Promise<SecretListing[]> {
  const overrides = await loadAllPlaintext().catch(() => ({} as Record<string, SecretRecord>));
  const overrideNames = new Set(Object.keys(overrides));
  const out: SecretListing[] = [];

  for (const k of KNOWN_SECRETS) {
    const fromOverride = overrides[k.name];
    const fromEnv = process.env[k.name];
    const value = fromOverride?.value ?? fromEnv;
    out.push({
      name: k.name,
      category: k.category,
      description: k.description,
      link: k.link,
      required: k.required,
      deployTimeOnly: k.deployTimeOnly,
      hasValue: Boolean(value),
      masked: maskValue(value),
      source: fromOverride ? "override" : fromEnv ? "process.env" : "unset",
      updatedAt: fromOverride?.updatedAt,
    });
    overrideNames.delete(k.name);
  }

  for (const name of overrideNames) {
    const rec = overrides[name];
    out.push({
      name,
      category: "Custom",
      hasValue: true,
      masked: maskValue(rec.value),
      source: "override",
      updatedAt: rec.updatedAt,
    });
  }

  return out;
}

export async function getSecret(name: string): Promise<string | undefined> {
  const overrides = await loadAllPlaintext().catch(() => ({} as Record<string, SecretRecord>));
  return overrides[name]?.value ?? process.env[name];
}

export async function setSecret(name: string, value: string): Promise<void> {
  const trimmed = name.trim();
  if (FORBIDDEN.has(trimmed)) {
    throw new Error(`${trimmed} cannot be set at runtime — set it in Vercel project env.`);
  }
  if (!/^[A-Z][A-Z0-9_]*$/.test(trimmed)) {
    throw new Error("Secret name must be UPPER_SNAKE_CASE, starting with a letter.");
  }
  const all = await loadAllPlaintext();
  all[trimmed] = { name: trimmed, value, updatedAt: new Date().toISOString() };
  await saveAll(all);
  process.env[trimmed] = value;
  invalidateOverrideCache();
  recordEvent("env:updated", { name: trimmed });
}

export async function deleteSecret(name: string): Promise<void> {
  if (FORBIDDEN.has(name)) {
    throw new Error(`${name} cannot be removed at runtime.`);
  }
  const all = await loadAllPlaintext();
  if (!(name in all)) return;
  delete all[name];
  await saveAll(all);
  invalidateOverrideCache();
  recordEvent("env:deleted", { name });
}
