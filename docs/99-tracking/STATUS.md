# STATUS

## Project
Virtual Try-On for Salla

## Current Phase
Phase 1 - Salla Integration

## Current Task
Realign Phase 1 around an external React dashboard with Salla OAuth callback auth instead of embedded auth.

## Overall Status
Phase 0 scaffold is complete enough to support concrete Phase 1 integrations.
Governance files were verified before implementation.
The locked stack, hybrid architecture, and approved phase order were confirmed against `AGENTS.md` and `docs/`.
External dashboard auth is now the canonical direction by direct user override.
Phase 1 now includes real backend integration points for Salla webhooks, merchant-side API access, and an external OAuth callback flow.

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
- Bootstrapped `apps/api`, `apps/dashboard`, `apps/widget`, `packages/shared-types`, and `supabase/`
- Added `supabase/config.toml` and root Supabase helper scripts
- Replaced embedded auth with external OAuth assumptions:
  - `GET /api/auth/salla/start`
  - `GET /api/auth/salla/callback`
  - `POST /api/auth/verify` now completes an OAuth handoff into a local dashboard session
  - `GET /api/auth/me` now reads the local dashboard session cookie
  - frontend auth gate now shows an external sign-in flow instead of waiting for embedded SDK auth
  - frontend callback route now finalizes auth from a `handoff` query parameter
- Added merchant persistence helpers backed by Supabase:
  - merchant ensure/find helpers keyed by `salla_merchant_id`
  - plan and credits upsert helpers
  - encrypted token storage helpers
- Added backend webhook integration:
  - `POST /webhooks/salla`
  - raw-body signature verification against `X-Salla-Signature`
  - idempotency reserve/mark flow in `webhook_events`
  - handlers for install, authorize, uninstall, subscription, trial, and settings events
- Added Salla admin API service bootstrap:
  - access token decryption
  - refresh-token lock to avoid duplicate refresh races
  - product list/detail helpers
- Added the first real schema migration in-repo:
  - `supabase/migrations/20260404181500_initial_schema.sql`
  - creates `merchants`, `credits`, `tryon_jobs`, `webhook_events`, and `credit_transactions`
  - creates `update_updated_at`, `deduct_credit`, and `refund_credit`
- Fixed workspace env loading:
  - API now loads the root `.env`
  - dashboard Vite config now uses the workspace root as `envDir`
- Updated `AGENTS.md` so the repository’s highest-precedence local instruction now reflects the external dashboard decision
- Verified:
  - `pnpm lint`
  - `pnpm build`
  - OAuth authorization URL generation using the configured public callback URL
  - invalid `POST /webhooks/salla` request is rejected with `401`

## In Progress
- Runtime verification still depends on a real Salla OAuth round-trip through the public callback URL
- The currently running local API process must be restarted so it reloads the updated `.env` values and auth flow
- The current Supabase project does not yet have the app schema applied, so auth currently stops at the first merchant lookup

## Next Recommended Task
Finish the runtime validation of the external OAuth path, then move into Phase 2:

- apply `supabase/migrations/20260404181500_initial_schema.sql` to the active Supabase project
- restart `pnpm dev:api` and `pnpm dev:dashboard`
- trigger `GET /api/auth/salla/start` from the local dashboard
- complete the Salla OAuth approval flow so the backend callback stores merchant tokens and redirects back to `localhost`
- verify `GET /api/auth/me` and then verify merchant product access end-to-end using the new Salla API service
- then start Phase 2 with `/api/products`, `/api/credits`, and migration alignment in-repo

## Blockers
- A real Salla OAuth callback round-trip is still needed to verify the new external dashboard session flow end-to-end
- The current local API watch process still has stale environment values loaded until it is restarted
- The active Supabase project is missing the application schema, which currently causes `MERCHANT_LOOKUP_FAILED`
- The `DATABASE_URL` currently configured is not reachable from this environment over direct PostgreSQL, so the schema could not be applied automatically from the agent
- Salla docs state Custom Mode is for testing and Easy Mode is the only allowed mode for published App Store apps, so publication constraints must be re-evaluated later if this external dashboard direction is kept

## Canonical Implementation Direction
- Keep the hybrid architecture
- Keep `merchant_id` as tenant identity
- Keep the dashboard external
- Keep backend trust rooted in Salla OAuth plus server-side token storage
- Keep local dashboard auth as a short-lived app session, not JWT
- Keep AI processing asynchronous
- Keep the widget as a lightweight IIFE bundle
- Keep stack and phase order unchanged

## Notes
- `GET /api/auth/me` is the canonical self endpoint
- `GET /health` reports config readiness for Salla, Supabase, Replicate, Bunny, and app secrets
- Supabase CLI is not installed globally; root helper scripts use `pnpm dlx supabase`
- `DECISIONS_LOG.md` was updated because the dashboard architecture changed
- The app now depends on the root workspace `.env`; package-local `.env` files are no longer assumed
- `app.subscription.*` payloads can omit `plan_name` in Salla docs, so the webhook handler uses Salla lookup first and then a conservative paid-tier fallback if the plan still cannot be resolved
- `API_URL` is now used as the public backend base for the Salla OAuth callback, while the dashboard itself continues to run locally on `DASHBOARD_URL`
- `supabase-js` confirmed that the current project’s Data API cannot access the expected tables yet because the schema has not been applied to the active project
