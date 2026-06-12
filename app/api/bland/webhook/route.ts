import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { recordEvent } from "@/lib/store";
import { loadSecretOverrides } from "@/lib/secrets";

export const runtime = "nodejs";
export const maxDuration = 30;

// Bland.ai post-call webhook receiver.
//
// Bland fires this URL once a call completes (or, depending on org settings,
// at intermediate milestones). We verify the HMAC signature against
// BLAND_WEBHOOK_SECRET when present, then record a real-time event into the
// admin live stream with the call outcome.

function verify(rawBody: string, signature: string | null): { ok: boolean; reason?: string } {
  const secret = process.env.BLAND_WEBHOOK_SECRET;
  if (!secret) {
    // No secret configured — accept (best-effort dev mode). Caller is
    // responsible for setting BLAND_WEBHOOK_SECRET in production.
    return { ok: true, reason: "no-secret-configured" };
  }
  if (!signature) return { ok: false, reason: "missing-signature-header" };
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  // Bland sometimes prefixes "sha256=" — strip it if present.
  const provided = signature.replace(/^sha256=/i, "");
  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(provided, "hex");
    if (a.length !== b.length) return { ok: false, reason: "signature-length-mismatch" };
    return { ok: timingSafeEqual(a, b), reason: undefined };
  } catch {
    return { ok: false, reason: "signature-decode-failed" };
  }
}

function maskPhone(input: unknown): string | undefined {
  if (typeof input !== "string" || !input) return undefined;
  return input.replace(/\d(?=\d{4})/g, "•");
}

export async function POST(req: NextRequest) {
  await loadSecretOverrides();

  const raw = await req.text();
  const sig =
    req.headers.get("x-bland-signature") ||
    req.headers.get("x-webhook-signature") ||
    req.headers.get("signature");

  const verified = verify(raw, sig);
  if (!verified.ok) {
    return NextResponse.json({ error: "Invalid signature", reason: verified.reason }, { status: 401 });
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Bland's payload shape varies by event but commonly includes:
  //   call_id, call_length, completed, to, from, transferred_to,
  //   answered_by, concatenated_transcript, recording_url, summary
  const callId = (payload.call_id as string) ?? null;
  const lengthSec = Number(payload.call_length ?? 0) || undefined;
  const completed = Boolean(payload.completed);
  const to = maskPhone(payload.to);
  const from = maskPhone(payload.from);
  const answeredBy = payload.answered_by as string | undefined;
  const transferredTo = maskPhone(payload.transferred_to);
  const recordingUrl = (payload.recording_url as string) ?? undefined;
  const summary =
    typeof payload.summary === "string" && payload.summary.length > 0
      ? (payload.summary as string).slice(0, 280)
      : undefined;

  recordEvent("voice_call:started", {
    // Reuse the same event kind so the live stream highlights it; tagged with
    // phase so the UI can distinguish "started" from "completed".
    phase: completed ? "completed" : "update",
    callId,
    lengthSec,
    to,
    from,
    answeredBy,
    transferredTo,
    recordingUrl,
    summary,
    verified: verified.reason ?? "ok",
  });

  return NextResponse.json({ received: true });
}
