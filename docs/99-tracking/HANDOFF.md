# HANDOFF

## Project
Virtual Try-On for Salla

## Current State
The repository is in active Phase 1 work with the dashboard architecture now switched to external React hosting.
The current auth model is external Salla OAuth callback plus a short-lived local dashboard session, not embedded auth and not JWT.
Webhook verification, event processing, and Salla merchant API service scaffolding still exist and remain compatible with the new direction.

## Latest Completed Work
- Verified `AGENTS.md` and all files under `docs/` before coding
- Confirmed the locked stack, canonical hybrid architecture, and approved phase order
- Recorded the new auth decision: no local JWT session, direct Salla token auth only
- Added workspace monorepo wiring at the repository root
- Added `.env.example`
- Moved the Vite frontend scaffold into `apps/dashboard`
- Bootstrapped `apps/api`, `apps/dashboard`, `apps/widget`, `packages/shared-types`, and `supabase/`
- Added `supabase/config.toml` and root Supabase helper scripts
- Replaced the embedded auth direction with external dashboard auth:
  - `GET /api/auth/salla/start` creates the Salla OAuth authorization redirect
  - `GET /api/auth/salla/callback` exchanges the code and stores merchant tokens
  - `POST /api/auth/verify` consumes a one-time handoff token and creates the dashboard session cookie
  - `GET /api/auth/me` now reads the dashboard session cookie
  - frontend now uses a login screen plus `/auth/callback` instead of embedded SDK bootstrap
- Added Phase 1 webhook backend:
  - `POST /webhooks/salla`
  - HMAC verification using `X-Salla-Signature`
  - idempotency storage via `webhook_events`
  - handlers for app install, authorize, uninstall, subscriptions, trials, and settings sync
- Added merchant persistence layer:
  - merchant ensure/find by `salla_merchant_id`
  - credits upsert for install/subscription/trial flows
  - AES-256-GCM token storage helpers
- Added Salla admin API service:
  - merchant token decryption
  - refresh flow with per-merchant lock
  - product list/detail helper methods
- Added the first actual Supabase schema migration in-repo:
  - `supabase/migrations/20260404181500_initial_schema.sql`
  - core tables, indexes, triggers, and credit helper functions
- Fixed workspace env loading:
  - API loads the root `.env`
  - dashboard Vite reads env from the workspace root
- Updated `AGENTS.md` to reflect external dashboard auth as the new repository-level direction
- Verified:
  - `pnpm lint`
  - `pnpm build`
  - invalid `POST /webhooks/salla` returned `401`
  - OAuth authorization URL generation succeeds with the configured public callback base

## Canonical Direction
- Dashboard: React 19 + Vite + shadcn/ui + Tailwind CSS 4
- API: Node.js 20 + Express 5
- Database access: direct Supabase JS client, no ORM
- AI: Replicate
- Storage/CDN: Bunny.net
- Widget: Vanilla JS IIFE
- Tenant identity: `merchant_id` / `salla_merchant_id`
- Job model: async only
- Auth model: external Salla OAuth callback + short-lived local dashboard session, no embedded auth, no JWT

## Important Decisions
- No stack changes were introduced
- Architecture changed by direct user instruction from embedded dashboard auth to external dashboard auth
- No tenant identity changes were introduced
- `DECISIONS_LOG.md` was updated because the dashboard/auth model changed by direct user instruction

## Suggested Immediate Next Task
Finish live verification of the external OAuth runtime path:

1. apply `supabase/migrations/20260404181500_initial_schema.sql` to the active Supabase project
2. restart `pnpm dev:api` so the running process reloads the updated `.env`
3. restart `pnpm dev:dashboard`
4. trigger `/api/auth/salla/start` from the dashboard login screen
5. complete the Salla OAuth approval flow and confirm the redirect lands on `/auth/callback?handoff=...`
6. confirm `/api/auth/me` returns the merchant session afterward
7. then verify the Salla admin service by fetching merchant products

## Open Blockers
- The current local API watch process still has stale env values loaded until it is restarted
- A real OAuth callback cycle from Salla is still needed to verify the new handoff/session path
- The active Supabase project does not yet have the app schema applied
- The configured `DATABASE_URL` could not be used from this environment to apply SQL automatically because direct PostgreSQL connectivity is not reachable here
- Salla docs note that Custom Mode is for testing use cases and Easy Mode is the only allowed mode for published App Store apps; this decision may need product review before publication
- Supabase local tooling may require Docker if local services are started

## Run Guidance for the Next Session
Before coding:
1. read `AGENTS.md`
2. read all docs under `docs/`
3. check `docs/99-tracking/STATUS.md`
4. check `docs/99-tracking/DECISIONS_LOG.md`
5. continue from the immediate next task above

Useful commands:
- `pnpm install`
- `pnpm dev:api`
- `pnpm dev:dashboard`
- `pnpm dev:widget`
- `pnpm build`
- `pnpm lint`
- `curl http://localhost:3001/health`
- `curl -X POST http://localhost:3001/webhooks/salla -H "Content-Type: application/json" -H "X-Salla-Signature: invalid" -d "{}"`
- open `http://localhost:5173` and start Salla login from the dashboard itself

## Safety Notes
Do not:
- reintroduce embedded auth unless the user requests it
- reintroduce local JWT auth unless the user requests it
- invent a new architecture
- change the locked stack
- use email as tenant identity
- process AI jobs synchronously
- skip webhook verification
- skip idempotency
- skip atomic credit rules in later phases
