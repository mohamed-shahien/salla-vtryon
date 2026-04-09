# STATUS

## Project
Virtual Try-On for Salla

## Current Phase
Phase 7 - Storefront UX Hardening and Live Validation

## Current Task
Realign the source-of-truth docs and finish the real shopper widget experience so it matches the approved business flow:

- merchant dashboard for controls and monitoring
- storefront widget for shopper try-on
- **Unified Architecture**: Single Source of Truth in `shared-types`

## Overall Status

The project has achieved a major milestone: **Merchant Onboarding & Granular Product Control**.
Merchants now have a guided first-run experience and can toggle the storefront widget on a per-product basis without breaking existing global settings.

The backend now supports a hybrid visibility model:
1. `all` mode: Widget shows on all products (legacy behavior)
2. `selected` mode: Widget shows ONLY on products with active rules in `merchant_product_rules`

The dashboard UI is now premium and supports batch operations and optimistic updates.


## Done

- preserved the locked stack and tenant identity rules
- preserved the external dashboard decision
- preserved the widget-first shopper flow
- completed external Salla OAuth and webhook handling
- completed encrypted Salla token storage
- completed merchant-facing APIs for auth, products, credits, jobs, uploads, and widget settings
- completed atomic credits and async job orchestration
- completed worker-side failure refund handling
- completed merchant dashboard surfaces for:
  - overview
  - products
  - jobs
  - credits
  - settings
- completed public widget APIs for:
  - config resolution
  - widget job creation
  - widget job polling
- updated source docs so they no longer describe embedded dashboard auth or dashboard-first shopper try-on as canonical
- completed merchant onboarding wizard with marketing and activation flow
- completed granular product-based widget visibility rules with legacy fallback
- completed premium products dashboard with search, filters, and batch enablement
- completed widget safety contract and verification script
- completed Merchant Dashboard Unification:
  - type-safe `useWidgetStudioV2` hook
  - synchronized visual identity, button, and window presets
  - atomic settings patching with dirty state detection
  - dedicated runtime safeguards configuration
- resolved widespread `as any` type issues in dashboard primitives
- completed **Full Architecture Unification**:
  - Combined V1/V2 settings into a single `WidgetSettings` schema.
  - Purged all legacy local schema proxies and orphaned V1 files.
  - verified end-to-end `tsc` build for API, Dashboard, and Widget.

## Verified

- `pnpm.cmd lint`
- `pnpm.cmd build`
- `GET /health`
- real widget config requests returned valid merchant/product config and signed widget tokens
- real widget-created jobs reached the backend and worker pipeline
- failed AI/provider jobs refunded merchant credits correctly

## In Progress

- storefront widget production hardening on real Salla product pages
- CTA placement and interaction polish
- dialog reliability and shopper UX polish
- live end-to-end validation of a successful completion once the external provider blocker is cleared

## Blockers

- Replicate currently blocks successful live completions on the active account:
  - `402 Payment Required`
  - `429 Too Many Requests`
- the staged DB hardening migration is still not applied remotely because the current direct Postgres host in `DATABASE_URL` is not reachable from this environment:
  - `supabase/migrations/20260405011500_phase3_credit_jobs.sql`

## Next Recommended Task

Keep execution tightly focused on Phase 7:

1. finish the storefront widget CTA and dialog behavior on a real enabled product page
2. verify shopper upload or camera flow visually and technically
3. clear the Replicate billing blocker
4. run one successful end-to-end widget completion
5. then move into Phase 8 testing and security hardening

## Canonical Direction

- external merchant dashboard
- storefront shopper widget
- async backend orchestration
- `merchant_id` / `salla_merchant_id` tenancy
- atomic refundable credits
