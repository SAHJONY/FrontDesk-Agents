"use client";

import { useEffect, useMemo, useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

type Booking = { id?: string; name: string; service: string; datetime: string; phone: string; createdAt: string };
type Lead = { id: string; phone?: string; email?: string; business?: string; plan?: string; source: string; createdAt: string };

function EmptyCard({ title, hint, cta }: { title: string; hint: string; cta?: { href: string; label: string } }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
      <h3 className="font-semibold text-slate-200">{title}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{hint}</p>
      {cta && (
        <a href={cta.href} className="mt-4 inline-block rounded-xl border border-teal-glow/30 px-3 py-1.5 text-xs text-teal-glow">
          {cta.label}
        </a>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let local: Booking[] = [];
    try {
      local = JSON.parse(localStorage.getItem("fd_bookings") || "[]");
    } catch {}
    Promise.all([
      fetch("/api/bookings")
        .then((r) => r.json())
        .then((d) => (Array.isArray(d.bookings) ? (d.bookings as Booking[]) : []))
        .catch(() => []),
      fetch("/api/leads")
        .then((r) => r.json())
        .then((d) => (Array.isArray(d.leads) ? (d.leads as Lead[]) : []))
        .catch(() => []),
    ]).then(([server, serverLeads]) => {
      const merged = [...server];
      for (const b of local) {
        if (!merged.some((m) => m.createdAt === b.createdAt && m.name === b.name)) merged.push(b);
      }
      merged.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      setBookings(merged);
      setLeads(serverLeads);
      setLoaded(true);
    });
  }, []);

  const stats = useMemo(
    () => [
      { label: "Appointments booked", value: String(bookings.length), accent: "text-gold" },
      { label: "Leads captured", value: String(leads.length), accent: "text-teal-glow" },
      { label: "Conversations this month", value: "—", accent: "text-slate-400" },
      { label: "Plan status", value: "Free", accent: "text-emerald-300" },
    ],
    [bookings.length, leads.length]
  );

  const empty = loaded && bookings.length === 0 && leads.length === 0;

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
              Your <span className="text-gradient-gold">dashboard</span>
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Bookings made through the <a href="/demo" className="text-teal-glow underline">live demo</a> appear here
              instantly. Real numbers, no synthetic data.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="glass rounded-2xl p-5">
              <div className="text-xs uppercase tracking-widest text-slate-500">{s.label}</div>
              <div className={`mt-2 font-display text-3xl font-bold ${s.accent}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {empty ? (
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <EmptyCard
              title="No appointments yet"
              hint="Open the demo and ask AVA to book one — it'll show up here in real time."
              cta={{ href: "/demo", label: "Try the demo →" }}
            />
            <EmptyCard
              title="No leads yet"
              hint="When AVA captures a phone number from a visitor, it lands here."
              cta={{ href: "/signup", label: "Walk through signup →" }}
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="glass rounded-3xl p-6">
              <h2 className="font-semibold">Latest leads</h2>
              {leads.length === 0 ? (
                <p className="mt-3 text-xs text-slate-500">No leads yet.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {leads.slice(0, 8).map((l) => (
                    <li key={l.id} className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{l.business || l.email || l.phone || "Anonymous"}</span>
                        <span className="text-[10px] uppercase tracking-wider text-gold">{l.plan ?? l.source}</span>
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500">{l.email || l.phone || "—"}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="glass rounded-3xl p-6">
              <h2 className="font-semibold">Latest appointments</h2>
              {bookings.length === 0 ? (
                <p className="mt-3 text-xs text-slate-500">No appointments yet.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {bookings.slice(0, 6).map((b, i) => (
                    <li key={b.id ?? `${b.name}-${i}`} className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{b.name}</span>
                        <span className="text-[10px] uppercase tracking-wider text-gold">{b.datetime}</span>
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500">{b.service}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
