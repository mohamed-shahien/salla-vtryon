# HANDOFF

## Project
Virtual Try-On for Salla

## Current State
The codebase is now aligned with the clarified product behavior:
- the dashboard is for merchant management
- the storefront widget is for shopper upload and try-on execution

Active implementation state:
- external Salla OAuth dashboard auth is working
- webhook verification and token persistence are working
- credits, products, jobs, uploads, and async processing are working
- merchant-facing dashboard pages are live for:
  - overview
  - products
  - jobs
  - credits
  - widget settings
- public storefront widget APIs are live
- the widget bundle is no longer a placeholder

## Latest Completed Work
- Re-read `AGENTS.md` and project docs before continuing
- Preserved the locked stack and tenant identity rules
- Preserved the external dashboard decision
- Replaced the dashboard's old merchant-upload try-on surface with merchant control pages:
  - `/products` for widget eligibility management
  - `/settings` for widget behavior configuration
- Added normalized widget settings handling in the backend:
  - `widget_enabled`
  - `widget_mode`
  - `widget_products`
  - `widget_button_text`
  - `default_category`
- Added signed widget token issuance through:
  - `GET /api/widget/config/:merchantId`
- Added public widget execution routes:
  - `POST /api/widget/job`
  - `GET /api/widget/job/:id`
- Added protected merchant widget settings routes:
  - `GET /api/widget/settings`
  - `PUT /api/widget/settings`
- Added a real storefront widget runtime with:
  - body-mounted CTA with fixed positioning as the current stable storefront strategy
  - separate camera and upload entry actions
  - category selection
  - blur/loading overlay while generation is running
  - async status polling
  - result/download state
- Collapsed the widget build output to a single `widget.js` bundle with CSS injected at runtime
- Added automatic storefront `productId` discovery through `window.salla.config.get('page.id')` when available
- Added fallback `productId` discovery through Salla slider markup ids like `details-slider-<productId>`
- Added storefront slider image extraction so the widget can pass the first main product image directly into the async try-on job
- Hardened the widget bootstrap so it survives delayed Salla hydration while remaining mounted at the end of `body`
- Added automatic widget re-bootstrap on page `load` and DOM mutations to handle delayed Salla web component hydration
- Changed widget startup order so the CTA root is injected before async config/product checks complete
- Rebuilt the widget around a Shadow DOM host to isolate CTA/modal styles and click handling from storefront theme interference
- Changed CTA behavior so the shopper sees the modal immediately while widget/product eligibility loads inside it
- Fixed a storefront runtime bug where the CTA HTML could appear but remain non-interactive because widget init crashed before listener binding
- Expanded storefront product detection using slider ids, wishlist `data-id`, and gallery `data-fslightbox` markup before job/config calls
- Added clearer runtime messaging when the widget cannot resolve the current product or the current product is disabled
- Removed forced config refetch on every CTA press and added a short wait window for delayed storefront product context
- Added shopper-friendly mapping for backend/AI throttling failures so raw Replicate `429` and `402` details are not surfaced directly in the modal
- Updated dashboard shell/overview copy so merchant vs shopper responsibilities are explicit
- Updated tracking docs and added a new accepted decision clarifying that shopper try-on is widget-only

## Verification Already Run
- `pnpm.cmd lint`
- `pnpm.cmd build`
- `GET /health` returns `Phase 6/7 - Merchant Controls & Storefront Widget`
- `GET /api/widget/config/939837259?productId=1220688598` returned `200` with:
  - `overall_enabled: true`
  - `current_product_enabled: true`
  - a real `widget_token`
- `POST /api/widget/job` succeeded for real merchant `939837259` and real product `1220688598`
- `GET /api/widget/job/:id` returned the created widget job
- Worker failure/refund behavior remains verified:
  - one widget job failed on Replicate `402 Payment Required`
  - one widget job failed on Replicate `429 Too Many Requests`
  - credits returned to `total_credits: 10`, `used_credits: 0`

## Important Constraints
- Do not reintroduce dashboard-first shopper upload flow unless the user explicitly asks for it
- Do not reintroduce embedded dashboard auth
- Do not add JWT auth
- Do not use email as tenant identity
- Keep the widget lightweight and storefront-safe
- Keep AI processing async only
- Keep the approved stack unchanged

## Open Blockers
- Replicate billing/payment is still blocking a successful completed result:
  - `402 Payment Required`
  - `429 Too Many Requests`
- The staged DB hardening migration is still not applied remotely because the current `DATABASE_URL` host is not reachable from this environment:
  - `supabase/migrations/20260405011500_phase3_credit_jobs.sql`

## Exact Next Recommended Task
Complete one successful shopper journey through the real storefront widget:

1. fund the Replicate account and add a payment method
2. place the built widget script on a real enabled product page
3. upload a shopper photo through the widget
4. confirm the result image reaches Bunny and is returned to the widget
5. then apply the staged Phase 3 migration remotely

## Run Guidance
- `pnpm.cmd dev:api`
- `pnpm.cmd dev:dashboard`
- `pnpm.cmd dev:widget`
- `pnpm.cmd lint`
- `pnpm.cmd build`
- `curl http://localhost:3001/health`
- `curl "http://localhost:3001/api/widget/config/<merchantId>?productId=<productId>"`

## Notes
- Canonical self endpoint remains `GET /api/auth/me`
- Shopper uploads now belong to the storefront widget, not the dashboard
- Dashboard product browsing is now an admin surface for widget eligibility only
- The widget bundle currently builds to:
  - `dist/widget.js` about `28kb`
- `docs/99-tracking/DECISIONS_LOG.md` was updated in this step because the user clarified a real product-direction decision
