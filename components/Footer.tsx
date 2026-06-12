import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-ink-2/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <img src="/icon.svg" alt="" className="h-8 w-8 rounded-lg" />
            <span className="font-display text-lg font-semibold">
              FrontDesk <span className="text-gradient-gold">Agents</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
            An AI receptionist for service businesses. Answer chats, book appointments, and capture
            leads in 100+ languages worldwide — 24 hours a day.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-300">Platform</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><Link href="/demo" className="hover:text-teal-glow">Live Demo</Link></li>
            <li><Link href="/pricing" className="hover:text-teal-glow">Pricing & ROI</Link></li>
            <li><Link href="/dashboard" className="hover:text-teal-glow">Dashboard</Link></li>
            <li><Link href="/portal" className="hover:text-teal-glow">Customer Portal</Link></li>
            <li><Link href="/signup" className="hover:text-teal-glow">Get Started</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-300">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><a href="mailto:sahjonyllc@gmail.com" className="hover:text-teal-glow">Contact</a></li>
            <li><Link href="/#features" className="hover:text-teal-glow">Technology</Link></li>
            <li><Link href="/#industries" className="hover:text-teal-glow">Industries</Link></li>
            <li><Link href="/admin" className="hover:text-gold">Admin</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-5 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} FrontDesk Agents LLC. All rights reserved.
      </div>
    </footer>
  );
}
