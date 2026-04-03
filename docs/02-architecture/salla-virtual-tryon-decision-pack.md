# Salla Virtual Try-On Decision Pack

---

## `docs/02-architecture/salla-virtual-tryon-decision-pack.md`

```md
# Salla Virtual Try-On — Decision Pack

## Version
v1.0

## Date
2026-04-01

## Purpose
This document locks the approved product and technical direction for the Virtual Try-On project on Salla.

It exists to prevent architectural drift and to make implementation decisions explicit before code execution begins.

---

## 1. Executive Decision

Virtual Try-On for Salla is approved as a **hybrid multi-tenant SaaS application**.

### Salla is responsible for:
- app installation
- authorization
- embedded authentication
- subscription lifecycle
- storefront integration entry points

### Our platform is responsible for:
- merchant dashboard
- local merchant session
- product enablement rules
- credits and billing usage logic
- try-on job orchestration
- AI processing
- result storage and delivery

This hybrid model is the canonical architectural direction for MVP.

---

## 2. Product Definition

The product is a SaaS app for Salla fashion merchants.

### Merchant-side outcome
Merchants install the app, open the dashboard, choose how the widget behaves, decide which products should show the try-on experience, and monitor jobs and credits.

### Shopper-side outcome
Shoppers see a try-on widget on eligible product pages, upload a photo or use the camera, and receive a try-on result image within seconds.

---

## 3. Approved Architecture

The project is built on three connected layers:

### A) Salla Integration Layer
Used for:
- install / authorize
- embedded app auth
- app lifecycle webhooks
- subscription state
- settings synchronization

### B) Merchant Control Layer
Used for:
- dashboard UI
- merchant session
- enabled product configuration
- credits and transactions
- recent jobs and settings

### C) Storefront + AI Processing Layer
Used for:
- storefront widget
- shopper upload flow
- async try-on jobs
- AI processing
- result delivery

All three layers are required for the approved MVP.

---

## 4. Tenant and Identity Decision

The system is tenant-first.

### Canonical tenant identifier
- `merchant_id`
- `salla_merchant_id`

### Not valid as source of truth
- merchant email
- employee email
- local user email

A user may change.
The store remains the tenant.

This rule applies to:
- auth
- data access
- credits
- product rules
- jobs
- widget behavior

---

## 5. Authentication Decision

### Merchant authentication
Merchant trust begins from Salla embedded auth.

Approved dashboard flow:

1. `embedded.init()`
2. `embedded.auth.getToken()`
3. frontend sends token to backend
4. backend introspects token
5. backend starts local session
6. `embedded.ready()`

### Local session decision
A local session is allowed for convenience, but it does not replace Salla as the trust source.

### Security decision
Do not generate passwords automatically and email them.
If an external login is introduced later, it must use:
- magic link
- or secure set-password after verified onboarding

---

## 6. Salla Integration Decision

### Embedded dashboard
Merchant dashboard must run as a Salla embedded app.

### Storefront widget delivery
Shopper-facing try-on must be delivered through the approved storefront integration path, such as:
- App Snippet
- Device Mode style injection
- or the validated storefront script mechanism

### Why hybrid instead of embedded-only?
Because:
- embedded dashboard serves merchants
- storefront widget serves shoppers
- backend orchestration serves both

An embedded-only architecture is not sufficient.

---

## 7. Webhook Decision

Webhook processing is a critical subsystem.

All webhook handling must be:
- signature-verified
- idempotent
- retry-safe
- logged

### Critical events for MVP
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

### Mandatory behavior
- create merchant on install
- store encrypted tokens on authorize
- deactivate merchant on uninstall
- sync plan / limits on subscription events
- reset credits on renewals
- sync merchant settings when updated

---

## 8. Data Model Decision

The simplified canonical MVP data model is based on these core tables:

- `merchants`
- `credits`
- `tryon_jobs`
- `webhook_events`
- `credit_transactions`

This keeps the MVP practical while preserving:
- tenant isolation
- credit accounting
- job tracking
- webhook idempotency
- auditability

Future expansion may add more explicit domain tables, but MVP should stay aligned with the current approved ERD.

---

## 9. Credit System Decision

Credits are a platform-level consumption model layered on top of Salla subscriptions.

### Rules
- each try-on attempt costs 1 credit
- credits must be checked before job creation
- deduction must be atomic
- refund must happen on AI failure when applicable
- credits must reset on subscription renewal
- every movement must be logged in `credit_transactions`

### Billing split
- Salla manages commercial subscription plans
- Our platform manages operational credit consumption

This split is approved and must not be silently changed.

---

## 10. AI Processing Decision

AI processing is handled through Replicate.

### Model direction
Use IDM-VTON or the currently approved equivalent virtual try-on model.

### Processing rules
- uploads must be validated
- images must be optimized before inference
- jobs must run asynchronously
- failures must be stored as job state
- result images must be uploaded to Bunny
- stuck jobs must timeout and be cleaned up

### Explicit anti-decision
Do not build or train a custom AI model in MVP.

---

## 11. Storage Decision

Use Bunny.net for:
- shopper image uploads
- result image storage
- CDN delivery

### Storage layout
```txt
/{salla_merchant_id}/
├── uploads/
├── results/
└── products/