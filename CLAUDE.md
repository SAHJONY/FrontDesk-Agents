# FrontDesk Agents — agent coordination rules

Two AI sessions work on this repo (a Mac session and a server session), both
pushing to the `platform` branch. Follow these rules to avoid collisions:

1. **Always `git fetch origin platform` and rebase before pushing.** If the
   push is rejected, fetch again and rebase — never force-push except for
   explicit history rewrites agreed with the owner.
2. **Commit author must be `NEXTLEVEL-RE <204511455+NEXTLEVEL-RE@users.noreply.github.com>`**
   (repo-local git config already set). Vercel's Hobby plan BLOCKS deployments
   whose commit author isn't the connected GitHub user.
3. **Git-webhook deploys get BLOCKED anyway** — after pushing, trigger
   production explicitly:
   `POST https://api.vercel.com/v13/deployments?teamId=team_Me3fB0D0J6He10CgJlJ44Xaq`
   with `gitSource {type: github, org: SAHJONY, repo: FrontDesk-Agents, ref: platform}`
   (project `prj_d2uyjufHD9WfISsZf3UN9W` is wrong; correct id: `prj_d2uyjufHD9WfISsZf3YrmuBKOAhT`).
4. **Production = www.frontdeskagents.com** (project-y8vxc, Vercel account
   sahjonyllc-1808). The account-1 deployment (frontdesk-agents-kappa) is a
   non-canonical mirror.
5. **Bland.ai gotchas** (hard-won): number prompts can be silently overridden
   by attached Personas (check `persona_id` on call records) and Memories
   (`memory_id` on number config) — the sync route strips memories. Language
   `auto` = EN/ES only; we use `babel`. `first_sentence` overrides script
   openings — always push it on sync.
6. **Blob reads lag writes ~30–60s** (CDN propagation) — not data loss.
7. **Never commit `backups/` or `.env*`** — GitHub push protection blocks
   Twilio-pattern IDs in the persona backups.
8. **Don't claim HIPAA/SOC2 anywhere** — scripts intentionally refuse.

## Layout pointers
- `lib/receptionist.ts` — HERMES cascade + deterministic core (EN/ES booking
  state machine; other languages: LLM-run booking via `[BOOKING_JSON]` token).
- `lib/bland*.ts` — voice layer; `CALL_ENGINE` keeps inbound/outbound identical.
- `lib/translate.ts` + `components/LanguageProvider.tsx` — whole-site i18n.
- `lib/email.ts` — Resend transactional email (owner alerts live; customer
  email pending DNS verification of frontdeskagents.com in Resend).
- `lib/customer-auth.ts` + `/portal` — customer self-service accounts.
- `ops/` — uptime watchdog (launchd on the Mac; GitHub Actions version staged
  in `ops/github-workflows/`, needs a workflow-scoped token to activate).
