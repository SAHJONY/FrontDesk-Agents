// Bland.ai telephony integration. Activates the moment BLAND_API_KEY is set;
// the admin dashboard can then place live outbound demo calls.
import { recordEvent } from "@/lib/store";

const BLAND_API = "https://api.bland.ai/v1";

export function blandConfigured(): boolean {
  return Boolean(process.env.BLAND_API_KEY);
}

export async function startOutboundCall(phone: string, task: string) {
  const apiKey = process.env.BLAND_API_KEY;
  if (!apiKey) {
    return { ok: false as const, error: "Bland.ai is not configured yet — set BLAND_API_KEY in the Environment tab to activate." };
  }
  const res = await fetch(`${BLAND_API}/calls`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: apiKey },
    body: JSON.stringify({
      phone_number: phone,
      task:
        task ||
        "You are AVA, the FrontDesk Agents AI receptionist. Greet warmly, answer questions about the business, and offer to book an appointment.",
      voice: "maya",
      record: true,
      wait_for_greeting: true,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false as const, error: data?.message || `Bland.ai returned ${res.status}` };
  }
  recordEvent("voice_call:started", { callId: data?.call_id ?? null, phone: phone.replace(/\d(?=\d{4})/g, "•") });
  return { ok: true as const, callId: data?.call_id ?? null };
}
