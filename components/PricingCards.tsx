import Link from "next/link";
import { PLANS } from "@/lib/plans";

export default function PricingCards() {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {PLANS.map((p) => (
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
          <Link
            href={`/signup?plan=${p.id}`}
            className={`mt-6 rounded-xl px-4 py-2.5 text-center text-sm ${p.highlight ? "btn-gold" : "btn-ghost"}`}
          >
            Choose {p.name}
          </Link>
        </div>
      ))}
    </div>
  );
}
