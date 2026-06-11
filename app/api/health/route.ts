import { NextResponse } from "next/server";
import { availableBrains } from "@/lib/receptionist";
import { blandConfigured } from "@/lib/bland";

export async function GET() {
  const brains = availableBrains();
  return NextResponse.json({
    ok: true,
    platform: "FrontDesk Agents",
    domain: "www.frontdeskagents.com",
    engine: "HERMES",
    brains,
    primaryBrain: brains[0] ?? "deterministic core",
    llmBrain: brains.length > 0,
    bland: blandConfigured(),
    time: new Date().toISOString(),
  });
}
