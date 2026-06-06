# FrontDesk Agents — Production Deployment Guide

> Last updated: June 5, 2026
> Version: 1.0.0

---

## Overview

FrontDesk Agents is a multi-tenant AI receptionist platform. This guide covers bringing a fresh install to live production with real payments, real phone numbers, and real customers.

**Architecture:** Next.js 15 (App Router) + Supabase (Postgres + Auth + RLS) + Stripe + Twilio/Bland AI + NVIDIA NIM.

---

## Step 1 — Supabase Project Setup

### 1a. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose the closest region to your customers
3. Save your **Project URL** and **API Keys** from Settings → API

### 1b. Run the database schema

Run `SUPABASE_SCHEMA.sql` in your Supabase SQL Editor:

```
https://supabase.com/dashboard/project/<your-project>/sql_editor
```

This creates all tables, RLS policies, indexes, and triggers in one pass. It supersedes all prior migration files.

### 1c. Enable Realtime (optional for production)

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE call_records;
ALTER PUBLICATION supabase_realtime ADD TABLE voicemails;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE sms_records;
```

---

## Step 2 — Environment Variables

Copy `.env.example` to `.env.local` and fill in every variable. The critical ones for production are marked **REQUIRED**.

### Owner Authentication (REQUIRED)

```bash
# Generate a secure salt:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Save the output, then set:

PASSWORD_SALT=<generated-salt>           # REQUIRED — keep secret, never commit
OWNER_PASSWORD_HASH=<bcrypt-hash>        # REQUIRED — generate below

# Generate the bcrypt hash (run locally with your desired password):
node -e "const b=require('bcryptjs'); console.log(b.hashSync('YOUR_PASSWORD' + process.env.PASSWORD_SALT, 12))"
# Set the output as OWNER_PASSWORD_HASH

OWNER_EMAIL=admin@yourbusiness.com       # REQUIRED — your admin login
OWNER_NAME="Your Name"                   # REQUIRED — displayed in owner dashboard
```

> ⚠️ **If PASSWORD_SALT or OWNER_PASSWORD_HASH is missing**, the owner login will fail silently (bcrypt.compare runs with empty strings). Both must be set before going live.

### Supabase (REQUIRED)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>   # Keep server-side only
```

### Stripe (REQUIRED for payments)

```bash
STRIPE_SECRET_KEY=sk_live_<your-key>       # Live key from stripe.com dashboard
STRIPE_WEBHOOK_SECRET=whsec_<your-secret>  # From stripe.com dashboard → Webhooks
NEXT_PUBLIC_APP_URL=https://yourdomain.com  # Your production URL
```

**Stripe webhook setup:**
1. Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://yourdomain.com/api/stripe/webhook`
3. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
4. Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

### Twilio (REQUIRED for phone/SMS)

```bash
TWILIO_ACCOUNT_SID=<your-account-sid>
TWILIO_AUTH_TOKEN=<your-auth-token>
TWILIO_PHONE_NUMBER=+1234567890           # E.164 format
```

### AI Providers (REQUIRED for AI features)

```bash
NVIDIA_NIM_API_KEY=<from ngc.nvidia.com/setup/api-key>
OPENAI_API_KEY=sk-<from platform.openai.com>
ANTHROPIC_API_KEY=<from console.anthropic.com>   # Optional — fallback provider
```

---

## Step 3 — Stripe Plans

The platform ships with 4 plans (defined in `src/lib/stripe.ts`):

| Plan | Price | Calls/month |
|---|---|---|
| Starter | $99/mo | 100 |
| Professional | $299/mo | 1,000 |
| Enterprise | $799/mo | Unlimited |
| Ultimate | $1,999/mo | Unlimited |

No Stripe product/subscription creation needed — the `createCheckoutSession()` function creates Stripe Checkout sessions programmatically with prices defined in code. To change prices, edit `src/lib/stripe.ts` → `PLANS`.

---

## Step 4 — Vercel Deployment

### 4a. Install Vercel CLI and connect

```bash
npm i -g vercel
vercel login
vercel link
```

### 4b. Add environment variables to Vercel

```bash
# Using Vercel dashboard: Settings → Environment Variables
# Add ALL variables from .env.local — mark "Production" and "Preview" and "Development"
```

Or via CLI:
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add STRIPE_SECRET_KEY
vercel env add PASSWORD_SALT
# ... add all vars
```

### 4c. Deploy

```bash
vercel --prod
```

Or connect via GitHub (Settings → Git → Deploy Hooks) for automatic deploys on `git push master`.

### GitHub Actions CI/CD

The CI workflow (`.github/workflows/ci.yml`) runs:
1. **On every PR**: `tsc --noEmit` + lint
2. **On PR merge to master**: Deploy to Vercel Preview
3. **On master push**: Deploy to Vercel Production

Required GitHub Secrets:
- `VERCEL_TOKEN` — from vercel.com → Settings → Tokens
- `VERCEL_ORG_ID` — from `vercel whoami --json` output
- `VERCEL_PROJECT_ID` — from `vercel projects ls`

---

## Step 5 — Rate Limiting in Production

The current rate limiter uses in-memory Maps. This works on single-instance deployments but **resets on every cold start** on Vercel serverless (each cold start = fresh 5-attempt auth limit).

### Recommended: Upstash Redis (free tier: 10k req/day)

```bash
npm install @upstash/redis
```

```ts
// Replace in-memory rateLimit with:
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Auth rate limit using Redis INCR with TTL
async function authRateLimit(ip: string) {
  const key = `auth:${ip}`
  const count = await redis.incr(key)
  if (count === 1) await redis.expire(key, 60) // 60 second window
  return { success: count <= 5, retryAfter: count > 5 ? 60 : undefined }
}
```

Set in Vercel environment variables:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Sign up at [upstash.com](https://upstash.com) (free tier is sufficient for most production loads).

---

## Step 6 — Owner Dashboard

Access the owner dashboard at `/owner/dashboard`. Owner credentials are set via the env vars in Step 2.

### Owner-only routes (auth-gated):
- `/api/owner/login` — Owner login
- `/api/owner/logout` — Owner logout
- `/api/owner/billing` — All billing records
- `/api/owner/session` — Session check
- `/api/ai/decisions` — AI decision engine
- `/api/ai/self-healing` — Self-healing monitor
- `/api/ai/model-routing` — Model comparison lab
- `/api/legal/documents` — Legal documents
- `/api/legal/court-analysis` — Court analysis
- `/api/legal/case-law` — Case law search
- `/api/legal/judge-analysis` — Judge analysis
- `/api/marketing/legal-images?action=balance` — MuAPI credit balance
- `/api/analytics/vertical-outcomes` — Analytics

---

## Step 7 — Customer Onboarding

1. Customer visits `/customer/login` or `/customer/signup`
2. Signs up with email + password → Supabase Auth creates account
3. Customer record created in `customers` table (via `supabaseAdmin`)
4. Customer starts on **Starter plan / Trial status**
5. Customer visits `/customer/dashboard` to upgrade via Stripe Checkout

---

## Monitoring & Alerts

### Health check
```bash
GET /api/health
```

Returns which services are configured (presence/absence of env vars).

### AI Decision Engine alerts
`GET /api/ai/decisions?action=self-healing` — Returns self-healing system status and any active alerts.

### Billing alerts
Stripe webhook handles all billing events automatically. Monitor `billing_history` table for failed payments.

---

## Security Checklist

- [ ] `PASSWORD_SALT` generated and set (32+ random hex chars)
- [ ] `OWNER_PASSWORD_HASH` generated with bcrypt (12 rounds)
- [ ] `OWNER_EMAIL` set to a secure email address
- [ ] `STRIPE_WEBHOOK_SECRET` configured (not the test key)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` never exposed to client
- [ ] All API routes use appropriate auth (owner vs customer)
- [ ] RLS enabled on all Supabase tables (verified in schema)
- [ ] HTTPS enforced on all production traffic
- [ ] Rate limiting in production using Redis (not in-memory)
- [ ] `NEXT_PUBLIC_APP_URL` set to production domain

---

## Troubleshooting

### "Login fails even with correct password"
→ Check `PASSWORD_SALT` and `OWNER_PASSWORD_HASH` are both set in production env
→ Verify the hash was generated with: `bcrypt.hash(password + salt, 12)`
→ Check browser DevTools → Network → Response for specific error

### "Stripe webhooks not firing"
→ Verify webhook URL is `https://yourdomain.com/api/stripe/webhook` (not localhost)
→ Check Stripe Dashboard → Developers → Webhooks → Delivery logs
→ Ensure `STRIPE_WEBHOOK_SECRET` matches exactly (copy-paste from Stripe)

### "Supabase connection errors"
→ Verify `NEXT_PUBLIC_SUPABASE_URL` is set to `https://<project>.supabase.co`
→ Check Supabase Dashboard → Settings → API → Database connection string
→ Ensure `SUPABASE_SERVICE_ROLE_KEY` is the correct key (not the anon key)

### "Rate limiting not working (5 fresh attempts per request)"
→ This is expected on Vercel serverless (in-memory resets on cold start)
→ Migrate to Upstash Redis per Step 5