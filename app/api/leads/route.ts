import { NextRequest, NextResponse } from "next/server";
import { addLead, listLeads } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const leads = await listLeads();
  return NextResponse.json({ leads });
}

export async function POST(req: NextRequest) {
  try {
    const l = await req.json();
    if (!l.email && !l.phone) {
      return NextResponse.json({ error: "email or phone is required" }, { status: 400 });
    }
    const lead = await addLead({
      email: l.email ? String(l.email).slice(0, 200) : undefined,
      phone: l.phone ? String(l.phone).slice(0, 40) : undefined,
      business: l.business ? String(l.business).slice(0, 200) : undefined,
      industry: l.industry ? String(l.industry).slice(0, 100) : undefined,
      plan: l.plan ? String(l.plan).slice(0, 50) : undefined,
      source: String(l.source ?? "website").slice(0, 100),
    });
    return NextResponse.json({ lead }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
