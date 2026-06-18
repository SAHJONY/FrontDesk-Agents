"use client";

import { useState } from "react";
import Link from "next/link";
import { PLANS, type PlanId } from "@/lib/plans";

type Provider = "stripe" | "square" | "paypal";

const PROVIDER_LABEL: Record<Provider, string> = {
  stripe: "Pay with Card",
  square: "Pay with Square",
  paypal: "Pay with PayPal",
};

export default function PricingCards() {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function checkout(planId: PlanId, provider: Provider) {
    setError(null);

    // Square invoices a customer; it needs an email up front to create the
    // customer record. Stripe and PayPal collect email on their own page.
    let extra: Record<string, string> = {};
    if (provider === "square") {
      const email = (window.prompt(
        "Enter the email Square should send your monthly invoice to:"
      ) || "").trim();
      if (!email) return;
      extra = { email };
    }

    setBusy(`${planId}:${provider}`);
    try {
      const res = await fetch(`/api/billing/checkout/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, ...extra }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data?.error || "Checkout is temporarily unavailable.");
      }
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed. Please try another option.");
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((p) => {
          const isFree = p.price === 0;
          return (
            <div
              key={p.id}
              className={`relative flex flex-col rounded-3xl p-6 ${p.highlight ? "glass-gold" : "glass"}`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#f0d293] to-[#d4a843] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#1a1206]">
                  Most Popular
                </span>
              )}
              <h3 className="font-display text-xl font-semibold">{p.name}</h3>
              <p className="mt-1 text-xs text-slate-400">{p.tagline}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold text-gradient-gold">${p.price}</span>
                <span className="text-sm text-slate-400">/month</span>
              </div>
              <ul className="mt-5 flex-1 space-y-2.5 text-sm text-slate-300">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-teal-glow">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {isFree ? (
                <Link
                  href={`/signup?plan=${p.id}`}
                  className="mt-6 rounded-xl px-4 py-2.5 text-center text-sm btn-ghost"
                >
                  Start free
                </Link>
              ) : (
                <div className="mt-6 space-y-2">
                  <button
                    onClick={() => checkout(p.id, "stripe")}
                    disabled={busy !== null}
                    className={`w-full rounded-xl px-4 py-2.5 text-sm disabled:opacity-50 ${p.highlight ? "btn-gold" : "btn-ghost"}`}
                  >
                    {busy === `${p.id}:stripe` ? "Redirecting…" : PROVIDER_LABEL.stripe}
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => checkout(p.id, "square")}
                      disabled={busy !== null}
                      className="flex-1 rounded-xl border border-white/10 bg-white/[0.02] px-2 py-2 text-xs text-slate-300 transition hover:border-teal-glow/40 disabled:opacity-50"
                    >
                      {busy === `${p.id}:square` ? "…" : "Square"}
                    </button>
                    <button
                      onClick={() => checkout(p.id, "paypal")}
                      disabled={busy !== null}
                      className="flex-1 rounded-xl border border-white/10 bg-white/[0.02] px-2 py-2 text-xs text-slate-300 transition hover:border-teal-glow/40 disabled:opacity-50"
                    >
                      {busy === `${p.id}:paypal` ? "…" : "PayPal"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {error && (
        <p className="mt-6 text-center text-sm text-red-300" role="alert">
          {error}
        </p>
      )}
      <p className="mt-6 text-center text-xs text-slate-500">
        All checkouts are secure and hosted by Stripe, Square, or PayPal — we never see your card number.
      </p>
    </div>
  );
}
