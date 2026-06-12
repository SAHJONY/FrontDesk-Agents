import { NextRequest, NextResponse } from "next/server";
import { isOwner } from "@/lib/auth";
import { configureInboundNumber, blandConfigured } from "@/lib/bland";
import { getPersona, inboundScript } from "@/lib/bland-scripts";
import { loadSecretOverrides } from "@/lib/secrets";
import { recordEvent } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 30;

// Owner-only. Pushes the current inbound script to Bland.ai for the
// configured BLAND_INBOUND_NUMBER (or an override in the request body).
export async function POST(req: NextRequest) {
  await loadSecretOverrides();
  if (!(await isOwner())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!blandConfigured()) {
    return NextResponse.json({ error: "Set BLAND_API_KEY first" }, { status: 400 });
  }

  let body: { phoneNumber?: string } = {};
  try {
    body = await req.json().catch(() => ({}));
  } catch {
    // body is optional
  }

  const persona = getPersona();
  const phone = body.phoneNumber || persona.inboundNumber;
  if (!phone) {
    return NextResponse.json(
      { error: "No inbound number configured. Set BLAND_INBOUND_NUMBER first." },
      { status: 400 }
    );
  }

  const result = await configureInboundNumber({
    phoneNumber: phone,
    prompt: inboundScript(persona),
    voice: persona.voice,
    language: persona.language,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: result.error,
        status: result.lastStatus,
        hint: "If this keeps failing, paste the script directly into the Bland.ai dashboard under Phone Numbers → " + phone + " → Inbound config.",
      },
      { status: 502 }
    );
  }

  recordEvent("env:updated", { name: "BLAND_INBOUND_CONFIG", phoneNumber: phone, endpoint: result.endpoint });
  return NextResponse.json({ ok: true, endpoint: result.endpoint });
}
