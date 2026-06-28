import { NextRequest, NextResponse } from "next/server";
import { isOwner } from "@/lib/auth";
import { loadSecretOverrides } from "@/lib/secrets";
import { generateVideo } from "@/lib/site-image";

export const runtime = "nodejs";
export const maxDuration = 300; // video renders are slow; Higgsfield is async + polled

// Owner-gated cinematic video generation (Higgsfield) for the website builder.
//   POST { prompt, aspect?, durationSec?, inputImage? } -> { url, provider }
// Pass inputImage (a hero still URL) to animate it into a looping background film.
export async function POST(req: NextRequest) {
  await loadSecretOverrides();
  if (!(await isOwner())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const prompt = typeof body.prompt === "string" ? body.prompt : "";
  if (!prompt) return NextResponse.json({ error: "Body must include a 'prompt' string." }, { status: 400 });

  const result = await generateVideo(prompt, {
    aspect: typeof body.aspect === "string" ? body.aspect : undefined,
    durationSec: Number(body.durationSec) || undefined,
    inputImage: typeof body.inputImage === "string" ? body.inputImage : undefined,
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ url: result.url, provider: result.provider });
}
