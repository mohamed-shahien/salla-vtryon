# HANDOFF

## Project
Virtual Try-On for Salla

## Current State
The repository has moved from governance-only mode into a working Phase 0 scaffold.
The codebase is now organized as a workspace monorepo with dedicated shells for the API, dashboard, widget, shared types, and Supabase migrations.
No feature implementation beyond Phase 0 has started.

## Latest Completed Work
- Verified `AGENTS.md` and all files under `docs/` before coding
- Confirmed the locked stack, canonical hybrid architecture, and approved phase order
- Added workspace monorepo wiring at the repository root
- Added `.env.example`
- Moved the Vite frontend scaffold into `apps/dashboard`
- Bootstrapped `apps/api` with:
  - Express 5 app shell
  - env loader
  - security/logging middleware
  - rate-limit scaffold
  - `/health` endpoint
  - placeholder Supabase and Replicate clients
- Bootstrapped `apps/dashboard` with:
  - React 19
  - Tailwind CSS 4
  - shadcn/ui-ready config
  - React Router shell
  - Zustand shell store
  - readiness snapshot fed from `/health`
- Bootstrapped `apps/widget` with a vanilla JS IIFE build scaffold
- Added `packages/shared-types`
- Added `supabase/migrations/`
- Added `supabase/config.toml`
- Added root Supabase helper scripts via `pnpm dlx supabase`
- Verified:
  - `pnpm lint`
  - `pnpm build`
  - API health response from `GET /health`

## Canonical Direction
- Dashboard: React 19 + Vite + shadcn/ui + Tailwind CSS 4
- API: Node.js 20 + Express 5
- Database access: direct Supabase JS client, no ORM
- AI: Replicate
- Storage/CDN: Bunny.net
- Widget: Vanilla JS IIFE
- Tenant identity: `merchant_id` / `salla_merchant_id`
- Job model: async only
- Billing model: Salla subscriptions + platform credits

## Important Decisions
- No stack changes were introduced
- No architecture changes were introduced
- No tenant identity changes were introduced
- `DECISIONS_LOG.md` stays unchanged because implementation followed existing decisions only

## Suggested Immediate Next Task
Complete the remaining infra-dependent part of Phase 0:

1. connect a real Supabase project
2. set actual values from `.env.example`
3. verify migration tooling and environment loading against the real project
4. confirm local startup with real external credentials

Only after that, start Phase 1:

1. Salla embedded SDK wrapper
2. `POST /api/auth/verify`
3. session bootstrap
4. webhook signature verification and idempotent handlers

## Open Blockers
- Real Salla credentials are missing
- Real Supabase connection details are missing
- Real Bunny credentials are missing
- Real Replicate token is missing
- Supabase local tooling may also require Docker when the next session runs the CLI

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

## Safety Notes
Do not:
- start feature work beyond the current approved phase
- invent a new architecture
- change the locked stack
- use email as tenant identity
- process AI jobs synchronously
- skip webhook verification
- skip idempotency
- skip atomic credit rules in later phases
