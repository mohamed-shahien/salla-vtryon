# STATUS

Root tracking entrypoint for Codex sessions.
Canonical docs folder remains `docs/99-tracking/`; keep this file aligned with `docs/99-tracking/STATUS.md` when updating status.

## Project
Virtual Try-On for Salla

## Current Phase
Phase 7 - Storefront UX Hardening and Live Validation

## Current Task
Finish the storefront widget CTA and dialog behavior on a real enabled product page.

## Overall Status
The project has achieved a major milestone: **Merchant Onboarding & Granular Product Control**.
Merchants now have a guided first-run experience and can toggle the storefront widget on a per-product basis.
The backend supports a hybrid visibility model (`all` vs `selected`).

## Done
- completed Full Architecture Unification (Unified Schema V2)
- completed merchant onboarding wizard
- completed granular product-based widget visibility rules
- completed premium products dashboard
- completed widget safety contract and verification script
- completed external Salla OAuth and webhook handling
- completed atomic credits and async job orchestration

## In Progress
- storefront widget production hardening on real Salla product pages
- live end-to-end validation of a successful completion

## Next Recommended Task
1. finish the storefront widget CTA and dialog behavior on a real enabled product page
2. verify shopper upload or camera flow visually and technically
3. clear the Replicate billing blocker (402/429 errors)

## Canonical Implementation Direction
- external merchant dashboard
- storefront shopper widget
- async backend orchestration
- `merchant_id` / `salla_merchant_id` tenancy
- atomic refundable credits

## Notes
- `GET /api/auth/me` is the canonical self endpoint
- `GET /api/widget/embed-script` is the correct endpoint for the widget script tag
