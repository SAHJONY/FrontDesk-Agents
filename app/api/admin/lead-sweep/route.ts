import { NextRequest, NextResponse } from "next/server";
import { isOwner } from "@/lib/auth";
import { loadSecretOverrides } from "@/lib/secrets";
import { runSweep, getSweepState, gridSize, METROS, INDUSTRIES } from "@/lib/lead-sweep";

export const runtime = "nodejs";
export const maxDuration = 300;

// Owner-only control surface for the worldwide lead-sweep engine.
//   GET           -> current cursor/state + coverage stats
//   POST { cells, pages } -> run one batch right now (manual trigger)
export async function GET() {
  await loadSecretOverrides();
  if (!(await isOwner())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const state = await getSweepState();
  const total = gridSize();
  return NextResponse.json({
    state,
    coverage: {
      gridSize: total,
      metros: METROS.length,
      industries: INDUSTRIES.length,
      cyclePercent: total ? Math.round((state.cursor / total) * 100) : 0,
    },
  });
}

export async function POST(req: NextRequest) {
  await loadSecretOverrides();
  if (!(await isOwner())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Record<string, any>;
  const result = await runSweep({ cells: Number(body.cells) || undefined, maxPagesPerCell: Number(body.pages) || undefined });
  return NextResponse.json(result, { status: result.ok ? 200 : 200 });
}
