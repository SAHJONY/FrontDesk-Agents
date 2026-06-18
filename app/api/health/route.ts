import { NextResponse } from "next/server";
import { hermesStatus } from "@/lib/receptionist";
import { blandConfigured } from "@/lib/bland";
import { stripeConfigured } from "@/lib/billing/stripe";
import { squareConfigured } from "@/lib/billing/square";
import { paypalConfigured } from "@/lib/billing/paypal";
import { loadSecretOverrides } from "@/lib/secrets";

// Public health endpoint. Returns *only* what is safe to expose externally:
// engine identity, online flag, model count (no model names, no provider
// names). The full HERMES diagnostic surface lives at /api/admin/overview
// behind owner auth.
export async function GET() {
  await loadSecretOverrides();
  const hermes = hermesStatus();
  return NextResponse.json({
    ok: true,
    platform: "FrontDesk Agents",
    engine: "HERMES",
    hermes: {
      online: hermes.online,
      modelCount: hermes.totalModels,
    },
    capabilities: {
      voice: blandConfigured(),
      payments: stripeConfigured() || squareConfigured() || paypalConfigured(),
    },
    time: new Date().toISOString(),
  });
}
