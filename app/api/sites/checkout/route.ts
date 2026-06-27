import { NextRequest, NextResponse } from "next/server";
import { isOwner } from "@/lib/auth";
import { loadSecretOverrides } from "@/lib/secrets";
import { loadFactorySecrets } from "@/lib/site-store";

export const runtime = "nodejs";

// Owner-only: create a Stripe Checkout link for a website build (one-time or
// installment plan) and/or a monthly care plan. The site slug is embedded in
// metadata so /api/billing/webhook/site flips the site LIVE on payment. Ported
// from the factory's checkout.js (core path: Stripe + manual handles).
const money = (n: number) => "$" + (Math.round(n * 100) / 100).toLocaleString("en-US");

async function stripeKey(): Promise<string> {
  if (process.env.STRIPE_SECRET_KEY) return process.env.STRIPE_SECRET_KEY;
  return (await loadFactorySecrets()).STRIPE_SECRET_KEY || "";
}

export async function POST(req: NextRequest) {
  await loadSecretOverrides();
  if (!(await isOwner())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Record<string, any>;
  const name = String(body.name || "Client").slice(0, 120);
  const build = Math.max(0, Number(body.build) || 0);
  const monthly = Math.max(0, Number(body.monthly) || 0);
  const installments = Math.max(1, Math.min(36, Math.round(Number(body.installments) || 1)));
  const slug = String(body.slug || "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 60);
  if (!build && !monthly) return NextResponse.json({ error: "Provide a build price and/or a monthly amount." }, { status: 400 });

  const zelle = process.env.ZELLE_HANDLE || "";
  const cashapp = process.env.CASHAPP_CASHTAG || "";

  // Installment plan + minimum down payment policy.
  const minDownPct = Math.max(0, Math.min(100, Number(process.env.MIN_DOWN_PCT || 25)));
  const minDownUsd = Math.max(0, Number(process.env.MIN_DOWN_USD || 0));
  let downPayment = 0, remainder = 0, perInstall = 0, buildIsPlan = false;
  if (installments >= 2 && build > 0) {
    const minDown = Math.max(minDownUsd, Math.round((build * minDownPct) / 100));
    downPayment = Math.min(build, Math.max(Number(body.downPayment) || 0, minDown));
    remainder = Math.max(0, build - downPayment);
    if (remainder > 0) { buildIsPlan = true; perInstall = Math.ceil(remainder / installments); }
  }

  const manualLines: string[] = [];
  if (zelle) manualLines.push(`  – Zelle: ${zelle}`);
  if (cashapp) manualLines.push(`  – Cash App: ${cashapp}`);
  const manualBlock = manualLines.length ? `\n\nPrefer to pay directly?\n${manualLines.join("\n")}` : "";
  const opts: string[] = [];
  if (build > 0) opts.push(buildIsPlan ? `• Website build: ${money(build)} — ${money(downPayment)} down, then ${installments} × ~${money(perInstall)}/mo` : `• Website build: ${money(build)}`);
  if (monthly > 0) opts.push(`• Care plan: ${money(monthly)}/month`);

  const sk = await stripeKey();
  if (!sk) {
    if (manualLines.length) return NextResponse.json({ stripe: false, manual: { zelle, cashapp }, message: `Hi ${name}!\n\n${opts.join("\n")}${manualBlock}` });
    return NextResponse.json({ error: "No payment method configured. Set STRIPE_SECRET_KEY (and/or ZELLE_HANDLE / CASHAPP_CASHTAG)." }, { status: 500 });
  }

  const base = process.env.APP_URL || new URL(req.url).origin;
  const mode = monthly > 0 || buildIsPlan ? "subscription" : "payment";
  const p = new URLSearchParams();
  p.append("mode", mode);
  p.append("success_url", `${base}/builder?paid=1`);
  p.append("cancel_url", `${base}/builder?canceled=1`);
  p.append("client_reference_id", name);
  p.append("metadata[client]", name);
  p.append("metadata[monthly]", String(monthly));
  p.append("metadata[build]", String(build));
  if (slug) p.append("metadata[slug]", slug);
  p.append("allow_promotion_codes", "true");
  p.append("payment_method_options[card][installments][enabled]", "true");

  let i = 0;
  if (monthly > 0) {
    p.append(`line_items[${i}][price_data][currency]`, "usd");
    p.append(`line_items[${i}][price_data][product_data][name]`, `${name} — Care plan`);
    p.append(`line_items[${i}][price_data][unit_amount]`, String(Math.round(monthly * 100)));
    p.append(`line_items[${i}][price_data][recurring][interval]`, "month");
    p.append(`line_items[${i}][quantity]`, "1");
    i++;
  }
  if (build > 0) {
    if (buildIsPlan) {
      if (downPayment > 0) {
        p.append(`line_items[${i}][price_data][currency]`, "usd");
        p.append(`line_items[${i}][price_data][product_data][name]`, `${name} — Website build (down payment)`);
        p.append(`line_items[${i}][price_data][unit_amount]`, String(Math.round(downPayment * 100)));
        p.append(`line_items[${i}][quantity]`, "1");
        i++;
      }
      p.append(`line_items[${i}][price_data][currency]`, "usd");
      p.append(`line_items[${i}][price_data][product_data][name]`, `${name} — Build balance (${installments} monthly)`);
      p.append(`line_items[${i}][price_data][unit_amount]`, String(Math.round(perInstall * 100)));
      p.append(`line_items[${i}][price_data][recurring][interval]`, "month");
      p.append(`line_items[${i}][quantity]`, "1");
      i++;
    } else {
      p.append(`line_items[${i}][price_data][currency]`, "usd");
      p.append(`line_items[${i}][price_data][product_data][name]`, `${name} — Website build`);
      p.append(`line_items[${i}][price_data][unit_amount]`, String(Math.round(build * 100)));
      p.append(`line_items[${i}][quantity]`, "1");
      i++;
    }
  }
  if (mode === "subscription") {
    p.append("subscription_data[metadata][client]", name);
    if (slug) p.append("subscription_data[metadata][slug]", slug);
  }

  try {
    const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${sk}`, "content-type": "application/x-www-form-urlencoded" },
      body: p.toString(),
    });
    const data = await r.json();
    if (!r.ok) return NextResponse.json({ error: data?.error?.message || "Stripe error" }, { status: r.status });
    const message = `Hi ${name}! Here are your payment options:\n\n${opts.join("\n")}\n\nPay securely:\n${data.url}${manualBlock}`;
    return NextResponse.json({ url: data.url, id: data.id, stripe: true, isPlan: buildIsPlan, message });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Request failed" }, { status: 500 });
  }
}
