# STATUS

## Project
Virtual Try-On for Salla

## Current Phase
Phase 7 - Storefront UX Hardening and Live Validation

## Current Task
Realign the source-of-truth docs and finish the real shopper widget experience so it matches the approved business flow:

- merchant dashboard for controls and monitoring
- storefront widget for shopper try-on

## Overall Status

The project direction is now explicitly aligned around the correct product behavior:

- merchant uses an external dashboard
- shopper uses a storefront widget on the product page
- backend handles credits, jobs, AI, and storage asynchronously

The backend foundation is strong and the merchant admin side is largely in place.

The main open product task is not architecture anymore. It is storefront reliability and UX polish on real Salla product pages.

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
