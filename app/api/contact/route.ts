import { NextRequest, NextResponse } from "next/server";
import { kvGetJson, kvSetJson, siteStoreConfigured } from "@/lib/site-store";
import { tgHandleUpdate, tgNotifyOwner } from "@/lib/telegram";
import { addLead } from "@/lib/store";

export const runtime = "nodejs";

// PUBLIC, write-only contact intake — the endpoint hosted sites (/s/<slug>) and
// the Telegram webhook (?tg=1) post to. Ported from the factory's contact.js.
//   - ?tg=1            → Telegram webhook → autonomous Ava agent
//   - { bizSlug, ... } → append to that business's console inbox
//   - else             → agency inbox + platform CRM + owner Telegram ping
const INBOX_KEY = "fda:contact:inbox";
const MAX = 500;
const clean = (v: unknown) => String(v == null ? "" : v).slice(0, 2000);

export async function POST(req: NextRequest) {
  const url = new URL(req.url);

  // Telegram webhook
  if (url.searchParams.get("tg")) {
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (secret && req.headers.get("x-telegram-bot-api-secret-token") !== secret) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
    const upd = await req.json().catch(() => ({}));
    try { await tgHandleUpdate(upd); } catch { /* never retry-storm */ }
    return NextResponse.json({ ok: true });
  }

  if (!siteStoreConfigured()) return NextResponse.json({ error: "Inbox is not configured (Upstash env vars missing)." }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as Record<string, any>;

  // Message from a visitor on a published client site → that business's console.
  const bizSlug = String(body.bizSlug || "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 60);
  if (bizSlug) {
    if (!clean(body.name).trim() || !clean(body.contact).trim()) {
      return NextResponse.json({ error: "name and contact are required." }, { status: 400 });
    }
    const msg = { id: Date.now(), name: clean(body.name), contact: clean(body.contact), message: clean(body.message || body.notes), status: "new", at: new Date().toISOString() };
    try {
      const key = `fda:biz:${bizSlug}:messages`;
      const list = (await kvGetJson<any[]>(key)) || [];
      const next = (Array.isArray(list) ? list : []);
      next.unshift(msg);
      await kvSetJson(key, next.slice(0, MAX));
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json({ error: "Could not send your message. Please try again." }, { status: 502 });
    }
  }

  if (!clean(body.name).trim() || !clean(body.type).trim() || !clean(body.contact).trim()) {
    return NextResponse.json({ error: "name, type and contact are required." }, { status: 400 });
  }

  const entry = {
    id: Date.now(),
    name: clean(body.name), type: clean(body.type), contact: clean(body.contact),
    city: clean(body.city), url: clean(body.url), notes: clean(body.notes), ref: clean(body.ref).slice(0, 24),
    at: new Date().toISOString(),
  };

  try {
    const list = (await kvGetJson<any[]>(INBOX_KEY)) || [];
    const next = Array.isArray(list) ? list : [];
    next.push(entry);
    await kvSetJson(INBOX_KEY, next.slice(-MAX));

    // Also surface in the platform CRM so it shows in /admin Leads + scoring.
    const contact = entry.contact;
    const isEmail = /@/.test(contact);
    addLead({
      email: isEmail ? contact : undefined,
      phone: isEmail ? undefined : contact,
      business: entry.name,
      industry: entry.type || undefined,
      source: "contact-form",
    }).catch(() => {});

    tgNotifyOwner(
      `📥 <b>New website request</b>\n<b>${entry.name}</b> — ${entry.type}\n📞 ${entry.contact}` +
        (entry.city ? `\n📍 ${entry.city}` : "") + (entry.notes ? `\n📝 ${entry.notes}` : "")
    ).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not save your message. Please try again." }, { status: 502 });
  }
}
