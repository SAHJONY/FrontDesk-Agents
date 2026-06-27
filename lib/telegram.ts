// Autonomous Telegram sales agent "Ava" — qualifies inbound leads, answers as a
// receptionist/sales rep with per-chat memory, and hands off to the owner.
// Ported from the factory's lib/telegram.js. Differences for the unified
// platform: the AI reply uses the in-process brain (generateWebsite) instead of
// an HTTP call to /api/generate, and /pay uses createSiteCheckout directly.
import { generateWebsite } from "@/lib/website-gen";
import { createSiteCheckout } from "@/lib/site-checkout";
import { kvGetJson, kvSetJson } from "@/lib/site-store";

const esc = (s: unknown) => String(s == null ? "" : s).replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c] as string));

export function tgConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN);
}

export async function tgSend(chatId: string | number, text: string, extra: Record<string, unknown> = {}): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId || !text) return false;
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: String(text).slice(0, 4000), parse_mode: "HTML", disable_web_page_preview: true, ...extra }),
    });
    return r.ok;
  } catch {
    return false;
  }
}

export async function tgNotifyOwner(text: string, extra?: Record<string, unknown>): Promise<boolean> {
  const owner = process.env.TELEGRAM_OWNER_CHAT;
  if (!owner) return false;
  return tgSend(owner, text, extra);
}

const histKey = (id: string | number) => `fda:tg:hist:${id}`;
const humanKey = (id: string | number) => `fda:tg:human:${id}`;
const HUMAN_PAUSE_MS = 2 * 60 * 60 * 1000;
const BUILDER_URL = (process.env.APP_URL || "https://www.frontdeskagents.com").replace(/\/$/, "") + "/websites";

type Turn = { role: "user" | "assistant"; content: string };

const PERSONA = `You are Ava, the warm, sharp virtual receptionist and sales rep for FrontDesk Agents. We build premium custom websites for local businesses — fast turnaround, AI-generated imagery, mobile-friendly, SEO help — plus an optional AI receptionist that answers calls/chats 24/7 and monthly care plans. Payment is flexible: pay in full, installments, card, Cash App, Zelle, or Square.
Your job:
- Greet warmly, sound like a real person.
- Answer clearly and confidently.
- Qualify: business name, type, city, whether they have a website, what they want.
- GET THEM TO THE INTAKE FORM whenever they want a website, sample, pricing, or to start: ${BUILDER_URL}
Rules: keep replies 2-5 sentences, no markdown, minimal emoji. Paste the link as a plain URL. Never invent prices — offer a free custom quote via the form. If they want to buy now or need a human, say you'll connect them with the team.`;

async function aiReply(history: Turn[]): Promise<string> {
  const convo = history.slice(-10).map((h) => `${h.role === "user" ? "Customer" : "Ava"}: ${h.content}`).join("\n");
  const prompt = `${PERSONA}\n\nConversation so far:\n${convo}\n\nWrite Ava's next reply only — just the message text, no name prefix, no quotes.`;
  const r = await generateWebsite(prompt, 500);
  if (!r.ok) return "";
  return r.text.trim().replace(/^["']|["']$/g, "").replace(/^(ava|agent)\s*:\s*/i, "");
}

async function loadHistory(id: string | number): Promise<Turn[]> {
  const v = await kvGetJson<Turn[]>(histKey(id));
  return Array.isArray(v) ? v : [];
}
async function saveHistory(id: string | number, history: Turn[]): Promise<void> {
  await kvSetJson(histKey(id), history.slice(-12));
}

// Handle one Telegram webhook update.
export async function tgHandleUpdate(update: any): Promise<boolean> {
  const msg = update && (update.message || update.edited_message);
  if (!msg || !msg.chat) return false;
  const chatId = msg.chat.id;
  const owner = process.env.TELEGRAM_OWNER_CHAT;
  const from = msg.from || {};
  const who = `${from.first_name || ""} ${from.last_name || ""}`.trim() || from.username || `user ${chatId}`;
  const text = (msg.text || "").trim();

  // ---- Owner messaging the bot ----
  if (owner && String(chatId) === String(owner)) {
    const pay = text.match(/^\/pay\s+(\d{4,})\s+(\d+(?:\.\d+)?)(?:\s+(\d+(?:\.\d+)?))?(?:\s+(\d+))?(?:\s+(\d+(?:\.\d+)?))?(?:\s+([a-z0-9][a-z0-9-]+))?/i);
    if (pay) {
      const [, cid, b, mo, inst, dn, slug] = pay;
      const res = await createSiteCheckout({ name: "Client", build: Number(b) || 0, monthly: Number(mo) || 0, installments: Number(inst) || 1, downPayment: Number(dn) || 0, slug: slug || "" }, BUILDER_URL.replace(/\/websites$/, ""));
      const d = res.data as { message?: string; url?: string; error?: string };
      if (d.message || d.url) {
        await tgSend(cid, d.message || d.url || "");
        await kvSetJson(humanKey(cid), Date.now());
        await tgSend(owner, `✅ Payment options sent to client ${cid}.`);
      } else {
        await tgSend(owner, `⚠️ Couldn't create the payment link${d.error ? ": " + esc(d.error) : ""}.`);
      }
      return true;
    }
    const m = text.match(/^\/?r?\s*(\d{4,})\s+([\s\S]+)/);
    if (m) {
      const ok = await tgSend(m[1], esc(m[2]));
      await kvSetJson(humanKey(m[1]), Date.now());
      await tgSend(owner, ok ? `✅ Sent to ${m[1]} (AI paused 2h).` : `⚠️ Couldn't reach ${m[1]}.`);
    } else if (text === "/start") {
      await tgSend(owner, "✅ Owner console ready. Ava answers clients automatically. Jump in with <code>&lt;chat id&gt; message</code>.");
    } else if (text) {
      await tgSend(owner, "ℹ️ Reply to a client: <code>&lt;their chat id&gt; your message</code>. Your reply pauses the AI 2h for that chat.");
    }
    return true;
  }

  // ---- Client/visitor messaging the bot ----
  if (text === "/start") {
    await tgSend(chatId, `👋 Welcome to FrontDesk Agents! I'm Ava. Tell me about your business and what you'd like — or fill out this quick form and we'll build your website automatically:\n\n${BUILDER_URL}`);
    await tgNotifyOwner(`🆕 <b>${esc(who)}</b> started the bot.\nReply: <code>${chatId} your message</code>`);
    return true;
  }

  const history = await loadHistory(chatId);
  history.push({ role: "user", content: text || "(non-text message)" });

  const humanTs = Number((await kvGetJson<number>(humanKey(chatId))) || 0);
  if (humanTs && Date.now() - humanTs < HUMAN_PAUSE_MS) {
    await saveHistory(chatId, history);
    await tgNotifyOwner(`💬 <b>${esc(who)}</b> (<code>${chatId}</code>):\n${esc(text)}\n\nReply: <code>${chatId} ...</code>`);
    return true;
  }

  let reply = await aiReply(history);
  if (!reply) reply = "Thanks for reaching out! Tell me your business name and what you'd like for your website, and I'll get you a free sample. (Our team is also here if you'd prefer a person.)";
  const wantsLink = /\b(website|web ?site|site|page|price|pricing|cost|quote|sample|demo|get ?started|start|begin|build|made|design|sign ?up|interested|how much|order|yes|ready)\b/i.test(text);
  if (wantsLink && !/\/websites|\/s\//i.test(reply)) reply += `\n\n👉 Start here (2 minutes):\n${BUILDER_URL}`;
  history.push({ role: "assistant", content: reply });
  await saveHistory(chatId, history);
  await tgSend(chatId, esc(reply));
  await tgNotifyOwner(`🤖 <b>${esc(who)}</b> (<code>${chatId}</code>) — Ava handled:\n👤 ${esc(text)}\n💬 ${esc(reply)}\n\nTake over: <code>${chatId} your message</code>`);
  return true;
}
