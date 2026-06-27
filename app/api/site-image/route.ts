import { NextRequest, NextResponse } from "next/server";
import { isOwner } from "@/lib/auth";
import { loadSecretOverrides } from "@/lib/secrets";
import { generateImage } from "@/lib/site-image";

export const runtime = "nodejs";
export const maxDuration = 60;

// Owner-gated AI image generation for the website builder.
export async function POST(req: NextRequest) {
  await loadSecretOverrides();
  if (!(await isOwner())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const prompt = typeof body.prompt === "string" ? body.prompt : "";
  const size = typeof body.size === "string" ? body.size : "1024x1024";
  if (!prompt) return NextResponse.json({ error: "Body must include a 'prompt' string." }, { status: 400 });

  const result = await generateImage(prompt, size);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ url: result.url, provider: result.provider });
}
