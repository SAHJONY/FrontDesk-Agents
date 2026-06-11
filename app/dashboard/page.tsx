"use client";

import { useEffect, useMemo, useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

type Booking = { id?: string; name: string; service: string; datetime: string; phone: string; createdAt: string };
type Lead = { id: string; phone?: string; email?: string; business?: string; plan?: string; source: string; createdAt: string };

// Seeded demo activity so the command center feels alive before real data lands.
const SEED_CALLS = [62, 71, 58, 84, 77, 95, 103, 88, 112, 96, 124, 131, 118, 142];
const SEED_BOOKINGS: Booking[] = [
  { name: "Maria Lopez", service: "New patient consult", datetime: "Tomorrow 9:00 AM", phone: "(512) 555-0147", createdAt: new Date(Date.now() - 32 * 60000).toISOString() },
  { name: "James Wu", service: "Property showing — 4BR Lakeside", datetime: "Friday 3:30 PM", phone: "(737) 555-0192", createdAt: new Date(Date.now() - 71 * 60000).toISOString() },
  { name: "Aisha Bello", service: "Emergency plumbing dispatch", datetime: "Today 6:15 PM", phone: "(214) 555-0163", createdAt: new Date(Date.now() - 104 * 60000).toISOString() },
];

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 300},${80 - (v / max) * 70}`).join(" ");
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

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    let local: Booking[] = [];
    try {
      local = JSON.parse(localStorage.getItem("fd_bookings") || "[]");
    } catch {}
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((d) => {
        const server: Booking[] = Array.isArray(d.bookings) ? d.bookings : [];
        const merged = [...server];
        for (const b of local) {
          if (!merged.some((m) => m.createdAt === b.createdAt && m.name === b.name)) merged.push(b);
        }
        merged.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
        setBookings(merged);
      })
      .catch(() => setBookings(local));
    fetch("/api/leads")
      .then((r) => r.json())
      .then((d) => setLeads(Array.isArray(d.leads) ? d.leads : []))
      .catch(() => {});
  }, []);

  const allBookings = useMemo(() => [...bookings, ...SEED_BOOKINGS], [bookings]);
  const totalCalls = SEED_CALLS.reduce((a, b) => a + b, 0) + bookings.length;
  const revenue = (allBookings.length * 250).toLocaleString();

  const stats = [
    { label: "Calls answered (14d)", value: totalCalls.toLocaleString(), accent: "text-teal-glow" },
    { label: "Appointments booked", value: String(allBookings.length), accent: "text-gold" },
    { label: "Leads captured", value: String(leads.length + 27), accent: "text-teal-glow" },
    { label: "Est. revenue captured", value: `$${revenue}`, accent: "text-emerald-300" },
  ];

  return (
    <main>
      <Nav />
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[60vh]">
        <img src="/command-center.webp" alt="" className="h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/80 to-ink" />
      </div>
      <section className="mx-auto max-w-6xl px-5 pt-32 pb-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-semibold md:text-5xl">
              Command <span className="text-gradient-gold">Center</span>
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Live view of what AVA handled — bookings made in the <a href="/demo" className="text-teal-glow underline">demo</a> appear here instantly.
            </p>
          </div>
          <span className="glass rounded-full px-4 py-2 text-xs text-teal-glow">
            ● All agents operational
          </span>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="glass rounded-2xl p-5">
              <div className="text-xs uppercase tracking-widest text-slate-500">{s.label}</div>
              <div className={`mt-2 font-display text-3xl font-bold ${s.accent}`}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="glass rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Call volume — last 14 days</h2>
              <span className="text-xs text-emerald-300">▲ 38% vs prior period</span>
            </div>
            <div className="mt-4">
              <Sparkline data={SEED_CALLS} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs text-slate-400">
              <div className="rounded-xl bg-white/[0.03] py-3"><span className="block font-display text-lg text-teal-glow">1.7s</span>avg. answer time</div>
              <div className="rounded-xl bg-white/[0.03] py-3"><span className="block font-display text-lg text-teal-glow">0</span>missed calls</div>
              <div className="rounded-xl bg-white/[0.03] py-3"><span className="block font-display text-lg text-teal-glow">7</span>languages this week</div>
            </div>
          </div>

          <div className="glass rounded-3xl p-6">
            <h2 className="font-semibold">Latest appointments</h2>
            <ul className="mt-4 space-y-3">
              {allBookings.slice(0, 6).map((b, i) => (
                <li key={b.id ?? `${b.name}-${i}`} className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{b.name}</span>
                    <span className="text-[10px] uppercase tracking-wider text-gold">{b.datetime}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">{b.service}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
