import { NextRequest, NextResponse } from "next/server";
import { translateBatch, SUPPORTED_LANGS } from "@/lib/translate";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  return NextResponse.json({ languages: SUPPORTED_LANGS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const lang = String(body.lang ?? "").toLowerCase().slice(0, 5);
    if (!SUPPORTED_LANGS[lang]) {
      return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
    }
    const texts: string[] = Array.isArray(body.texts)
      ? body.texts.slice(0, 250).map((t: unknown) => String(t).slice(0, 500))
      : [];
    if (texts.length === 0) {
      return NextResponse.json({ translations: [] });
    }
    const translations = await translateBatch(lang, texts);
    return NextResponse.json({ translations });
  } catch {
    return NextResponse.json({ error: "Translation unavailable" }, { status: 500 });
  }
}
