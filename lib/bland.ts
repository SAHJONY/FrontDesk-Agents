// Bland.ai telephony integration. Activates the moment BLAND_API_KEY is set.
//
// Two call types:
//   - outbound demo / sales: operator triggers from /admin, or autonomous
//     callback (only when a visitor explicitly opted in via the chat).
//   - inbound: the (216) 480-4413 number is wired in Bland.ai dashboard to
//     run the inbound script — this file exposes the script so the operator
//     can paste it into the Bland dashboard.

import { recordEvent } from "@/lib/store";
import { getPersona, inboundScript, outboundSalesScript } from "@/lib/bland-scripts";

const BLAND_API = "https://api.bland.ai/v1";

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
  const fromNumber = o.from ?? persona.outboundNumber;
  if (fromNumber) body.from = fromNumber;

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
  };
}
