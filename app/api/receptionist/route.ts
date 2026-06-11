import { NextRequest, NextResponse } from "next/server";
import { runReceptionist, FRESH_STATE, type SessionState, type ChatMessage } from "@/lib/receptionist";
import { addBooking, addLead } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message: string = String(body.message ?? "").slice(0, 2000);
    if (!message.trim()) {
      return NextResponse.json({ error: "Empty message" }, { status: 400 });
    }
    const history: ChatMessage[] = Array.isArray(body.history) ? body.history.slice(-20) : [];
    const state: SessionState = body.state && body.state.stage ? body.state : { ...FRESH_STATE };

    const result = await runReceptionist(message, history, state);

    if (result.action?.type === "booking_confirmed") {
      await addBooking(result.action.booking).catch(() => {});
    }
    if (result.action?.type === "lead_captured") {
      await addLead({ phone: result.action.phone, source: "receptionist-chat" }).catch(() => {});
    }

    return NextResponse.json({
      reply: result.reply,
      state: result.state,
      agent: result.agent,
      action: result.action ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Receptionist unavailable" }, { status: 500 });
  }
}
