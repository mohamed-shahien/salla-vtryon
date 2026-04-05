# STATUS

## Project
Virtual Try-On for Salla

## Current Phase
Phase 6/7 - Merchant Controls & Storefront Widget

## Current Task
Align the product to the clarified business flow:
- merchant dashboard manages widget settings, enabled products, credits, and jobs
- storefront widget handles shopper upload, async job creation, polling, and result display

## Overall Status
The platform now has:
- working external Salla OAuth for the merchant dashboard
- encrypted Salla token storage and webhook handling
- live credits, products, and jobs APIs
- an active async job processor
- merchant dashboard pages for products, jobs, credits, and widget settings
- public storefront widget APIs
- a real widget bundle that can request config, upload a shopper photo, create a job, poll status, and render the result when AI succeeds

The remaining blocker is external:
- Replicate is currently failing real completions with `402 Payment Required` and `429 Too Many Requests` until billing/payment is fixed

## Done
- Re-read `AGENTS.md` and the governance/product/architecture/delivery/tracking docs before continuing
- Preserved the locked stack:
  - React 19 + Vite + shadcn/ui + Tailwind CSS 4
  - Node.js 20 + Express 5
  - Supabase direct client
  - Replicate
  - Bunny.net
  - Vanilla JS widget
  - Zustand
  - Zod
  - Sharp
- Preserved the direct user override to keep the dashboard external
- Completed the auth and merchant runtime baseline:
  - `GET /api/auth/salla/start`
  - `GET /api/auth/salla/callback`
  - `POST /api/auth/verify`
  - `GET /api/auth/me`
  - `POST /webhooks/salla`
- Completed the core merchant APIs:
  - `GET /api/credits`
  - `GET /api/products`
  - `GET /api/products/:id`
  - `POST /api/upload`
  - `POST /api/jobs`
  - `GET /api/jobs`
  - `GET /api/jobs/:id`
- Completed the async job engine:
  - Replicate prediction submission and polling
  - Bunny result upload
  - timeout handling
  - refund protection on failure
- Re-aligned the dashboard to the clarified merchant use case:
  - `/products` now manages widget product eligibility instead of merchant photo upload
  - `/settings` now manages widget enablement, all-vs-selected mode, button text, and default category
  - `/jobs` and `/credits` remain merchant monitoring surfaces
- Added normalized widget settings handling on the backend:
  - merchant settings are normalized server-side
  - selected product ids are validated and stored in the merchant settings JSON
- Added public storefront widget APIs:
  - `GET /api/widget/config/:merchantId`
  - `GET /api/widget/settings`
  - `PUT /api/widget/settings`
  - `POST /api/widget/job`
  - `GET /api/widget/job/:id`
- Added signed widget tokens so shopper requests can create and poll jobs without using dashboard auth cookies
- Added a real storefront widget runtime:
  - body-mounted CTA with fixed positioning as the current stable storefront strategy
  - modal panel
  - two shopper entry actions:
    - camera capture
    - file upload
  - category selection
  - blur/loading overlay during generation
  - async job submission
  - polling
  - result state with download link
- Simplified storefront installation by making the widget a single JavaScript bundle with runtime CSS injection
- Added automatic `productId` discovery from `window.salla.config.get('page.id')` when the storefront provides it
- Added fallback `productId` discovery from Salla slider markup such as `details-slider-<productId>`
- Added slider image extraction so the widget can send the first main product image from the slider to the backend as the garment image source
- Hardened widget bootstrap so it can survive delayed Salla web component hydration while remaining mounted at the end of `body`
- Added automatic re-bootstrap on `load` and DOM mutations so the widget can survive delayed Salla web component hydration
- Changed widget startup order so the CTA root is injected first, then widget config/product eligibility is loaded asynchronously
- Rebuilt the storefront widget around a Shadow DOM host to isolate its styles and interactions from the Salla storefront theme
- Changed widget interaction flow so clicking the CTA opens the dialog immediately, then loads product/widget config inside the modal
- Fixed a widget init runtime crash that could leave the CTA visible but without bound click behavior
- Expanded storefront product detection to include slider ids, wishlist `data-id`, and gallery `data-fslightbox` markup
- Added clearer shopper-facing error messaging when product context is missing or the product is not enabled
- Stopped forcing a fresh widget-config fetch on every CTA press; the widget now reuses warmed config and waits briefly for delayed product context before failing
- Added shopper-friendly failure mapping for backend/AI throttling errors such as Replicate `429` and `402`

## Verification
- `pnpm.cmd lint`
- `pnpm.cmd build`
- `GET /health` returns `Phase 6/7 - Merchant Controls & Storefront Widget`
- `GET /api/widget/config/939837259?productId=1220688598` returned `200` and a real widget token for the active merchant/product
- `POST /api/widget/job` succeeded for a real merchant/product and created real jobs from a shopper-style uploaded image
- `GET /api/widget/job/:id` returned the created widget jobs
- Worker failure path is still verified live:
  - Replicate returned `402 Payment Required`
  - Replicate also returned `429 Too Many Requests`
  - both failures marked the job `failed`
  - merchant credits returned to `10 / 0`

## In Progress
- Full successful `completed` widget result verification is blocked until Replicate billing/payment is usable

## Blockers
- Replicate account state is still blocking real completions:
  - `402 Payment Required`
  - `429 Too Many Requests` until a payment method is added
- The staged DB hardening migration is still not applied remotely because the direct Postgres host in `DATABASE_URL` is not reachable from this environment:
  - `supabase/migrations/20260405011500_phase3_credit_jobs.sql`

## Next Recommended Task
Fix the external Replicate blocker, then run one successful storefront widget job end-to-end:

1. add billing credit and a payment method to the Replicate account behind `REPLICATE_API_TOKEN`
2. load the real storefront widget on an enabled product page
3. upload a shopper photo through the widget
4. confirm the worker writes `result_image_url`
5. confirm the widget renders the final Bunny result image
6. then apply the staged Phase 3 migration from an environment that can reach the direct Postgres host

## Canonical Implementation Direction
- Keep the hybrid architecture
- Keep the external dashboard
- Keep `merchant_id` / `salla_merchant_id` as tenant identity
- Keep the dashboard merchant-only
- Keep shopper uploads in the storefront widget
- Keep AI processing asynchronous
- Keep credits atomic and refundable on AI failure
