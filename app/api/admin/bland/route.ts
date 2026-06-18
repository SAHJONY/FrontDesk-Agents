import { NextResponse } from "next/server";
import { isOwner } from "@/lib/auth";
import { getActiveScripts, blandConfigured } from "@/lib/bland";
import { loadSecretOverrides } from "@/lib/secrets";

export const runtime = "nodejs";

// Owner-only. Returns the inbound + outbound Ava scripts plus persona config
// (name, voice, language, both numbers). The operator can copy the inbound
// script into the FrontDesk Agents phone-number configuration in their dashboard.
export async function GET() {
  await loadSecretOverrides();
  if (!(await isOwner())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const scripts = getActiveScripts();
  return NextResponse.json({
    configured: blandConfigured(),
    persona: scripts.persona,
    inboundScript: scripts.inbound,
    outboundSalesScript: scripts.outboundDefault,
  });
}
