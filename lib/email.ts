// Transactional email. Primary transport is SMTP (Outlook business mailbox —
// can reach any recipient); Resend is the fallback when SMTP is unavailable.
// Every send is best-effort and recorded in the event stream; a missing
// configuration degrades to a silent no-op so the calling flow never breaks.
import nodemailer from "nodemailer";
import { recordEvent } from "@/lib/store";
import type { IntelligenceReport } from "@/lib/intelligence";

export function emailConfigured(): boolean {
  return Boolean((process.env.SMTP_USER && process.env.SMTP_PASS) || process.env.RESEND_API_KEY);
}

export function notifyAddress(): string {
  return process.env.NOTIFY_EMAIL || "sahjonycapitalllc@outlook.com";
}

async function sendViaSmtp(to: string, subject: string, html: string): Promise<boolean> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return false;
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp-mail.outlook.com",
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({
      from: `"FrontDesk Agents" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch {
    return false;
  }
}

async function sendViaResend(to: string, subject: string, html: string): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "FrontDesk Agents <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) return true;
    // Custom sender not verified yet — retry once on the shared sender,
    // which can always reach the account owner.
    if (process.env.RESEND_FROM && res.status === 403) {
      const retry = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from: "FrontDesk Agents <onboarding@resend.dev>", to: [to], subject, html }),
        signal: AbortSignal.timeout(10000),
      });
      return retry.ok;
    }
    return false;
  } catch {
    return false;
  }
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const ok = (await sendViaSmtp(to, subject, html)) || (await sendViaResend(to, subject, html));
  recordEvent(ok ? "email:sent" : "email:failed", { to: to.replace(/(.{3}).*(@.*)/, "$1…$2"), subject });
  return ok;
}

const wrap = (title: string, body: string) => `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;background:#0b1422;color:#e8eef7;border-radius:12px;overflow:hidden">
  <div style="padding:20px 24px;background:linear-gradient(120deg,#0d1a2d,#0b1422);border-bottom:2px solid #d4a843">
    <span style="font-size:18px;font-weight:bold">FrontDesk <span style="color:#e8c476">Agents</span></span>
  </div>
  <div style="padding:24px">
    <h2 style="margin:0 0 14px;color:#f6dba2;font-size:18px">${title}</h2>
    ${body}
  </div>
  <div style="padding:14px 24px;background:#08101d;font-size:11px;color:#64748b">
    FrontDeskAgents.com — the AI receptionist that never sleeps.
  </div>
</div>`;

const row = (k: string, v: string) =>
  `<tr><td style="padding:6px 10px;color:#94a3b8;font-size:13px">${k}</td><td style="padding:6px 10px;color:#e8eef7;font-size:13px"><strong>${v}</strong></td></tr>`;

export async function emailBookingConfirmation(b: {
  name: string;
  service: string;
  datetime: string;
  phone: string;
}): Promise<void> {
  const body = `
    <p style="font-size:14px;color:#cbd5e1">AVA just booked a new appointment:</p>
    <table style="width:100%;background:#0d1a2d;border-radius:8px;border-collapse:collapse">
      ${row("Client", b.name)}${row("Service", b.service)}${row("When", b.datetime)}${row("Phone", b.phone || "—")}
    </table>
    <p style="font-size:12px;color:#64748b;margin-top:14px">Full details in the <a href="https://www.frontdeskagents.com/admin" style="color:#2dd4bf">Executive Suite</a>.</p>`;
  await sendEmail(notifyAddress(), `📅 New booking: ${b.name} — ${b.datetime}`, wrap("New appointment booked", body));
}

export async function emailLeadAlert(l: { business?: string; email?: string; phone?: string; plan?: string; source: string }): Promise<void> {
  const body = `
    <p style="font-size:14px;color:#cbd5e1">A new lead just came in:</p>
    <table style="width:100%;background:#0d1a2d;border-radius:8px;border-collapse:collapse">
      ${row("Business", l.business || "—")}${row("Contact", l.email || l.phone || "—")}${row("Plan interest", l.plan || "—")}${row("Source", l.source)}
    </table>`;
  await sendEmail(notifyAddress(), `🔥 New lead: ${l.business || l.email || l.phone || "unknown"}`, wrap("New lead captured", body));
}

// Daily Owner Report — the Autonomous Decision Engine, pushed to the owner's
// inbox on a schedule (via /api/cron/daily-report). Renders the same health,
// funnel, and prioritized insights shown in the admin Intelligence tab.
export async function emailDailyOwnerReport(report: IntelligenceReport): Promise<boolean> {
  const h = report.health;
  const money = (n: number) => `$${Math.round(n).toLocaleString()}`;
  const wow = h.activityWoWPct;
  const wowStr = wow === null ? "—" : `${wow >= 0 ? "+" : ""}${wow}%`;

  const sevColor: Record<string, string> = {
    risk: "#f87171",
    opportunity: "#e8c476",
    healthy: "#34d399",
  };

  const stats = `
    <table style="width:100%;background:#0d1a2d;border-radius:8px;border-collapse:collapse;margin-bottom:16px">
      ${row("MRR", money(h.mrr))}${row("ARR run-rate", money(h.arr))}
      ${row("Active subscribers", String(h.activeSubscribers))}${row("Customers", String(h.customers))}
      ${row("New leads · 7d", `${h.newLeads7d} (prior wk ${h.newLeads7dPrev})`)}${row("Bookings · 7d", String(h.bookings7d))}
      ${row("Activity WoW", wowStr)}
    </table>`;

  const insightHtml = report.insights.length
    ? report.insights
        .map((i) => {
          const c = sevColor[i.severity] ?? "#94a3b8";
          const val = i.estValue ? ` · <span style="color:#34d399">${money(i.estValue)}/mo</span>` : "";
          return `
      <div style="border-left:3px solid ${c};background:#0d1a2d;border-radius:6px;padding:10px 14px;margin-bottom:10px">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:${c}">${i.severity} · ${i.priority} priority${val}</div>
        <div style="font-size:14px;font-weight:bold;color:#e8eef7;margin:4px 0">${i.title}</div>
        ${i.problem !== "—" ? `<div style="font-size:12px;color:#94a3b8"><strong>Problem:</strong> ${i.problem}</div>` : ""}
        <div style="font-size:12px;color:#94a3b8"><strong>Impact:</strong> ${i.impact}</div>
        <div style="font-size:12px;color:#cbd5e1"><strong>Action:</strong> ${i.action}</div>
      </div>`;
        })
        .join("")
    : `<p style="font-size:13px;color:#94a3b8">No action items detected — the funnel is clean.</p>`;

  const body = `
    <p style="font-size:14px;color:#cbd5e1;line-height:1.5">${report.summary}</p>
    <h3 style="color:#f6dba2;font-size:14px;margin:18px 0 8px">Business health</h3>
    ${stats}
    <h3 style="color:#f6dba2;font-size:14px;margin:18px 0 8px">Decision engine — ${report.insights.length} item(s)</h3>
    ${insightHtml}
    <p style="font-size:12px;color:#64748b;margin-top:16px">Full detail in the <a href="https://project-y8vxc.vercel.app/admin" style="color:#2dd4bf">Intelligence tab</a>.</p>`;

  const date = report.generatedAt.slice(0, 10);
  return sendEmail(notifyAddress(), `📊 Daily owner report — ${date} · MRR ${money(h.mrr)}`, wrap("Daily owner report", body));
}

export async function emailCallSummary(c: {
  callId: string | null;
  summary?: string;
  lengthSec?: number;
  recordingUrl?: string;
  from?: string;
}): Promise<void> {
  const body = `
    <p style="font-size:14px;color:#cbd5e1">${c.summary || "A call just completed."}</p>
    <table style="width:100%;background:#0d1a2d;border-radius:8px;border-collapse:collapse">
      ${row("Caller", c.from || "—")}${row("Duration", c.lengthSec ? `${c.lengthSec} min` : "—")}
      ${c.recordingUrl ? row("Recording", `<a href="${c.recordingUrl}" style="color:#2dd4bf">listen</a>`) : ""}
    </table>`;
  await sendEmail(notifyAddress(), `📞 Call summary ${c.callId ? `(${String(c.callId).slice(0, 8)})` : ""}`, wrap("Call completed", body));
}
