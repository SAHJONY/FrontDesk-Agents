import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

export const metadata: Metadata = {
  title: "Live Demo — Talk to AVA | FrontDesk Agents",
  description: "Talk to AVA, the agentic AI receptionist, live. Book an appointment, ask for pricing, or switch to Spanish mid-conversation.",
};

export default function DemoPage() {
  return (
    <main>
      <Nav />
      <section className="mx-auto grid max-w-6xl gap-10 px-5 pt-32 pb-20 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-teal-glow/30 bg-teal-glow/10 px-4 py-1.5 text-xs font-medium text-teal-glow">
            <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-teal-glow" />
            Live demo — no signup required
          </p>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-tight md:text-6xl">
            This is <span className="text-gradient-gold">AVA.</span>
            <br />
            She&apos;s already working.
          </h1>
          <p className="mt-5 max-w-md leading-relaxed text-slate-400">
            Everything you see is the real production engine — the same multi-agent system your
            customers would reach. Try these:
          </p>
          <ul className="mt-6 space-y-3 text-sm text-slate-300">
            <li className="glass rounded-xl px-4 py-3">💬 “I&apos;d like to book a demo” — watch the full booking flow</li>
            <li className="glass rounded-xl px-4 py-3">💰 “How much does it cost?” — instant pricing</li>
            <li className="glass rounded-xl px-4 py-3">🌎 “Hola, necesito una cita” — she switches to Spanish</li>
            <li className="glass rounded-xl px-4 py-3">🎙️ Tap the mic and just talk — voice in, voice out</li>
          </ul>
          <div className="mt-8">
            <img
              src="/avatar.webp"
              alt="AVA, the FrontDesk Agents AI receptionist"
              className="h-64 w-52 rounded-3xl border border-gold/25 object-cover object-top shadow-[0_30px_80px_-20px_rgba(45,212,191,0.25)]"
            />
          </div>
        </div>
        <div className="lg:pt-10">
          <ChatWidget tall />
          <p className="mt-3 text-center text-xs text-slate-600">
            Bookings made here appear live on the <a href="/dashboard" className="underline">dashboard</a>.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
