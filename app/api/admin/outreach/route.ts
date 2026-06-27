import { NextRequest, NextResponse } from "next/server";
import { isOwner } from "@/lib/auth";
import { loadSecretOverrides } from "@/lib/secrets";
import { isOptedOut, addOptOut, recordEvent } from "@/lib/store";

export const runtime = "nodejs";

// Owner-gated outreach (email via Resend, SMS via Twilio). Compliance built in:
//   - honors an opt-out suppression list (rejects suppressed contacts)
//   - POST { optOut:true, to } adds a contact to the suppression list
//   - auto-appends an unsubscribe line so every message is opt-out-able
// NOT an autonomous blaster — one explicit, owner-initiated send per call.
export async function POST(req: NextRequest) {
  await loadSecretOverrides();
  if (!(await isOwner())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Record<string, any>;

  if (body.optOut) {
    await addOptOut(String(body.to || ""));
    return NextResponse.json({ ok: true, optedOut: String(body.to || "").trim().toLowerCase() });
  }

  const channel = body.channel === "sms" ? "sms" : "email";
  const to = String(body.to || "").trim();
  const message = String(body.message || "").trim();
  const subject = String(body.subject || "A quick website idea for your business").slice(0, 160);
  if (!to || !message) return NextResponse.json({ error: "'to' and 'message' are required." }, { status: 400 });

  if (await isOptedOut(to)) {
    return NextResponse.json({ error: "Recipient has opted out — not sent." }, { status: 409 });
  }

  const optOutLine = channel === "sms" ? "\n\nReply STOP to opt out." : "\n\n— Reply with 'unsubscribe' to opt out.";
  const fullMessage = message + optOutLine;

  try {
    if (channel === "email") {
      const rk = process.env.RESEND_API_KEY;
      if (!rk) return NextResponse.json({ error: "Set RESEND_API_KEY to send emails." }, { status: 500 });
      const from = process.env.OUTREACH_FROM || "onboarding@resend.dev";
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: "Bearer " + rk, "content-type": "application/json" },
        body: JSON.stringify({ from, to, subject, text: fullMessage }),
      });
      const j = await r.json();
      if (!r.ok) return NextResponse.json({ error: j?.message || j?.error || "Email failed" }, { status: r.status });
      recordEvent("email:sent", { to: to.replace(/(.{3}).*(@.*)/, "$1…$2"), subject, kind: "outreach" });
      return NextResponse.json({ ok: true, id: j.id });
    }

    const sid = process.env.TWILIO_ACCOUNT_SID, tok = process.env.TWILIO_AUTH_TOKEN, from = process.env.TWILIO_FROM;
    if (!sid || !tok || !from) return NextResponse.json({ error: "Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM to send SMS." }, { status: 500 });
    const form = new URLSearchParams({ To: to, From: from, Body: fullMessage });
    const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: { Authorization: "Basic " + Buffer.from(sid + ":" + tok).toString("base64"), "content-type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    const j = await r.json();
    if (!r.ok) return NextResponse.json({ error: j?.message || "SMS failed" }, { status: r.status });
    return NextResponse.json({ ok: true, sid: j.sid });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Request failed" }, { status: 500 });
  }
}
