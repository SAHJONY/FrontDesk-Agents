"use client";

import { useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

// Done-for-you website product. Pricing per the v8 product spec: one-time
// builds (Starter / Professional / Enterprise) plus the recurring Care Plan.
const BUILD_TIERS = [
  {
    name: "Starter",
    price: "$499",
    note: "one-time",
    tagline: "A clean, fast site that makes you look established.",
    features: ["Custom 1–3 page design", "Mobile-optimized", "SEO foundation", "Contact form + click-to-call", "SSL + hosting setup", "Live in ~7 days"],
  },
  {
    name: "Professional",
    price: "$999",
    note: "one-time",
    highlight: true,
    tagline: "A complete presence built to convert visitors into clients.",
    features: ["Everything in Starter", "Up to 6 pages", "Conversion-focused layout", "Analytics + lead tracking", "Performance optimization", "Booking / quote request flow"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    note: "quote",
    tagline: "Multi-location, custom features, and integrations.",
    features: ["Everything in Professional", "Unlimited pages", "Multi-location support", "Custom integrations", "Priority delivery", "Dedicated project lead"],
  },
];

const INCLUDED = [
  "Custom design", "Mobile optimization", "SEO foundation", "Contact systems",
  "Analytics", "Hosting configuration", "SSL", "Performance optimization", "Deployment",
];

export default function WebsitesPage() {
  const [business, setBusiness] = useState("");
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState("Professional");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business, email, plan: `website-${tier.toLowerCase()}`, source: "websites-page" }),
      });
      if (!res.ok) throw new Error();
      setStatus("✅ Thanks — we'll email you a proposal within one business day.");
      setBusiness("");
      setEmail("");
    } catch {
      setStatus("⚠️ Something went wrong — please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <Nav />
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[60vh]">
        <img src="/command-center.webp" alt="" className="h-full w-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/80 to-ink" />
      </div>

      <section className="mx-auto max-w-5xl px-5 pt-32 pb-16 text-center">
        <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] uppercase tracking-widest text-gold">
          Done-for-you websites
        </span>
        <h1 className="mt-5 font-display text-4xl font-semibold md:text-6xl">
          A website that wins clients —{" "}
          <span className="text-gradient-gold">built for you</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-400 md:text-base">
          You run the business; we handle the website. Custom design, hosting, SEO, and performance —
          fully managed, launched in days. Pair it with an AI receptionist and never miss a client again.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <a href="#quote" className="btn-gold rounded-xl px-6 py-3 text-sm">Get a free proposal</a>
          <Link href="/pricing" className="btn-ghost rounded-xl px-6 py-3 text-sm">Add an AI receptionist →</Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-8">
        <div className="glass rounded-3xl p-6 md:p-8">
          <h2 className="text-center font-semibold text-slate-200">Every build includes</h2>
          <div className="mt-5 flex flex-wrap justify-center gap-2.5">
            {INCLUDED.map((f) => (
              <span key={f} className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs text-slate-300">
                ✓ {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-5 md:grid-cols-3">
          {BUILD_TIERS.map((t) => (
            <div
              key={t.name}
              className={`rounded-3xl p-6 ${t.highlight ? "glass-gold ring-1 ring-gold/30" : "glass"}`}
            >
              {t.highlight && (
                <span className="rounded-full bg-gold/20 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-gold">Most popular</span>
              )}
              <h3 className="mt-2 font-display text-xl font-semibold">{t.name}</h3>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="font-display text-3xl font-bold text-gold">{t.price}</span>
                <span className="text-xs text-slate-500">{t.note}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">{t.tagline}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-2"><span className="text-teal-glow">✓</span> {f}</li>
                ))}
              </ul>
              <a href="#quote" className={`mt-6 block rounded-xl px-4 py-2.5 text-center text-sm ${t.highlight ? "btn-gold" : "btn-ghost"}`}>
                {t.price === "Custom" ? "Request a quote" : "Get started"}
              </a>
            </div>
          ))}
        </div>

        <div className="glass mt-5 flex flex-wrap items-center justify-between gap-4 rounded-3xl p-6">
          <div>
            <h3 className="font-semibold">Website Care Plan</h3>
            <p className="mt-1 text-xs text-slate-400">Hosting, security, backups, updates, monitoring, and content changes — fully managed.</p>
          </div>
          <div className="text-right">
            <div className="font-display text-2xl font-bold text-emerald-300">$89<span className="text-sm text-slate-500">/mo</span></div>
          </div>
        </div>
      </section>

      <section id="quote" className="mx-auto max-w-2xl px-5 pb-24">
        <div className="glass-gold rounded-3xl p-6 md:p-8">
          <h2 className="font-display text-2xl font-semibold">Get a free proposal</h2>
          <p className="mt-1.5 text-sm text-slate-400">
            Tell us your business — we&apos;ll send a tailored proposal within one business day. No obligation.
          </p>
          <form onSubmit={submit} className="mt-6 space-y-3">
            <input
              value={business}
              onChange={(e) => setBusiness(e.target.value)}
              placeholder="Business name"
              required
              className="w-full rounded-xl border border-white/10 bg-ink-2/80 px-4 py-3 text-sm outline-none focus:border-gold/50"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Work email"
              required
              className="w-full rounded-xl border border-white/10 bg-ink-2/80 px-4 py-3 text-sm outline-none focus:border-gold/50"
            />
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-ink-2/80 px-4 py-3 text-sm"
            >
              {BUILD_TIERS.map((t) => (
                <option key={t.name} value={t.name}>{t.name} — {t.price}</option>
              ))}
            </select>
            <button type="submit" disabled={busy || !business || !email} className="btn-gold w-full rounded-xl py-3 text-sm disabled:opacity-50">
              {busy ? "Sending…" : "Send me a proposal"}
            </button>
          </form>
          {status && <p className="mt-3 text-xs text-slate-300">{status}</p>}
        </div>
      </section>
      <Footer />
    </main>
  );
}
