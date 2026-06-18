import { NextRequest, NextResponse } from "next/server";
import { runReceptionist, FRESH_STATE, type SessionState, type ChatMessage } from "@/lib/receptionist";
import {
  addBooking,
  addLead,
  listCustomers,
  getActiveSubscriptionForCustomer,
  incrementUsage,
  getUsage,
  recordEvent,
} from "@/lib/store";
import { getPlan } from "@/lib/plans";
import { loadSecretOverrides } from "@/lib/secrets";
import { emailBookingConfirmation, emailLeadAlert } from "@/lib/email";

export const runtime = "nodejs";
export const maxDuration = 30;

// Default for unauthenticated demo traffic on our own site. Generous, but
// keeps a single abuser from running up bills.
const DEMO_CAP = 50;

export async function POST(req: NextRequest) {
  await loadSecretOverrides();
  try {
    const body = await req.json();
    const message: string = String(body.message ?? "").slice(0, 2000);
    if (!message.trim()) {
      return NextResponse.json({ error: "Empty message" }, { status: 400 });
    }
    const history: ChatMessage[] = Array.isArray(body.history) ? body.history.slice(-20) : [];
    const state: SessionState = body.state && body.state.stage ? body.state : { ...FRESH_STATE };
    const customerId = typeof body.customerId === "string" ? body.customerId : null;

    // Enforce the chat cap for paid sites; the homepage demo path uses a
    // soft demo cap so abuse can't drain LLM credits.
    if (customerId) {
      const customers = await listCustomers();
      const customer = customers.find((c) => c.id === customerId);
      if (!customer) {
        return NextResponse.json({ error: "Unknown customer" }, { status: 404 });
      }
      const sub = await getActiveSubscriptionForCustomer(customerId);
      const plan = sub ? getPlan(sub.planId) : getPlan("free");
      if (!plan) {
        return NextResponse.json({ error: "Plan unavailable" }, { status: 500 });
      }
      const used = await getUsage(customerId);
      if (used >= plan.monthlyCallCap) {
        return NextResponse.json(
          {
            error: "Monthly chat cap reached on your current plan.",
            upgrade: { currentPlan: plan.id, used, cap: plan.monthlyCallCap },
          },
          { status: 402 }
        );
      }
      await incrementUsage(customerId);
    }

    recordEvent("chat:incoming", { customerId, language: state.lang });

    const result = await runReceptionist(message, history, state);

    // Real-time telemetry — broadcast which brain answered and how fast.
    recordEvent("chat:reply", {
      agent: result.agent,
      brain: result.internalBrain ?? "deterministic",
      latencyMs: result.latencyMs,
      customerId,
    });

    if (result.action?.type === "booking_confirmed") {
      await addBooking(result.action.booking).catch(() => {});
      emailBookingConfirmation(result.action.booking).catch(() => {});
    }
    if (result.action?.type === "lead_captured") {
      await addLead({ phone: result.action.phone, source: "receptionist-chat" }).catch(() => {});
      emailLeadAlert({ phone: result.action.phone, source: "receptionist-chat" }).catch(() => {});
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

// Exported for the demo cap so future embeds can read it.
export const DEMO_MAX_PER_MONTH = DEMO_CAP;
