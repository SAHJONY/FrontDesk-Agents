// Shared website-checkout logic (used by /api/sites/checkout and the Telegram
// /pay command). Creates a Stripe Checkout link for a build (one-time or
// installment plan) and/or monthly care plan; the site slug rides in metadata so
// the site webhook flips it live on payment.
import { loadFactorySecrets } from "@/lib/site-store";

const money = (n: number) => "$" + (Math.round(n * 100) / 100).toLocaleString("en-US");

async function stripeKey(): Promise<string> {
  if (process.env.STRIPE_SECRET_KEY) return process.env.STRIPE_SECRET_KEY;
  return (await loadFactorySecrets()).STRIPE_SECRET_KEY || "";
}

export type CheckoutInput = { name?: string; build?: number; monthly?: number; installments?: number; downPayment?: number; slug?: string };
export type CheckoutResult = { status: number; data: Record<string, unknown> };

export async function createSiteCheckout(input: CheckoutInput, origin: string): Promise<CheckoutResult> {
  const name = String(input.name || "Client").slice(0, 120);
  const build = Math.max(0, Number(input.build) || 0);
  const monthly = Math.max(0, Number(input.monthly) || 0);
  const installments = Math.max(1, Math.min(36, Math.round(Number(input.installments) || 1)));
  const slug = String(input.slug || "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 60);
  if (!build && !monthly) return { status: 400, data: { error: "Provide a build price and/or a monthly amount." } };

  const zelle = process.env.ZELLE_HANDLE || "";
  const cashapp = process.env.CASHAPP_CASHTAG || "";
  const minDownPct = Math.max(0, Math.min(100, Number(process.env.MIN_DOWN_PCT || 25)));
  const minDownUsd = Math.max(0, Number(process.env.MIN_DOWN_USD || 0));
  let downPayment = 0, remainder = 0, perInstall = 0, buildIsPlan = false;
  if (installments >= 2 && build > 0) {
    const minDown = Math.max(minDownUsd, Math.round((build * minDownPct) / 100));
    downPayment = Math.min(build, Math.max(Number(input.downPayment) || 0, minDown));
    remainder = Math.max(0, build - downPayment);
    if (remainder > 0) { buildIsPlan = true; perInstall = Math.ceil(remainder / installments); }
  }

  // Cash App + Zelle are the PRIMARY rails to start the business (no Stripe
  // needed). Set PAYMENTS_PRIMARY=stripe to lead with card instead.
  const manualPrimary = (process.env.PAYMENTS_PRIMARY || "manual").toLowerCase() !== "stripe";
  const manualLines: string[] = [];
  if (cashapp) manualLines.push(`  – Cash App: ${cashapp}`);
  if (zelle) manualLines.push(`  – Zelle: ${zelle}`);
  const manualBlock = manualLines.length ? `\n\n💵 Pay by Cash App or Zelle:\n${manualLines.join("\n")}` : "";
  const opts: string[] = [];
  if (build > 0) opts.push(buildIsPlan ? `• Website build: ${money(build)} — ${money(downPayment)} down, then ${installments} × ~${money(perInstall)}/mo` : `• Website build: ${money(build)}`);
  if (monthly > 0) opts.push(`• Care plan: ${money(monthly)}/month`);

  const sk = await stripeKey();
  if (!sk) {
    if (manualLines.length) return { status: 200, data: { stripe: false, manual: { zelle, cashapp }, message: `Hi ${name}!\n\n${opts.join("\n")}${manualBlock}` } };
    return { status: 500, data: { error: "No payment method configured. Set STRIPE_SECRET_KEY (and/or ZELLE_HANDLE / CASHAPP_CASHTAG)." } };
  }

  const base = process.env.APP_URL || origin;
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
    if (!r.ok) return { status: r.status, data: { error: data?.error?.message || "Stripe error" } };
    const cardBlock = `\n\nOr pay by card / installments:\n${data.url}`;
    const message = manualPrimary && manualLines.length
      ? `Hi ${name}! Here are your payment options:\n\n${opts.join("\n")}${manualBlock}${cardBlock}`
      : `Hi ${name}! Here are your payment options:\n\n${opts.join("\n")}\n\nPay securely:\n${data.url}${manualBlock}`;
    return { status: 200, data: { url: data.url, id: data.id, stripe: true, isPlan: buildIsPlan, message } };
  } catch (e) {
    return { status: 500, data: { error: e instanceof Error ? e.message : "Request failed" } };
  }
}
