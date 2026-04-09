# Virtual Try-On Execution Plan

**Version:** 2.0
**Date:** 2026-04-05
**Status:** Active Execution Baseline

## Execution Goal

Ship the approved product in this order:

1. merchant installs and authorizes with Salla
2. merchant manages widget behavior from the external dashboard
3. shopper uses the widget on an eligible product page
4. backend creates and processes async try-on jobs
5. result returns to the shopper inside the widget dialog

This plan intentionally centers the storefront shopper flow. The dashboard exists to configure and monitor that flow, not replace it.

---

## Locked Phase Order

| Phase | Name | Status | Purpose |
|---|---|---|---|
| 0 | Project Setup and Infrastructure | Done | Monorepo, shells, env, health, base tooling |
| 1 | Salla Integration and External OAuth | Done | OAuth, token storage, webhook baseline |
| 2 | Merchant Runtime APIs | Done | Auth, products, upload, settings, dashboard-facing APIs |
| 3 | Credits and Async Jobs | Done | Credits, transactions, job creation, refund rules |
| 4 | AI Worker and Storage | Done with external blocker | Replicate worker, Bunny upload, timeout handling |
| 5 | Merchant Dashboard | Done | Merchant admin surfaces consolidated into Unified Studio |
| 6 | Storefront Widget Core | Done | Widget config, upload, job creation, and polling unified |
| 7 | Storefront UX Hardening and Live Validation | Current | Real shopper UX on real product pages |
| 8 | Testing and Security Hardening | Pending | Test coverage, limits, audits, resilience |
| 9 | Launch Preparation | Pending | Production infra, partner setup, go-live readiness |

The order above is canonical. Do not skip ahead to launch work while Phase 7 and Phase 8 are still unstable.

---

## Phase 0 - Project Setup and Infrastructure

### Goal

Create the repo, workspace, shells, and environment baseline.

### Exit Criteria

- workspace layout exists
- API health route exists
- dashboard shell exists
- widget build pipeline exists
- shared env template exists

### Current State

Done.

---

## Phase 1 - Salla Integration and External OAuth

### Goal

Integrate Salla as the authority for merchant installation, OAuth, and lifecycle webhooks.

### Scope

- external Salla OAuth start and callback
- encrypted token storage
- merchant identity bootstrap
- webhook verification
- webhook idempotency
- subscription and install lifecycle handling

### Exit Criteria

- merchant can complete OAuth from the external dashboard
- backend stores encrypted Salla tokens
- webhook handlers are verified and idempotent

### Current State

Done.

---

## Phase 2 - Merchant Runtime APIs

### Goal

Expose the backend APIs the merchant dashboard needs for configuration and monitoring.

### Scope

- `GET /api/auth/me`
- `GET /api/credits`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/upload`
- widget settings read and update APIs

### Exit Criteria

- dashboard can fetch merchant state
- dashboard can list Salla products
- dashboard can read and update widget settings

### Current State

Done.

---

## Phase 3 - Credits and Async Jobs

### Goal

Make try-on usage auditable and safe before any real AI processing happens.

### Scope

- atomic credit checks
- atomic credit deduction
- refund on failure
- `POST /api/jobs`
- `GET /api/jobs`
- `GET /api/jobs/:id`
- `credit_transactions` audit trail

### Exit Criteria

- every job consumes exactly one credit
- failed AI jobs refund correctly
- job state transitions are persisted

### Current State

Done.

Remote migration hardening is still pending from an environment that can reach the direct Postgres host.

---

## Phase 4 - AI Worker and Storage

### Goal

Process try-on jobs asynchronously and return durable result assets.

### Scope

- Replicate job submission
- Replicate polling
- timeout handling
- Bunny result upload
- failure mapping
- refund protection

### Exit Criteria

- worker can move jobs from `pending` to `processing` to `completed` or `failed`
- results land on Bunny
- provider failures do not burn merchant credits

### Current State

Implemented, but live successful completion is externally blocked by the current Replicate account state.

---

## Phase 5 - Merchant Dashboard

### Goal

Provide the merchant with a clean external admin surface.

### Canonical Pages

- overview
- products
- jobs
- credits
- widget settings

### Explicit non-goal

Do not treat the dashboard as the canonical shopper try-on experience.

### Exit Criteria

- merchant can manage eligible products
- merchant can manage widget mode, text, and defaults
- merchant can review jobs and credits

### Current State

Done (Unified Architecture).
- All admin surfaces (Overview, Products, Jobs, Credits, Settings) are synchronized with the shared type system.
- Studio Mode implemented with smooth highlights and consistent spacing.

---

## Phase 6 - Storefront Widget Core

### Goal

Ship the real shopper-facing widget runtime.

### Scope

- lightweight IIFE bundle
- product context detection from Salla storefront pages
- config lookup
- signed widget token handling
- shopper image upload
- widget job creation
- widget job polling

### Exit Criteria

- widget can resolve eligibility for the current product
- widget can submit a shopper-generated try-on job
- widget can poll and display job state

### Current State

Done (Unified Architecture).
- Widget runtime correctly consumes the nested configuration schema.
- Shopper photo upload and async polling are verified technically.

---

## Phase 7 - Storefront UX Hardening and Live Validation

### Goal

Turn the widget from technically functional into a production-safe shopper experience.

### Scope

- stable CTA placement over or near product media when possible
- safe fixed-position fallback when markup is unstable
- immediate dialog open on click
- camera and file-upload entry actions
- preview state before generation
- polished loading and blur state during processing
- shopper-friendly error messaging
- theme-safe style isolation
- validation on real Salla product pages

### Exit Criteria

- CTA is visible and interactive on real product pages
- dialog feels immediate and reliable
- shopper can upload or capture a photo end-to-end
- widget can survive delayed Salla web component hydration
- widget does not visibly damage the storefront layout

### Current State

Current phase.

This is the main open product-delivery task now.

---

## Phase 8 - Testing and Security Hardening

### Goal

Lock down the platform before launch.

### Scope

- unit coverage for credits, webhooks, crypto, and widget helpers
- integration coverage for OAuth, widget job submission, and worker lifecycle
- E2E verification on real storefront pages
- rate-limit validation
- image validation tests
- security header review
- error observability review

### Exit Criteria

- critical backend flows are covered
- widget flow has repeatable real-page verification
- security controls are explicitly checked

### Current State

Pending.

---

## Phase 9 - Launch Preparation

### Goal

Prepare the product for live operation and partner review.

### Scope

- production API and dashboard URLs
- production callback and webhook URLs
- production env and secrets
- Salla partner configuration
- screenshots and listing assets
- monitoring and alerting setup

### Exit Criteria

- production URLs are stable
- Salla partner settings match the live system
- merchant onboarding path is verified

### Current State

Pending.

---

## Current Delivery Truth

The platform is no longer planned as:

- embedded dashboard auth
- dashboard-first try-on
- `user_id`-driven tenancy

The active delivery truth is:

- external merchant dashboard
- storefront shopper widget
- async backend orchestration

---

## Immediate Next Work

The next implementation work should happen in this order:

1. finish Phase 7 storefront widget UX hardening on real Salla product pages
2. validate one real shopper flow on a live enabled product page
3. clear the external Replicate billing blocker and verify one successful completion
4. apply the staged Phase 3 DB hardening migration from a reachable environment
5. then move to Phase 8 testing and security hardening
