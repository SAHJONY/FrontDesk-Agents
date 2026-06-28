import { NextRequest, NextResponse } from "next/server";
import { runSweep } from "@/lib/lead-sweep";
import { loadSecretOverrides } from "@/lib/secrets";

export const runtime = "nodejs";
export const maxDuration = 300;

// Autonomous worldwide lead sweep. Wired in vercel.json. Like the daily-report
// cron, Vercel attaches `Authorization: Bearer ${CRON_SECRET}` — we require it
// when CRON_SECRET is set so the path can't be triggered by a guesser.
function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // no secret configured → allow (set CRON_SECRET to lock down)
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await loadSecretOverrides();

  // Optional tuning via query: ?cells=3&pages=2 (clamped inside runSweep).
  const cells = Number(req.nextUrl.searchParams.get("cells")) || undefined;
  const pages = Number(req.nextUrl.searchParams.get("pages")) || undefined;

  const result = await runSweep({ cells, maxPagesPerCell: pages });
  return NextResponse.json(result, { status: result.ok ? 200 : 200 });
}
