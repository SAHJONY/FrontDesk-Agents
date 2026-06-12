"use client";

import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { AGENTS, PLANS } from "@/lib/plans";

type Booking = { id?: string; name: string; service: string; datetime: string; phone: string; createdAt: string };
type Lead = { id: string; phone?: string; email?: string; business?: string; industry?: string; plan?: string; source: string; createdAt: string };
type Overview = {
  bookings: Booking[];
  leads: Lead[];
  finances: { mrr: number; arr: number; pipeline: number };
  integrations: { brains: string[]; bland: boolean };
};

const TABS = ["Overview", "Finances", "Agents", "Bookings", "Leads", "Integrations"] as const;

function LoginGate({ onAuth }: { onAuth: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error();
      onAuth();
    } catch {
      setError("Invalid credentials.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass mx-auto mt-10 max-w-md rounded-3xl p-8">
      <div className="text-center">
        <img src="/icon.svg" alt="" className="mx-auto h-12 w-12 rounded-xl" />
        <h1 className="mt-4 font-display text-2xl font-semibold">
          Admin <span className="text-gradient-gold">login</span>
        </h1>
        <p className="mt-1.5 text-xs text-slate-500">Restricted — operator credentials required</p>
      </div>
      <form onSubmit={login} className="mt-7 space-y-3">
        <input
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Executive email"
          className="w-full rounded-xl border border-white/10 bg-ink-2/80 px-4 py-3 text-sm outline-none focus:border-teal-glow/50"
        />
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-xl border border-white/10 bg-ink-2/80 px-4 py-3 text-sm outline-none focus:border-teal-glow/50"
        />
        {error && <p className="text-xs text-red-300">{error}</p>}
        <button type="submit" disabled={busy || !email || !password} className="btn-gold w-full rounded-xl py-3 text-sm disabled:opacity-50">
          {busy ? "Verifying…" : "Unlock the platform"}
        </button>
      </form>
    </div>
  );
}

function Stat({ label, value, accent = "text-teal-glow" }: { label: string; value: string; accent?: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="text-xs uppercase tracking-widest text-slate-500">{label}</div>
      <div className={`mt-2 font-display text-3xl font-bold ${accent}`}>{value}</div>
    </div>
  );
}

function CallLauncher({ blandActive }: { blandActive: boolean }) {
  const [phone, setPhone] = useState("");
  const [task, setTask] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function launch() {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, task }),
      });
      const data = await res.json();
      setStatus(res.ok ? `✅ Call launched (id: ${data.callId ?? "queued"})` : `⚠️ ${data.error}`);
    } catch {
      setStatus("⚠️ Network error — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass-gold rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">ARIA outbound call — Bland.ai</h3>
        <span className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-wider ${blandActive ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-400/10 text-amber-300"}`}>
          {blandActive ? "● Active" : "Awaiting BLAND_API_KEY"}
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-400">
        Launch a live AI phone call from the platform. {blandActive ? "" : "Add your Bland.ai key in Vercel → Settings → Environment Variables to go live; the launcher activates automatically."}
      </p>
      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 (555) 123-4567"
          className="flex-1 rounded-xl border border-white/10 bg-ink-2/80 px-4 py-2.5 text-sm outline-none focus:border-gold/50"
        />
        <input
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Mission (optional) — e.g. follow up on yesterday's quote"
          className="flex-[2] rounded-xl border border-white/10 bg-ink-2/80 px-4 py-2.5 text-sm outline-none focus:border-gold/50"
        />
        <button onClick={launch} disabled={busy || !phone} className="btn-gold rounded-xl px-5 py-2.5 text-sm disabled:opacity-40">
          {busy ? "Dialing…" : "📞 Call now"}
        </button>
      </div>
      {status && <p className="mt-3 text-xs text-slate-300">{status}</p>}
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [data, setData] = useState<Overview | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const [agentsOn, setAgentsOn] = useState<Record<string, boolean>>({});

  async function load() {
    const res = await fetch("/api/admin/overview");
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    const d = await res.json();
    setData(d);
    setAuthed(true);
  }

  useEffect(() => {
    load();
    try {
      setAgentsOn(JSON.parse(localStorage.getItem("fd_agents_on") || "{}"));
    } catch {}
  }, []);

  function toggleAgent(name: string) {
    const next = { ...agentsOn, [name]: agentsOn[name] === false ? true : false };
    setAgentsOn(next);
    localStorage.setItem("fd_agents_on", JSON.stringify(next));
  }

  const fmt = (n: number) => `$${n.toLocaleString()}`;

  return (
    <main>
      <Nav />
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[55vh]">
        <img src="/command-center.webp" alt="" className="h-full w-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/85 to-ink" />
      </div>

      <section className="mx-auto max-w-6xl px-5 pt-32 pb-24">
        {authed === null && <p className="mt-20 text-center text-slate-500">Authenticating…</p>}
        {authed === false && <LoginGate onAuth={load} />}
        {authed && data && (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-4xl font-semibold md:text-5xl">
                  Admin <span className="text-gradient-gold">console</span>
                </h1>
                <p className="mt-2 text-sm text-slate-400">
                  Operator view — bookings, leads, integrations, and outbound demo calls.
                </p>
              </div>
              <button
                onClick={async () => {
                  await fetch("/api/auth/login", { method: "DELETE" });
                  setAuthed(false);
                }}
                className="btn-ghost rounded-xl px-4 py-2 text-xs"
              >
                Sign out
              </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    tab === t ? "bg-gradient-to-r from-[#f0d293] to-[#d4a843] font-semibold text-[#1a1206]" : "glass text-slate-300 hover:text-teal-glow"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {tab === "Overview" && (
              <div className="mt-8 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Stat label="Monthly recurring revenue" value={fmt(data.finances.mrr)} accent="text-emerald-300" />
                  <Stat label="Appointments captured" value={String(data.bookings.length)} accent="text-gold" />
                  <Stat label="Leads in pipeline" value={String(data.leads.length)} />
                  <Stat label="AI brains online" value={String(data.integrations.brains.length)} />
                </div>
                <CallLauncher blandActive={data.integrations.bland} />
                <div className="glass rounded-3xl p-6">
                  <h3 className="font-semibold">Platform status</h3>
                  <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                    <div className="rounded-xl bg-white/[0.03] px-4 py-3">🧠 HERMES brains: {data.integrations.brains.join(" → ") || "deterministic core only"}</div>
                    <div className="rounded-xl bg-white/[0.03] px-4 py-3">📞 Bland.ai voice: {data.integrations.bland ? "active" : "ready to activate"}</div>
                    <div className="rounded-xl bg-white/[0.03] px-4 py-3">🤖 Agent fleet: {AGENTS.length} specialists deployed</div>
                    <div className="rounded-xl bg-white/[0.03] px-4 py-3">🌐 Domain: www.frontdeskagents.com</div>
                  </div>
                </div>
              </div>
            )}

            {tab === "Finances" && (
              <div className="mt-8 space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Stat label="MRR" value={fmt(data.finances.mrr)} accent="text-emerald-300" />
                  <Stat label="ARR (run-rate)" value={fmt(data.finances.arr)} accent="text-emerald-300" />
                  <Stat label="Pipeline value" value={fmt(data.finances.pipeline)} accent="text-gold" />
                </div>
                <div className="glass rounded-3xl p-6">
                  <h3 className="font-semibold">Revenue by plan</h3>
                  <div className="mt-4 space-y-3">
                    {PLANS.map((p) => {
                      const count = data.leads.filter((l) => l.plan === p.id).length;
                      const rev = count * p.price;
                      const max = Math.max(1, ...PLANS.map((q) => data.leads.filter((l) => l.plan === q.id).length * q.price));
                      return (
                        <div key={p.id}>
                          <div className="flex justify-between text-xs text-slate-400">
                            <span>{p.name} · {count} signup{count === 1 ? "" : "s"}</span>
                            <span className="text-slate-200">{fmt(rev)}/mo</span>
                          </div>
                          <div className="mt-1 h-2 rounded-full bg-white/5">
                            <div className="h-2 rounded-full bg-gradient-to-r from-[#2dd4bf] to-[#d4a843]" style={{ width: `${(rev / max) * 100}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {tab === "Agents" && (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {AGENTS.map((a) => {
                  const on = agentsOn[a.name] !== false;
                  return (
                    <div key={a.name} className={`glass rounded-2xl p-5 transition ${on ? "" : "opacity-50"}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-display font-semibold text-gold">{a.name}</span>
                        <button
                          onClick={() => toggleAgent(a.name)}
                          className={`relative h-6 w-11 rounded-full transition ${on ? "bg-teal-glow/70" : "bg-white/10"}`}
                          aria-label={`Toggle ${a.name}`}
                        >
                          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
                        </button>
                      </div>
                      <div className="mt-0.5 text-[10px] uppercase tracking-widest text-slate-500">{a.role}</div>
                      <p className="mt-2 text-xs leading-relaxed text-slate-400">{a.desc}</p>
                      <div className={`mt-3 text-[10px] uppercase tracking-wider ${on ? "text-emerald-300" : "text-slate-600"}`}>
                        {on ? "● Operational" : "○ Standby"}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {tab === "Bookings" && (
              <div className="glass mt-8 overflow-x-auto rounded-3xl p-6">
                <h3 className="font-semibold">All appointments ({data.bookings.length})</h3>
                {data.bookings.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">No bookings yet — try the <a className="text-teal-glow underline" href="/demo">live demo</a>; AVA's bookings land here in real time.</p>
                ) : (
                  <table className="mt-4 w-full text-left text-sm">
                    <thead className="text-xs uppercase tracking-wider text-slate-500">
                      <tr><th className="py-2 pr-4">Client</th><th className="py-2 pr-4">Service</th><th className="py-2 pr-4">When</th><th className="py-2 pr-4">Phone</th><th className="py-2">Captured</th></tr>
                    </thead>
                    <tbody className="text-slate-300">
                      {data.bookings.map((b, i) => (
                        <tr key={b.id ?? i} className="border-t border-white/5">
                          <td className="py-2.5 pr-4 font-medium">{b.name}</td>
                          <td className="py-2.5 pr-4">{b.service}</td>
                          <td className="py-2.5 pr-4 text-gold">{b.datetime}</td>
                          <td className="py-2.5 pr-4">{b.phone}</td>
                          <td className="py-2.5 text-xs text-slate-500">{new Date(b.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {tab === "Leads" && (
              <div className="glass mt-8 overflow-x-auto rounded-3xl p-6">
                <h3 className="font-semibold">All leads ({data.leads.length})</h3>
                {data.leads.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">No leads yet — the signup wizard and AVA's lead capture feed this table.</p>
                ) : (
                  <table className="mt-4 w-full text-left text-sm">
                    <thead className="text-xs uppercase tracking-wider text-slate-500">
                      <tr><th className="py-2 pr-4">Business</th><th className="py-2 pr-4">Contact</th><th className="py-2 pr-4">Industry</th><th className="py-2 pr-4">Plan</th><th className="py-2">Source</th></tr>
                    </thead>
                    <tbody className="text-slate-300">
                      {data.leads.map((l) => (
                        <tr key={l.id} className="border-t border-white/5">
                          <td className="py-2.5 pr-4 font-medium">{l.business || "—"}</td>
                          <td className="py-2.5 pr-4">{l.email || l.phone || "—"}</td>
                          <td className="py-2.5 pr-4">{l.industry || "—"}</td>
                          <td className="py-2.5 pr-4 capitalize text-gold">{l.plan || "—"}</td>
                          <td className="py-2.5 text-xs text-slate-500">{l.source}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {tab === "Integrations" && (
              <div className="mt-8 space-y-4">
                {[
                  { name: "Claude (Anthropic)", active: data.integrations.brains.includes("Claude"), note: "Primary HERMES brain. Set ANTHROPIC_API_KEY to activate." },
                  { name: "OpenAI", active: data.integrations.brains.includes("OpenAI"), note: "Secondary HERMES brain. Set OPENAI_API_KEY to activate." },
                  { name: "NVIDIA NIM", active: data.integrations.brains.includes("NVIDIA NIM"), note: "Cloud inference fallback. Configured via NIM_BASE_URL / NIM_API_KEY / NIM_MODEL." },
                  { name: "Bland.ai voice calls", active: data.integrations.bland, note: "Real phone calls with the ARIA voice layer. Set BLAND_API_KEY to activate." },
                  { name: "Deterministic agent core", active: true, note: "Zero-dependency multi-agent engine — always on, the platform can never go dark." },
                ].map((i) => (
                  <div key={i.name} className="glass flex items-center justify-between rounded-2xl px-5 py-4">
                    <div>
                      <div className="text-sm font-semibold">{i.name}</div>
                      <div className="mt-0.5 text-xs text-slate-500">{i.note}</div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-wider ${i.active ? "bg-emerald-400/15 text-emerald-300" : "bg-white/5 text-slate-500"}`}>
                      {i.active ? "● Connected" : "○ Not configured"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
      <Footer />
    </main>
  );
}
