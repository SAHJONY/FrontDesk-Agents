import { NextRequest, NextResponse } from "next/server";
import { isOwner } from "@/lib/auth";
import { configureInboundNumber, blandConfigured } from "@/lib/bland";
import { getPersona, inboundScript, outboundSalesScript } from "@/lib/bland-scripts";
import { loadSecretOverrides } from "@/lib/secrets";
import { recordEvent } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 30;

type Target = "inbound" | "outbound" | "both";

// Owner-only. Pushes Ava's prompts to Bland.ai.
//
//   target=inbound  → inbound script → BLAND_INBOUND_NUMBER  (default)
//   target=outbound → outbound sales script → BLAND_OUTBOUND_NUMBER
//                     (so callbacks to the outbound caller-ID also reach Ava
//                      in sales mode)
//   target=both     → both of the above in sequence
//
// Also accepts an explicit phoneNumber override for one-off sync.
export async function POST(req: NextRequest) {
  await loadSecretOverrides();
  if (!(await isOwner())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!blandConfigured()) {
    return NextResponse.json({ error: "Set BLAND_API_KEY first" }, { status: 400 });
  }

  let body: { target?: Target; phoneNumber?: string } = {};
  try {
    body = await req.json().catch(() => ({}));
  } catch {
    // optional body
  }
  const target: Target = body.target ?? "inbound";

  const persona = getPersona();
  const jobs: Array<{ label: Target; phone: string | undefined; prompt: string }> = [];

  if (target === "inbound" || target === "both") {
    jobs.push({
      label: "inbound",
      phone: body.phoneNumber || persona.inboundNumber,
      prompt: inboundScript(persona),
    });
  }
  if (target === "outbound" || target === "both") {
    jobs.push({
      label: "outbound",
      phone: body.phoneNumber || persona.outboundNumber,
      prompt: outboundSalesScript({ persona }),
    });
  }

  if (jobs.length === 0) {
    return NextResponse.json({ error: "Invalid target" }, { status: 400 });
  }

  const results: Array<{
    target: Target;
    phoneNumber?: string;
    ok: boolean;
    endpoint?: string;
    error?: string;
    hint?: string;
  }> = [];

  for (const job of jobs) {
    if (!job.phone) {
      results.push({
        target: job.label,
        ok: false,
        error: `No ${job.label} number configured. Set BLAND_${job.label.toUpperCase()}_NUMBER first.`,
      });
      continue;
    }
    const r = await configureInboundNumber({
      phoneNumber: job.phone,
      prompt: job.prompt,
      voice: persona.voice,
      language: persona.language,
    });
    if (r.ok) {
      recordEvent("env:updated", {
        name: `BLAND_${job.label.toUpperCase()}_CONFIG`,
        phoneNumber: job.phone,
        endpoint: r.endpoint,
      });
      results.push({ target: job.label, phoneNumber: job.phone, ok: true, endpoint: r.endpoint });
    } else {
      results.push({
        target: job.label,
        phoneNumber: job.phone,
        ok: false,
        error: r.error,
        hint: `If this keeps failing, paste the ${job.label} script into Bland.ai dashboard → Phone Numbers → ${job.phone} → Inbound config.`,
      });
    }
  }

  const allOk = results.every((r) => r.ok);
  return NextResponse.json({ ok: allOk, results }, { status: allOk ? 200 : 207 });
}
