import { NextRequest, NextResponse } from "next/server";
import { kvGetJson, kvSetJson, cleanSlug, siteStoreConfigured } from "@/lib/site-store";

export const runtime = "nodejs";

// Multi-tenant Business Console API (Phase 4b). Each published site (slug) is a
// tenant; its owner signs in with slug + access code (provisioned by /api/sites
// on publish) and can read/write ONLY keys under fda:biz:<slug>:*. The live site
// at /s/<slug> renders content/media/promotions/payments at serve time.
// Ported from the factory's data.js handleBiz.
const BIZ_SECTIONS = ["profile", "customers", "appointments", "catalog", "orders", "messages", "settings", "content", "media", "promotions", "payments", "providers"];
const BIZ_TOKEN_TTL = 60 * 60 * 24 * 30; // 30 days

function rndToken(): string {
  return (crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/-/g, "");
}

async function slugFromToken(req: NextRequest, bodyToken?: string): Promise<string | null> {
  const tok = req.headers.get("x-biz-token") || bodyToken || new URL(req.url).searchParams.get("token");
  if (!tok) return null;
  const v = await kvGetJson<{ slug?: string } | string>(`fda:biztoken:${tok}`);
  if (!v) return null;
  return typeof v === "object" ? v.slug ?? null : String(v);
}

export async function GET(req: NextRequest) {
  if (!siteStoreConfigured()) return NextResponse.json({ error: "Storage not configured." }, { status: 500 });
  const action = new URL(req.url).searchParams.get("action");

  if (action === "biz-get") {
    const slug = await slugFromToken(req);
    if (!slug) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    const section = String(new URL(req.url).searchParams.get("section") || "");
    if (!BIZ_SECTIONS.includes(section)) return NextResponse.json({ error: "Unknown section." }, { status: 400 });
    const value = await kvGetJson(`fda:biz:${slug}:${section}`);
    return NextResponse.json({ ok: true, section, value: value ?? null });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  if (!siteStoreConfigured()) return NextResponse.json({ error: "Storage not configured." }, { status: 500 });
  const action = new URL(req.url).searchParams.get("action");
  const body = (await req.json().catch(() => ({}))) as Record<string, any>;

  if (action === "biz-login") {
    const slug = cleanSlug(String(body.slug || ""));
    const code = String(body.code || "").trim();
    if (!slug || !code) return NextResponse.json({ ok: false, error: "Business ID and access code required." }, { status: 400 });
    const auth = await kvGetJson<{ code?: string }>(`fda:biz:${slug}:auth`);
    if (!auth || String(auth.code || "") !== code) return NextResponse.json({ ok: false, error: "Incorrect business ID or access code." }, { status: 401 });
    const token = rndToken();
    await kvSetJson(`fda:biztoken:${token}`, { slug }, BIZ_TOKEN_TTL);
    const profile = (await kvGetJson(`fda:biz:${slug}:profile`)) || {};
    return NextResponse.json({ ok: true, token, slug, profile });
  }

  if (action === "biz-set") {
    const slug = await slugFromToken(req, body.token);
    if (!slug) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    const section = String(body.section || "");
    if (!BIZ_SECTIONS.includes(section)) return NextResponse.json({ error: "Unknown section." }, { status: 400 });
    await kvSetJson(`fda:biz:${slug}:${section}`, body.value == null ? {} : body.value);
    return NextResponse.json({ ok: true, section });
  }

  if (action === "biz-setcode") {
    const slug = await slugFromToken(req, body.token);
    if (!slug) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    const code = String(body.code || "").trim();
    if (code.length < 4) return NextResponse.json({ error: "Code must be at least 4 characters." }, { status: 400 });
    await kvSetJson(`fda:biz:${slug}:auth`, { code });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
