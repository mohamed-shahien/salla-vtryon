# DECISIONS LOG

## 2026-04-03 — Repository governance layer added
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

## 2026-04-03 — Stack locked for MVP
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

## 2026-04-03 — Hybrid architecture confirmed
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

## 2026-04-03 — Tenant identity fixed to merchant_id
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

## 2026-04-03 — Database-driven queue chosen for MVP
**Status:** accepted

Async job processing will use Supabase/PostgreSQL-backed job polling instead of Redis/BullMQ.

**Reason:**  
Simpler MVP operations, already aligned with current plans, and sufficient for initial launch scope.

**Impact:**  
Job processor implementation must use DB-safe polling, locking, timeout handling, and retry logic.

---

## 2026-04-03 — Canonical self endpoint fixed
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

## 2026-04-03 — Credit policy fixed for MVP
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

## 2026-04-03 — Out-of-scope features locked
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