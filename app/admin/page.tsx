"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { PLANS } from "@/lib/plans";

// ============================================================================
// Real-time event types + hook
// ============================================================================

type PlatformEventKind =
  | "chat:incoming"
  | "chat:reply"
  | "booking:created"
  | "lead:captured"
  | "customer:created"
  | "subscription:active"
  | "subscription:updated"
  | "subscription:canceled"
  | "voice_call:started"
  | "env:updated"
  | "env:deleted";

type PlatformEvent = {
  id: string;
  kind: PlatformEventKind;
  payload: Record<string, unknown>;
  createdAt: string;
};

type StreamStatus = "connecting" | "live" | "reconnecting" | "closed";

function useEventStream(authed: boolean): {
  status: StreamStatus;
  events: PlatformEvent[];
  lastEventAt: string | null;
} {
  const [status, setStatus] = useState<StreamStatus>("connecting");
  const [events, setEvents] = useState<PlatformEvent[]>([]);
  const [lastEventAt, setLastEventAt] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const sinceRef = useRef<string>(new Date(Date.now() - 5 * 60_000).toISOString());

  useEffect(() => {
    if (!authed) return;
    let cancelled = false;

    function connect() {
      if (cancelled) return;
      setStatus("connecting");
      try {
        const es = new EventSource(`/api/admin/stream?since=${encodeURIComponent(sinceRef.current)}`);
        esRef.current = es;
        es.addEventListener("ready", () => setStatus("live"));
        es.addEventListener("event", (e: MessageEvent) => {
          try {
            const ev = JSON.parse(e.data) as PlatformEvent;
            setEvents((prev) => [ev, ...prev].slice(0, 200));
            setLastEventAt(ev.createdAt);
            if (ev.createdAt > sinceRef.current) sinceRef.current = ev.createdAt;
          } catch {
            // ignore malformed
          }
        });
        es.addEventListener("bye", () => {
          es.close();
          if (!cancelled) {
            setStatus("reconnecting");
            setTimeout(connect, 500);
          }
        });
        es.onerror = () => {
          es.close();
          if (!cancelled) {
            setStatus("reconnecting");
            setTimeout(connect, 2000);
          }
        };
      } catch {
        setStatus("closed");
      }
    }

    connect();
    return () => {
      cancelled = true;
      esRef.current?.close();
    };
  }, [authed]);

  return { status, events, lastEventAt };
}

// ============================================================================
// Types
// ============================================================================

type Booking = { id: string; name: string; service: string; datetime: string; phone: string; createdAt: string };
type Lead = { id: string; phone?: string; email?: string; business?: string; industry?: string; plan?: string; source: string; createdAt: string };
type Customer = { id: string; email: string; name?: string; business?: string; createdAt: string };
type Subscription = {
  id: string;
  customerId: string;
  planId: string;
  provider: "stripe" | "square" | "paypal";
  providerSubId: string;
  providerCustomerId?: string;
  status: "active" | "trialing" | "past_due" | "canceled" | "incomplete";
  currentPeriodEnd?: string;
  createdAt: string;
  updatedAt: string;
};
type Activity = { id: string; type: "booking" | "lead" | "subscription"; title: string; subtitle: string; createdAt: string; badge?: string };

type Overview = {
  time: string;
  bookings: Booking[];
  leads: Lead[];
  subscriptions: Subscription[];
  customers: number;
  finances: {
    mrr: number;
    arr: number;
    activeSubscribers: number;
    subsByPlan: { planId: string; planName: string; price: number; count: number; mrr: number }[];
    subsByProvider: { provider: string; count: number; mrr: number }[];
  };
  activity: Activity[];
  sparkline: { day: string; count: number }[];
  hermes: {
    online: boolean;
    totalModels: number;
    providers: string[];
    primary: string;
    models: string[];
    byProvider: { nim: string[]; anthropic: string[]; openai: string[] };
  };
  integrations: { bland: boolean; stripe: boolean; square: boolean; paypal: boolean };
};

type SecretListing = {
  name: string;
  category: string;
  description?: string;
  link?: string;
  required?: boolean;
  deployTimeOnly?: boolean;
  hasValue: boolean;
  masked: string;
  source: "process.env" | "override" | "unset";
  updatedAt?: string;
};

const TABS = ["Overview", "Financials", "HERMES", "Bookings", "Leads", "Subscriptions", "Customers", "Environment", "Settings"] as const;
type Tab = (typeof TABS)[number];

// ============================================================================
// Login gate
// ============================================================================

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
          placeholder="Operator email"
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
          {busy ? "Verifying…" : "Unlock"}
        </button>
      </form>
    </div>
  );
}

// ============================================================================
// Shared pieces
// ============================================================================

function StatCard({ label, value, accent = "text-teal-glow", hint }: { label: string; value: string; accent?: string; hint?: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="text-xs uppercase tracking-widest text-slate-500">{label}</div>
      <div className={`mt-2 font-display text-3xl font-bold ${accent}`}>{value}</div>
      {hint && <div className="mt-1 text-[11px] text-slate-500">{hint}</div>}
    </div>
  );
}

function StatusPill({ active, labelOn, labelOff }: { active: boolean; labelOn: string; labelOff: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider ${
        active ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-400/10 text-amber-300"
      }`}
    >
      {active ? `● ${labelOn}` : `○ ${labelOff}`}
    </span>
  );
}

function Sparkline({ data }: { data: { day: string; count: number }[] }) {
  if (data.length === 0) return null;
  const max = Math.max(1, ...data.map((d) => d.count));
  const pts = data.map((d, i) => `${(i / Math.max(1, data.length - 1)) * 300},${80 - (d.count / max) * 70}`).join(" ");
  return (
    <svg viewBox="0 0 300 84" className="h-24 w-full">
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2dd4bf" stopOpacity="0.35" />
          <stop offset="1" stopColor="#2dd4bf" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,84 ${pts} 300,84`} fill="url(#spark)" />
      <polyline points={pts} fill="none" stroke="#2dd4bf" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function fmtMoney(n: number) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function fmtAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 5000) return "just now";
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function eventBadge(kind: PlatformEventKind): { label: string; color: string } {
  switch (kind) {
    case "chat:incoming":
      return { label: "chat in", color: "bg-teal-glow/15 text-teal-glow" };
    case "chat:reply":
      return { label: "chat reply", color: "bg-emerald-400/15 text-emerald-300" };
    case "booking:created":
      return { label: "booking", color: "bg-gold/20 text-gold" };
    case "lead:captured":
      return { label: "lead", color: "bg-amber-400/15 text-amber-300" };
    case "customer:created":
      return { label: "new customer", color: "bg-purple-400/15 text-purple-300" };
    case "subscription:active":
      return { label: "new paid", color: "bg-emerald-400/15 text-emerald-300" };
    case "subscription:updated":
      return { label: "sub update", color: "bg-teal-glow/15 text-teal-glow" };
    case "subscription:canceled":
      return { label: "sub canceled", color: "bg-red-400/15 text-red-300" };
    case "voice_call:started":
      return { label: "voice call", color: "bg-gold/20 text-gold" };
    case "env:updated":
      return { label: "env updated", color: "bg-slate-400/15 text-slate-300" };
    case "env:deleted":
      return { label: "env deleted", color: "bg-red-400/15 text-red-300" };
  }
}

function eventTitle(e: PlatformEvent): string {
  const p = e.payload;
  switch (e.kind) {
    case "chat:incoming":
      return `Visitor sent a message · ${p.language ?? "en"}`;
    case "chat:reply": {
      const ms = Number(p.latencyMs ?? 0);
      return `${p.agent ?? "HERMES"} replied${ms ? ` in ${ms}ms` : ""}${p.brain ? ` · ${p.brain}` : ""}`;
    }
    case "booking:created":
      return `${p.name ?? "Visitor"} booked ${p.service ?? "an appointment"} (${p.datetime ?? "TBD"})`;
    case "lead:captured":
      return `Lead captured · ${p.business ?? p.source ?? "anonymous"}`;
    case "customer:created":
      return `New customer · ${p.email ?? "anonymous"}`;
    case "subscription:active":
      return `New paid subscription · ${p.planId} via ${p.provider}`;
    case "subscription:updated":
      return `Subscription updated · ${p.planId} · ${p.status}`;
    case "subscription:canceled":
      return `Subscription canceled · ${p.planId} via ${p.provider}`;
    case "voice_call:started":
      return `Outbound voice call dialing ${p.phone ?? "phone"}`;
    case "env:updated":
      return `Env updated · ${p.name}`;
    case "env:deleted":
      return `Env removed · ${p.name}`;
  }
}

function LiveEventRow({ event }: { event: PlatformEvent }) {
  const badge = eventBadge(event.kind);
  return (
    <li className="flex items-start gap-3 py-2.5">
      <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${badge.color}`}>
        {badge.label}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm leading-snug text-slate-200">{eventTitle(event)}</div>
        <div className="text-[10px] text-slate-500">{fmtAgo(event.createdAt)}</div>
      </div>
    </li>
  );
}

// ============================================================================
// Outbound Bland.ai call launcher
// ============================================================================

type BlandConfig = {
  configured: boolean;
  persona: {
    name: string;
    businessName: string;
    voice: string;
    language: string;
    inboundNumber?: string;
    outboundNumber?: string;
  };
  inboundScript: string;
  outboundSalesScript: string;
};

function CallLauncher({ blandActive }: { blandActive: boolean }) {
  const [phone, setPhone] = useState("");
  const [contactName, setContactName] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [config, setConfig] = useState<BlandConfig | null>(null);

  useEffect(() => {
    if (!blandActive) return;
    fetch("/api/admin/bland")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setConfig(d))
      .catch(() => {});
  }, [blandActive]);

  async function launch() {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          contactName: contactName || undefined,
          reason: reason || undefined,
        }),
      });
      const data = await res.json();
      setStatus(res.ok ? `✅ Call launched (id: ${data.callId ?? "queued"})` : `⚠️ ${data.error}`);
      if (res.ok) {
        setPhone("");
        setContactName("");
        setReason("");
      }
    } catch {
      setStatus("⚠️ Network error — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass-gold rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Outbound voice call — {config?.persona?.name ?? "Ava"}</h3>
        <StatusPill active={blandActive} labelOn="Live" labelOff="Set BLAND_API_KEY" />
      </div>
      {blandActive ? (
        <p className="mt-2 text-xs text-slate-400">
          {config?.persona?.outboundNumber ? (
            <>Will dial from <span className="text-gold font-mono">{config.persona.outboundNumber}</span>{" "}</>
          ) : (
            <>Will dial from Bland's default number — set <code className="text-gold">BLAND_OUTBOUND_NUMBER</code> for your own caller ID.{" "}</>
          )}
          Using the production outbound sales script. Every call is logged in the event stream with a consent source.
        </p>
      ) : (
        <p className="mt-2 text-xs text-slate-400">
          Set <code className="text-gold">BLAND_API_KEY</code> in the Environment tab to activate.
        </p>
      )}
      <div className="mt-4 grid gap-2.5 sm:grid-cols-[1.1fr_1fr_1.3fr_auto]">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 (555) 123-4567"
          className="rounded-xl border border-white/10 bg-ink-2/80 px-4 py-2.5 text-sm outline-none focus:border-gold/50"
        />
        <input
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          placeholder="Their name (optional)"
          className="rounded-xl border border-white/10 bg-ink-2/80 px-4 py-2.5 text-sm outline-none focus:border-gold/50"
        />
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for call (e.g. follow up on demo request)"
          className="rounded-xl border border-white/10 bg-ink-2/80 px-4 py-2.5 text-sm outline-none focus:border-gold/50"
        />
        <button onClick={launch} disabled={busy || !phone} className="btn-gold rounded-xl px-5 py-2.5 text-sm disabled:opacity-40">
          {busy ? "Dialing…" : "📞 Call now"}
        </button>
      </div>
      {status && <p className="mt-3 text-xs text-slate-300">{status}</p>}

      {config && <BlandConfigPanel config={config} />}
    </div>
  );
}

function BlandConfigPanel({ config }: { config: BlandConfig }) {
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  async function syncInbound() {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await fetch("/api/admin/bland/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSyncMsg(`✅ Inbound script pushed to Bland.ai (${data.endpoint ?? "ok"}). Try calling ${config.persona.inboundNumber} now.`);
      } else {
        setSyncMsg(`⚠️ ${data.error}${data.hint ? ` — ${data.hint}` : ""}`);
      }
    } catch (e) {
      setSyncMsg(`⚠️ ${e instanceof Error ? e.message : "Network error"}`);
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="mt-5 space-y-2 text-xs">
      {config.persona.inboundNumber && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2.5">
          <div>
            <div className="text-slate-400">Inbound number — Ava answers calls here:</div>
            <div className="mt-0.5 font-mono text-gold">{config.persona.inboundNumber}</div>
          </div>
          <button
            onClick={syncInbound}
            disabled={syncing}
            className="rounded-lg border border-teal-glow/30 bg-teal-glow/10 px-3 py-1.5 text-[11px] font-medium text-teal-glow hover:bg-teal-glow/15 disabled:opacity-50"
          >
            {syncing ? "Syncing…" : "↗ Push inbound script to Bland.ai"}
          </button>
        </div>
      )}
      {syncMsg && <p className="px-4 text-slate-300">{syncMsg}</p>}

      <details className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2.5">
        <summary className="cursor-pointer text-slate-300">
          View inbound script {config.persona.inboundNumber ? `for ${config.persona.inboundNumber}` : ""}
        </summary>
        <pre className="mt-3 max-h-[360px] overflow-y-auto whitespace-pre-wrap rounded-lg bg-black/40 p-3 text-[11px] leading-relaxed text-slate-300">
          {config.inboundScript}
        </pre>
      </details>
      <details className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2.5">
        <summary className="cursor-pointer text-slate-300">View outbound sales script (used automatically when you press Call now)</summary>
        <pre className="mt-3 max-h-[360px] overflow-y-auto whitespace-pre-wrap rounded-lg bg-black/40 p-3 text-[11px] leading-relaxed text-slate-300">
          {config.outboundSalesScript}
        </pre>
      </details>
    </div>
  );
}

// ============================================================================
// Environment tab
// ============================================================================

function EnvironmentTab() {
  const [secrets, setSecrets] = useState<SecretListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [newName, setNewName] = useState("");
  const [newValue, setNewValue] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/env");
      if (!res.ok) throw new Error("load failed");
      const data = await res.json();
      setSecrets(data.secrets ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save(name: string) {
    const value = drafts[name] ?? "";
    setError(null);
    try {
      const res = await fetch("/api/admin/env", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setEditing((e) => ({ ...e, [name]: false }));
      setDrafts((d) => ({ ...d, [name]: "" }));
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function remove(name: string) {
    if (!confirm(`Delete ${name}? The deploy-time value (if any) will take over again.`)) return;
    try {
      const res = await fetch(`/api/admin/env?name=${encodeURIComponent(name)}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  async function addCustom() {
    if (!newName || !newValue) return;
    try {
      const res = await fetch("/api/admin/env", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.toUpperCase(), value: newValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Add failed");
      setNewName("");
      setNewValue("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Add failed");
    }
  }

  const grouped = useMemo(() => {
    const g: Record<string, SecretListing[]> = {};
    for (const s of secrets) {
      const cat = s.category || "Custom";
      g[cat] = g[cat] || [];
      g[cat].push(s);
    }
    return g;
  }, [secrets]);

  const order = ["Owner", "Storage", "Secrets", "LLM (HERMES)", "Voice (Bland.ai)", "Payments", "Deploy", "Custom"];

  return (
    <div className="mt-8 space-y-6">
      <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 text-xs leading-relaxed text-amber-200/90">
        Changes take effect within ~5 seconds — no redeploy required. Values are AES-256 encrypted
        at rest using <code className="text-gold">SECRETS_ENCRYPTION_KEY</code> (or your Blob token
        as fallback). Set <code className="text-gold">SECRETS_ENCRYPTION_KEY</code> in Vercel for
        production-grade encryption.
      </div>

      {error && <p className="text-sm text-red-300">{error}</p>}
      {loading && <p className="text-sm text-slate-500">Loading…</p>}

      {!loading &&
        order
          .filter((cat) => grouped[cat]?.length)
          .map((cat) => (
            <div key={cat} className="glass rounded-3xl p-6">
              <h3 className="font-semibold text-gold">{cat}</h3>
              <div className="mt-4 space-y-3">
                {grouped[cat].map((s) => {
                  const isEditing = editing[s.name];
                  return (
                    <div key={s.name} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <code className="font-mono text-sm text-teal-glow">{s.name}</code>
                            {s.required && (
                              <span className="rounded-full bg-red-400/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-red-300">required</span>
                            )}
                            {s.deployTimeOnly && (
                              <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-amber-300">deploy-time</span>
                            )}
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                                s.hasValue
                                  ? s.source === "override"
                                    ? "bg-emerald-400/15 text-emerald-300"
                                    : "bg-teal-glow/15 text-teal-glow"
                                  : "bg-white/5 text-slate-500"
                              }`}
                            >
                              {s.hasValue ? (s.source === "override" ? "● set via UI" : "● set in vercel") : "○ unset"}
                            </span>
                          </div>
                          {s.description && <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{s.description}</p>}
                          {s.link && (
                            <a href={s.link} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-[11px] text-teal-glow underline">
                              {s.link}
                            </a>
                          )}
                          {s.hasValue && !isEditing && (
                            <div className="mt-2 font-mono text-xs text-slate-300">{s.masked}</div>
                          )}
                          {isEditing && (
                            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                              <input
                                type="password"
                                value={drafts[s.name] ?? ""}
                                onChange={(e) => setDrafts((d) => ({ ...d, [s.name]: e.target.value }))}
                                placeholder="New value (kept encrypted)"
                                className="flex-1 rounded-lg border border-white/10 bg-ink-2/80 px-3 py-2 text-xs outline-none focus:border-teal-glow/50"
                              />
                              <button onClick={() => save(s.name)} className="btn-gold rounded-lg px-3 py-2 text-xs">Save</button>
                              <button
                                onClick={() => {
                                  setEditing((e) => ({ ...e, [s.name]: false }));
                                  setDrafts((d) => ({ ...d, [s.name]: "" }));
                                }}
                                className="btn-ghost rounded-lg px-3 py-2 text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                        {!isEditing && !s.deployTimeOnly && (
                          <div className="flex shrink-0 gap-2">
                            <button
                              onClick={() => setEditing((e) => ({ ...e, [s.name]: true }))}
                              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:border-teal-glow/40"
                            >
                              {s.hasValue ? "Update" : "Set"}
                            </button>
                            {s.source === "override" && (
                              <button
                                onClick={() => remove(s.name)}
                                className="rounded-lg border border-red-400/30 px-3 py-1.5 text-xs text-red-300 hover:bg-red-400/10"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

      <div className="glass rounded-3xl p-6">
        <h3 className="font-semibold">Add a custom env var</h3>
        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="MY_CUSTOM_VAR"
            className="flex-1 rounded-xl border border-white/10 bg-ink-2/80 px-4 py-2.5 text-xs font-mono outline-none focus:border-teal-glow/50"
          />
          <input
            type="password"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="value"
            className="flex-[2] rounded-xl border border-white/10 bg-ink-2/80 px-4 py-2.5 text-xs outline-none focus:border-teal-glow/50"
          />
          <button onClick={addCustom} disabled={!newName || !newValue} className="btn-gold rounded-xl px-5 py-2.5 text-xs disabled:opacity-40">
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Subscription grant form
// ============================================================================

function GrantForm({ onGranted }: { onGranted: () => void }) {
  const [email, setEmail] = useState("");
  const [planId, setPlanId] = useState<string>(PLANS.find((p) => p.price > 0)?.id ?? "starter");
  const [provider, setProvider] = useState<"stripe" | "square" | "paypal">("stripe");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function grant() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, planId, provider, status: "active" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Grant failed");
      setMsg(`✅ Granted ${planId} to ${email}`);
      setEmail("");
      onGranted();
    } catch (e) {
      setMsg(`⚠️ ${e instanceof Error ? e.message : "Grant failed"}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass-gold rounded-3xl p-6">
      <h3 className="font-semibold">Grant subscription (no charge)</h3>
      <p className="mt-1 text-xs text-slate-400">Comp accounts, beta testers, internal use. No payment provider involved.</p>
      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="customer@example.com"
          className="flex-1 rounded-xl border border-white/10 bg-ink-2/80 px-4 py-2.5 text-sm outline-none focus:border-gold/50"
        />
        <select value={planId} onChange={(e) => setPlanId(e.target.value)} className="rounded-xl border border-white/10 bg-ink-2/80 px-4 py-2.5 text-sm">
          {PLANS.map((p) => (
            <option key={p.id} value={p.id}>{p.name} ${p.price}/mo</option>
          ))}
        </select>
        <select value={provider} onChange={(e) => setProvider(e.target.value as "stripe" | "square" | "paypal")} className="rounded-xl border border-white/10 bg-ink-2/80 px-4 py-2.5 text-sm">
          <option value="stripe">Stripe (tag)</option>
          <option value="square">Square (tag)</option>
          <option value="paypal">PayPal (tag)</option>
        </select>
        <button onClick={grant} disabled={busy || !email} className="btn-gold rounded-xl px-5 py-2.5 text-sm disabled:opacity-40">
          {busy ? "Granting…" : "Grant"}
        </button>
      </div>
      {msg && <p className="mt-3 text-xs text-slate-300">{msg}</p>}
    </div>
  );
}

// ============================================================================
// Main page
// ============================================================================

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [data, setData] = useState<Overview | null>(null);
  const [tab, setTab] = useState<Tab>("Overview");
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/overview", { cache: "no-store" });
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    if (!res.ok) return;
    const d = (await res.json()) as Overview;
    setData(d);
    setAuthed(true);
    setLastUpdate(new Date().toLocaleTimeString());
  }, []);

  // Initial load + 5s real-time polling.
  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  // Real-time event stream — push-driven updates, no polling lag.
  const stream = useEventStream(authed === true);

  // Refetch overview immediately when a meaningful state-changing event arrives.
  useEffect(() => {
    if (stream.events.length === 0) return;
    const latest = stream.events[0];
    if (
      latest.kind === "booking:created" ||
      latest.kind === "lead:captured" ||
      latest.kind === "subscription:active" ||
      latest.kind === "subscription:canceled" ||
      latest.kind === "customer:created"
    ) {
      load();
    }
  }, [stream.events, load]);

  // Rolling stats from the chat:reply stream — latency + last model.
  const chatStats = useMemo(() => {
    const replies = stream.events.filter((e) => e.kind === "chat:reply").slice(0, 30);
    if (replies.length === 0) return { count: 0, avgLatency: null as number | null, lastBrain: null as string | null };
    const latencies = replies
      .map((r) => Number(r.payload.latencyMs ?? 0))
      .filter((n) => n > 0);
    const avg = latencies.length ? latencies.reduce((a, b) => a + b, 0) / latencies.length : null;
    const lastBrain = (replies[0].payload.brain as string) || null;
    return { count: replies.length, avgLatency: avg, lastBrain };
  }, [stream.events]);

  const autonomousChecks = useMemo(() => {
    if (!data) return [];
    return [
      { name: "HERMES brain", active: data.hermes.online, hint: data.hermes.online ? `${data.hermes.totalModels} model${data.hermes.totalModels === 1 ? "" : "s"} ready` : "Add NIM_API_KEY in Environment" },
      { name: "Stripe checkout", active: data.integrations.stripe, hint: data.integrations.stripe ? "Card payments live" : "Add STRIPE_SECRET_KEY" },
      { name: "Square checkout", active: data.integrations.square, hint: data.integrations.square ? "Square subscriptions live" : "Optional — add SQUARE_ACCESS_TOKEN" },
      { name: "PayPal checkout", active: data.integrations.paypal, hint: data.integrations.paypal ? "PayPal subscriptions live" : "Optional — add PAYPAL_CLIENT_ID" },
      { name: "Bland.ai voice", active: data.integrations.bland, hint: data.integrations.bland ? "Outbound calls armed" : "Optional — add BLAND_API_KEY" },
    ];
  }, [data]);

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
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider ${
                      stream.status === "live"
                        ? "bg-emerald-400/15 text-emerald-300"
                        : stream.status === "reconnecting"
                          ? "bg-amber-400/15 text-amber-300"
                          : "bg-white/5 text-slate-400"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        stream.status === "live" ? "bg-emerald-300 animate-pulse-glow" : "bg-slate-500"
                      }`}
                    />
                    {stream.status === "live"
                      ? "Live · streaming"
                      : stream.status === "reconnecting"
                        ? "Reconnecting…"
                        : "Connecting…"}
                  </span>
                  <span>Snapshot {lastUpdate ?? "—"}</span>
                  {stream.lastEventAt && <span>· last event {fmtAgo(stream.lastEventAt)}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => load()}
                  className="rounded-xl border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:border-teal-glow/40"
                >
                  ↻ Refresh now
                </button>
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
                  <StatCard label="MRR" value={fmtMoney(data.finances.mrr)} accent="text-emerald-300" />
                  <StatCard label="Active subscribers" value={String(data.finances.activeSubscribers)} accent="text-gold" />
                  <StatCard label="Customers" value={String(data.customers)} />
                  <StatCard label="Models online" value={String(data.hermes.totalModels)} accent="text-teal-glow" hint={data.hermes.online ? "HERMES armed" : "No LLM configured"} />
                </div>

                <div className="glass rounded-3xl p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Autonomous mode</h3>
                    <span className="text-xs text-slate-500">
                      {autonomousChecks.filter((c) => c.active).length}/{autonomousChecks.length} systems online
                    </span>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {autonomousChecks.map((c) => (
                      <div key={c.name} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                        <div>
                          <div className="text-sm font-medium">{c.name}</div>
                          <div className="text-[11px] text-slate-500">{c.hint}</div>
                        </div>
                        <StatusPill active={c.active} labelOn="Online" labelOff="Pending" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="glass rounded-2xl p-5">
                    <div className="text-xs uppercase tracking-widest text-slate-500">Chats (last 30 replies)</div>
                    <div className="mt-2 font-display text-3xl font-bold text-teal-glow">{chatStats.count}</div>
                  </div>
                  <div className="glass rounded-2xl p-5">
                    <div className="text-xs uppercase tracking-widest text-slate-500">Avg reply latency</div>
                    <div className="mt-2 font-display text-3xl font-bold text-gold">
                      {chatStats.avgLatency ? `${Math.round(chatStats.avgLatency)} ms` : "—"}
                    </div>
                  </div>
                  <div className="glass rounded-2xl p-5">
                    <div className="text-xs uppercase tracking-widest text-slate-500">Last model in use</div>
                    <div className="mt-2 font-display text-base font-semibold text-teal-glow truncate" title={chatStats.lastBrain ?? ""}>
                      {chatStats.lastBrain ?? "—"}
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="glass rounded-3xl p-6">
                    <h3 className="font-semibold">Activity — last 14 days</h3>
                    <Sparkline data={data.sparkline} />
                    <p className="mt-2 text-[11px] text-slate-500">Bookings + leads + subscriptions, daily totals.</p>
                  </div>
                  <CallLauncher blandActive={data.integrations.bland} />
                </div>

                <div className="glass rounded-3xl p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Live event stream</h3>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">
                      {stream.events.length} event{stream.events.length === 1 ? "" : "s"} buffered
                    </span>
                  </div>
                  {stream.events.length === 0 ? (
                    <p className="mt-3 text-xs text-slate-500">
                      Waiting for activity… new conversations, bookings, subscriptions, and env changes will appear here the instant they happen.
                    </p>
                  ) : (
                    <ul className="mt-4 max-h-[480px] overflow-y-auto divide-y divide-white/5 scrollbar-slim">
                      {stream.events.slice(0, 60).map((e) => (
                        <LiveEventRow key={e.id} event={e} />
                      ))}
                    </ul>
                  )}
                </div>

                <div className="glass rounded-3xl p-6">
                  <h3 className="font-semibold">Aggregated activity feed</h3>
                  {data.activity.length === 0 ? (
                    <p className="mt-3 text-xs text-slate-500">No persisted activity yet.</p>
                  ) : (
                    <ul className="mt-4 divide-y divide-white/5">
                      {data.activity.slice(0, 12).map((a) => (
                        <li key={a.id} className="flex items-center justify-between py-3">
                          <div className="min-w-0">
                            <div className="text-sm font-medium">{a.title}</div>
                            <div className="text-[11px] text-slate-500">{a.subtitle}</div>
                          </div>
                          <div className="text-[11px] text-gold">{fmtAgo(a.createdAt)}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {tab === "Financials" && (
              <div className="mt-8 space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <StatCard label="MRR" value={fmtMoney(data.finances.mrr)} accent="text-emerald-300" />
                  <StatCard label="ARR (run-rate)" value={fmtMoney(data.finances.arr)} accent="text-emerald-300" />
                  <StatCard label="Active subscribers" value={String(data.finances.activeSubscribers)} accent="text-gold" />
                </div>

                <div className="glass rounded-3xl p-6">
                  <h3 className="font-semibold">Revenue by plan</h3>
                  <div className="mt-4 space-y-3">
                    {data.finances.subsByPlan.map((p) => {
                      const max = Math.max(1, ...data.finances.subsByPlan.map((q) => q.mrr));
                      return (
                        <div key={p.planId}>
                          <div className="flex justify-between text-xs text-slate-400">
                            <span>{p.planName} · {p.count} subscriber{p.count === 1 ? "" : "s"}</span>
                            <span className="text-slate-200">{fmtMoney(p.mrr)}/mo</span>
                          </div>
                          <div className="mt-1 h-2 rounded-full bg-white/5">
                            <div className="h-2 rounded-full bg-gradient-to-r from-[#2dd4bf] to-[#d4a843]" style={{ width: `${(p.mrr / max) * 100}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="glass rounded-3xl p-6">
                  <h3 className="font-semibold">Revenue by processor</h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {data.finances.subsByProvider.map((p) => (
                      <div key={p.provider} className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                        <div className="text-xs uppercase tracking-wider text-slate-500">{p.provider}</div>
                        <div className="mt-1 font-display text-xl font-semibold">{fmtMoney(p.mrr)}/mo</div>
                        <div className="text-[11px] text-slate-500">{p.count} sub{p.count === 1 ? "" : "s"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === "HERMES" && (
              <div className="mt-8 space-y-6">
                <div className="glass rounded-3xl p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">HERMES status</h3>
                    <StatusPill active={data.hermes.online} labelOn="Armed" labelOff="No LLM configured" />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Primary: <span className="text-gold">{data.hermes.primary}</span> · {data.hermes.totalModels} total model{data.hermes.totalModels === 1 ? "" : "s"} across {data.hermes.providers.length} provider{data.hermes.providers.length === 1 ? "" : "s"}.
                  </p>
                </div>

                {(["nim", "anthropic", "openai"] as const).map((provider) => {
                  const models = data.hermes.byProvider[provider];
                  if (!models.length) return null;
                  return (
                    <div key={provider} className="glass rounded-3xl p-6">
                      <h3 className="font-semibold uppercase tracking-wide">{provider}</h3>
                      <ul className="mt-3 space-y-1.5 font-mono text-xs">
                        {models.map((m, i) => (
                          <li key={m} className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500">{String(i + 1).padStart(2, "0")}</span>
                            <span className="text-teal-glow">{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}

            {tab === "Bookings" && (
              <div className="glass mt-8 overflow-x-auto rounded-3xl p-6">
                <h3 className="font-semibold">All appointments ({data.bookings.length})</h3>
                {data.bookings.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">No bookings yet — try the <a className="text-teal-glow underline" href="/demo">live demo</a>.</p>
                ) : (
                  <table className="mt-4 w-full text-left text-sm">
                    <thead className="text-xs uppercase tracking-wider text-slate-500">
                      <tr><th className="py-2 pr-4">Client</th><th className="py-2 pr-4">Service</th><th className="py-2 pr-4">When</th><th className="py-2 pr-4">Phone</th><th className="py-2 pr-4">Captured</th><th className="py-2"></th></tr>
                    </thead>
                    <tbody className="text-slate-300">
                      {data.bookings.map((b) => (
                        <tr key={b.id} className="border-t border-white/5">
                          <td className="py-2.5 pr-4 font-medium">{b.name}</td>
                          <td className="py-2.5 pr-4">{b.service}</td>
                          <td className="py-2.5 pr-4 text-gold">{b.datetime}</td>
                          <td className="py-2.5 pr-4">{b.phone}</td>
                          <td className="py-2.5 pr-4 text-xs text-slate-500">{fmtAgo(b.createdAt)}</td>
                          <td className="py-2.5 text-right">
                            <button
                              onClick={async () => {
                                if (!confirm(`Delete booking for ${b.name}?`)) return;
                                await fetch(`/api/admin/bookings?id=${b.id}`, { method: "DELETE" });
                                await load();
                              }}
                              className="text-xs text-red-300 hover:text-red-200"
                            >
                              Delete
                            </button>
                          </td>
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
                  <p className="mt-4 text-sm text-slate-500">No leads yet.</p>
                ) : (
                  <table className="mt-4 w-full text-left text-sm">
                    <thead className="text-xs uppercase tracking-wider text-slate-500">
                      <tr><th className="py-2 pr-4">Business</th><th className="py-2 pr-4">Contact</th><th className="py-2 pr-4">Industry</th><th className="py-2 pr-4">Plan</th><th className="py-2 pr-4">Source</th><th className="py-2"></th></tr>
                    </thead>
                    <tbody className="text-slate-300">
                      {data.leads.map((l) => (
                        <tr key={l.id} className="border-t border-white/5">
                          <td className="py-2.5 pr-4 font-medium">{l.business || "—"}</td>
                          <td className="py-2.5 pr-4">{l.email || l.phone || "—"}</td>
                          <td className="py-2.5 pr-4">{l.industry || "—"}</td>
                          <td className="py-2.5 pr-4 capitalize text-gold">{l.plan || "—"}</td>
                          <td className="py-2.5 pr-4 text-xs text-slate-500">{l.source}</td>
                          <td className="py-2.5 text-right">
                            <button
                              onClick={async () => {
                                if (!confirm(`Delete lead?`)) return;
                                await fetch(`/api/admin/leads?id=${l.id}`, { method: "DELETE" });
                                await load();
                              }}
                              className="text-xs text-red-300 hover:text-red-200"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {tab === "Subscriptions" && (
              <div className="mt-8 space-y-6">
                <GrantForm onGranted={load} />
                <div className="glass overflow-x-auto rounded-3xl p-6">
                  <h3 className="font-semibold">All subscriptions ({data.subscriptions.length})</h3>
                  {data.subscriptions.length === 0 ? (
                    <p className="mt-4 text-sm text-slate-500">No subscriptions yet. Grant one above, or share the pricing page.</p>
                  ) : (
                    <table className="mt-4 w-full text-left text-sm">
                      <thead className="text-xs uppercase tracking-wider text-slate-500">
                        <tr><th className="py-2 pr-4">Plan</th><th className="py-2 pr-4">Provider</th><th className="py-2 pr-4">Status</th><th className="py-2 pr-4">Provider ID</th><th className="py-2 pr-4">Created</th><th className="py-2"></th></tr>
                      </thead>
                      <tbody className="text-slate-300">
                        {data.subscriptions.map((s) => (
                          <tr key={s.id} className="border-t border-white/5">
                            <td className="py-2.5 pr-4 font-medium capitalize">{s.planId}</td>
                            <td className="py-2.5 pr-4 uppercase text-gold">{s.provider}</td>
                            <td className="py-2.5 pr-4">{s.status}</td>
                            <td className="py-2.5 pr-4 font-mono text-[11px] text-slate-400">{s.providerSubId.slice(0, 18)}…</td>
                            <td className="py-2.5 pr-4 text-xs text-slate-500">{fmtAgo(s.createdAt)}</td>
                            <td className="py-2.5 text-right">
                              <button
                                onClick={async () => {
                                  if (!confirm(`Delete subscription? This is local only — the actual provider subscription is not cancelled.`)) return;
                                  await fetch(`/api/admin/subscriptions?id=${s.id}`, { method: "DELETE" });
                                  await load();
                                }}
                                className="text-xs text-red-300 hover:text-red-200"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {tab === "Customers" && <CustomersTab onChange={load} />}

            {tab === "Environment" && <EnvironmentTab />}

            {tab === "Settings" && (
              <div className="mt-8 space-y-6">
                <div className="glass rounded-3xl p-6">
                  <h3 className="font-semibold">Data export</h3>
                  <p className="mt-1 text-xs text-slate-400">Download a full JSON snapshot of all data (no raw secret values).</p>
                  <a
                    href="/api/admin/export"
                    download
                    className="btn-gold mt-4 inline-block rounded-xl px-5 py-2.5 text-sm"
                  >
                    ⬇ Download export
                  </a>
                </div>
              </div>
            )}
          </>
        )}
      </section>
      <Footer />
    </main>
  );
}

// ============================================================================
// Customers tab — separate so it can fetch on demand
// ============================================================================

function CustomersTab({ onChange }: { onChange: () => void }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/customers");
    if (res.ok) {
      const d = await res.json();
      setCustomers(d.customers ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="glass mt-8 overflow-x-auto rounded-3xl p-6">
      <h3 className="font-semibold">All customers ({customers.length})</h3>
      {loading ? (
        <p className="mt-4 text-sm text-slate-500">Loading…</p>
      ) : customers.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No customers yet.</p>
      ) : (
        <table className="mt-4 w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-slate-500">
            <tr><th className="py-2 pr-4">Email</th><th className="py-2 pr-4">Name</th><th className="py-2 pr-4">Business</th><th className="py-2 pr-4">Created</th><th className="py-2"></th></tr>
          </thead>
          <tbody className="text-slate-300">
            {customers.map((c) => (
              <tr key={c.id} className="border-t border-white/5">
                <td className="py-2.5 pr-4 font-medium">{c.email}</td>
                <td className="py-2.5 pr-4">{c.name || "—"}</td>
                <td className="py-2.5 pr-4">{c.business || "—"}</td>
                <td className="py-2.5 pr-4 text-xs text-slate-500">{fmtAgo(c.createdAt)}</td>
                <td className="py-2.5 text-right">
                  <button
                    onClick={async () => {
                      if (!confirm(`Delete customer ${c.email}? Their subscriptions stay but become orphaned.`)) return;
                      await fetch(`/api/admin/customers?id=${c.id}`, { method: "DELETE" });
                      await load();
                      onChange();
                    }}
                    className="text-xs text-red-300 hover:text-red-200"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
