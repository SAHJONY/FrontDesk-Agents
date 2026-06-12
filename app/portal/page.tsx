"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

type Me = {
  customer: { id: string; email: string; name?: string; business?: string };
  plan: { id: string; name: string; price: number; cap: number } | null;
  subscription: { status: string; provider: string; renews?: string } | null;
  usage: { used: number; cap: number };
};

function AuthCard({ onAuthed }: { onAuthed: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ email: "", password: "", business: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/portal/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      onAuthed();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass mx-auto max-w-md rounded-3xl p-8">
      <h1 className="text-center font-display text-3xl font-semibold">
        Customer <span className="text-gradient-gold">Portal</span>
      </h1>
      <div className="mt-6 flex rounded-xl bg-white/5 p-1 text-sm">
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 rounded-lg py-2 transition ${mode === m ? "bg-gradient-to-r from-[#f0d293] to-[#d4a843] font-semibold text-[#1a1206]" : "text-slate-300"}`}
          >
            {m === "login" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="mt-6 space-y-3">
        {mode === "register" && (
          <input
            value={form.business}
            onChange={(e) => setForm({ ...form, business: e.target.value })}
            placeholder="Business name"
            className="w-full rounded-xl border border-white/10 bg-ink-2/80 px-4 py-3 text-sm outline-none focus:border-teal-glow/50"
          />
        )}
        <input
          type="email"
          autoComplete="username"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email"
          className="w-full rounded-xl border border-white/10 bg-ink-2/80 px-4 py-3 text-sm outline-none focus:border-teal-glow/50"
        />
        <input
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder={mode === "register" ? "Password (8+ characters)" : "Password"}
          className="w-full rounded-xl border border-white/10 bg-ink-2/80 px-4 py-3 text-sm outline-none focus:border-teal-glow/50"
        />
        {error && <p className="text-xs text-red-300">{error}</p>}
        <button type="submit" disabled={busy || !form.email || !form.password} className="btn-gold w-full rounded-xl py-3 text-sm disabled:opacity-50">
          {busy ? "One moment…" : mode === "login" ? "Sign in" : "Create my account"}
        </button>
      </form>
      <p className="mt-4 text-center text-xs text-slate-500">
        Every account starts on the Free plan — no card required.
      </p>
    </div>
  );
}

export default function PortalPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  async function load() {
    const res = await fetch("/api/portal/me");
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    setMe(await res.json());
    setAuthed(true);
  }

  useEffect(() => {
    load();
  }, []);

  const embed = me
    ? `<script src="https://www.frontdeskagents.com/widget.js" data-customer="${me.customer.id}" async></script>`
    : "";
  const pct = me ? Math.min(100, Math.round((me.usage.used / Math.max(1, me.usage.cap)) * 100)) : 0;

  return (
    <main>
      <Nav />
      <section className="mx-auto max-w-4xl px-5 pt-32 pb-24">
        {authed === null && <p className="text-center text-slate-500">Loading…</p>}
        {authed === false && <AuthCard onAuthed={load} />}
        {authed && me && (
          <>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="font-display text-4xl font-semibold">
                  Welcome{me.customer.business ? `, ${me.customer.business}` : ""}
                </h1>
                <p className="mt-1 text-sm text-slate-400">{me.customer.email}</p>
              </div>
              <button
                onClick={async () => {
                  await fetch("/api/portal/auth", { method: "DELETE" });
                  setAuthed(false);
                  setMe(null);
                }}
                className="btn-ghost rounded-xl px-4 py-2 text-xs"
              >
                Sign out
              </button>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <div className="glass rounded-3xl p-6">
                <div className="text-xs uppercase tracking-widest text-slate-500">Your plan</div>
                <div className="mt-2 font-display text-3xl font-bold text-gradient-gold">{me.plan?.name ?? "Free"}</div>
                <div className="mt-1 text-sm text-slate-400">
                  {me.plan && me.plan.price > 0 ? `$${me.plan.price}/month` : "Free forever"}
                  {me.subscription ? ` · ${me.subscription.status}` : ""}
                </div>
                <Link href="/pricing" className="btn-gold mt-5 inline-block rounded-xl px-5 py-2.5 text-sm">
                  {me.plan && me.plan.price > 0 ? "Change plan" : "Upgrade"}
                </Link>
              </div>

              <div className="glass rounded-3xl p-6">
                <div className="text-xs uppercase tracking-widest text-slate-500">AI chats this month</div>
                <div className="mt-2 font-display text-3xl font-bold text-teal-glow">
                  {me.usage.used} <span className="text-base text-slate-500">/ {me.usage.cap}</span>
                </div>
                <div className="mt-4 h-2 rounded-full bg-white/5">
                  <div
                    className={`h-2 rounded-full ${pct > 90 ? "bg-red-400" : "bg-gradient-to-r from-[#2dd4bf] to-[#d4a843]"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">Resets monthly. Upgrade anytime for a higher cap.</p>
              </div>
            </div>

            <div className="glass mt-5 rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Add AVA to your website</h2>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(embed);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="btn-ghost rounded-lg px-3 py-1.5 text-xs"
                >
                  {copied ? "Copied ✓" : "Copy"}
                </button>
              </div>
              <pre data-no-translate className="scrollbar-slim mt-3 overflow-x-auto rounded-xl bg-ink-2/80 p-4 text-xs text-teal-100/90">{embed}</pre>
              <p className="mt-2 text-xs text-slate-500">
                Paste this one line before the closing &lt;/body&gt; tag of your site — AVA starts answering instantly,
                and every conversation counts against your plan above.
              </p>
            </div>

            <div className="glass mt-5 rounded-3xl p-6">
              <h2 className="font-semibold">Need anything?</h2>
              <p className="mt-2 text-sm text-slate-400">
                Talk to <Link href="/demo" className="text-teal-glow underline">AVA</Link> any time, or email{" "}
                <a href="mailto:frontdeskllc@outlook.com" className="text-teal-glow underline">support</a> — a human
                replies within one business day.
              </p>
            </div>
          </>
        )}
      </section>
      <Footer />
    </main>
  );
}
