"use client";

import { useState } from "react";

export default function ROICalculator() {
  const [leads, setLeads] = useState(100);
  const [revenuePerLead, setRevenuePerLead] = useState(50);
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const monthlySavings = leads * revenuePerLead - 399; // $399 monthly cost
    setResult(monthlySavings > 0 ? monthlySavings : 0);
  };

  return (
    <div className="mt-8 rounded-2xl bg-ink-2/30 p-6 text-center">
      <h3 className="font-display text-xl font-semibold text-gold mb-3">ROI Calculator</h3>
      <div className="flex flex-col gap-3 md:flex-row md:justify-center md:items-center">
        <div>
          <label className="text-sm text-slate-300">Monthly leads</label>
          <input
            type="number"
            min="1"
            value={leads}
            onChange={(e) => setLeads(Number(e.target.value))}
            className="mt-1 w-28 rounded bg-ink-2/50 px-2 py-1 text-center text-white focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-slate-300">Avg. revenue per lead ($)</label>
          <input
            type="number"
            min="1"
            value={revenuePerLead}
            onChange={(e) => setRevenuePerLead(Number(e.target.value))}
            className="mt-1 w-28 rounded bg-ink-2/50 px-2 py-1 text-center text-white focus:outline-none"
          />
        </div>
        <button
          onClick={calculate}
          className="mt-2 md:mt-0 rounded-xl bg-gold/20 px-4 py-2 text-sm font-medium text-gold hover:bg-gold/30"
        >
          Calculate
        </button>
      </div>
      {result !== null && (
        <p className="mt-4 text-lg font-medium text-teal-glow">
          Estimated monthly profit: <span className="text-gold">${result.toLocaleString()}</span>
        </p>
      )}
    </div>
  );
}
