# DECISIONS LOG

## 2026-04-05 - Source docs realigned to external dashboard and widget-first shopper flow
**Status:** accepted

The source-of-truth docs are now explicitly aligned to the clarified product:

- external React dashboard for merchants
- storefront widget for shoppers
- async backend orchestration for credits, jobs, AI, and storage

**Reason:**
Older docs still described embedded dashboard auth and dashboard-first try-on as canonical, while the approved product direction had already moved away from that.

**Impact:**
- PRD, architecture, and delivery docs now describe the real product direction
- delivery sequencing now prioritizes storefront widget UX hardening instead of admin-side try-on work
- future work should be judged against the merchant-admin plus shopper-widget split

## 2026-04-05 - Shopper try-on flow is storefront-widget-only
**Status:** accepted

By direct user instruction, the canonical shopper try-on flow lives in the storefront widget only.

The dashboard is merchant-facing control software for:
- credits
- jobs
- widget settings
- product enablement

**Reason:**
The user clarified that the business value is the shopper experience on the product page, not a merchant selfie flow inside the admin dashboard.

**Impact:**
- dashboard try-on must not be treated as the main product journey
- widget APIs and widget UX are first-class product surfaces
- merchant dashboard pages exist to configure and monitor the widget flow

## 2026-04-04 - External dashboard replaces embedded dashboard auth
**Status:** accepted

By direct user instruction, the merchant dashboard is an external React dashboard rather than a Salla embedded page.

The canonical auth direction is:
- merchant starts OAuth from the external dashboard
- Salla redirects back to the backend callback URL with `code` and `state`
- backend exchanges the code for Salla tokens
- backend stores tokens server-side only
- backend creates a short-lived dashboard session

**Reason:**
The user explicitly confirmed an external dashboard and requested that embedded auth be removed.

**Impact:**
- `embedded.init()`, `embedded.auth.getToken()`, and `embedded.ready()` are not part of the dashboard flow
- backend auth centers on Salla OAuth callback handling plus a server-managed session
- webhook-based token lifecycle handling remains part of the system

## 2026-04-03 - Direct Salla token auth replaces local JWT session
**Status:** superseded

This decision was superseded on 2026-04-04 by the accepted external dashboard OAuth decision.

The project no longer treats direct embedded Salla token auth as the canonical merchant auth path.

## 2026-04-03 - Repository governance layer added
**Status:** accepted

Created the governance layer that controls execution through:
- `AGENTS.md`
- `README.md`
- `docs/99-tracking/*`

**Reason:**
The project needed a repository-level operating layer so implementation sessions do not drift.

**Impact:**
All future implementation must read and respect the governance docs before coding.

## 2026-04-03 - Stack locked for MVP
**Status:** accepted

The stack is fixed to:
- React 19 + Vite + shadcn/ui + Tailwind CSS 4
- Node.js 20 + Express 5
- Supabase PostgreSQL + Realtime
- Replicate API
- Bunny.net
- Vanilla JS widget

**Reason:**
This stack is already defined across the governance and delivery docs.

**Impact:**
No stack substitutions without explicit user approval.

## 2026-04-03 - Hybrid architecture confirmed
**Status:** accepted

The platform uses:
- external merchant dashboard
- storefront widget for shoppers
- backend orchestration for jobs, credits, uploads, and integrations

**Reason:**
This architecture best matches the product's merchant-admin plus shopper-widget split.

**Impact:**
Do not attempt embedded-only, dashboard-only, or widget-only architecture.

## 2026-04-03 - Tenant identity fixed to merchant_id
**Status:** accepted

The primary tenant identifier is:
- `merchant_id`
- `salla_merchant_id`

The following are not primary tenant identifiers:
- email
- `user_id`

**Reason:**
Merchant tenancy must remain stable even if staff users or emails change.

**Impact:**
Auth, data modeling, access checks, credits, and widget settings must all center around merchant identity.

## 2026-04-03 - Database-driven queue chosen for MVP
**Status:** accepted

Async job processing uses Supabase/PostgreSQL-backed job polling instead of Redis/BullMQ.

**Reason:**
Simpler MVP operations and already aligned with the approved scope.

**Impact:**
Job processing must use DB-safe polling, locking, timeout handling, and retry logic.

## 2026-04-03 - Canonical self endpoint fixed
**Status:** accepted

Canonical endpoint:
- `GET /api/auth/me`

Legacy reference:
- `GET /api/merchants/me`

**Reason:**
The repo standardizes on `auth/me` to match the current auth bootstrap flow.

**Impact:**
Use `GET /api/auth/me` in new implementation.

## 2026-04-03 - Credit policy fixed for MVP
**Status:** accepted

Credit rules:
- each try-on costs 1 credit
- credit check before job creation
- atomic deduction
- refund on AI failure
- reset on subscription renewal
- audit every movement in `credit_transactions`

**Reason:**
This is the current commercial and technical operating model of the product.

**Impact:**
Any job creation flow that skips these rules is invalid.

## 2026-04-06 - Hybrid Product Visibility with Legacy Fallback
**Status:** accepted

The system now supports a hybrid model for determining widget visibility on storefront product pages:
1. **Rule-Based Visibility**: A new `merchant_product_rules` table stores explicit per-product overrides.
2. **Global Setting**: Validated against `settings.widget_mode` (`all` vs `selected`).
3. **Legacy Fallback**: If no specific rule exists for a product, the system falls back to checking the legacy `settings.widget_products` array to ensure no disruption for existing merchants.

**Reason:**
To provide granular product-level control (Bulk Enable/Disable) without breaking the existing storefront configuration or requiring a complex data migration for active users.

**Impact:**
- `GET /api/widget/config` now calculates `is_product_eligible` dynamically based on rules + mode + fallback.
- The dashboard provides a premium management interface for these rules.
- Widget job creation validates against these rules to prevent unauthorized AI consumption.
