"use client";

import Link from "next/link";
import { useState } from "react";
import ShareButton from "./ShareButton";

const links = [
  { href: "/#features", label: "Features" },
  { href: "/#industries", label: "Industries" },
  { href: "/pricing", label: "Pricing" },
  { href: "/demo", label: "Live Demo" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <nav className="glass mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-2xl px-5 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/icon.svg" alt="" className="h-8 w-8 rounded-lg" />
          <span className="font-display text-lg font-semibold tracking-tight">
            FrontDesk <span className="text-gradient-gold">Agents</span>
          </span>
        </Link>
        <div className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-teal-glow">
              {l.label}
            </Link>
          ))}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <ShareButton />
          <Link href="/signup" className="btn-gold rounded-xl px-4 py-2 text-sm">
            Start Free
          </Link>
        </div>
        <button
          aria-label="Menu"
          className="md:hidden text-slate-200"
          onClick={() => setOpen(!open)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>
      {open && (
        <div className="glass mx-auto mt-2 max-w-6xl rounded-2xl p-4 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-slate-200 hover:bg-white/5"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/signup" onClick={() => setOpen(false)} className="btn-gold mt-2 block rounded-xl px-4 py-2.5 text-center text-sm">
            Start Free
          </Link>
        </div>
      )}
    </header>
  );
}
