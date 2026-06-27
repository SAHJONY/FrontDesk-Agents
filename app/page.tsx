import Link from "next/link";
import Nav from "@/components/Nav";
import ChatWidget from "@/components/ChatWidget";
import PricingCards from "@/components/PricingCards";
import ROICalculator from "@/components/ROICalculator";
import Footer from "@/components/Footer";
import { AGENTS, INDUSTRIES } from "@/lib/plans";
import TestimonialCarousel from "@/components/TestimonialCarousel";

const STATS = [
  { value: "<2s", label: "Avg. response time" },
  { value: "24/7", label: "Always-on coverage" },
  { value: "100+", label: "Languages worldwide" },
  { value: "0", label: "Calls missed at 3am" },
];

const TICKER = [
  "💬 Web chat that answers in seconds — even at 3 AM",
  "🗓 Appointments booked straight into your inbox",
  "🌎 100+ languages worldwide, detected and switched automatically mid-conversation",
  "📥 Every conversation summarized and emailed to your team",
  "📞 Outbound demo calls (FrontDesk Agents voice) on Professional+",
  "🔌 Embed AVA on your site in a single line of code",
];

const FAQS = [
  {
    q: "How fast can I go live?",
    a: "Most businesses are live in under 10 minutes: tell us your business name, hours, and services in the signup wizard, and AVA starts answering chats on your site immediately.",
  },
  {
    q: "Does it really work for my industry?",
    a: "AVA works for any service business that takes appointments — dental, legal, real estate, home services, hospitality, automotive, and more. She uses your wording and your hours.",
  },
  {
    q: "What happens when a visitor needs a human?",
    a: "The Escalation Agent detects urgency, captures a callback number, and sends your team an instant alert with the full transcript — your visitors never hit a dead end.",
  },
  {
    q: "Which languages are supported?",
    a: "AVA autonomously detects the caller\u2019s language and answers in it — over 100 languages worldwide, on the phone and in chat, with instant mid-conversation switching.",
  },
  {
    q: "Can I resell this to my own clients?",
    a: "The Growth plan includes white-label branding and beta API access so agencies can offer FrontDesk Agents under their own name.",
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
              Your complete online presence — built, hosted, and answered for you
            </p>
            <h1 className="rise-in rise-in-1 font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
              We build your website first.
              <br />
              <span className="text-gradient-gold">Then AVA answers every call.</span>
            </h1>
            <p className="rise-in rise-in-2 mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
              FrontDesk Agents designs and launches your done-for-you website — then adds an AI
              receptionist that answers chats and calls 24/7, books appointments, and captures leads
              in 100+ languages worldwide. <strong className="text-gold">One company for your entire digital front desk.</strong>
            </p>
            <div className="rise-in rise-in-3 mt-8 flex flex-wrap gap-4">
              <Link href="/websites" className="btn-gold rounded-2xl px-7 py-3.5 text-base">
                Build My Website →
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

      {/* TESTIMONIALS */}
      <TestimonialCarousel />

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

      {/* HERMES + AGENTS */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-24">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-teal-glow">How the brain works</p>
        <h2 className="mt-3 text-center font-display text-4xl font-semibold md:text-5xl">
          <span className="text-gradient-gold">HERMES</span> — the brain that never fails.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-slate-400">
          HERMES is our proprietary AI orchestrator. It runs every conversation through a
          cascade of frontier language models, automatically routing around any model that's
          slow, rate-limited, or down. Underneath sits a deterministic agent core, so booking
          flows work even when every external service goes dark at once.
        </p>

        <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-3">
          <div className="glass rounded-2xl p-5">
            <div className="text-xs uppercase tracking-widest text-teal-glow">Primary brain</div>
            <div className="mt-1.5 font-display text-base font-semibold text-gold">Frontier model fleet</div>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
              A curated pool of the strongest open-source models, refreshed continuously as
              new state-of-the-art releases land.
            </p>
          </div>
          <div className="glass rounded-2xl p-5">
            <div className="text-xs uppercase tracking-widest text-teal-glow">Fallback layer</div>
            <div className="mt-1.5 font-display text-base font-semibold text-gold">Closed-source backstops</div>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
              The top closed-source models join the cascade automatically the moment the
              primary fleet hesitates — sub-second handover, no dropped conversations.
            </p>
          </div>
          <div className="glass rounded-2xl p-5">
            <div className="text-xs uppercase tracking-widest text-teal-glow">Last resort</div>
            <div className="mt-1.5 font-display text-base font-semibold text-gold">Deterministic core</div>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
              A zero-dependency rules engine handles booking flows even if every LLM goes
              offline. The platform never goes dark.
            </p>
          </div>
        </div>

        <h3 className="mt-16 text-center font-display text-2xl font-semibold">
          Four specialists. <span className="text-gradient-gold">One front desk.</span>
        </h3>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
              { n: "1", t: "Tell AVA about your business", d: "Two-minute wizard: your services, hours, and tone of voice. No code, no IT project." },
              { n: "2", t: "Embed the chat widget", d: "One snippet on your site activates AVA. She answers visitors 24/7 in 100+ languages, detected automatically." },
              { n: "3", t: "Watch bookings land in your inbox", d: "Every appointment AVA captures lands in your dashboard and email — with the full transcript attached." },
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
            Hiring an after-hours receptionist costs thousands a month. AVA covers all 168 hours a week from $399.
          </p>
          <div className="mt-12">
            <PricingCards />
          <ROICalculator />
          </div>
          <p className="mt-8 text-center text-sm text-slate-500">
            Want the math for your business? <Link href="/pricing" className="text-teal-glow underline">Try the ROI calculator →</Link>
          </p>
        </div>
      </section>

      {/* SOCIAL PROOF — re-enable once real, named customers consent to be quoted */}

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
