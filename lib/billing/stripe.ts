// Stripe wrapper. Lazy-instantiated so the module can be imported in env where
// STRIPE_SECRET_KEY isn't set (e.g. local dev or preview before secrets are wired).
import Stripe from "stripe";

let cached: Stripe | null = null;

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "Stripe is not configured. Set STRIPE_SECRET_KEY in your Vercel environment."
    );
  }
  // Omit apiVersion — Stripe pins the version this SDK was built against, which
  // avoids drift when the package is upgraded.
  cached = new Stripe(key);
  return cached;
}

export function appUrl(): string {
  // Order: explicit override → Vercel prod URL → current deployment URL.
  // The last fallback covers preview deployments (project-xxx.vercel.app).
  const candidate =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "frontdeskagents.com";
  const withScheme = /^https?:\/\//.test(candidate) ? candidate : `https://${candidate}`;
  return withScheme.replace(/\/$/, "");
}
