# DECISIONS LOG

## 2026-04-05 - Shopper try-on flow is storefront-widget-only
**Status:** accepted

By direct user instruction, the canonical shopper try-on flow now lives in the storefront widget only.

The dashboard is merchant-facing control software for:
- credits
- jobs
- widget settings
- product enablement

The shopper-facing flow is:
- widget appears on eligible product pages
- shopper captures or uploads a photo
- widget sends the shopper photo plus the selected product to the backend
- backend creates the async try-on job
- result returns to the shopper inside the widget

**Reason:**  
The user clarified that the dashboard should not be the main surface for uploading shopper photos or running try-on as a merchant workflow. The primary business flow is storefront-first.

**Impact:**  
- dashboard product browsing is now for widget eligibility management, not merchant selfie upload
- dashboard settings are now centered on widget enablement, mode, button text, and default category
- the canonical public widget routes are now:
  - `GET /api/widget/config/:merchantId`
  - `POST /api/widget/job`
  - `GET /api/widget/job/:id`
- older dashboard try-on page behavior should be treated as superseded by this clarified product direction
- backend job orchestration remains valid and is reused by the widget flow

## 2026-04-04 - External dashboard replaces embedded dashboard auth
**Status:** accepted

By direct user instruction, the merchant dashboard is now an external React dashboard rather than a Salla embedded page.

The canonical auth direction is now:
- merchant starts OAuth from the external dashboard
- Salla redirects back to the backend callback URL with `code` and `state`
- backend exchanges the code for Salla tokens
- backend stores tokens server-side only
- backend hands off a local dashboard session to the React app

**Reason:**  
The user explicitly confirmed an external dashboard and requested that embedded auth be removed.

**Impact:**  
- `embedded.init()`, `embedded.auth.getToken()`, and `embedded.ready()` are no longer part of the dashboard flow
- the frontend now assumes an external login page and callback handoff flow
- backend auth now centers on Salla OAuth callback handling plus a local dashboard session
- the backend still keeps webhook-based token handling for `app.store.authorize`

**Official docs note:**  
Salla documentation states that Custom Mode is for testing use cases and that Easy Mode is the only allowed mode for published App Store apps. The external dashboard choice is therefore being implemented as a user-directed architecture decision for the current project path.

## 2026-04-03 - Direct Salla token auth replaces local JWT session
**Status:** accepted

By direct user instruction, the project will not use a local JWT or convenience session for merchant authentication.

The canonical auth direction is now:
- frontend gets the embedded Salla token
- backend introspects the Salla token directly
- protected backend routes accept the Salla token as the auth credential

**Reason:**  
The user explicitly requested to rely on Salla authentication directly whenever the user has a valid token, instead of layering a local JWT session on top.

**Impact:**  
- `JWT_SECRET` is no longer part of the auth flow
- `POST /api/auth/verify` validates the Salla token directly
- `GET /api/auth/me` uses Salla token auth directly
- future protected API routes should use the same direct Salla token model unless the user changes direction again

---

## 2026-04-03 - Repository governance layer added
**Status:** accepted

Created the governance layer that controls Codex execution through:
- `AGENTS.md`
- `README.md`
- `docs/99-tracking/*`

**Reason:**  
The project already has product, architecture, delivery, and schema docs, but it needs repository-level operating instructions and continuity files so implementation sessions do not drift.

**Impact:**  
All future implementation must read and respect the governance docs before coding.

---

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
This stack is already defined across the existing project governance docs and delivery plans.

**Impact:**  
No stack substitutions without explicit user approval.

---

## 2026-04-03 - Hybrid architecture confirmed
**Status:** accepted

The platform will use:
- Salla embedded dashboard for merchants
- storefront widget for shoppers
- backend orchestration for jobs, credits, uploads, and integrations

**Reason:**  
This is the approved architectural direction for the product and best matches the business and UX requirements.

**Impact:**  
Do not attempt embedded-only or widget-only architecture.

---

## 2026-04-03 - Tenant identity fixed to merchant_id
**Status:** accepted

The primary tenant identifier is:
- `merchant_id`
- `salla_merchant_id`

Email is not a primary tenant identifier.

**Reason:**  
Merchant tenancy must remain stable even if team users or emails change.

**Impact:**  
Auth, data modeling, and access checks must all center around merchant identity.

---

## 2026-04-03 - Database-driven queue chosen for MVP
**Status:** accepted

Async job processing will use Supabase/PostgreSQL-backed job polling instead of Redis/BullMQ.

**Reason:**  
Simpler MVP operations, already aligned with current plans, and sufficient for initial launch scope.

**Impact:**  
Job processor implementation must use DB-safe polling, locking, timeout handling, and retry logic.

---

## 2026-04-03 - Canonical self endpoint fixed
**Status:** accepted

Canonical endpoint:
- `GET /api/auth/me`

Legacy reference:
- `GET /api/merchants/me`

**Reason:**  
Some planning docs reference `auth/me` while others reference `merchants/me`.  
The repository will standardize on `auth/me` because it aligns directly with the current auth verification flow:
- `POST /api/auth/verify`
- `GET /api/auth/me`

**Impact:**  
Use `GET /api/auth/me` in new implementation.  
Only add alias compatibility for `/api/merchants/me` if needed later.

---

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

---

## 2026-04-03 - Out-of-scope features locked
**Status:** accepted

Not in MVP:
- video try-on
- accessories support
- multi-person support
- native mobile apps
- custom AI training
- non-Salla platforms
- advanced analytics suite
- 3D body fitting

**Reason:**  
Keeps the MVP focused and executable within the approved timeline.

**Impact:**  
Do not introduce these features unless the user expands scope.
