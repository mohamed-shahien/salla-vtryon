# Product Requirements Document
# Virtual Try-On for Salla

**Version:** 2.0
**Date:** 2026-04-05
**Status:** Active Source of Truth
**Owner:** Product + Engineering

---

## 1. Executive Summary

Virtual Try-On for Salla is a multi-tenant SaaS product for fashion merchants on Salla.

The product has two distinct surfaces:

- an **external React dashboard** for the merchant
- a **storefront widget** for the shopper on product pages

The merchant installs the app, authorizes it with Salla, manages credits and widget settings, and decides which products are eligible for try-on.

The shopper sees a "Try Now" CTA on an eligible product page, opens a lightweight dialog, captures or uploads a photo, and receives an AI-generated try-on result inside the same dialog.

Credits belong to the merchant account. Each try-on attempt consumes one credit. AI jobs run asynchronously and refunds happen automatically on AI failure.

---

## 2. Problem Statement

Fashion merchants on Salla lose conversions because shoppers cannot visualize how a garment may look on them before purchase.

The missing capability is not another merchant admin tool. The missing capability is a **shopper-facing product-page experience** that:

- appears where purchase intent already exists
- works well on mobile
- requires no app install from the shopper
- finishes in seconds
- does not damage storefront performance or theme stability

---

## 3. Product Definition

### Merchant outcome

The merchant can:

- install and authorize the app through Salla
- access an external dashboard
- review credits and recent jobs
- control widget enablement
- choose whether the widget is available on all products or selected products only
- manage button text and default category

### Shopper outcome

The shopper can:

- open an eligible product page
- see a try-on CTA placed over or near the product media area
- open a modal dialog immediately
- choose camera capture or file upload
- preview the selected image
- submit the try-on request
- see a polished loading state while AI processing runs
- receive the result in the same dialog

---

## 4. Target Users

### Primary user: Merchant

- Salla fashion merchant
- cares about conversions, returns, and app simplicity
- uses the dashboard to configure the experience and monitor usage

### Secondary user: Shopper

- browsing product pages on the merchant storefront
- mobile-first behavior is common
- wants a fast, private, low-friction try-on flow

---

## 5. Canonical User Journeys

### 5.1 Merchant install and setup

1. Merchant installs the app from Salla.
2. Merchant authorizes access through Salla OAuth.
3. Backend receives lifecycle webhooks and stores encrypted tokens.
4. Merchant opens the external dashboard.
5. Merchant reviews credits and widget settings.
6. Merchant keeps widget mode as `all` or switches to `selected`.
7. Merchant enables specific products if needed.

### 5.2 Merchant daily operations

1. Merchant opens the dashboard.
2. Merchant sees overview, credits, jobs, products, and widget settings.
3. Merchant checks remaining credits.
4. Merchant reviews failed and completed jobs.
5. Merchant updates enabled products or button text.

### 2.2 Dashboard (Merchant Interface)
- **External Login**: Merchants can log in via Salla OAuth (primary) or Email/Password (secondary for returning access).
- **Merchant Profile**: Manage display name and security settings (password update).
- **Product Management**:
    - List all products from Salla.
    - Toggle Virtual Try-On per product.
    - **Visibility Logic**: Disabling a product manually forces the widget into `selected` mode for that product, ensuring it remains hidden regardless of global settings.

### 5.3 Shopper try-on flow

1. Shopper lands on a product page.
2. Widget loads without blocking the store.
3. Widget resolves merchant config and current product context.
4. CTA appears on or near the product media area.
5. Shopper clicks CTA.
6. Dialog opens immediately.
7. Shopper chooses:
   - `Take Photo`
   - `Upload Photo`
8. Shopper sees a preview and chooses a category if needed.
9. Shopper presses `Generate`.
10. Widget sends:
   - shopper image
   - current product image
   - product id
   - category
11. Backend creates an async job and deducts one credit atomically.
12. Widget shows a polished processing state.
13. On success, result appears in the same dialog.
14. On AI failure, shopper sees a clean retry-friendly message and the merchant credit is refunded.

---

## 6. Functional Requirements

### 6.1 Salla integration

| ID | Requirement | Priority |
|----|-------------|----------|
| SI-01 | App installation and authorization happen through Salla | P0 |
| SI-02 | Merchant auth for the dashboard uses external Salla OAuth, not embedded auth | P0 |
| SI-03 | Backend stores encrypted Salla access and refresh tokens server-side only | P0 |
| SI-04 | Backend handles Salla lifecycle webhooks with signature verification and idempotency | P0 |
| SI-05 | Merchant product data is fetched from Salla Admin API | P0 |
| SI-06 | Salla subscription events update plan and credit state | P0 |

### 6.2 Merchant dashboard

| ID | Requirement | Priority |
|----|-------------|----------|
| DA-01 | External dashboard shows overview, products, jobs, credits, and widget settings | P0 |
| DA-02 | Dashboard does not host the canonical shopper try-on flow | P0 |
| DA-03 | Merchant can enable widget globally or only for selected products | P0 |
| DA-04 | Merchant can customize widget button text and default category | P0 |
| DA-05 | Merchant can review job history and failures | P0 |
| DA-06 | Merchant can review credits and transactions | P0 |

### 6.3 Storefront widget

| ID | Requirement | Priority |
|----|-------------|----------|
| WI-01 | Widget runs as a lightweight vanilla JS bundle | P0 |
| WI-02 | Widget is isolated from the storefront theme and CSS | P0 |
| WI-03 | CTA appears over or near the product media area when possible | P0 |
| WI-04 | CTA falls back to a stable fixed position if page markup is unstable | P0 |
| WI-05 | Dialog opens immediately when the shopper clicks the CTA | P0 |
| WI-06 | Dialog offers both camera capture and file upload | P0 |
| WI-07 | Dialog shows image preview before generation | P0 |
| WI-08 | Dialog shows a polished loading state during async processing | P0 |
| WI-09 | Result is shown in the same dialog with retry and download actions | P0 |
| WI-10 | Widget only renders for eligible products | P0 |
| WI-11 | Widget handles missing product context and disabled products gracefully | P0 |

### 6.4 Jobs, AI, and credits

| ID | Requirement | Priority |
|----|-------------|----------|
| JC-01 | Each try-on attempt costs 1 credit | P0 |
| JC-02 | Credits are checked before job creation | P0 |
| JC-03 | Credit deduction is atomic | P0 |
| JC-04 | Credit is refunded automatically on AI failure | P0 |
| JC-05 | Jobs run asynchronously | P0 |
| JC-06 | Result image is stored on Bunny and returned to the widget | P0 |
| JC-07 | Shopper-facing errors must be clean even if backend or provider errors are noisy | P0 |

---

## 7. Canonical Widget UX Contract

The storefront widget is not a hidden technical script. It is a first-class shopper experience.

### Placement

- Preferred placement: anchored over or near product media
- Safe fallback: fixed CTA in the viewport

### Interaction contract

- CTA is visible and tappable
- Dialog opens on first click
- Product config can finish loading inside the dialog
- Shopper does not need to leave the product page

### Visual contract

- isolated styles
- RTL-safe
- mobile-friendly
- minimal theme interference
- polished motion and focus states
- blur/processing overlay during generation

### Failure contract

- disabled product -> clear message
- missing product context -> clear message
- throttled AI provider -> shopper-friendly retry message
- no raw provider payloads in the primary UI

---

## 8. Non-Functional Requirements

### Performance

- Widget must be non-blocking for the storefront
- Widget bundle should remain small and practical for storefront use
- Job processing remains async and outside request/response time

### Security

- merchant tenancy is keyed by `merchant_id` / `salla_merchant_id`
- do not use email as tenant identity
- do not use `user_id` as the merchant tenant key
- widget requests use signed widget tokens
- dashboard auth uses server-side Salla OAuth handling plus short-lived server session
- Salla tokens remain server-side only

### Reliability

- webhook handling must be idempotent
- credit accounting must be auditable
- AI failures must not silently burn merchant credits

### Compatibility

- widget must tolerate delayed Salla web component hydration
- widget must tolerate theme CSS conflicts
- widget must degrade safely when markup is unstable

---

## 9. Success Criteria

### Merchant success

- merchant can authorize the app and access the dashboard
- merchant can enable the widget for target products
- merchant can understand credit balance and job history

### Shopper success

- shopper sees the CTA on an eligible product page
- shopper can upload or capture a photo without friction
- shopper receives a result in the same dialog when AI succeeds

### System success

- every job is traceable
- every credit movement is traceable
- storefront widget does not damage store performance or layout

---

## 10. Out of Scope for Current MVP

- embedded merchant dashboard as the primary admin surface
- merchant selfie try-on as the canonical dashboard workflow
- shopper accounts or shopper identity persistence
- accessories, shoes, bags, or multi-person try-on
- custom AI training
- non-Salla platforms

---

## 11. Canonical Product Summary

This product is now defined as:

- **Merchant dashboard outside Salla iframe**
- **Shopper try-on inside a storefront widget**
- **Async backend orchestration for jobs, credits, AI, and storage**

Any older doc section that still describes:

- embedded dashboard auth as canonical
- merchant try-on inside the dashboard as the main use case
- `user_id` as tenant identity

should be treated as superseded by this PRD.
