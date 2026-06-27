"use client";

import { useCallback, useEffect, useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

type SiteEntry = { name: string; slug: string; at: string; status?: string };

// The prompt that turns a business brief into a complete, single-file website.
function buildPrompt(brief: string) {
  return `You are an elite web designer. Output a COMPLETE, single self-contained HTML document (inline CSS, no external build) for the business described below. Modern, premium, mobile-first, fast. Include: hero, services, about, testimonials, contact section, and a footer. Use semantic HTML and tasteful animation. Return ONLY the HTML, starting with <!doctype html>. Business brief:\n\n${brief}`;
}

function extractHtml(text: string): string {
  const fence = text.match(/```(?:html)?\s*([\s\S]*?)```/i);
  let html = fence ? fence[1] : text;
  const idx = html.toLowerCase().indexOf("<!doctype");
  if (idx > 0) html = html.slice(idx);
  return html.trim();
}

export default function BuilderPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [brief, setBrief] = useState("");
  const [name, setName] = useState("");
  const [html, setHtml] = useState("");
  const [engine, setEngine] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [sites, setSites] = useState<SiteEntry[]>([]);
  const [lookupName, setLookupName] = useState("");
  const [lookupAddr, setLookupAddr] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  async function research() {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/leads-find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lookup: true, name: lookupName, address: lookupAddr }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lookup failed");
      const b = data.business;
      setName(b.name || lookupName);
      setPhotos(Array.isArray(b.photos) ? b.photos : []);
      const social = b.social && Object.keys(b.social).length ? `\nSocial: ${Object.entries(b.social).map(([k, v]) => `${k}: ${v}`).join(", ")}` : "";
      const reviews = (b.reviews || []).slice(0, 3).map((r: { text: string }) => `“${r.text}”`).join(" ");
      setBrief(
        [
          `${b.name} — ${b.type}${b.city ? ` in ${b.city}` : ""}.`,
          b.address && `Address: ${b.address}.`,
          b.phone && `Phone: ${b.phone}.`,
          b.hours?.length && `Hours: ${b.hours.join("; ")}.`,
          b.about && `About: ${b.about}`,
          b.rating && `Rating: ${b.rating}★ (${b.reviewsCount} reviews).`,
          reviews && `Reviews: ${reviews}`,
          photos.length && `Use these real photos: ${(b.photos || []).join(", ")}`,
          social,
        ].filter(Boolean).join("\n")
      );
      setStatus(`✅ Found "${b.name}" — ${(b.photos || []).length} photo(s) imported. Review the brief, then generate.`);
    } catch (e) {
      setStatus(`⚠️ ${e instanceof Error ? e.message : "Lookup failed"}`);
    } finally {
      setBusy(false);
    }
  }

  const loadSites = useCallback(async () => {
    const res = await fetch("/api/sites");
    if (res.status === 401) { setAuthed(false); return; }
    if (res.ok) { setAuthed(true); setSites((await res.json()).sites ?? []); }
  }, []);

  useEffect(() => { loadSites(); }, [loadSites]);

  async function generate() {
    setBusy(true);
    setStatus(null);
    setHtml("");
    setEngine(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildPrompt(brief), maxTokens: 4000 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setHtml(extractHtml(data.text));
      setEngine(data.engine);
      setStatus(`✅ Generated via ${data.engine}`);
    } catch (e) {
      setStatus(`⚠️ ${e instanceof Error ? e.message : "Generation failed"}`);
    } finally {
      setBusy(false);
    }
  }

  async function paymentLink(slug: string, siteName: string) {
    const build = Number(prompt("One-time build price (USD)?", "999") || 0);
    const monthly = Number(prompt("Monthly care plan (USD)? 0 for none", "89") || 0);
    if (!build && !monthly) return;
    setStatus("Creating payment link…");
    try {
      const res = await fetch("/api/sites/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, name: siteName, build, monthly }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      if (data.message) { try { await navigator.clipboard?.writeText(data.message); } catch {} }
      setStatus(`✅ Payment link ready (copied). ${data.url || "(manual options sent)"}`);
    } catch (e) {
      setStatus(`⚠️ ${e instanceof Error ? e.message : "Checkout failed"}`);
    }
  }

  async function publish() {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || "Website", html }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Publish failed");
      setStatus(`✅ Published → ${data.url} · console code ${data.bizCode}`);
      await loadSites();
    } catch (e) {
      setStatus(`⚠️ ${e instanceof Error ? e.message : "Publish failed"}`);
    } finally {
      setBusy(false);
    }
  }

  if (authed === false) {
    return (
      <main>
        <Nav />
        <section className="mx-auto max-w-2xl px-5 pt-32 pb-24 text-center">
          <h1 className="font-display text-3xl font-semibold">Website <span className="text-gradient-gold">Builder</span></h1>
          <p className="mt-3 text-sm text-slate-400">Operator-only. Sign in to the admin console first.</p>
          <a href="/admin" className="btn-gold mt-6 inline-block rounded-xl px-6 py-3 text-sm">Go to admin →</a>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Nav />
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[55vh]">
        <img src="/command-center.webp" alt="" className="h-full w-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/85 to-ink" />
      </div>

      <section className="mx-auto max-w-6xl px-5 pt-32 pb-24">
        <h1 className="font-display text-4xl font-semibold md:text-5xl">
          Website <span className="text-gradient-gold">Builder</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">Describe the business → generate a complete site → publish it to a live <code className="text-teal-glow">/s/&lt;slug&gt;</code> URL.</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="glass rounded-3xl p-6">
            <div className="mb-5 rounded-2xl border border-gold/20 bg-gold/5 p-4">
              <label className="text-xs uppercase tracking-widest text-gold">🔎 Autonomous research (Google Maps)</label>
              <p className="mt-1 text-[11px] text-slate-400">Enter a business name + address — we pull its real data, hours, reviews & official photos to auto-fill the brief.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <input value={lookupName} onChange={(e) => setLookupName(e.target.value)} placeholder="Business name" className="rounded-xl border border-white/10 bg-ink-2/80 px-3 py-2.5 text-sm outline-none focus:border-gold/50" />
                <input value={lookupAddr} onChange={(e) => setLookupAddr(e.target.value)} placeholder="City / address" className="rounded-xl border border-white/10 bg-ink-2/80 px-3 py-2.5 text-sm outline-none focus:border-gold/50" />
                <button onClick={research} disabled={busy || !lookupName.trim()} className="btn-gold rounded-xl px-4 py-2.5 text-sm disabled:opacity-50">{busy ? "…" : "Research"}</button>
              </div>
              {photos.length > 0 && (
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {photos.map((u) => (
                    <img key={u} src={u} alt="" className="h-16 w-24 shrink-0 rounded-lg object-cover" />
                  ))}
                </div>
              )}
            </div>
            <label className="text-xs uppercase tracking-widest text-slate-500">Business name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Bright Smile Dental" className="mt-2 w-full rounded-xl border border-white/10 bg-ink-2/80 px-4 py-3 text-sm outline-none focus:border-gold/50" />
            <label className="mt-4 block text-xs uppercase tracking-widest text-slate-500">Business brief</label>
            <textarea value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="Dental practice in Cleveland, OH. Services: cleanings, whitening, implants. Warm, modern, trustworthy. Book online. Hours Mon–Fri 8–6." className="mt-2 min-h-[180px] w-full rounded-xl border border-white/10 bg-ink-2/80 px-4 py-3 text-sm outline-none focus:border-gold/50" />
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={generate} disabled={busy || !brief.trim()} className="btn-gold rounded-xl px-5 py-2.5 text-sm disabled:opacity-50">
                {busy ? "Working…" : "✨ Generate site"}
              </button>
              <button onClick={publish} disabled={busy || !html} className="btn-ghost rounded-xl px-5 py-2.5 text-sm disabled:opacity-50">
                Publish →
              </button>
            </div>
            {status && <p className="mt-3 text-xs text-slate-300">{status}</p>}
          </div>

          <div className="glass rounded-3xl p-3">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs uppercase tracking-widest text-slate-500">Live preview</span>
              {engine && <span className="text-[10px] text-teal-glow">{engine}</span>}
            </div>
            {html ? (
              <iframe title="preview" srcDoc={html} className="h-[480px] w-full rounded-2xl border border-white/10 bg-white" />
            ) : (
              <div className="flex h-[480px] items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-slate-500">
                Generated site appears here
              </div>
            )}
          </div>
        </div>

        <div className="glass mt-6 rounded-3xl p-6">
          <h3 className="font-semibold">Published sites ({sites.length})</h3>
          {sites.length === 0 ? (
            <p className="mt-3 text-xs text-slate-500">No sites published yet. Generate one above.</p>
          ) : (
            <ul className="mt-4 divide-y divide-white/5">
              {sites.map((s) => (
                <li key={s.slug} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <a href={`/s/${s.slug}`} target="_blank" rel="noreferrer" className="text-xs text-teal-glow underline">/s/{s.slug}</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => paymentLink(s.slug, s.name)} className="rounded-lg border border-gold/30 px-2.5 py-1 text-[11px] text-gold hover:bg-gold/10">💳 Payment link</button>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wider ${s.status === "active" || !s.status ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-400/15 text-amber-300"}`}>
                      {s.status || "active"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
