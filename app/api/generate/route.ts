import { NextRequest, NextResponse } from "next/server";
import { isOwner } from "@/lib/auth";
import { generateWebsite } from "@/lib/website-gen";
import { loadSecretOverrides } from "@/lib/secrets";

export const runtime = "nodejs";
export const maxDuration = 60;

// Owner-gated website generation (the agency builds client sites here). Gating
// prevents the LLM cascade from being abused as a free public endpoint — the
// standalone factory left it open; the unified platform locks it to the operator.
export async function POST(req: NextRequest) {
  await loadSecretOverrides();
  if (!(await isOwner())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const prompt = body?.prompt;
  const maxTokens = Number(body?.maxTokens) || 2000;
  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "Body must include a 'prompt' string." }, { status: 400 });
  }

  const result = await generateWebsite(prompt, maxTokens);
  if (!result.ok) {
    return NextResponse.json({ error: result.error, detail: result.detail }, { status: result.status });
  }
  return NextResponse.json({ text: result.text, engine: result.engine });
}
