import { NextRequest, NextResponse } from "next/server";
import { isOwner } from "@/lib/auth";
import { startOutboundCall } from "@/lib/bland";
import { loadSecretOverrides } from "@/lib/secrets";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  await loadSecretOverrides();
  if (!(await isOwner())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const phone = String(body.phone ?? "");
    if (!phone || phone.replace(/\D/g, "").length < 7) {
      return NextResponse.json({ error: "A valid phone number is required" }, { status: 400 });
    }
    const result = await startOutboundCall({
      phone,
      // Backwards compat — accept either `task` (raw prompt) or structured
      // fields. With nothing supplied, the default outbound sales script runs.
      task: body.task ? String(body.task) : undefined,
      reason: body.reason ? String(body.reason) : undefined,
      contactName: body.contactName ? String(body.contactName) : undefined,
      language: body.language ? String(body.language) : undefined,
      voice: body.voice ? String(body.voice) : undefined,
      from: body.from ? String(body.from) : undefined,
      consentSource: "operator-initiated",
    });
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 422 });
    return NextResponse.json({ ok: true, callId: result.callId });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
