# SKILL

---
name: virtual-tryon-salla
description: |
  Governance baseline for the Virtual Try-On for Salla repository.
  Use this document to keep implementation aligned with the approved product:
  external merchant dashboard, storefront shopper widget, async backend orchestration,
  merchant-based tenancy, Salla OAuth/webhooks, credits, jobs, Replicate, and Bunny.
---

# Virtual Try-On for Salla Governance

## 1. Product Identity

Virtual Try-On for Salla is a multi-tenant SaaS application that lets Salla merchants offer AI-powered clothing try-on directly on product pages.

The product has three canonical surfaces:

- external React dashboard for the merchant
- storefront widget for the shopper
- backend API and worker for orchestration

The dashboard is not the primary shopper try-on surface.

## 2. Locked Stack

Use this stack unless the user explicitly approves a change:

- React 19 + Vite + shadcn/ui + Tailwind CSS 4
- Node.js 20 + Express 5
- Supabase PostgreSQL with direct Supabase JS client
- Supabase Realtime
- Replicate API
- Bunny.net
- Vanilla JS storefront widget bundled as IIFE
- Zustand
- Zod
- Sharp

No ORM.
No Redis/BullMQ in MVP.
No Next.js dashboard.
No custom AI training in MVP.

## 3. Canonical Product Flow

### Merchant flow

1. merchant installs and authorizes the app through Salla
2. merchant opens the external dashboard
3. merchant manages:
   - eligible products
   - widget settings
   - jobs
   - credits

### Shopper flow

1. shopper opens an eligible product page
2. widget shows a CTA on or near product media
3. shopper opens the dialog immediately
4. shopper takes or uploads a photo
5. widget sends shopper image plus product image and category
6. backend creates an async try-on job
7. result returns in the same dialog

## 4. Tenant Identity Rules

The source of truth for tenancy is:

- `merchant_id`
- `salla_merchant_id`

Never use these as the tenant root:

- email
- staff account identity
- `user_id`

`user_id` may appear as contextual actor data, but not as the key for settings, credits, jobs, or widget access.

## 5. Merchant Auth Rules

The dashboard uses external Salla OAuth.

Canonical auth shape:

1. `GET /api/auth/salla/start`
2. `GET /api/auth/salla/callback`
3. backend stores encrypted Salla tokens server-side
4. backend creates a short-lived app session
5. frontend reads merchant state through `GET /api/auth/me`

Do not reintroduce embedded dashboard auth as canonical.
Do not store Salla tokens in the frontend.

## 6. Webhook Rules

All Salla webhooks must be:

- signature verified
- idempotent
- retry-safe
- logged

Critical events:

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

Required outcomes:

- merchant activation and lifecycle updates
- encrypted token storage
- plan and credits sync
- widget settings sync

## 7. Credit and Job Rules

Credits are platform-managed.

Always:

- check credits before job creation
- deduct credits atomically
- create jobs asynchronously
- refund automatically on AI failure when applicable
- log all credit movements in `credit_transactions`

Canonical async job flow:

1. validate request
2. create job request
3. deduct 1 credit atomically
4. store job as `pending`
5. worker picks it up
6. send to Replicate
7. upload result to Bunny
8. update final job state
9. refund on failure when applicable

## 8. Storefront Widget Rules

The widget must remain:

- lightweight
- non-blocking
- style-isolated
- mobile-friendly
- RTL-friendly
- safe on unstable storefront markup

Canonical widget behavior:

- show CTA over or near product media when possible
- use a safe fallback placement when markup is unstable
- open the dialog immediately on click
- support camera and upload
- show preview before generation
- show polished loading state during async processing
- show shopper-friendly errors

## 9. Canonical Route Baseline

- `GET /api/auth/salla/start`
- `GET /api/auth/salla/callback`
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
- `GET /api/widget/settings`
- `PUT /api/widget/settings`
- `POST /api/widget/job`
- `GET /api/widget/job/:id`
- `GET /health`

## 10. Anti-Drift Rules

Do not drift into:

- embedded merchant dashboard as canonical admin
- dashboard-first shopper try-on as the main product journey
- synchronous AI processing
- email or `user_id` tenancy
- stack substitutions without explicit approval

## 11. Current Delivery Priority

The current priority is:

- finish storefront widget UX hardening on real Salla product pages
- verify one successful end-to-end widget completion
- then move to testing and security hardening
