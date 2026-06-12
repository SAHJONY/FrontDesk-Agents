import { NextResponse } from "next/server";
import { hermesStatus } from "@/lib/receptionist";
import { blandConfigured } from "@/lib/bland";
import { stripeConfigured } from "@/lib/billing/stripe";
import { squareConfigured } from "@/lib/billing/square";
import { paypalConfigured } from "@/lib/billing/paypal";

export async function GET() {
  const hermes = hermesStatus();
  return NextResponse.json({
    ok: true,
    platform: "FrontDesk Agents",
    engine: "HERMES",
    hermes,
    // Back-compat fields consumed by older callers.
    brains: hermes.providers,
    primaryBrain: hermes.primary,
    llmBrain: hermes.online,
    integrations: {
      bland: blandConfigured(),
      stripe: stripeConfigured(),
      square: squareConfigured(),
      paypal: paypalConfigured(),
      durableStorage: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    },
    time: new Date().toISOString(),
  });
}
