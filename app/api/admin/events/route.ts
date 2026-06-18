import { NextRequest, NextResponse } from "next/server";
import { isOwner } from "@/lib/auth";
import { listRecentEvents, listEventsSince } from "@/lib/store";
import { loadSecretOverrides } from "@/lib/secrets";

export const runtime = "nodejs";

// Snapshot the event log. The realtime stream lives at /api/admin/stream; this
// endpoint is the cheap polling fallback when EventSource isn't viable.
export async function GET(req: NextRequest) {
  await loadSecretOverrides();
  if (!(await isOwner())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const since = req.nextUrl.searchParams.get("since");
  const limit = Math.min(200, Number(req.nextUrl.searchParams.get("limit") ?? "100"));
  const events = since ? await listEventsSince(since, limit) : await listRecentEvents(limit);
  return NextResponse.json({ events, time: new Date().toISOString() });
}
