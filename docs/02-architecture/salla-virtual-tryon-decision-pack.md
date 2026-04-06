# Salla Virtual Try-On Decision Pack

**Version:** 2.0
**Date:** 2026-04-05
**Status:** Active Source of Truth

## Purpose

This document locks the approved product and technical direction for Virtual Try-On for Salla.

Use it to prevent drift between:
- merchant dashboard behavior
- storefront widget behavior
- backend orchestration
- delivery sequencing

If older docs or older code disagree with this document, this document wins unless the user explicitly overrides it.

---

## 1. Executive Decision

Virtual Try-On for Salla is approved as a hybrid multi-tenant SaaS product with three core surfaces:

- an external React dashboard for merchants
- a lightweight storefront widget for shoppers
- a backend API and async worker for orchestration

This product is not defined as an embedded merchant dashboard with shopper try-on inside the admin surface.

The canonical business flow is:

1. merchant installs and authorizes the app through Salla
2. merchant manages products, widget settings, jobs, and credits in the external dashboard
3. shopper uses the widget on an eligible product page
4. backend creates and processes the async try-on job
5. result returns to the shopper inside the widget dialog

---

## 2. Responsibility Split

### Salla is responsible for

- app installation
- OAuth authorization entry and redirect
- lifecycle webhooks
- subscription lifecycle
- merchant product authority
- storefront page context and integration entry points

### Our platform is responsible for

- external dashboard session handling
- merchant settings and widget controls
- product eligibility rules
- credits and transaction audit
- try-on job lifecycle
- AI orchestration through Replicate
- result storage and delivery through Bunny

---

## 3. Approved Architecture

The approved MVP architecture is:

- `apps/dashboard`: external React dashboard for the merchant
- `apps/widget`: vanilla JS IIFE bundle for storefront shoppers
- `apps/api`: Express backend for auth, webhooks, products proxy, credits, uploads, widget config, and jobs
- `Supabase`: source of truth for merchants, credits, jobs, webhook idempotency, and widget settings
- `Replicate`: async virtual try-on inference
- `Bunny.net`: uploaded shopper images and result image delivery

The dashboard and the widget serve different actors and must stay separate in both UX and implementation responsibilities.

---

## 4. Tenant Identity Decision

The source of truth for tenancy is:

- `merchant_id`
- `salla_merchant_id`

The following are not valid tenant identifiers:

- merchant email
- staff email
- `user_id`
- any client-provided label that is not tied to the store

`user_id` may exist as actor context, but never as the root tenant key for config, credits, jobs, or widget access.

---

## 5. Merchant Authentication Decision

The merchant dashboard uses external Salla OAuth.

### Canonical flow

1. merchant starts login from the external dashboard
2. backend redirects to Salla OAuth
3. Salla redirects back to the backend callback with `code` and `state`
4. backend exchanges the code for access and refresh tokens
5. backend fetches merchant identity from Salla
6. backend stores encrypted tokens server-side
7. backend creates a short-lived dashboard session
8. frontend bootstraps the merchant state through `GET /api/auth/me`

### Explicit decisions

- embedded dashboard auth is not canonical
- frontend must not store Salla tokens directly
- backend is the only system allowed to hold access and refresh tokens
- `POST /api/auth/verify` is allowed as a session bootstrap helper, not as a reason to reintroduce embedded auth

---

## 6. Dashboard Decision

The dashboard is merchant-facing control software only.

### Canonical dashboard responsibilities

- overview and store status
- product eligibility management
- widget settings management
- job monitoring
- credit monitoring and audit visibility

### Non-canonical dashboard behavior

The dashboard is not the primary shopper try-on surface.

If a temporary internal testing flow exists inside the dashboard, treat it as secondary and do not use it to redefine the product.

---

## 7. Storefront Widget Decision

The widget is the canonical shopper experience.

### Widget requirements

- vanilla JS bundled as a single IIFE
- lightweight and non-blocking
- isolated from storefront CSS and behavior
- mobile-friendly
- RTL-friendly
- safe for unstable or delayed storefront markup

### Widget UX contract

1. widget resolves product context from the storefront page
2. CTA appears over or near product media when possible
3. safe fallback places the CTA in a fixed body-mounted position
4. shopper clicks CTA and the dialog opens immediately
5. shopper chooses camera capture or file upload
6. shopper previews the selected image
7. widget sends the shopper image plus the current product image and category
8. widget shows a polished processing state while the async job runs
9. widget displays the result in the same dialog when successful

### Widget security decision

- public widget calls must use a backend-issued signed widget token
- the storefront must not receive privileged merchant API tokens
- shopper-facing errors must be clean and retry-friendly

---

## 8. Webhook Decision

Webhook processing is mandatory for MVP.

### Mandatory properties

- signature verified
- idempotent
- retry-safe
- audited

### Critical events

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

### Required outcomes

- create or activate merchant records
- store encrypted tokens on authorize
- deactivate merchant access on uninstall when appropriate
- sync plan and credit state on subscription changes
- sync merchant-side settings updates

---

## 9. Credits and Job Processing Decision

Credits and AI jobs are platform-level backend responsibilities.

### Fixed rules

- each try-on attempt consumes 1 credit
- credits are checked before job creation
- deduction must be atomic
- refund must happen automatically on AI failure when applicable
- subscription renewals reset monthly usage
- every movement is logged in `credit_transactions`

### Canonical async flow

1. create job request
2. check credits
3. deduct 1 credit atomically
4. store job as `pending`
5. worker picks the job
6. send the job to Replicate
7. upload result to Bunny on success
8. update final job state
9. refund automatically on failure when applicable

Running the full AI pipeline synchronously in the request handler is not allowed.

---

## 10. Canonical Data Model

The minimum approved MVP domain model is:

- `merchants`
- `credits`
- `credit_transactions`
- `tryon_jobs`
- `webhook_events`

Merchant widget controls may remain stored in merchant settings as long as the backend normalizes and validates:

- widget enabled state
- widget mode
- selected product ids
- button text
- default category

---

## 11. Security and Reliability Rules

Always:

- encrypt Salla access and refresh tokens at rest
- keep tokens server-side only
- verify `X-Salla-Signature`
- rate-limit public widget routes
- validate uploaded images
- treat tenant checks as mandatory on every sensitive path
- keep provider-specific errors out of the primary shopper UI

---

## 12. Explicit Anti-Decisions

The following are not part of the approved MVP direction:

- embedded merchant dashboard as the canonical admin surface
- using `user_id` instead of `merchant_id` for tenancy
- dashboard-first shopper try-on as the main user journey
- synchronous AI processing in request handlers
- custom AI model training in MVP
- stack substitutions outside the locked stack

---

## 13. Canonical Summary

The approved product is:

- an external merchant dashboard
- a storefront shopper widget
- an async backend orchestration layer

Any older references to:

- embedded dashboard auth as canonical
- merchant try-on inside the dashboard as the main workflow
- `user_id` as the tenant root

---

## 14. Hybrid Authentication & Merchant Profiles

**Decision**: Implement a two-path login system (Salla OAuth + Email/Password) and a Merchant Profile management system.

**Context**:
- Merchants installing from Salla need a way to return directly to our dashboard.
- Merchants want to customize their "System Name" (Full Name) independent of their Salla Store name.

**Design**:
- **First-time install**: Salla OAuth creates/links the account and sets a temporary password and initial `full_name`.
- **Profile Page**: Allows updating `full_name` and changing passwords.
- **Audit Logging**: All security-sensitive actions (profile updates, password changes) are logged to the `audit_logs` table.

**Status**: [APPROVED/IMPLEMENTED]

---

## 15. Strict Product Visibility Override

**Decision**: Disabling a product in the dashboard forces it into "hidden" mode even if global settings are different.

**Context**: Merchants need granular control to prevent try-ons on specific items (e.g., accessories, hats) even if they enable Virtual Try-On for the whole store.

**Design**: If a product's visibility is toggled "OFF" in our dashboard, the backend widget config API always returns that product as if it were not enabled, overriding any automated selection logic.

**Status**: [APPROVED/IMPLEMENTED]
