# AGENTS
# AGENTS.md

## Project Identity

This repository builds and maintains **Virtual Try-On for Salla**:
a multi-tenant SaaS application that lets Salla merchants offer AI-powered clothing try-on to shoppers directly inside product pages.

The system is built around:
- **Salla** for app installation, authorization, embedded auth, subscriptions, and storefront integration
- **Our platform** for dashboard operations, product enablement rules, credits, job orchestration, and AI processing

This repository is the execution source for the product described in the project docs.

---

## Source of Truth Files

Read these files first at the beginning of every session and before every non-trivial task:

1. `/docs/00-governance/SKILL.md`
2. `/docs/01-product/prd-virtual-tryon.md`
3. `/docs/02-architecture/erd-virtual-tryon.md`
4. `/docs/02-architecture/salla-virtual-tryon-decision-pack.md`
5. `/docs/03-delivery/virtual-tryon-execution-plan.md`
6. `/docs/03-delivery/virtual-tryon-project-plan.md`
7. `/docs/99-tracking/STATUS.md`
8. `/docs/99-tracking/DECISIONS_LOG.md`
9. `/docs/99-tracking/HANDOFF.md`

If any code conflicts with these documents, the docs win unless the user explicitly overrides them.

If two docs conflict, use this precedence order:
1. direct user instruction
2. `AGENTS.md`
3. `docs/00-governance/SKILL.md`
4. `docs/02-architecture/salla-virtual-tryon-decision-pack.md`
5. `docs/01-product/prd-virtual-tryon.md`
6. `docs/02-architecture/erd-virtual-tryon.md`
7. `docs/03-delivery/virtual-tryon-execution-plan.md`
8. `docs/03-delivery/virtual-tryon-project-plan.md`
9. existing code

---

## Locked Tech Stack

Do not replace or drift from this stack unless the user explicitly approves it.

- **Frontend Dashboard:** React 19 + Vite + shadcn/ui + Tailwind CSS 4
- **Backend API:** Node.js 20 + Express 5
- **Database:** Supabase PostgreSQL with direct Supabase JS client
- **Realtime:** Supabase Realtime
- **AI:** Replicate API
- **Storage/CDN:** Bunny.net
- **Storefront Widget:** Vanilla JS, bundled as IIFE
- **State Management:** Zustand in dashboard
- **Validation:** Zod for request validation
- **Image Processing:** Sharp

No ORM.
No Redis/BullMQ in MVP.
No Next.js dashboard.
No custom AI training in MVP.

---

## Core Architecture Rules

### 1) Hybrid Architecture
Use the approved hybrid model:

- **External React Dashboard** for merchant operations outside the Salla iframe
- **Storefront Widget** for shopper experience on product pages
- **Backend API** for orchestration, credits, uploads, products proxy, webhooks, and AI jobs
- **Supabase** as system database and job state store
- **Replicate** for virtual try-on inference
- **Bunny** for image storage and delivery

### 2) Tenant Identity
The source of truth for tenancy is:
- `merchant_id` / `salla_merchant_id`

Never use email as the primary identifier for a merchant tenant.

### 3) Credit System
Each try-on job consumes credits.
Credits must be:
- checked before job creation
- deducted atomically
- refunded automatically on AI failure
- reset on subscription renewal
- fully tracked in `credit_transactions`

### 4) Job Processing
AI processing must be asynchronous.
Never run the full try-on pipeline synchronously in a request handler.

Approved flow:
1. create job
2. deduct credit atomically
3. mark job `pending`
4. processor picks it up
5. send to Replicate
6. upload result to Bunny
7. update job status
8. refund on failure when applicable

### 5) Storefront Widget
The widget must remain:
- lightweight
- non-blocking
- isolated in styling
- mobile-friendly
- RTL-friendly
- safe to inject into Salla storefront pages

---

## Salla Rules

### External Dashboard Auth
Dashboard auth flow must follow:
1. merchant starts Salla OAuth from the external dashboard
2. Salla redirects to the backend callback with `code` and `state`
3. backend exchanges the code for access and refresh tokens
4. backend fetches merchant identity from Salla user info
5. backend stores encrypted tokens server-side
6. backend creates a short-lived app session for dashboard access

### Webhooks
Handle Salla webhooks through:
- signature verification
- idempotency storage
- event-specific handlers

Critical events include:
- `app.installed`
- `app.store.authorize`
- `app.uninstalled`
- `app.subscription.started`
- `app.subscription.renewed`
- `app.subscription.canceled`
- `app.subscription.expired`
- `app.trial.started`
- `app.trial.expired`
- `app.settings.updated`

### Security
Always:
- verify `X-Salla-Signature`
- encrypt access and refresh tokens at rest
- store tokens server-side only
- use least-required scopes
- respect rate limits

---

## Canonical API Direction

Use these routes as the canonical baseline unless the user explicitly changes them:

- `POST /api/auth/verify`
- `GET /api/auth/me`
- `POST /webhooks/salla`
- `GET /api/credits`
- `POST /api/jobs`
- `GET /api/jobs`
- `GET /api/jobs/:id`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/upload`
- `GET /api/widget/config/:merchantId`
- `POST /api/widget/job`
- `GET /api/widget/job/:id`
- `GET /health`

If older docs or old code reference `/api/merchants/me`, treat that as legacy and prefer `/api/auth/me`.

---

## Canonical Repository Shape

Use this project structure as the default:

```txt
virtual-tryon/
├── apps/
│   ├── api/
│   ├── dashboard/
│   └── widget/
├── supabase/
│   └── migrations/
├── docs/
│   ├── 00-governance/
│   ├── 01-product/
│   ├── 02-architecture/
│   ├── 03-delivery/
│   └── 99-tracking/
└── packages/
    └── shared-types/
