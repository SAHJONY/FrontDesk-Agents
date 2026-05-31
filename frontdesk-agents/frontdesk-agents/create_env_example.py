import os

# ─── Paths ──────────────────────────────────────────
canonical = r'C:\Users\juani\frontdesk-agents\frontdesk-agents'
gitignore_path = r'C:\Users\juani\frontdesk-agents\.gitignore'

# ─── .env.example content ───────────────────────────
env_example = r"""# =============================================================================
# FRONTDESK AGENTS — Environment Variables
# =============================================================================
# Copy this file to .env.local for local development:
#   cp .env.example .env.local
#
# For production, set these in your hosting provider (Vercel, etc.)
# =============================================================================

# ── Application ────────────────────────────────────

NEXT_PUBLIC_APP_URL="http://localhost:3000"
# REQUIRED. The public URL of your application.
# Local: http://localhost:3000
# Production: https://yourdomain.com

NEXT_PUBLIC_GA_ID=""
# OPTIONAL. Google Analytics 4 measurement ID (e.g., G-XXXXXXXXXX).
# Leave empty to disable analytics.

# ── Supabase ───────────────────────────────────────

NEXT_PUBLIC_SUPABASE_URL=""
# REQUIRED. Your Supabase project URL.
# Found in: Supabase Dashboard > Settings > API > Project URL
# Format: https://xxxxxxxxxxxx.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=""
# REQUIRED. Supabase anonymous/public API key.
# Found in: Supabase Dashboard > Settings > API > anon/public
# This is safe for client-side use.

SUPABASE_SERVICE_ROLE_KEY=""
# REQUIRED for admin operations. Supabase service_role key.
# Found in: Supabase Dashboard > Settings > API > service_role (secret)
# WARNING: Never expose this to the client. Server-side only.
# Used for: admin database queries, webhook handlers, report generation.

# ── Stripe ─────────────────────────────────────────

STRIPE_SECRET_KEY=""
# REQUIRED for payments. Stripe secret API key.
# Found in: Stripe Dashboard > Developers > API Keys
# Test: sk_test_... | Live: sk_live_...

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
# REQUIRED for payments. Stripe publishable API key.
# Found in: Stripe Dashboard > Developers > API Keys
# Test: pk_test_... | Live: pk_live_...

STRIPE_WEBHOOK_SECRET=""
# REQUIRED for webhooks. Stripe webhook signing secret (whsec_...).
# Found in: Stripe Dashboard > Developers > Webhooks > Endpoint > Signing secret
# Used to verify that webhook requests genuinely come from Stripe.

# ── Square ─────────────────────────────────────────

SQUARE_ACCESS_TOKEN=""
# REQUIRED for Square payments. Square OAuth access token.
# Found in: Square Developer Dashboard > Applications > OAuth
# Note: This is the personal access token or OAuth token.

SQUARE_ENVIRONMENT="sandbox"
# REQUIRED. Square API environment.
# Options: sandbox | production
# Use 'sandbox' for testing, 'production' for live transactions.

SQUARE_WEBHOOK_SIGNATURE_KEY=""
# REQUIRED for Square webhooks. Square webhook signature key.
# Found in: Square Developer Dashboard > Applications > Webhooks > Signature key
# Used to verify webhook requests from Square.

SQUARE_WEBHOOK_URL=""
# OPTIONAL. Square webhook notification URL.
# This is set in Square Developer Dashboard > Webhooks, not typically an env var.

# ── Twilio ─────────────────────────────────────────

TWILIO_ACCOUNT_SID=""
# REQUIRED for phone/SMS. Twilio Account SID.
# Found in: Twilio Console > Account > Account Info

TWILIO_AUTH_TOKEN=""
# REQUIRED for phone/SMS. Twilio Auth Token.
# Found in: Twilio Console > Account > Account Info
# WARNING: Keep secret. Never expose to the client.

TWILIO_PHONE_NUMBER=""
# REQUIRED for phone/SMS. Twilio phone number in E.164 format.
# Format: +1XXXXXXXXXX (e.g., +15551234567)
# Found in: Twilio Console > Phone Numbers > Manage

# ── Bland AI ───────────────────────────────────────

BLANDAI_API_KEY=""
# REQUIRED for AI phone calls. Bland AI API key.
# Found in: Bland AI Dashboard > API Keys

BLANDAI_CALLER_ID=""
# OPTIONAL. Bland AI caller ID / phone number for outbound calls.
# Format: +1XXXXXXXXXX

BLANDAI_SALES_PHONE_NUMBER=""
# OPTIONAL. Bland AI sales/prospecting phone number.
# Used for automated outbound sales calls.

# ── LiveKit ────────────────────────────────────────

LIVEKIT_API_KEY=""
# REQUIRED for real-time voice/video. LiveKit API key.
# Found in: LiveKit Cloud Dashboard > Settings > Keys

LIVEKIT_API_SECRET=""
# REQUIRED for real-time voice/video. LiveKit API secret.
# Found in: LiveKit Cloud Dashboard > Settings > Keys
# Used to generate LiveKit access tokens.

LIVEKIT_WS_URL="wss://your-project.livekit.cloud"
# REQUIRED for real-time voice/video. LiveKit WebSocket URL.
# Found in: LiveKit Cloud Dashboard > Settings > Project > WebSocket URL
# Format: wss://xxxxxxxxxxxx.livekit.cloud

# ── AI Services ────────────────────────────────────

OPENAI_API_KEY=""
# REQUIRED for AI features. OpenAI API key.
# Found in: platform.openai.com > API Keys
# Used for: GPT-powered conversations, AI analysis, legal search, vision.

NVIDIA_NIM_API_KEY=""
# OPTIONAL. NVIDIA NIM API key for specialized AI models.
# Used as fallback for certain AI operations.

# ── Owner Dashboard ────────────────────────────────

OWNER_EMAIL="admin@yourbusiness.com"
# REQUIRED for owner dashboard access. Owner/admin login email.

OWNER_PASSWORD=""
# REQUIRED for owner dashboard access. Owner/admin login password.
# WARNING: In production, set a strong, unique password.
# This is used for the platform owner/super-admin login page.

OWNER_PASSWORD_HASH=""
# OPTIONAL. Pre-computed hash of the owner password.
# Used for password verification if direct password comparison isn't desired.

PASSWORD_SALT="change-this-to-a-random-secret-string"
# OPTIONAL. Salt used for password hashing operations.
# Should be a long, random string. Change from the default in production.
# Default in code: 'default_salt' (change for production security).

# ── Vercel (Auto-Injected) ────────────────────────

VERCEL_OIDC_TOKEN=""
# Vercel-injected OIDC token for Vercel-specific operations.
# Automatically set by Vercel during deployments. Do not set manually.

# ── Development Only ───────────────────────────────

NODE_ENV="development"
# Automatically set by Next.js. Options: development | production | test
# Controls behavior such as hot reloading, error overlay, and production optimizations.

# ═══════════════════════════════════════════════════════════════════════
# DEPLOYMENT CHEATSHEET
# ═══════════════════════════════════════════════════════════════════════
#
# Step 1: Set up Supabase
#   - Create project at https://supabase.com
#   - Get URL + anon key + service_role key
#   - Run migrations: supabase db push
#
# Step 2: Configure payments
#   - Stripe: Get keys from Stripe Dashboard
#   - Square (optional): Get keys from Square Developer Dashboard
#
# Step 3: Set up phone services
#   - Twilio: Buy a phone number, get Account SID + Auth Token
#   - Bland AI (optional): Get API key for AI phone agent
#
# Step 4: Set up LiveKit for real-time voice
#   - Create project at https://livekit.io or self-host
#   - Get keys and WebSocket URL
#
# Step 5: Set owner credentials
#   - Choose a strong email/password for the admin dashboard
#   - Set OWNER_EMAIL and OWNER_PASSWORD in production
#
# Step 6: Deploy to Vercel
#   - Connect your Git repository
#   - Add ALL env vars in Vercel Dashboard > Project Settings > Environment Variables
#   - Deploy
# ═══════════════════════════════════════════════════════════════════════
"""

# ─── Write .env.example ─────────────────────────────
env_example_path = os.path.join(canonical, '.env.example')
with open(env_example_path, 'w', encoding='utf-8') as f:
    f.write(env_example)
print(f'Created: {env_example_path} ({os.path.getsize(env_example_path)} bytes)')

# ─── Fix .gitignore to track .env.example ──────────
with open(gitignore_path, 'r', encoding='utf-8') as f:
    gitignore_content = f.read()

# Check if !.env.example is already there
if '!.env.example' not in gitignore_content:
    # Find the .env* line and add an exception after it
    if '.env*' in gitignore_content:
        gitignore_content = gitignore_content.replace('.env*', '.env*\n!.env.example')
        with open(gitignore_path, 'w', encoding='utf-8') as f:
            f.write(gitignore_content)
        print(f'Updated: {gitignore_path} (added !.env.example exception)')
    else:
        print('WARNING: .env* pattern not found in .gitignore')
else:
    print('!.env.example already in .gitignore')

# ─── Verify ─────────────────────────────────────────
print(f'\n=== Verification ===')
with open(env_example_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()
print(f'.env.example: {len(lines)} lines')

# Count env vars
var_count = sum(1 for line in lines if '="' in line and not line.strip().startswith('#') and 'process' not in line)
print(f'Environment variables documented: {var_count}')

with open(gitignore_path, 'r', encoding='utf-8') as f:
    content = f.read()
has_exception = '!.env.example' in content
print(f'.gitignore has !.env.example exception: {has_exception}')

print('\nOK')
