import { NextRequest, NextResponse } from "next/server";
import { isOwner } from "@/lib/auth";
import { loadSecretOverrides } from "@/lib/secrets";
import { recordEvent } from "@/lib/store";
import {
  siteStoreConfigured,
  listSitesIndex,
  saveSite,
  deleteSite,
  setSiteStatus,
} from "@/lib/site-store";

export const runtime = "nodejs";

// Owner-only: save / list / delete / status published websites. Ported from the
// factory's api/sites.js; storage is Upstash (index at fda:sites:index).
async function guard() {
  await loadSecretOverrides();
  if (!(await isOwner())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!siteStoreConfigured()) return NextResponse.json({ error: "Upstash is not configured; cannot save sites." }, { status: 500 });
  return null;
}

export async function GET() {
  const blocked = await guard();
  if (blocked) return blocked;
  return NextResponse.json({ sites: await listSitesIndex() });
}

export async function POST(req: NextRequest) {
  const blocked = await guard();
  if (blocked) return blocked;

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  if (body.delete) {
    const slug = await deleteSite(String(body.slug || ""));
    return NextResponse.json({ ok: true, deleted: slug });
  }

  if (body.action === "status") {
    const status = body.status === "active" ? "active" : "suspended";
    try {
      await setSiteStatus(String(body.slug || ""), status);
    } catch {
      return NextResponse.json({ error: "Site not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, slug: body.slug, status });
  }

  const html = body.html;
  if (!html || typeof html !== "string") return NextResponse.json({ error: "Missing site html." }, { status: 400 });
  if (html.length > 4_000_000) return NextResponse.json({ error: "Site is too large to publish." }, { status: 413 });

  const saved = await saveSite({
    name: String(body.name || "Website"),
    html,
    slug: body.slug ? String(body.slug) : undefined,
    status: body.status ? String(body.status) : undefined,
    bizType: body.bizType ? String(body.bizType) : undefined,
    bizCity: body.bizCity ? String(body.bizCity) : undefined,
  });
  recordEvent("site:published", { slug: saved.slug, name: String(body.name || "Website") });
  return NextResponse.json({ ok: true, ...saved, console: `/business.html?slug=${saved.slug}` });
}
