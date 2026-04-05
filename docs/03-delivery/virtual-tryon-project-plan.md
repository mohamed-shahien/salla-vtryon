# Virtual Try-On Project Plan

**Version:** 2.0
**Date:** 2026-04-05
**Status:** Active Project Plan

## Project Goal

Build a Salla app where:

- the merchant uses an external dashboard to control the feature
- the shopper uses a storefront widget on the product page
- the backend manages credits, jobs, AI processing, and result delivery

---

## Canonical Product Breakdown

### Merchant dashboard

The dashboard exists for:

- overview
- eligible products
- widget settings
- jobs monitoring
- credits monitoring

### Shopper widget

The widget exists for:

- opening from the product page
- capturing or uploading a shopper image
- sending a try-on request
- waiting for async processing
- showing the final result inside the same dialog

### Backend

The backend exists for:

- Salla OAuth and webhooks
- product proxying
- widget configuration
- credits and job audit
- Replicate orchestration
- Bunny storage

---

## Phase Board

| Phase | Name | Status | Exit Gate |
|---|---|---|---|
| 0 | Setup and Infra | Done | Repo, shells, env, health, build pipeline |
| 1 | Salla OAuth and Webhooks | Done | Merchant auth works and webhooks are verified |
| 2 | Merchant APIs | Done | Dashboard can read merchant state, products, and settings |
| 3 | Credits and Jobs | Done | Job lifecycle and refunds are auditable |
| 4 | AI Worker and Storage | Done with external blocker | Worker is wired, external provider still blocks success path |
| 5 | Merchant Dashboard | In progress | Merchant admin surfaces are usable and aligned |
| 6 | Storefront Widget Core | In progress | Widget can create and poll jobs |
| 7 | Storefront UX Hardening | Current | Widget feels reliable on real Salla product pages |
| 8 | Test and Security Hardening | Pending | Critical flows are verified and hardened |
| 9 | Launch Readiness | Pending | Production setup and partner submission are complete |

---

## What Is Already Locked

- stack remains unchanged
- dashboard remains external
- shopper try-on remains widget-first
- tenant identity remains `merchant_id` / `salla_merchant_id`
- credits remain atomic and refundable
- AI remains asynchronous

---

## Current Working Baseline

### Implemented

- external Salla OAuth
- webhook verification and lifecycle handling
- encrypted Salla token storage
- merchant APIs for auth, products, credits, jobs, uploads, and widget settings
- async job worker with refund handling
- merchant dashboard pages for overview, products, jobs, credits, and settings
- public widget config and widget job APIs

### Not yet fully closed

- production-grade storefront widget UX on real Salla pages
- one verified successful AI completion with the current Replicate account
- remote application of the staged DB hardening migration

---

## Immediate Sprint Focus

### Sprint objective

Finish the real shopper experience, not just the backend plumbing.

### Must complete next

1. make the widget CTA consistently visible and interactive on real product pages
2. make the dialog feel immediate and polished
3. confirm shopper image capture or upload works cleanly
4. confirm product media extraction is reliable
5. validate job submission, polling, and result rendering from the widget
6. clear the Replicate billing blocker and verify a successful completion

### Must not drift into

- embedded admin flows
- dashboard-first shopper upload
- tenant identity changes
- stack changes

---

## Acceptance Gates By Surface

### Merchant dashboard gate

The merchant can:

- log in via Salla OAuth
- manage eligible products
- manage widget settings
- review jobs
- review credits

### Shopper widget gate

The shopper can:

- see a clear CTA on an eligible product page
- open the dialog on first click
- choose camera or upload
- preview the selected image
- generate a try-on request
- receive success or failure feedback without raw provider noise

### Backend gate

The system can:

- verify webhooks
- protect tenant boundaries
- deduct and refund credits correctly
- process jobs asynchronously
- store result assets on Bunny

---

## External Dependencies Still Blocking Full Closure

- Replicate billing and payment method on the active account
- remote database connectivity for applying the staged hardening migration from a reachable environment

---

## Next Recommended Task

Finish Phase 7 by validating the shopper widget on a real enabled Salla product page, then run one successful end-to-end AI completion after the Replicate account is funded.
