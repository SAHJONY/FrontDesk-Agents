"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { PLANS, INDUSTRIES } from "@/lib/plans";

function SignupWizard() {
  const params = useSearchParams();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    business: "",
    industry: "",
    email: "",
    phone: "",
    plan: params.get("plan") || "professional",
  });
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      // Always capture the lead so we have the business context, regardless
      // of whether they ultimately pay.
      const leadRes = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "signup-wizard" }),
      });
      if (!leadRes.ok) throw new Error("lead");

      if (form.plan === "free") {
        setDone(true);
        return;
      }

      // Paid plan → start a real Stripe checkout. (Square/PayPal are available
      // from the pricing page; this path defaults to Stripe.)
      const coRes = await fetch("/api/billing/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: form.plan }),
      });
      const co = await coRes.json();
      if (!coRes.ok || !co.url) {
        setError(
          co.error ||
            "Couldn't start checkout. Your info is saved — try paying from the pricing page or contact support."
        );
        setSubmitting(false);
        return;
      }
      window.location.href = co.url;
    } catch {
      setError("Something went wrong — please try again.");
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="glass mx-auto max-w-lg rounded-3xl p-10 text-center">
        <div className="text-5xl">🎉</div>
        <h2 className="mt-4 font-display text-3xl font-semibold">
          Welcome aboard, <span className="text-gradient-gold">{form.business || "friend"}!</span>
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Your <strong className="text-gold capitalize">Free</strong> account is ready. We'll send
          your widget snippet and onboarding link to {form.email || form.phone} shortly.
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <Link href="/demo" className="btn-gold rounded-xl px-5 py-2.5 text-sm">Meet AVA</Link>
          <Link href="/dashboard" className="btn-ghost rounded-xl px-5 py-2.5 text-sm">View dashboard</Link>
        </div>
      </div>
    );
  }

  const steps = ["Your business", "Industry", "Contact", "Plan"];

  return (
    <div className="glass mx-auto max-w-xl rounded-3xl p-8">
      <div className="mb-8 flex gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex-1">
            <div className={`h-1 rounded-full ${i <= step ? "bg-gradient-to-r from-[#f0d293] to-[#2dd4bf]" : "bg-white/10"}`} />
            <div className={`mt-1.5 text-[10px] uppercase tracking-wider ${i <= step ? "text-gold" : "text-slate-600"}`}>{s}</div>
          </div>
        ))}
      </div>

      {step === 0 && (
        <div>
          <h2 className="font-display text-2xl font-semibold">What&apos;s your business called?</h2>
          <input
            autoFocus
            value={form.business}
            onChange={(e) => setForm({ ...form, business: e.target.value })}
            placeholder="e.g. Bright Smile Dental"
            className="mt-5 w-full rounded-xl border border-white/10 bg-ink-2/80 px-4 py-3 outline-none focus:border-teal-glow/50"
          />
        </div>
      )}

      {step === 1 && (
        <div>
          <h2 className="font-display text-2xl font-semibold">Pick your industry</h2>
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind.name}
                onClick={() => setForm({ ...form, industry: ind.name })}
                className={`rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                  form.industry === ind.name
                    ? "border-gold/60 bg-gold/10 text-gold"
                    : "border-white/10 bg-white/[0.02] text-slate-300 hover:border-teal-glow/40"
                }`}
              >
                {ind.icon} {ind.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="font-display text-2xl font-semibold">Where do we reach you?</h2>
          <input
            autoFocus
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@business.com"
            className="mt-5 w-full rounded-xl border border-white/10 bg-ink-2/80 px-4 py-3 outline-none focus:border-teal-glow/50"
          />
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="Business phone (optional)"
            className="mt-3 w-full rounded-xl border border-white/10 bg-ink-2/80 px-4 py-3 outline-none focus:border-teal-glow/50"
          />
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="font-display text-2xl font-semibold">Choose your plan</h2>
          <div className="mt-5 space-y-2.5">
            {PLANS.map((p) => (
              <button
                key={p.id}
                onClick={() => setForm({ ...form, plan: p.id })}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                  form.plan === p.id
                    ? "border-gold/60 bg-gold/10"
                    : "border-white/10 bg-white/[0.02] hover:border-teal-glow/40"
                }`}
              >
                <span className="text-sm font-medium">
                  {p.name} <span className="block text-xs font-normal text-slate-500">{p.tagline}</span>
                </span>
                <span className="font-display text-lg font-bold text-gradient-gold">${p.price}/mo</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

      <div className="mt-8 flex justify-between">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          className={`btn-ghost rounded-xl px-5 py-2.5 text-sm ${step === 0 ? "invisible" : ""}`}
        >
          ← Back
        </button>
        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={(step === 0 && !form.business.trim()) || (step === 2 && !form.email.trim() && !form.phone.trim())}
            className="btn-gold rounded-xl px-6 py-2.5 text-sm disabled:opacity-40"
          >
            Continue →
          </button>
        ) : (
          <button onClick={submit} disabled={submitting} className="btn-gold rounded-xl px-6 py-2.5 text-sm disabled:opacity-60">
            {submitting ? "Setting up…" : form.plan === "free" ? "Activate Free plan" : "Continue to checkout"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <main>
      <Nav />
      <section className="mx-auto max-w-6xl px-5 pt-32 pb-24">
        <div className="mb-10 text-center">
          <h1 className="font-display text-4xl font-semibold md:text-5xl">
            Go live in <span className="text-gradient-gold">10 minutes</span>
          </h1>
          <p className="mt-3 text-slate-400">Free tier needs no card. Paid plans send you to a secure checkout. Cancel anytime.</p>
        </div>
        <Suspense>
          <SignupWizard />
        </Suspense>
      </section>
      <Footer />
    </main>
  );
}
