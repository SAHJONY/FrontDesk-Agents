"use client";

import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { VOICE_STYLES, type VoiceStyle, type FAQ } from "@/lib/receptionist-config";

type Form = {
  businessName: string;
  industry: string;
  agentName: string;
  phone: string;
  hours: string;
  services: string[];
  serviceArea: string;
  faqs: FAQ[];
  pricingInfo: string;
  bookingRules: string;
  escalationRules: string;
  voiceStyle: VoiceStyle;
};

type Preview = { greeting: string; knowledgeBase: string; script: string; voice: string };

const EMPTY: Form = {
  businessName: "",
  industry: "",
  agentName: "Ava",
  phone: "",
  hours: "",
  services: [""],
  serviceArea: "",
  faqs: [{ q: "", a: "" }],
  pricingInfo: "",
  bookingRules: "",
  escalationRules: "",
  voiceStyle: "professional",
};

const STEPS = ["Business", "Services & hours", "FAQs", "Style & rules", "Review & activate"] as const;

const inputCls =
  "w-full rounded-xl border border-white/10 bg-ink-2/80 px-4 py-3 text-sm outline-none focus:border-teal-glow/50";
const labelCls = "text-xs uppercase tracking-widest text-slate-500";

export default function OnboardingPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [step, setStep] = useState(0);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    fetch("/api/portal/receptionist")
      .then((r) => {
        if (r.status === 401) {
          setAuthed(false);
          return null;
        }
        setAuthed(true);
        return r.json();
      })
      .then((d) => {
        if (d?.config) {
          setForm({
            businessName: d.config.businessName ?? "",
            industry: d.config.industry ?? "",
            agentName: d.config.agentName ?? "Ava",
            phone: d.config.phone ?? "",
            hours: d.config.hours ?? "",
            services: d.config.services?.length ? d.config.services : [""],
            serviceArea: d.config.serviceArea ?? "",
            faqs: d.config.faqs?.length ? d.config.faqs : [{ q: "", a: "" }],
            pricingInfo: d.config.pricingInfo ?? "",
            bookingRules: d.config.bookingRules ?? "",
            escalationRules: d.config.escalationRules ?? "",
            voiceStyle: d.config.voiceStyle ?? "professional",
          });
          setActive(d.config.status === "active");
          setPreview(d.preview ?? null);
        }
      })
      .catch(() => setAuthed(false));
  }, []);

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(activate: boolean) {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/portal/receptionist", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          services: form.services.filter((s) => s.trim()),
          faqs: form.faqs.filter((f) => f.q.trim() && f.a.trim()),
          activate,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setPreview(data.preview ?? null);
      setActive(data.config?.status === "active");
      setStatus(activate ? "✅ Receptionist activated — your team will be notified to bind a phone number." : "✅ Draft saved.");
    } catch (e) {
      setStatus(`⚠️ ${e instanceof Error ? e.message : "Save failed"}`);
    } finally {
      setBusy(false);
    }
  }

  const canProceed = step > 0 || (form.businessName.trim() && form.industry.trim());

  if (authed === false) {
    return (
      <main>
        <Nav />
        <section className="mx-auto max-w-2xl px-5 pt-32 pb-24 text-center">
          <h1 className="font-display text-3xl font-semibold">
            Set up your <span className="text-gradient-gold">AI receptionist</span>
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            Sign in to your customer account first — then we&apos;ll build your AI employee in a few minutes.
          </p>
          <a href="/portal" className="btn-gold mt-6 inline-block rounded-xl px-6 py-3 text-sm">
            Sign in to continue →
          </a>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Nav />
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[55vh]">
        <img src="/command-center.webp" alt="" className="h-full w-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/85 to-ink" />
      </div>

      <section className="mx-auto max-w-3xl px-5 pt-32 pb-24">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-4xl font-semibold md:text-5xl">
              Build your <span className="text-gradient-gold">AI receptionist</span>
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Answer a few questions. We generate your AI employee&apos;s personality, knowledge, and call script —
              powered by the same voice engine behind our own front desk.
            </p>
          </div>
          {active && (
            <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[11px] uppercase tracking-wider text-emerald-300">
              ● Active
            </span>
          )}
        </div>

        {/* Step rail */}
        <div className="mt-8 flex flex-wrap gap-2">
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => setStep(i)}
              className={`rounded-full px-3.5 py-1.5 text-xs transition ${
                i === step
                  ? "bg-gradient-to-r from-[#f0d293] to-[#d4a843] font-semibold text-[#1a1206]"
                  : "glass text-slate-300 hover:text-teal-glow"
              }`}
            >
              {i + 1}. {s}
            </button>
          ))}
        </div>

        <div className="glass mt-8 rounded-3xl p-6 md:p-8">
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label className={labelCls}>Business name *</label>
                <input className={`${inputCls} mt-2`} value={form.businessName} onChange={(e) => set("businessName", e.target.value)} placeholder="Bright Smile Dental" />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Industry *</label>
                  <input className={`${inputCls} mt-2`} value={form.industry} onChange={(e) => set("industry", e.target.value)} placeholder="Dental practice" />
                </div>
                <div>
                  <label className={labelCls}>Receptionist&apos;s name</label>
                  <input className={`${inputCls} mt-2`} value={form.agentName} onChange={(e) => set("agentName", e.target.value)} placeholder="Ava" />
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Business phone</label>
                  <input className={`${inputCls} mt-2`} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 (555) 123-4567" />
                </div>
                <div>
                  <label className={labelCls}>Service area</label>
                  <input className={`${inputCls} mt-2`} value={form.serviceArea} onChange={(e) => set("serviceArea", e.target.value)} placeholder="Greater Cleveland, OH" />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className={labelCls}>Business hours</label>
                <textarea className={`${inputCls} mt-2 min-h-[80px]`} value={form.hours} onChange={(e) => set("hours", e.target.value)} placeholder={"Mon–Fri 8am–6pm\nSat 9am–2pm\nClosed Sunday"} />
              </div>
              <div>
                <label className={labelCls}>Services offered</label>
                <div className="mt-2 space-y-2">
                  {form.services.map((s, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        className={inputCls}
                        value={s}
                        onChange={(e) => set("services", form.services.map((v, j) => (j === i ? e.target.value : v)))}
                        placeholder="e.g. Teeth cleaning, New-patient exam, Whitening"
                      />
                      {form.services.length > 1 && (
                        <button onClick={() => set("services", form.services.filter((_, j) => j !== i))} className="btn-ghost shrink-0 rounded-xl px-3 text-xs">
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => set("services", [...form.services, ""])} className="text-xs text-teal-glow hover:underline">
                    + Add service
                  </button>
                </div>
              </div>
              <div>
                <label className={labelCls}>Pricing information (optional)</label>
                <textarea className={`${inputCls} mt-2 min-h-[80px]`} value={form.pricingInfo} onChange={(e) => set("pricingInfo", e.target.value)} placeholder="New-patient exam $89. Cleanings from $120. Free whitening consult." />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Add the questions callers ask most. Your receptionist answers these directly — and never invents an
                answer it doesn&apos;t have.
              </p>
              {form.faqs.map((f, i) => (
                <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-slate-500">FAQ {i + 1}</span>
                    {form.faqs.length > 1 && (
                      <button onClick={() => set("faqs", form.faqs.filter((_, j) => j !== i))} className="text-xs text-red-300 hover:text-red-200">
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    className={`${inputCls} mt-2`}
                    value={f.q}
                    onChange={(e) => set("faqs", form.faqs.map((v, j) => (j === i ? { ...v, q: e.target.value } : v)))}
                    placeholder="Question — e.g. Do you take walk-ins?"
                  />
                  <textarea
                    className={`${inputCls} mt-2 min-h-[60px]`}
                    value={f.a}
                    onChange={(e) => set("faqs", form.faqs.map((v, j) => (j === i ? { ...v, a: e.target.value } : v)))}
                    placeholder="Answer — e.g. Yes, walk-ins are welcome before 4pm on weekdays."
                  />
                </div>
              ))}
              <button onClick={() => set("faqs", [...form.faqs, { q: "", a: "" }])} className="text-xs text-teal-glow hover:underline">
                + Add FAQ
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className={labelCls}>Voice personality</label>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {VOICE_STYLES.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => set("voiceStyle", v.id)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        form.voiceStyle === v.id ? "border-gold/50 bg-gold/5" : "border-white/10 bg-white/[0.02] hover:border-teal-glow/40"
                      }`}
                    >
                      <div className="text-sm font-semibold">{v.label}</div>
                      <div className="mt-1 text-[11px] leading-relaxed text-slate-400">{v.tone}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>Booking rules (optional — leave blank for the standard flow)</label>
                <textarea className={`${inputCls} mt-2 min-h-[70px]`} value={form.bookingRules} onChange={(e) => set("bookingRules", e.target.value)} placeholder="Only book Mon–Thu. Always collect insurance provider. New patients need a 60-min slot." />
              </div>
              <div>
                <label className={labelCls}>Escalation rules (optional)</label>
                <textarea className={`${inputCls} mt-2 min-h-[70px]`} value={form.escalationRules} onChange={(e) => set("escalationRules", e.target.value)} placeholder="Dental emergencies → take number and flag urgent. Billing questions → front desk callback." />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-sm">
                <div className="font-semibold text-slate-200">{form.businessName || "—"}</div>
                <div className="mt-0.5 text-xs text-slate-400">
                  {form.industry || "—"} · receptionist “{form.agentName}” · {VOICE_STYLES.find((v) => v.id === form.voiceStyle)?.label} voice
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  {form.services.filter((s) => s.trim()).length} service(s) · {form.faqs.filter((f) => f.q.trim() && f.a.trim()).length} FAQ(s)
                </div>
              </div>

              {preview && (
                <div className="space-y-3">
                  <div>
                    <div className={labelCls}>Opening line callers will hear</div>
                    <p className="mt-2 rounded-xl border border-gold/20 bg-gold/5 px-4 py-3 text-sm text-slate-200">“{preview.greeting}”</p>
                  </div>
                  <details className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                    <summary className="cursor-pointer text-sm text-slate-300">View generated call script</summary>
                    <pre className="mt-3 max-h-[360px] overflow-y-auto whitespace-pre-wrap rounded-lg bg-black/40 p-3 text-[11px] leading-relaxed text-slate-300">
                      {preview.script}
                    </pre>
                  </details>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button onClick={() => save(false)} disabled={busy} className="btn-ghost rounded-xl px-5 py-3 text-sm disabled:opacity-50">
                  {busy ? "Saving…" : "Save draft & preview"}
                </button>
                <button onClick={() => save(true)} disabled={busy || !form.businessName.trim()} className="btn-gold rounded-xl px-5 py-3 text-sm disabled:opacity-50">
                  {busy ? "Activating…" : "Activate receptionist"}
                </button>
              </div>
              {status && <p className="text-xs text-slate-300">{status}</p>}
              <p className="text-[11px] leading-relaxed text-slate-500">
                Activating generates your script and notifies our team to bind a phone number to it. Nothing is dialed
                automatically — your AI employee goes live once the number is connected.
              </p>
            </div>
          )}

          {/* Nav buttons */}
          <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-5">
            <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="btn-ghost rounded-xl px-4 py-2 text-sm disabled:opacity-30">
              ← Back
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={!canProceed} className="btn-gold rounded-xl px-5 py-2 text-sm disabled:opacity-40">
                Next →
              </button>
            ) : (
              <span className="text-[11px] text-slate-500">Save a draft anytime — return here to refine.</span>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
