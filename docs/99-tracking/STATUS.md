# STATUS

## Project
Virtual Try-On for Salla

## Current Phase
Phase 0 - Project Setup & Infrastructure

## Current Task
Phase 0 workspace scaffold and bootstrap implementation.

## Overall Status
Phase 0 has started and the repository is now scaffolded as a monorepo.
Governance files were verified before implementation.
The locked stack, hybrid architecture, and approved phase order were confirmed against `AGENTS.md` and `docs/`.
Core scaffolds now build successfully.

## Done
- Verified governance entrypoints:
  - `AGENTS.md`
  - `docs/00-governance/*`
  - `docs/01-product/*`
  - `docs/02-architecture/*`
  - `docs/03-delivery/*`
  - `docs/99-tracking/*`
- Confirmed locked stack:
  - React 19 + Vite + shadcn/ui + Tailwind CSS 4
  - Node.js 20 + Express 5
  - Supabase direct client
  - Replicate
  - Bunny.net
  - Vanilla JS widget
  - Zustand
  - Zod
  - Sharp
- Confirmed canonical architecture:
  - Salla embedded dashboard
  - backend orchestration layer
  - storefront widget
  - async AI job model
  - `merchant_id` / `salla_merchant_id` as tenant identity
- Confirmed phase order from Phase 0 through Phase 9
- Converted the repository into a workspace monorepo
- Added root workspace config in `package.json` and `pnpm-workspace.yaml`
- Added shared `.env.example`
- Moved the existing Vite app into `apps/dashboard`
- Bootstrapped `apps/api` with:
  - Express 5 shell
  - env loader
  - middleware stack
  - rate-limit scaffold
  - `/health` endpoint
  - Supabase and Replicate client scaffolds
- Bootstrapped `apps/dashboard` with:
  - React 19 + Vite
  - Tailwind CSS 4
  - shadcn/ui-ready `components.json`
  - React Router shell
  - Zustand store shell
  - API proxy config
  - infrastructure readiness snapshot wired to `/health`
- Bootstrapped `apps/widget` with:
  - Vanilla JS IIFE build scaffold
  - placeholder UI/api modules
- Added `packages/shared-types`
- Added `supabase/migrations/`
- Added `supabase/config.toml` and root Supabase helper scripts
- Added a placeholder Phase 0 migration file to keep migration tooling wired without starting Phase 2 schema work
- Verified:
  - `pnpm lint`
  - `pnpm build`
  - `GET /health`

## In Progress
- Phase 0 external infrastructure remains blocked on real service credentials and real project provisioning

## Next Recommended Task
Finish the remaining external-infra part of Phase 0:

- connect a real Supabase project
- set actual environment values from `.env.example`
- verify migration tooling against the real environment
- confirm local dev startup with real service credentials

After that, begin Phase 1.1:
- Salla embedded auth wrapper
- `POST /api/auth/verify`
- session bootstrap

## Blockers
- Real Salla app credentials are not configured
- Real Supabase project is not connected
- Real Bunny storage/CDN credentials are not configured
- Real Replicate token is not configured
- No production secrets have been set yet

## Canonical Implementation Direction
- Keep the hybrid architecture
- Keep `merchant_id` as tenant identity
- Keep API trust rooted in Salla embedded auth
- Keep AI processing asynchronous
- Keep the widget as a lightweight IIFE bundle
- Keep stack and phase order unchanged

## Notes
- `GET /api/auth/me` remains the canonical self endpoint for later phases
- `GET /health` is now live as the Phase 0 API health route
- `GET /health` now reports config readiness for Salla, Supabase, Replicate, Bunny, and app secrets
- Supabase CLI is not installed globally; root helper scripts now use `pnpm dlx supabase`
- `DECISIONS_LOG.md` was intentionally not updated because no approved decision changed
