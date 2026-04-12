# HANDOFF

## Project
Virtual Try-On for Salla

## Current State (Handoff)
- **Completed:** SDK-Aware context (Module 1) and ROI/Conversion Attribution (Module 2).
- **Stable:** 0 TypeScript errors across all apps.
- **Next Task:** Module 3 (Smart Category Rules).
- **Core Files to check:** `apps/api/src/services/attribution.service.ts` (latest ROI logic).

## Instructions for Next Agent
1. Read `AGENTS.md` and `docs/` first.
2. Implement Category-based eligibility logic.
3. Add UI in Dashboard for category selection.
4. Ensure 0 TS errors.

## What Is Working

- external Salla OAuth path for the merchant dashboard
- webhook verification and lifecycle handling
- encrypted Salla token storage
- merchant APIs for auth, products, credits, jobs, uploads, and widget settings
- async job creation and worker processing
- credit deduction and refund handling
- merchant dashboard surfaces for overview, products, jobs, credits, and settings
- public widget config and widget job APIs

## What Is Not Closed Yet

- storefront widget UX is not yet production-grade on real Salla product pages
- one successful live AI completion has not been verified on the active Replicate account because provider billing and throttling are still blocking it
- the staged DB hardening migration is still waiting to be applied from a reachable environment

## Latest Documentation Work

- realigned architecture docs to external dashboard plus widget-first shopper flow
- realigned delivery docs and the master plan to the same model
- updated the decisions log to mark the old direct embedded token auth decision as superseded
- updated status tracking so the current phase is clearly Phase 7 storefront UX hardening
- [x] **Module 1: SDK-Aware Context** (Stabilization) - Complete.
- [x] **Module 2: Conversion Attribution** (ROI Engine) - Complete.
- [ ] **Module 3: Smart Category Rules** (Catalog Scale) - Next.
- **Unification**: Purged all legacy V1/V2 folders the dashboard and API local proxies.
- **Shared Types**: Centralized all settings validation in `packages/shared-types`.

## Current Implementation Truth

### Merchant side

The merchant dashboard is for:
- overview
- product eligibility
- widget settings
- jobs
- credits

### Shopper side

The shopper flow is:
- see CTA on an eligible product page
- open the widget dialog
- take or upload a photo
- submit try-on
- wait while async processing runs
- see the result in the same dialog

### Backend side

The backend remains responsible for:
- auth and webhooks
- credits
- jobs
- uploads
- AI orchestration
- Bunny delivery

## Constraints To Preserve

- do not reintroduce embedded dashboard auth
- do not reintroduce dashboard-first shopper upload as canonical
- do not use email or `user_id` as tenant identity
- keep the widget lightweight and storefront-safe
- keep AI processing async only
- keep the locked stack unchanged
- **NEVER** re-introduce local schema proxies or flat-field settings in the API or Dashboard.
- **ALWAYS** consume `WidgetSettings` from `@virtual-tryon/shared-types`.

## Open Blockers

- Replicate account state still blocks successful live completions:
  - `402 Payment Required`
  - `429 Too Many Requests`
- `supabase/migrations/20260405011500_phase3_credit_jobs.sql` is staged but not applied remotely from this environment

## Exact Next Recommended Task

Resume with Phase 7 execution, not architecture changes:

1. finish the storefront widget CTA and dialog behavior on a real enabled product page
2. verify shopper upload or camera flow visually and technically
3. resolve the Replicate billing blocker
4. run one successful end-to-end widget completion
5. then move to Phase 8 testing and security hardening
