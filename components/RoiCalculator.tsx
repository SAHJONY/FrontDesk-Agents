"use client";

import Link from "next/link";
import { useState } from "react";

export default function RoiCalculator() {
  const [missedPerWeek, setMissedPerWeek] = useState(15);
  const [clientValue, setClientValue] = useState(250);
  const [closeRate, setCloseRate] = useState(30);

  const monthlyLoss = Math.round(missedPerWeek * 4.33 * (closeRate / 100) * clientValue);
  const recovered = Math.round(monthlyLoss * 0.92); // AVA answers ~92%+ of calls that would have been missed
  const plan = recovered > 8000 ? 799 : recovered > 2500 ? 299 : 99;
  const roi = plan > 0 ? Math.round(((recovered - plan) / plan) * 100) : 0;

  return (
    <div className="glass rounded-3xl p-8">
      <div className="grid gap-8 md:grid-cols-3">
        <label className="block">
          <span className="text-sm text-slate-300">Missed calls per week</span>
          <input
            type="range"
            min={1}
            max={100}
            value={missedPerWeek}
            onChange={(e) => setMissedPerWeek(+e.target.value)}
            className="mt-3 w-full accent-[#d4a843]"
          />
          <div className="mt-1 font-display text-2xl font-bold text-teal-glow">{missedPerWeek}</div>
        </label>
        <label className="block">
          <span className="text-sm text-slate-300">Average client value ($)</span>
          <input
            type="range"
            min={50}
            max={5000}
            step={50}
            value={clientValue}
            onChange={(e) => setClientValue(+e.target.value)}
            className="mt-3 w-full accent-[#d4a843]"
          />
          <div className="mt-1 font-display text-2xl font-bold text-teal-glow">${clientValue.toLocaleString()}</div>
        </label>
        <label className="block">
          <span className="text-sm text-slate-300">Close rate (%)</span>
          <input
            type="range"
            min={5}
            max={90}
            step={5}
            value={closeRate}
            onChange={(e) => setCloseRate(+e.target.value)}
            className="mt-3 w-full accent-[#d4a843]"
          />
          <div className="mt-1 font-display text-2xl font-bold text-teal-glow">{closeRate}%</div>
        </label>
      </div>

      <div className="mt-10 grid gap-5 rounded-2xl border border-gold/20 bg-gold/5 p-6 text-center sm:grid-cols-3">
        <div>
          <div className="text-xs uppercase tracking-widest text-slate-500">You&apos;re losing</div>
          <div className="mt-1 font-display text-3xl font-bold text-red-300">${monthlyLoss.toLocaleString()}/mo</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-slate-500">AVA recovers ≈</div>
          <div className="mt-1 font-display text-3xl font-bold text-emerald-300">${recovered.toLocaleString()}/mo</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-slate-500">ROI on ${plan}/mo plan</div>
          <div className="mt-1 font-display text-3xl font-bold text-gradient-gold">{roi.toLocaleString()}%</div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/signup" className="btn-gold inline-block rounded-2xl px-8 py-3.5">
          Stop the leak — Start Free
        </Link>
      </div>
    </div>
  );
}
