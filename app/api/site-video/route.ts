import { NextRequest, NextResponse } from "next/server";
import { isOwner } from "@/lib/auth";
import { loadSecretOverrides } from "@/lib/secrets";
import { generateVideo } from "@/lib/site-image";
import { submitOpenMontageJob, pollOpenMontageJob, openMontageConfigured } from "@/lib/openmontage";

export const runtime = "nodejs";
export const maxDuration = 300; // Higgsfield video renders are slow; async + polled

// Owner-gated cinematic video generation for the website builder. Two engines:
//   • OpenMontage — full agentic production (Python/FFmpeg/Remotion) via an
//     external worker (OPENMONTAGE_URL). Async: returns { jobId, pending }.
//   • Higgsfield — quick cinematic clip. Returns { url } directly.
// Default = OpenMontage when a worker is configured, else Higgsfield. Any worker
// failure transparently falls back to a Higgsfield clip.
//
//   POST { prompt, engine?, aspect?, durationSec?, inputImage?, photos?, business?, type?, city? }
//        -> { url, provider } | { jobId, provider:"openmontage", pending:true }
//   GET  ?job=<id>  -> { state, url, progress }   (poll an OpenMontage job)
export async function GET(req: NextRequest) {
  await loadSecretOverrides();
  if (!(await isOwner())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("job");
  if (!id) return NextResponse.json({ error: "Provide ?job=<id>." }, { status: 400 });
  const s = await pollOpenMontageJob(id);
  if (!s.ok) return NextResponse.json({ state: "error", error: s.error }, { status: s.status });
  return NextResponse.json({ state: s.state, url: s.url, progress: s.progress, provider: "openmontage" });
}

export async function POST(req: NextRequest) {
  await loadSecretOverrides();
  if (!(await isOwner())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const prompt = typeof body.prompt === "string" ? body.prompt : "";
  if (!prompt) return NextResponse.json({ error: "Body must include a 'prompt' string." }, { status: 400 });

  const engine = String((body.engine as string) || ((await openMontageConfigured()) ? "openmontage" : "higgsfield")).toLowerCase();

  // OpenMontage: full production via the external worker (async job).
  if (engine === "openmontage" && (await openMontageConfigured())) {
    const sub = await submitOpenMontageJob({
      prompt,
      business: body.business as string,
      type: body.type as string,
      city: body.city as string,
      durationSec: Number(body.durationSec) || undefined,
      aspect: typeof body.aspect === "string" ? body.aspect : undefined,
      heroImage: typeof body.inputImage === "string" ? body.inputImage : undefined,
      photos: Array.isArray(body.photos) ? (body.photos as string[]) : undefined,
    });
    if (sub.ok) return NextResponse.json({ jobId: sub.jobId, provider: "openmontage", pending: true }, { status: 202 });
    // fall through to Higgsfield if the worker couldn't accept the job
  }

  // Higgsfield: quick cinematic clip (also the fallback).
  const result = await generateVideo(prompt, {
    aspect: typeof body.aspect === "string" ? body.aspect : undefined,
    durationSec: Number(body.durationSec) || undefined,
    inputImage: typeof body.inputImage === "string" ? body.inputImage : undefined,
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ url: result.url, provider: result.provider });
}
