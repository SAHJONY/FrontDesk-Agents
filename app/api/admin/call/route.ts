import { NextRequest, NextResponse } from "next/server";
import { isOwner } from "@/lib/auth";
import { startOutboundCall } from "@/lib/bland";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  if (!(await isOwner())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { phone, task } = await req.json();
    if (!phone || String(phone).replace(/\D/g, "").length < 7) {
      return NextResponse.json({ error: "A valid phone number is required" }, { status: 400 });
    }
    const result = await startOutboundCall(String(phone), String(task ?? ""));
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 422 });
    return NextResponse.json({ ok: true, callId: result.callId });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
