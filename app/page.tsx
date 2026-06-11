import Link from "next/link";
import Nav from "@/components/Nav";
import ChatWidget from "@/components/ChatWidget";
import PricingCards from "@/components/PricingCards";
import Footer from "@/components/Footer";
import { AGENTS, INDUSTRIES } from "@/lib/plans";

const STATS = [
  { value: "<2s", label: "Average answer time" },
  { value: "24/7", label: "Always-on coverage" },
  { value: "50+", label: "Languages spoken" },
  { value: "98%", label: "Caller satisfaction" },
];

const TICKER = [
  "📞 Dental clinic in Austin booked 3 appointments overnight",
  "🌎 Spanish caller routed & answered in 1.4s",
  "⚖️ Law firm captured a $12k case intake at 2:07 AM",
  "🏠 Realtor demo scheduled while the agent was showing a home",
  "🔧 Emergency plumbing dispatch confirmed in 38 seconds",
  "🏨 Hotel upsell accepted — suite upgrade booked by AVA",
];

const TESTIMONIALS = [
  {
    quote:
      "We were losing 30+ calls a week after hours. FrontDesk Agents turned those into 11 booked appointments in the first month. It paid for itself in four days.",
    name: "Dr. Maya Chen",
    role: "Bright Smile Dental, Austin TX",
  },
  {
    quote:
      "Our clients call at midnight in three languages. AVA answers every single one like our best receptionist on her best day — and she never takes a sick day.",
    name: "Carlos Rivera",
    role: "Rivera & Associates Law",
  },
  {
    quote:
      "I white-labeled the Ultimate plan and now sell AI reception to my own agency clients. New revenue line, zero headcount.",
    name: "Sophie Laurent",
    role: "Atlas Digital Agency",
  },
];

const FAQS = [
  {
    q: "How fast can I go live?",
    a: "Most businesses are live in under 10 minutes: tell us your business name, hours, and services in the signup wizard, and AVA starts answering immediately.",
  },
  {
    q: "Does it really work for my industry?",
    a: "Yes — the agent team is industry-agnostic and trains on your scripts. We serve healthcare, legal, real estate, hospitality, home services, dental, automotive, and more.",
  },
  {
    q: "What happens when a caller needs a human?",
    a: "The Escalation Agent detects urgency and intent, then routes the call or sends your team an instant alert with a full transcript — your callers never hit a dead end.",
  },
  {
    q: "Which languages are supported?",
    a: "50+ languages with automatic detection. Try the live demo above in Spanish — AVA switches mid-conversation.",
  },
  {
    q: "Can I resell this to my own clients?",
    a: "The Ultimate plan includes full white-label branding and a commercial API license, so agencies run FrontDesk Agents under their own name.",
  },
];

export default function Home() {
  return (
    <main className="overflow-x-clip">
      <Nav />

      {/* HERO */}
      <section className="relative flex min-h-[100svh] items-center">
        <div className="absolute inset-0 -z-10">
          <img src="/hero.png" alt="" className="h-full w-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/55 to-ink" />
        </div>
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 pt-32 pb-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="rise-in mb-5 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-medium tracking-wide text-gold">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-glow animate-pulse-glow" />
              The world&apos;s most advanced agentic AI receptionist
            </p>
            <h1 className="rise-in rise-in-1 font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
              Never miss a call.
              <br />
              <span className="text-gradient-gold">Never lose a client.</span>
            </h1>
            <p className="rise-in rise-in-2 mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
              FrontDesk Agents answers every call in under 2 seconds, books appointments, qualifies
              leads, and speaks 50+ languages — 24 hours a day, for any business. Small businesses
              lose <strong className="text-gold">$75&nbsp;billion a year</strong>{" "}to missed calls.
              You won&apos;t be one of them.
            </p>
            <div className="rise-in rise-in-3 mt-8 flex flex-wrap gap-4">
              <Link href="/signup" className="btn-gold rounded-2xl px-7 py-3.5 text-base">
                Start Free — Live in 10 Minutes
              </Link>
              <Link href="/demo" className="btn-ghost rounded-2xl px-7 py-3.5 text-base">
                ▶ Talk to AVA Now
              </Link>
            </div>
            <div className="rise-in rise-in-4 mt-10 grid max-w-lg grid-cols-2 gap-4 sm:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label}>
                  <div className="font-display text-2xl font-bold text-teal-glow">{s.value}</div>
                  <div className="mt-0.5 text-xs text-slate-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="rise-in rise-in-2 animate-float hidden lg:block">
            <ChatWidget />
          </div>
        </div>
      </section>

      {/* LIVE TICKER */}
      <section className="border-y border-white/5 bg-ink-2/60 py-3.5">
        <div className="relative overflow-hidden">
          <div className="animate-ticker flex w-max gap-12 whitespace-nowrap text-sm text-slate-400">
            {[...TICKER, ...TICKER].map((t, i) => (
              <span key={i}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* DEMO (mobile-first placement) */}
      <section className="mx-auto max-w-6xl px-5 py-20 lg:hidden" id="demo">
        <h2 className="font-display text-3xl font-semibold">
          Meet <span className="text-gradient-gold">AVA</span> — live, right now
        </h2>
        <p className="mt-2 mb-6 text-slate-400">Ask for pricing or book an appointment. She&apos;ll handle it.</p>
        <ChatWidget />
      </section>

      {/* AGENT TEAM */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-24">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-teal-glow">The multi-agent brain</p>
        <h2 className="mt-3 text-center font-display text-4xl font-semibold md:text-5xl">
          Sixteen specialists. <span className="text-gradient-gold">One flawless front desk.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-slate-400">
          Powered by the BUFFY &amp; HERMES dual-AI architecture — Claude, OpenAI, and NVIDIA
          inference working as one brain. Every conversation is orchestrated, routed, and resolved
          by the right specialist, instantly.
        </p>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {AGENTS.map((a, i) => (
            <div key={a.name} className="glass group rounded-3xl p-6 transition duration-300 hover:-translate-y-1 hover:border-gold/30">
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-semibold text-gold">{a.name}</span>
                <span className="rounded-full bg-teal-glow/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-teal-glow">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="mt-1 text-xs font-medium uppercase tracking-widest text-slate-500">{a.role}</div>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-y border-white/5 bg-ink-2/40 py-24">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-center font-display text-4xl font-semibold md:text-5xl">
            Live in <span className="text-gradient-gold">three steps</span>
          </h2>
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {[
              { n: "1", t: "Tell AVA about your business", d: "Two-minute wizard: your services, hours, booking rules, and tone of voice. No code, no IT project." },
              { n: "2", t: "Connect your number", d: "Forward your existing line or get a new one. Web chat and SMS channels activate instantly." },
              { n: "3", t: "Watch revenue stop leaking", d: "Every call answered, every lead captured, every booking on your calendar — with transcripts and analytics." },
            ].map((s) => (
              <div key={s.n} className="relative">
                <div className="font-display text-7xl font-bold text-white/5">{s.n}</div>
                <h3 className="-mt-8 font-display text-xl font-semibold text-gold">{s.t}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-400">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section id="industries" className="mx-auto max-w-6xl px-5 py-24">
        <h2 className="text-center font-display text-4xl font-semibold md:text-5xl">
          Built for <span className="text-gradient-gold">every industry</span>
        </h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {INDUSTRIES.map((ind) => (
            <div key={ind.name} className="glass rounded-2xl p-5 transition duration-300 hover:border-teal-glow/40">
              <div className="text-2xl">{ind.icon}</div>
              <h3 className="mt-2 font-semibold">{ind.name}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{ind.blurb}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="border-y border-white/5 bg-ink-2/40 py-24">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-center font-display text-4xl font-semibold md:text-5xl">
            Costs less than <span className="text-gradient-gold">one missed client</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-slate-400">
            A human receptionist costs $35,000+/year for 40 hours a week. AVA covers all 168 hours from $99/month.
          </p>
          <div className="mt-12">
            <PricingCards />
          </div>
          <p className="mt-8 text-center text-sm text-slate-500">
            Want the math for your business? <Link href="/pricing" className="text-teal-glow underline">Try the ROI calculator →</Link>
          </p>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <h2 className="text-center font-display text-4xl font-semibold md:text-5xl">
          Loved by <span className="text-gradient-gold">owners worldwide</span>
        </h2>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="glass rounded-3xl p-7">
              <div className="text-gold">★★★★★</div>
              <blockquote className="mt-4 text-sm leading-relaxed text-slate-300">“{t.quote}”</blockquote>
              <figcaption className="mt-5">
                <div className="text-sm font-semibold">{t.name}</div>
                <div className="text-xs text-slate-500">{t.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 pb-24">
        <h2 className="text-center font-display text-4xl font-semibold">Questions, answered</h2>
        <div className="mt-10 space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="glass group rounded-2xl px-6 py-4">
              <summary className="cursor-pointer list-none font-medium marker:hidden flex items-center justify-between">
                {f.q}
                <span className="text-gold transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden py-28">
        <div className="absolute inset-0 -z-10">
          <img src="/hero.png" alt="" className="h-full w-full object-cover object-bottom opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink" />
        </div>
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="font-display text-4xl font-semibold leading-tight md:text-6xl">
            Your next client is calling <span className="text-gradient-gold">right now.</span>
          </h2>
          <p className="mt-5 text-lg text-slate-300">Make sure someone brilliant answers.</p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link href="/signup" className="btn-gold rounded-2xl px-8 py-4 text-base">
              Start Free Today
            </Link>
            <Link href="/demo" className="btn-ghost rounded-2xl px-8 py-4 text-base">
              Talk to AVA First
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
