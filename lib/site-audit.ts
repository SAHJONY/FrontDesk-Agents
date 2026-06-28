// Outdated-website detector. Given a prospect's website URL, fetches the page
// (their OWN public site only) and derives staleness signals the lead-scoring
// engine understands: outdatedWebsite / poorMobile / noBookingAutomation /
// weakOnlinePresence. This is what lets the autonomous engine find not just
// businesses with NO website, but businesses whose site is old/broken and ripe
// for a rebuild.
//
// Compliance: reads only the prospect's own homepage HTML (same as a browser).
// No login, no third-party platform scraping, no PII harvesting.

import type { LeadSignals } from "@/lib/lead-scoring";

export type SiteAudit = {
  url: string;
  reachable: boolean; // did the homepage respond at all?
  https: boolean; // served over HTTPS
  staleness: number; // 0-100, higher = more outdated/worse
  outdated: boolean; // staleness crosses the "worth a pitch" threshold
  signals: LeadSignals; // feed straight into scoreLead()
  reasons: string[]; // human-readable findings ("No mobile viewport", "©2013")
};

// "Now" for copyright-age math. Injectable so it's deterministic in tests and
// avoids Date.now() surprises; callers normally omit it.
function currentYear(now?: number): number {
  return now ? new Date(now).getUTCFullYear() : new Date().getUTCFullYear();
}

async function fetchHtml(url: string, ms: number): Promise<{ ok: boolean; finalUrl: string; html: string }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: { "user-agent": "Mozilla/5.0 (compatible; FrontDeskLeadBot/1.0; +https://www.frontdeskagents.com)" },
    });
    if (!r.ok) return { ok: false, finalUrl: r.url || url, html: "" };
    const html = (await r.text()).slice(0, 600000);
    return { ok: true, finalUrl: r.url || url, html };
  } catch {
    return { ok: false, finalUrl: url, html: "" };
  } finally {
    clearTimeout(t);
  }
}

// Legacy tech / hand-coded-decade-ago tells.
const LEGACY_PATTERNS: [string, RegExp][] = [
  ["Flash content", /\.swf\b|application\/x-shockwave-flash|<embed[^>]+flash/i],
  ["Table-based layout", /<table[^>]*>[\s\S]*?<table/i],
  ["Deprecated <font>/<center> tags", /<font\b|<center\b|<marquee\b|<blink\b/i],
  ["FrontPage / legacy generator", /FrontPage|Microsoft Word|Dreamweaver|GeoCities|Joomla! 1\.|WordPress 3\.|WordPress 4\./i],
  ["Ancient jQuery", /jquery[-.]?1\.[0-9]+(\.[0-9]+)?(\.min)?\.js/i],
  ["XHTML/HTML4 doctype", /<!DOCTYPE\s+html\s+PUBLIC/i],
];

const BOOKING_HINTS =
  /(book|booking|schedule|appointment|reserve|reservation|order online|contact form|request a quote|get a quote|calendly|squareup|opentable|resy|acuity)/i;

const PARKED_HINTS =
  /(domain (is )?for sale|buy this domain|parked( free)?|godaddy\.com\/forsale|this domain is parked|under construction|coming soon|website coming soon|sedo\.com|hugedomains)/i;

/**
 * Audit a prospect's website for staleness. `existsHint=false` means Google had
 * no website on file at all — we short-circuit to a "no site" verdict.
 */
export async function auditSite(website: string | undefined, opts: { now?: number; timeoutMs?: number } = {}): Promise<SiteAudit> {
  const url = String(website || "").trim();
  const base: SiteAudit = { url, reachable: false, https: false, staleness: 0, outdated: false, signals: {}, reasons: [] };

  if (!url) {
    // No website at all — caller handles this as needsSite; report as max staleness.
    return { ...base, staleness: 100, signals: { hasWebsite: false }, reasons: ["No website on record"] };
  }

  const { ok, finalUrl, html } = await fetchHtml(url, opts.timeoutMs ?? 6000);
  const https = /^https:/i.test(finalUrl);

  // Unreachable: dead/parked domain. Treat like "needs a site" — strong signal.
  if (!ok || html.length < 200) {
    return {
      url,
      reachable: false,
      https,
      staleness: 95,
      outdated: true,
      signals: { hasWebsite: false, weakOnlinePresence: true },
      reasons: [ok ? "Site returns almost no content" : "Website is unreachable / down"],
    };
  }

  const reasons: string[] = [];
  const signals: LeadSignals = { hasWebsite: true };
  let staleness = 0;

  if (PARKED_HINTS.test(html)) {
    return {
      url,
      reachable: true,
      https,
      staleness: 90,
      outdated: true,
      signals: { hasWebsite: false, weakOnlinePresence: true },
      reasons: ["Parked / placeholder domain (no real site)"],
    };
  }

  // ---- Mobile-friendliness: the single biggest "old site" tell --------------
  const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(html);
  if (!hasViewport) {
    signals.poorMobile = true;
    staleness += 30;
    reasons.push("No mobile viewport (not responsive)");
  }

  // ---- No HTTPS -------------------------------------------------------------
  if (!https) {
    staleness += 15;
    reasons.push("No HTTPS / insecure");
  }

  // ---- Legacy tech ----------------------------------------------------------
  for (const [label, rx] of LEGACY_PATTERNS) {
    if (rx.test(html)) {
      staleness += 12;
      reasons.push(label);
    }
  }

  // ---- Stale copyright year -------------------------------------------------
  const yr = currentYear(opts.now);
  const years = (html.match(/(?:©|&copy;|copyright)\s*(?:&copy;\s*)?((?:19|20)\d{2})/gi) || [])
    .map((m) => parseInt((m.match(/((?:19|20)\d{2})/) || [])[1] || "0", 10))
    .filter((y) => y >= 1995 && y <= yr);
  if (years.length) {
    const newest = Math.max(...years);
    const age = yr - newest;
    if (age >= 4) {
      staleness += 20;
      reasons.push(`Copyright last updated ${newest} (${age}y old)`);
    } else if (age >= 2) {
      staleness += 10;
      reasons.push(`Copyright ${newest}`);
    }
  }

  // ---- Open Graph / social meta (weak presence) -----------------------------
  const hasOg = /<meta[^>]+property=["']og:/i.test(html);
  if (!hasOg) {
    signals.weakOnlinePresence = true;
    staleness += 8;
    reasons.push("No Open Graph / social metadata");
  }

  // ---- Booking / contact automation ----------------------------------------
  if (!BOOKING_HINTS.test(html)) {
    signals.noBookingAutomation = true;
    staleness += 10;
    reasons.push("No online booking / contact automation");
  }

  // ---- Thin content ---------------------------------------------------------
  const textLen = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().length;
  if (textLen < 600) {
    signals.weakOnlinePresence = true;
    staleness += 10;
    reasons.push("Very little page content");
  }

  staleness = Math.max(0, Math.min(100, staleness));
  // "Outdated enough to pitch a rebuild": not mobile-friendly, OR a meaningful
  // pile of smaller signals.
  const outdated = signals.poorMobile === true || staleness >= 35;
  if (outdated) signals.outdatedWebsite = true;

  return { url, reachable: true, https, staleness, outdated, signals, reasons };
}
