import { NextRequest, NextResponse } from "next/server";
import { customerFromCookies } from "@/lib/customer-auth";
import { getReceptionistByCustomer, upsertReceptionistConfig, type StoredReceptionistConfig } from "@/lib/store";
import {
  validateReceptionistInput,
  generateReceptionist,
  type ReceptionistConfig,
  type VoiceStyle,
} from "@/lib/receptionist-config";

export const runtime = "nodejs";

// Adapt the structurally-typed stored record into the lib's ReceptionistConfig
// so the pure generator can run over it.
function toConfig(s: StoredReceptionistConfig): ReceptionistConfig {
  return { ...s, voiceStyle: s.voiceStyle as VoiceStyle };
}

export async function GET() {
  const customer = await customerFromCookies();
  if (!customer) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const stored = await getReceptionistByCustomer(customer.id);
  if (!stored) return NextResponse.json({ config: null, preview: null });

  const config = toConfig(stored);
  return NextResponse.json({ config, preview: generateReceptionist(config) });
}

export async function PUT(req: NextRequest) {
  const customer = await customerFromCookies();
  if (!customer) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const validated = validateReceptionistInput(body);
  if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });

  // `activate` flips status to active; otherwise it saves as a draft.
  const activate = Boolean((body as Record<string, unknown>)?.activate);
  const stored = await upsertReceptionistConfig(customer.id, validated.value, activate ? "active" : "draft");

  const config = toConfig(stored);
  return NextResponse.json({ config, preview: generateReceptionist(config) }, { status: 200 });
}
