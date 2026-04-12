# STATUS

## Project
Virtual Try-On for Salla

## Current Phase
Phase 7 - Storefront UX Hardening and Live Validation

## Current Task
Execute **Module 3: Smart Category Rules** (Zero-Configuration). Implement automated category detection and Dashboard Category Management UI.

## Overall Status
The project has achieved a major milestone: **Merchant Onboarding & Granular Product Control**.
Merchants now have a guided first-run experience and can toggle the storefront widget on a per-product basis without breaking existing global settings.
The backend supports a hybrid visibility model (`all` vs `selected`).

## Done
- **Full Architecture Unification**: Combined legacy V1/V2 into a single `WidgetSettings` schema in `@virtual-tryon/shared-types`.
- **Merchant Onboarding**: Guided setup flow for new merchants.
- **Granular Product Control**: Individual product rules (`merchant_product_rules`) and `display_rules`.
- **Premium Dashboard**: Refined UI for products, jobs, and credits.
- **Safe Storefront Injection**: Isolated widget script (`/widget.js`) with cross-origin safeguards.
- **Atomic Credits & Refunding**: Verified worker-side failure refund handling as per ERD.
- **External Salla OAuth & Webhooks**: Completed lifecycle handling with signature verification.

## Verified
- `pnpm lint` & `pnpm build`
- `GET /health` (API)
- `GET /api/widget/embed-script` returns valid script tag context.
- Webhook signature verification and idempotency.

## In Progress
- **SDK-Aware Context**: Completed Full-Stack integration for zero-latency page resolution.
- **Conversion Attribution**: Completed ROI Engine. `order.created` webhooks now attribute revenue to try-on activity.
  - **Conversion Attribution Engine**: Connecting `order.created` webhooks to try-on activity.
  - **Premium UX Hardening**: Comparison Slider and Session Gallery.
  - **Salla SDK Integration**: Moving widget context resolution to native `salla.product.get()`.
- Storefront widget production hardening on real Salla product pages.
- Performance and interaction polish (CTA placement, dialog reliability).
- Live end-to-end validation (blocked by Replicate billing/429).

## Next Recommended Task
1. Execute **Module 2: Conversion Attribution** (order.created Webhook + Dashboard Analytics UI).
2. Execute **Module 3: Smart Category Rules** (REST API Fetching + Dashboard UI).
3. Execute **Module 4: Premium Branding** (Sharp.js Watermarking + Widget UX).

## Canonical Direction
- external merchant dashboard
- storefront shopper widget
- async backend orchestration
- `merchant_id` / `salla_merchant_id` tenancy
- atomic refundable credits
