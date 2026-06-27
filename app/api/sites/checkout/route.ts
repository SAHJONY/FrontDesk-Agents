import { NextRequest, NextResponse } from "next/server";
import { isOwner } from "@/lib/auth";
import { loadSecretOverrides } from "@/lib/secrets";
import { createSiteCheckout } from "@/lib/site-checkout";

export const runtime = "nodejs";

// Owner-only: create a Stripe Checkout link for a website build / care plan.
// The slug rides in metadata so /api/billing/webhook/site flips the site live.
export async function POST(req: NextRequest) {
  await loadSecretOverrides();
  if (!(await isOwner())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const result = await createSiteCheckout(body, new URL(req.url).origin);
  return NextResponse.json(result.data, { status: result.status });
}
