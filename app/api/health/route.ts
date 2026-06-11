import { NextResponse } from "next/server";
import { availableBrains } from "@/lib/receptionist";
import { blandConfigured } from "@/lib/bland";

export async function GET() {
  const brains = availableBrains();
  return NextResponse.json({
    ok: true,
    platform: "FrontDesk Agents",
    domain: "www.frontdeskagents.com",
    brains,
    llmBrain: brains.length > 0,
    bland: blandConfigured(),
    time: new Date().toISOString(),
  });
}
