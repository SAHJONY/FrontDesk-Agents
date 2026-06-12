// Bland.ai telephony integration. Activates the moment BLAND_API_KEY is set.
//
// Two call types:
//   - outbound demo / sales: operator triggers from /admin, or autonomous
//     callback (only when a visitor explicitly opted in via the chat).
//   - inbound: the (216) 480-4413 number is wired in Bland.ai dashboard to
//     run the inbound script — this file exposes the script so the operator
//     can paste it into the Bland dashboard.

import { createHash } from "crypto";
import { recordEvent } from "@/lib/store";
import { getPersona, inboundScript, outboundSalesScript } from "@/lib/bland-scripts";

const BLAND_API = "https://api.bland.ai/v1";

// Webhook URL with an embedded auth key derived from the signing secret.
// Bland's per-call webhooks don't reliably sign with a header we can verify,
// so the URL itself carries proof — we set this URL, nobody else knows it.
export function webhookUrlWithKey(): string | undefined {
  const base = process.env.BLAND_WEBHOOK_URL;
  if (!base) return undefined;
  const secret = process.env.BLAND_WEBHOOK_SECRET;
  if (!secret) return base;
  const key = createHash("sha256").update(`fd-wh:${secret}`).digest("hex").slice(0, 24);
  return `${base}${base.includes("?") ? "&" : "?"}key=${key}`;
}


export function blandConfigured(): boolean {
  return Boolean(process.env.BLAND_API_KEY);
}

export type OutboundCallOptions = {
  phone: string;
  // Free-form override of the task prompt. If omitted, the outbound sales
  // script is used with the persona configured via env.
  task?: string;
  // What we're calling about — interpolated into the opening line.
  reason?: string;
  // Optional name of the person we expect to reach.
  contactName?: string;
  // Override the language for this specific call. Defaults to env.
  language?: string;
  // Override the voice for this specific call. Defaults to env.
  voice?: string;
  // Override the caller-ID number. Defaults to BLAND_OUTBOUND_NUMBER.
  from?: string;
  // Wait for the callee to say hello before Ava speaks.
  waitForGreeting?: boolean;
  // Whether the call is being placed in response to an explicit consent
  // event (e.g. a visitor requested a callback through the chat). The
  // event log records this so cold-calling never happens silently.
  consentSource?: "operator-initiated" | "visitor-callback-request" | "manual-admin";
};

export async function startOutboundCall(opts: OutboundCallOptions | string, legacyTask?: string) {
  // Back-compat: original signature was startOutboundCall(phone, task).
  const o: OutboundCallOptions = typeof opts === "string" ? { phone: opts, task: legacyTask } : opts;

  const apiKey = process.env.BLAND_API_KEY;
  if (!apiKey) {
    return {
      ok: false as const,
      error: "Bland.ai is not configured yet — set BLAND_API_KEY in the Environment tab to activate.",
    };
  }

  const persona = getPersona();
  const task = o.task ?? outboundSalesScript({ reason: o.reason, contactName: o.contactName, persona });

  const body: Record<string, unknown> = {
    phone_number: o.phone,
    task,
    voice: o.voice ?? persona.voice,
    language: o.language ?? persona.language,
    record: true,
    wait_for_greeting: o.waitForGreeting ?? true,
  };

  // Bland's `from` parameter requires a number purchased/verified in your
  // Bland account. Falls back gracefully if env not set — Bland uses default.
  const fromNumber = o.from ?? persona.callerId ?? persona.outboundNumber;
  if (fromNumber) body.from = fromNumber;

  // Post-call payload (transcript, recording URL, duration) is shipped to
  // this webhook URL by Bland after the call ends. Skipped if unset.
  const webhook = webhookUrlWithKey();
  if (webhook) body.webhook = webhook;

  const res = await fetch(`${BLAND_API}/calls`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: apiKey },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false as const, error: data?.message || `Bland.ai returned ${res.status}` };
  }

  // Mask the dialed number in event payload — admin can see the unmasked
  // number in their Bland.ai dashboard if they need it.
  recordEvent("voice_call:started", {
    callId: data?.call_id ?? null,
    phone: o.phone.replace(/\d(?=\d{4})/g, "•"),
    from: fromNumber ?? "bland-default",
    consentSource: o.consentSource ?? "manual-admin",
    reason: o.reason,
  });

  return { ok: true as const, callId: data?.call_id ?? null };
}

// Exposes the scripts so the admin UI can show them (and so the operator can
// paste the inbound script into Bland.ai's phone-number config in their
// dashboard).
export function getActiveScripts() {
  const persona = getPersona();
  return {
    persona,
    inbound: inboundScript(persona),
    outboundDefault: outboundSalesScript({ persona }),
    webhookUrl: process.env.BLAND_WEBHOOK_URL ?? null,
  };
}

// Push the inbound script directly to a Bland.ai phone number. Bland's
// inbound config endpoint accepts a prompt + voice + language and binds the
// number to that conversational agent. After this runs, any caller dialing
// the number will be handled by Ava with the live script.
//
// Bland.ai has shifted endpoint shapes over the years, so we attempt the
// modern path first and fall back if the API responds with a 404.
export async function configureInboundNumber(input: {
  phoneNumber: string;
  prompt: string;
  voice?: string;
  language?: string;
  firstSentence?: string;
}): Promise<
  | { ok: true; endpoint: string; raw: unknown }
  | { ok: false; error: string; lastStatus?: number }
> {
  const apiKey = process.env.BLAND_API_KEY;
  if (!apiKey) return { ok: false, error: "BLAND_API_KEY not set" };

  const persona = getPersona();
  const body: Record<string, unknown> = {
    prompt: input.prompt,
    voice: input.voice ?? persona.voice,
    language: input.language ?? persona.language,
    record: true,
    wait_for_greeting: false,
  };
  // Always overwrite first_sentence — a stale one silently overrides the
  // script's opening line on every call.
  if (input.firstSentence) body.first_sentence = input.firstSentence;
  // Detach any Bland "Memory" from the number. Memories inject summaries of
  // past calls into new ones — a stale memory from the previous brand kept
  // resurrecting retired personas and an English/Spanish-only language claim.
  body.memory_id = null;
  const webhook = webhookUrlWithKey();
  if (webhook) body.webhook = webhook;

  const candidates = [
    // Modern endpoint (path-parameterised by phone number)
    { method: "POST", url: `${BLAND_API}/inbound/${encodeURIComponent(input.phoneNumber)}` },
    // Older endpoint: phone in body, POST /inbound
    {
      method: "POST",
      url: `${BLAND_API}/inbound`,
      bodyExtra: { phone_number: input.phoneNumber } as Record<string, unknown>,
    },
    // PATCH variant
    { method: "PATCH", url: `${BLAND_API}/inbound/${encodeURIComponent(input.phoneNumber)}` },
  ];

  let lastStatus: number | undefined;
  let lastError = "Bland.ai inbound config failed";

  for (const c of candidates) {
    const finalBody = { ...body, ...((c as { bodyExtra?: Record<string, unknown> }).bodyExtra ?? {}) };
    try {
      const res = await fetch(c.url, {
        method: c.method,
        headers: { "Content-Type": "application/json", Authorization: apiKey },
        body: JSON.stringify(finalBody),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        return { ok: true, endpoint: `${c.method} ${c.url}`, raw: data };
      }
      lastStatus = res.status;
      lastError =
        (data as { message?: string; error?: string } | null)?.message ||
        (data as { error?: string } | null)?.error ||
        `Bland API ${res.status}`;
      // Only fall through to the next candidate on 404 / "endpoint not found"
      // shape — other errors (401, 422, 500) are authoritative.
      if (res.status !== 404) break;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  return { ok: false, error: lastError, lastStatus };
}
