"use client";

import { useCallback, useEffect, useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

// Multi-tenant Business Console (Phase 4b). A site owner signs in with their
// Business ID (slug) + access code and edits the content/photos/videos/
// promotions/payments that render live on /s/<slug> — no rebuild, no agency.
const inputCls = "w-full rounded-xl border border-white/10 bg-ink-2/80 px-3 py-2.5 text-sm outline-none focus:border-gold/50";

type Promo = { title?: string; body?: string; code?: string; active?: boolean };
type Pay = { label?: string; handle?: string; url?: string };

export default function BusinessConsolePage() {
  const [token, setToken] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Section state
  const [textRows, setTextRows] = useState<{ k: string; v: string }[]>([{ k: "", v: "" }]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [pays, setPays] = useState<Pay[]>([]);
  const [newCode, setNewCode] = useState("");

  const authedFetch = useCallback(
    (url: string, opts: RequestInit = {}) =>
      fetch(url, { ...opts, headers: { "Content-Type": "application/json", "x-biz-token": token || "", ...(opts.headers || {}) } }),
    [token]
  );

  const loadSection = useCallback(
    async (section: string) => {
      const r = await authedFetch(`/api/biz?action=biz-get&section=${section}`);
      if (!r.ok) return null;
      return (await r.json()).value;
    },
    [authedFetch]
  );

  const loadAll = useCallback(async () => {
    const content: any = (await loadSection("content")) || {};
    const t = content.text || {};
    setTextRows(Object.keys(t).length ? Object.entries(t).map(([k, v]) => ({ k, v: String(v) })) : [{ k: "", v: "" }]);
    const media: any = (await loadSection("media")) || {};
    setPhotos(Array.isArray(media.photos) ? media.photos : []);
    setVideos(Array.isArray(media.videos) ? media.videos : []);
    const promo: any = (await loadSection("promotions")) || {};
    setPromos(Array.isArray(promo.items) ? promo.items : Array.isArray(promo) ? promo : []);
    const pay: any = (await loadSection("payments")) || {};
    setPays(Array.isArray(pay.customer) ? pay.customer : []);
  }, [loadSection]);

  useEffect(() => {
    if (token) loadAll();
  }, [token, loadAll]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch("/api/biz?action=biz-login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, code }) });
      const d = await r.json();
      if (!r.ok || !d.ok) throw new Error(d.error || "Sign-in failed");
      setToken(d.token);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  async function save(section: string, value: unknown, label: string) {
    setBusy(true);
    setMsg(null);
    try {
      const r = await authedFetch("/api/biz?action=biz-set", { method: "POST", body: JSON.stringify({ section, value }) });
      if (!r.ok) throw new Error((await r.json()).error || "Save failed");
      setMsg(`✅ ${label} saved — live on your site.`);
    } catch (e) {
      setMsg(`⚠️ ${e instanceof Error ? e.message : "Save failed"}`);
    } finally {
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <main>
        <Nav />
        <section className="mx-auto max-w-md px-5 pt-32 pb-24">
          <div className="glass rounded-3xl p-8">
            <h1 className="font-display text-2xl font-semibold">Business <span className="text-gradient-gold">Console</span></h1>
            <p className="mt-1.5 text-xs text-slate-500">Edit your website&apos;s content, photos, promotions, and payment options — instantly.</p>
            <form onSubmit={login} className="mt-6 space-y-3">
              <input className={inputCls} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Business ID (your site address)" />
              <input className={inputCls} type="password" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Access code" />
              {err && <p className="text-xs text-red-300">{err}</p>}
              <button disabled={busy || !slug || !code} className="btn-gold w-full rounded-xl py-3 text-sm disabled:opacity-50">{busy ? "Signing in…" : "Sign in"}</button>
            </form>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Nav />
      <section className="mx-auto max-w-3xl px-5 pt-32 pb-24">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold">Your <span className="text-gradient-gold">Business Console</span></h1>
            <a href={`/s/${slug}`} target="_blank" rel="noreferrer" className="text-xs text-teal-glow underline">View your live site → /s/{slug}</a>
          </div>
          <button onClick={() => setToken(null)} className="btn-ghost rounded-xl px-4 py-2 text-xs">Sign out</button>
        </div>
        {msg && <p className="mt-4 text-xs text-slate-300">{msg}</p>}

        {/* Content text overrides */}
        <div className="glass mt-6 rounded-3xl p-6">
          <h3 className="font-semibold">Page text</h3>
          <p className="mt-1 text-[11px] text-slate-500">Override any editable text block by its key (matches data-edit on your site).</p>
          <div className="mt-4 space-y-2">
            {textRows.map((row, i) => (
              <div key={i} className="flex gap-2">
                <input className={`${inputCls} max-w-[36%]`} value={row.k} onChange={(e) => setTextRows(textRows.map((r, j) => (j === i ? { ...r, k: e.target.value } : r)))} placeholder="key (e.g. headline)" />
                <input className={inputCls} value={row.v} onChange={(e) => setTextRows(textRows.map((r, j) => (j === i ? { ...r, v: e.target.value } : r)))} placeholder="new text" />
                <button onClick={() => setTextRows(textRows.filter((_, j) => j !== i))} className="btn-ghost shrink-0 rounded-xl px-3 text-xs">✕</button>
              </div>
            ))}
            <button onClick={() => setTextRows([...textRows, { k: "", v: "" }])} className="text-xs text-teal-glow hover:underline">+ Add text override</button>
          </div>
          <button onClick={() => save("content", { text: Object.fromEntries(textRows.filter((r) => r.k.trim()).map((r) => [r.k.trim(), r.v])) }, "Page text")} disabled={busy} className="btn-gold mt-4 rounded-xl px-5 py-2.5 text-sm disabled:opacity-50">Save text</button>
        </div>

        {/* Media */}
        <ListEditor title="Photos" hint="Image URLs added to your gallery." items={photos} setItems={setPhotos} placeholder="https://…/photo.jpg" onSave={() => save("media", { photos, videos }, "Photos")} busy={busy} />
        <ListEditor title="Videos" hint="YouTube/Vimeo/MP4 URLs (embedded as players)." items={videos} setItems={setVideos} placeholder="https://youtube.com/watch?v=…" onSave={() => save("media", { photos, videos }, "Videos")} busy={busy} />

        {/* Promotions */}
        <div className="glass mt-6 rounded-3xl p-6">
          <h3 className="font-semibold">Promotions</h3>
          <div className="mt-4 space-y-3">
            {promos.map((p, i) => (
              <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-3">
                <input className={inputCls} value={p.title || ""} onChange={(e) => setPromos(promos.map((q, j) => (j === i ? { ...q, title: e.target.value } : q)))} placeholder="Title (e.g. 20% off this week)" />
                <input className={`${inputCls} mt-2`} value={p.body || ""} onChange={(e) => setPromos(promos.map((q, j) => (j === i ? { ...q, body: e.target.value } : q)))} placeholder="Details" />
                <div className="mt-2 flex gap-2">
                  <input className={inputCls} value={p.code || ""} onChange={(e) => setPromos(promos.map((q, j) => (j === i ? { ...q, code: e.target.value } : q)))} placeholder="Code (optional)" />
                  <button onClick={() => setPromos(promos.filter((_, j) => j !== i))} className="btn-ghost shrink-0 rounded-xl px-3 text-xs">Remove</button>
                </div>
              </div>
            ))}
            <button onClick={() => setPromos([...promos, { active: true }])} className="text-xs text-teal-glow hover:underline">+ Add promotion</button>
          </div>
          <button onClick={() => save("promotions", { items: promos.filter((p) => p.title || p.body) }, "Promotions")} disabled={busy} className="btn-gold mt-4 rounded-xl px-5 py-2.5 text-sm disabled:opacity-50">Save promotions</button>
        </div>

        {/* Payments */}
        <div className="glass mt-6 rounded-3xl p-6">
          <h3 className="font-semibold">Payment options (shown to your customers)</h3>
          <div className="mt-4 space-y-3">
            {pays.map((p, i) => (
              <div key={i} className="flex flex-wrap gap-2">
                <input className={`${inputCls} max-w-[30%]`} value={p.label || ""} onChange={(e) => setPays(pays.map((q, j) => (j === i ? { ...q, label: e.target.value } : q)))} placeholder="Label (e.g. Cash App)" />
                <input className={`${inputCls} max-w-[28%]`} value={p.handle || ""} onChange={(e) => setPays(pays.map((q, j) => (j === i ? { ...q, handle: e.target.value } : q)))} placeholder="Handle ($tag)" />
                <input className={inputCls} value={p.url || ""} onChange={(e) => setPays(pays.map((q, j) => (j === i ? { ...q, url: e.target.value } : q)))} placeholder="Pay link (optional)" />
                <button onClick={() => setPays(pays.filter((_, j) => j !== i))} className="btn-ghost shrink-0 rounded-xl px-3 text-xs">✕</button>
              </div>
            ))}
            <button onClick={() => setPays([...pays, {}])} className="text-xs text-teal-glow hover:underline">+ Add payment option</button>
          </div>
          <button onClick={() => save("payments", { customer: pays.filter((p) => p.label) }, "Payment options")} disabled={busy} className="btn-gold mt-4 rounded-xl px-5 py-2.5 text-sm disabled:opacity-50">Save payments</button>
        </div>

        {/* Access code */}
        <div className="glass mt-6 rounded-3xl p-6">
          <h3 className="font-semibold">Change access code</h3>
          <div className="mt-3 flex gap-2">
            <input className={inputCls} type="password" value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="New code (min 4 chars)" />
            <button
              onClick={async () => {
                setBusy(true); setMsg(null);
                try {
                  const r = await authedFetch("/api/biz?action=biz-setcode", { method: "POST", body: JSON.stringify({ code: newCode }) });
                  if (!r.ok) throw new Error((await r.json()).error || "Failed");
                  setNewCode(""); setMsg("✅ Access code updated.");
                } catch (e) { setMsg(`⚠️ ${e instanceof Error ? e.message : "Failed"}`); } finally { setBusy(false); }
              }}
              disabled={busy || newCode.length < 4}
              className="btn-gold shrink-0 rounded-xl px-5 py-2.5 text-sm disabled:opacity-50"
            >
              Update code
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function ListEditor({ title, hint, items, setItems, placeholder, onSave, busy }: { title: string; hint: string; items: string[]; setItems: (v: string[]) => void; placeholder: string; onSave: () => void; busy: boolean }) {
  return (
    <div className="glass mt-6 rounded-3xl p-6">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-[11px] text-slate-500">{hint}</p>
      <div className="mt-4 space-y-2">
        {items.map((u, i) => (
          <div key={i} className="flex gap-2">
            <input className="w-full rounded-xl border border-white/10 bg-ink-2/80 px-3 py-2.5 text-sm outline-none focus:border-gold/50" value={u} onChange={(e) => setItems(items.map((v, j) => (j === i ? e.target.value : v)))} placeholder={placeholder} />
            <button onClick={() => setItems(items.filter((_, j) => j !== i))} className="btn-ghost shrink-0 rounded-xl px-3 text-xs">✕</button>
          </div>
        ))}
        <button onClick={() => setItems([...items, ""])} className="text-xs text-teal-glow hover:underline">+ Add {title.toLowerCase().replace(/s$/, "")}</button>
      </div>
      <button onClick={onSave} disabled={busy} className="btn-gold mt-4 rounded-xl px-5 py-2.5 text-sm disabled:opacity-50">Save {title.toLowerCase()}</button>
    </div>
  );
}
