# Product Requirements Document (PRD)
# Virtual Try-On — Salla SaaS App

**Version:** 1.0
**Date:** April 2026
**Status:** Draft → Review
**Owner:** Product Team

---

## 1. Executive Summary

Virtual Try-On is a SaaS application integrated with the Salla e-commerce platform that enables online shoppers to virtually try on clothing products using AI-powered image generation. The app serves Salla merchants by adding a "Try It On" button to their product pages, allowing their customers to upload a photo and see how a garment would look on them — all within seconds.

The business model is credit-based: merchants subscribe to a plan through Salla's marketplace, receive a monthly credit allocation, and each virtual try-on attempt consumes one credit. The system is fully multi-tenant, meaning each merchant operates in an isolated environment with their own data, settings, and credit balance.

---

## 2. Problem Statement

Online clothing stores face a persistent challenge: customers cannot physically try on garments before purchasing. This leads to high return rates (averaging 30-40% in fashion e-commerce), low conversion rates on product pages, and reduced customer confidence in purchase decisions.

Existing solutions either require expensive 3D modeling of each garment (impractical for small merchants), or offer generic "size recommendation" tools that don't address the visual fit concern.

**The gap:** There is no affordable, plug-and-play virtual try-on solution available for Salla's 50,000+ merchant ecosystem.

---

## 3. Solution Overview

A Salla-native embedded application that:

- Injects a "Try It On" widget into any product page on the merchant's store
- Accepts a customer photo upload (or camera capture on mobile)
- Uses AI diffusion models to realistically composite the product garment onto the customer's photo
- Returns a high-quality result image within 3-15 seconds
- Manages usage through a credit system tied to Salla's subscription billing

---

## 4. Target Users

### 4.1 Primary: Salla Merchants (B2B)
- **Profile:** Small-to-medium fashion retailers on Salla
- **Pain:** High return rates, low conversion, customers asking "how will this look on me?"
- **Need:** Easy-to-install tool that requires zero technical setup
- **Behavior:** Manages store from Salla Dashboard (Arabic, mobile-heavy)

### 4.2 Secondary: End Customers (B2C)
- **Profile:** Online shoppers browsing clothing products
- **Pain:** Can't visualize how a garment fits their body
- **Need:** Quick, private way to "try on" before buying
- **Behavior:** Mobile-first, Arabic-speaking, expects fast results

---

## 5. User Journeys

### 5.1 Merchant: Installation to First Use

```
1. Merchant discovers app on Salla App Store
2. Clicks "Install" → Salla handles OAuth authorization
3. App receives app.installed + app.store.authorize webhooks
4. Merchant opens app from Salla Dashboard (embedded iframe)
5. Dashboard shows: 10 free credits, widget auto-enabled
6. Merchant visits their store → sees "Try It On" button on products
7. Merchant goes to Dashboard → tries the feature themselves
8. Impressed → upgrades to paid plan for more credits
```

### 5.2 Customer: Widget Try-On Flow

```
1. Customer visits product page on Salla store
2. Sees floating "جرّب الآن" (Try It On) button
3. Clicks → modal opens with upload prompt
4. Uploads photo (or takes camera selfie on mobile)
5. System validates image (person detected, quality ok)
6. Loading animation plays (3-15 seconds)
7. Result appears: before/after comparison slider
8. Customer can download result or try another product
9. Customer proceeds to purchase with higher confidence
```

### 5.3 Merchant: Dashboard Management

```
1. Opens app in Salla Dashboard
2. Home page shows: credit balance, recent jobs, stats
3. Can manually create try-on (select product + upload photo)
4. Views job history with results
5. Checks credit usage and purchases more if needed
6. Configures widget settings (which products, button text)
```

---

## 6. Functional Requirements

### 6.1 Salla Integration

| ID | Requirement | Priority | Salla Mechanism |
|----|-------------|----------|-----------------|
| SI-01 | App installs via Salla App Store | P0 | OAuth 2.0 + app.installed webhook |
| SI-02 | Dashboard embedded inside Salla merchant panel | P0 | Embedded SDK (iframe + postMessage) |
| SI-03 | Authentication via Salla's embedded token introspection | P0 | POST /introspect with S-Source header |
| SI-04 | Handle all app lifecycle webhooks | P0 | 11 webhook events (see Webhook Matrix) |
| SI-05 | Subscription billing through Salla | P0 | Salla Custom Plans + app.subscription.* events |
| SI-06 | Credit purchase via Salla checkout | P1 | embedded.checkout.create() for addons |
| SI-07 | Fetch merchant's products via Salla API | P0 | GET /admin/v2/products with Bearer token |
| SI-08 | Widget injects into Salla storefront | P0 | Script tag in store theme |
| SI-09 | App settings sync with Salla | P2 | app.settings.updated webhook |
| SI-10 | Standalone dev mode for local development | P1 | Mock SDK + fake merchant data |

### 6.2 AI Virtual Try-On Engine

| ID | Requirement | Priority | Details |
|----|-------------|----------|---------|
| AI-01 | Accept human photo + garment image as input | P0 | JPEG/PNG/WebP, max 5MB |
| AI-02 | Support 3 garment categories | P0 | upper_body, lower_body, dresses |
| AI-03 | Return composite result image | P0 | High-quality JPEG, 1024x1024 |
| AI-04 | Process asynchronously (not blocking request) | P0 | Queue-based with polling |
| AI-05 | Complete processing within 15 seconds (p95) | P0 | Target: 3-10s average |
| AI-06 | Handle failures gracefully with credit refund | P0 | Auto-refund on AI error |
| AI-07 | Validate human image quality before processing | P1 | Person detection, min resolution |
| AI-08 | Resize and optimize images before AI processing | P1 | Sharp library, max 1024px |
| AI-09 | Retry transient failures automatically | P1 | Max 3 retries |
| AI-10 | Timeout stuck jobs after 120 seconds | P0 | Mark as failed + refund |

#### AI Model Specification

**Model:** IDM-VTON (via Replicate API)
- **Repository:** cuuupid/idm-vton on Replicate
- **Type:** Diffusion-based virtual try-on
- **Architecture:** Based on Stable Diffusion with specialized garment alignment layers

**How it works (simplified):**
1. **Human parsing:** The model segments the input photo to identify the person's body, pose, and existing clothing regions
2. **Garment warping:** The product image is spatially deformed to match the person's body shape and pose using thin-plate spline transformation
3. **Diffusion rendering:** A diffusion model generates the final composite, blending the warped garment onto the person while preserving skin tone, lighting, and background
4. **Post-processing:** The output is cleaned up for edge artifacts and color consistency

**Input Requirements:**
| Parameter | Specification |
|-----------|--------------|
| human_img | Full body or upper body photo of a person |
| garm_img | Flat lay or product photo of the garment |
| category | "upper_body" or "lower_body" or "dresses" |
| Resolution | 768x1024 recommended (model resizes internally) |

**Output:**
- Single JPEG image with the garment composited onto the person
- Same dimensions as input human image
- Processing time: 3-15 seconds depending on model load

**Limitations (known):**
- Works best with front-facing poses
- Complex patterns (plaids, intricate prints) may distort slightly
- Loose/flowing garments produce better results than tight-fitting ones
- Accessories (hats, bags, shoes) are not supported in v1
- Group photos not supported — single person only

**Fallback strategy:**
- If IDM-VTON becomes unavailable, the system can swap to alternative models (e.g., OOTDiffusion, CatVTON) on Replicate with minimal code changes — only the model identifier and input parameter mapping need updating

### 6.3 Credit System

| ID | Requirement | Priority | Details |
|----|-------------|----------|---------|
| CR-01 | Each try-on attempt costs 1 credit | P0 | Deducted at job creation |
| CR-02 | Credits checked before job creation | P0 | Reject with clear message if insufficient |
| CR-03 | Credits deducted atomically (no race conditions) | P0 | PostgreSQL FOR UPDATE |
| CR-04 | Auto-refund on AI processing failure | P0 | Only AI errors, not user errors |
| CR-05 | Credits reset on subscription renewal | P0 | app.subscription.renewed webhook |
| CR-06 | Credit purchase via Salla checkout | P1 | Addon: "extra-credits-50" |
| CR-07 | Transaction audit trail | P0 | Every debit/credit logged |
| CR-08 | Block new jobs when credits exhausted | P0 | Middleware check |

**Credit Allocation by Plan:**

| Plan | Monthly Credits | Price (Salla) | Target Merchant |
|------|----------------|---------------|-----------------|
| Free | 10 | 0 SAR | Trial/evaluation |
| Trial | 5 | 0 SAR (14 days) | First-time users |
| Basic | 50 | Set in Salla | Small stores |
| Professional | 200 | Set in Salla | Medium stores |
| Enterprise | 1,000 | Set in Salla | Large stores |

### 6.4 Dashboard (Merchant-Facing)

| ID | Requirement | Priority | Details |
|----|-------------|----------|---------|
| DA-01 | Home page with credit balance + stats + recent jobs | P0 | |
| DA-02 | Try-on wizard: product selection → photo upload → result | P0 | Multi-step form |
| DA-03 | Job history with filters and result viewing | P0 | Paginated, filterable |
| DA-04 | Credit balance page with usage chart and transactions | P0 | |
| DA-05 | Settings page for widget configuration | P1 | |
| DA-06 | Arabic RTL layout | P0 | Primary language |
| DA-07 | Dark/light mode synced with Salla | P1 | Via Salla theme detection |
| DA-08 | Mobile responsive | P0 | Merchants use mobile dashboard |
| DA-09 | Real-time job status updates | P1 | Via Supabase Realtime |
| DA-10 | Before/after comparison slider for results | P0 | |

### 6.5 Storefront Widget

| ID | Requirement | Priority | Details |
|----|-------------|----------|---------|
| WI-01 | Floating "Try It On" button on product pages | P0 | |
| WI-02 | Photo upload modal with camera support | P0 | Mobile camera API |
| WI-03 | Loading animation during processing | P0 | |
| WI-04 | Result display with before/after | P0 | |
| WI-05 | Download result button | P1 | |
| WI-06 | Error handling with retry | P0 | |
| WI-07 | Configurable: all products vs. selected products | P1 | Via merchant settings |
| WI-08 | Customizable button text | P2 | |
| WI-09 | Bundle size < 50KB gzipped | P0 | Performance requirement |
| WI-10 | Zero impact on store page load time | P0 | Lazy loaded, non-blocking |
| WI-11 | Scoped CSS (no style leaks) | P0 | |
| WI-12 | RTL support | P0 | |

---

## 7. Non-Functional Requirements

### 7.1 Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| API response time (p95) | < 200ms | Excluding AI processing |
| AI processing time (p95) | < 15 seconds | End-to-end including upload |
| Dashboard initial load | < 2 seconds | First contentful paint |
| Widget bundle size | < 50KB gzipped | |
| Widget injection time | < 100ms | Time to render button |
| Image upload time | < 3 seconds | For 5MB image |
| Concurrent job processing | 20 jobs/minute | Per instance |

### 7.2 Reliability

| Metric | Target |
|--------|--------|
| API uptime | 99.5% |
| Webhook processing success rate | 99.9% (with retries) |
| Job completion rate | > 90% (AI model dependent) |
| Data durability | 99.99% (Supabase managed) |

### 7.3 Security

| Requirement | Implementation |
|-------------|---------------|
| Token encryption at rest | AES-256-GCM |
| Webhook signature verification | HMAC-SHA256 + timing-safe comparison |
| Rate limiting | 100 req/min API, 10 req/min widget |
| CORS restrictions | Salla domains + app domain only |
| Image validation | Magic bytes + type + size checks |
| No frontend token storage | Session JWT only, server-managed |
| Signed URLs for images | 15-minute expiry |
| Input sanitization | Zod validation on all endpoints |

### 7.4 Scalability

The architecture is designed for horizontal scaling:
- **Stateless API:** Any instance can handle any request
- **Database-driven queue:** No external message broker dependency
- **CDN-served static assets:** Widget and images served from edge
- **Supabase connection pooling:** Handles concurrent DB connections

### 7.5 Localization

| Language | Scope | Priority |
|----------|-------|----------|
| Arabic (RTL) | Dashboard + Widget + Error messages | P0 |
| English | Dashboard + Widget | P1 |

---

## 8. Data Architecture

### 8.1 Entity Relationship Summary

```
MERCHANTS (1) ←──── (1) CREDITS
    │
    ├──── (N) TRYON_JOBS ────── (N) CREDIT_TRANSACTIONS
    │
    └──── (N) CREDIT_TRANSACTIONS

WEBHOOK_EVENTS (standalone — idempotency store)
```

### 8.2 Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| UUID primary keys | No sequential ID leakage, safe for multi-tenant |
| merchant_id (not email) as identity | Salla's introspect returns merchant_id; email can change |
| Encrypted token storage | Salla access/refresh tokens are sensitive credentials |
| Soft delete for uninstalls | Merchant may reinstall; preserve history |
| JSONB settings column | Flexible schema for widget configuration |
| Separate credits table | Atomic operations easier with dedicated row lock |
| Credit transactions audit | Complete history for billing disputes and debugging |
| Webhook events table | Idempotency — prevent double-processing |
| Database-driven job queue | Simpler than Redis/BullMQ for MVP; Supabase already available |

### 8.3 Row Level Security

All tables have RLS enabled. The API backend uses Supabase's service role key (bypasses RLS) for all operations. If client-side Supabase access is ever added (e.g., Realtime subscriptions), RLS policies must be added per-merchant.

---

## 9. Integration Architecture

### 9.1 External Services

| Service | Purpose | SLA Dependency | Fallback |
|---------|---------|----------------|----------|
| Salla API | Product data, merchant info | High | Cache products for 5 min |
| Salla Embedded SDK | Dashboard auth + UI modules | High | Standalone dev mode |
| Replicate API | AI model inference | Critical | Retry 3x + queue retry |
| Bunny.net Storage | Image upload and storage | High | Images cached at CDN edge |
| Bunny.net CDN | Image delivery | High | Multiple PoPs, auto-failover |
| Supabase | Database + Realtime | Critical | Managed service with backups |

### 9.2 Salla Webhook Matrix

| Event | Trigger | Our Action | Idempotent |
|-------|---------|------------|------------|
| app.installed | Merchant installs app | Create merchant + 10 free credits | Yes (upsert) |
| app.store.authorize | OAuth grant | Store encrypted tokens | Yes (overwrite) |
| app.uninstalled | Merchant removes app | Soft delete + cancel pending jobs | Yes |
| app.subscription.started | Paid plan activated | Set plan + credit quota | Yes |
| app.subscription.renewed | Monthly renewal | Reset used_credits to 0 | Yes |
| app.subscription.canceled | Plan canceled | Set plan_status inactive | Yes |
| app.subscription.expired | Plan expired | Set plan_status inactive | Yes |
| app.trial.started | Trial begins | Set plan=trial + 5 credits | Yes |
| app.trial.expired | Trial ends | Set plan_status inactive | Yes |
| app.trial.canceled | Trial canceled | Set plan_status inactive | Yes |
| app.settings.updated | Merchant changes settings | Sync settings JSONB | Yes |

### 9.3 Salla Embedded SDK Usage

| Module | Method | Our Usage |
|--------|--------|-----------|
| Core | embedded.init() | Initialize SDK connection |
| Core | embedded.ready() | Signal app loaded successfully |
| Core | embedded.destroy() | Cleanup on auth failure |
| Auth | embedded.auth.getToken() | Get session token from URL |
| Auth | embedded.auth.refresh() | Refresh expired token |
| Page | embedded.page.resize() | Auto-resize iframe height |
| Page | embedded.page.setTitle() | Set page title in Salla nav |
| UI | embedded.ui.toast() | Show success/error notifications |
| UI | embedded.ui.loading() | Show/hide loading overlay |
| Checkout | embedded.checkout.create() | Purchase credit addons |
| Checkout | embedded.checkout.onResult() | Handle purchase result |

---

## 10. AI Model Deep Dive

### 10.1 Model Selection Rationale

| Criteria | IDM-VTON | OOTDiffusion | CatVTON |
|----------|----------|--------------|---------|
| Quality | High | Medium-High | Medium |
| Speed | 5-12s | 8-15s | 3-8s |
| Categories | 3 (upper, lower, dress) | 2 (upper, lower) | 3 |
| Replicate available | Yes | Yes | Yes |
| Pose tolerance | Good | Medium | Good |
| Cost per run | ~$0.01-0.03 | ~$0.01-0.02 | ~$0.01 |

**Decision:** IDM-VTON for best quality-to-speed ratio. The model is well-established on Replicate with reliable availability.

### 10.2 Processing Pipeline

```
Input Validation
├── Is it an image? (magic bytes check)
├── Is file size < 5MB?
├── Is resolution >= 256x256?
└── Basic person detection (optional v2)

Image Preprocessing (Sharp)
├── Convert to JPEG
├── Resize to max 1024x1024 (maintain aspect ratio)
├── Strip EXIF data (privacy)
└── Upload to Bunny CDN

AI Inference (Replicate)
├── Submit prediction with human_img + garm_img + category
├── Poll every 3 seconds for status
├── Timeout after 120 seconds
├── On success: download output URL
└── On failure: log error, trigger refund

Result Processing
├── Download result from Replicate's temporary URL
├── Upload to Bunny CDN (permanent storage)
├── Generate CDN URL for delivery
└── Update job record with result URL

Delivery
├── Dashboard: Supabase Realtime push
└── Widget: Client polling every 3 seconds
```

### 10.3 Cost Model

| Item | Cost | Notes |
|------|------|-------|
| Replicate inference | ~$0.02/run | IDM-VTON average |
| Bunny storage | $0.01/GB/month | ~100KB per result image |
| Bunny CDN transfer | $0.01/GB | First 1TB included |
| Supabase DB | $25/month (Pro) | Includes 8GB, connection pooling |
| **Cost per try-on** | **~$0.02-0.03** | Dominated by Replicate |

**Margin analysis:** If Basic plan (50 credits) costs 29 SAR (~$7.70), cost per credit to us is ~$0.03, revenue per credit is ~$0.15. Healthy 5x margin.

---

## 11. Widget Technical Specification

### 11.1 Injection Method

The widget is a single JavaScript file loaded via a script tag in the merchant's Salla store theme:

```html
<script src="https://cdn.virtual-tryon.com/widget.v1.min.js" 
        data-merchant-id="MERCHANT_SALLA_ID" 
        async defer></script>
```

### 11.2 Widget Behavior State Machine

```
IDLE → LOADING_CONFIG → READY → UPLOAD → PROCESSING → RESULT
                          ↑                               │
                          └───────────── RETRY ←──────────┘
                          
LOADING_CONFIG → DISABLED (if widget disabled or product not enabled)
PROCESSING → ERROR (on failure) → RETRY → UPLOAD
```

### 11.3 Widget Configuration Check

On page load, the widget calls `GET /api/widget/config/:merchantId` which returns:

```json
{
  "enabled": true,
  "mode": "all",
  "products": [],
  "buttonText": "جرّب الآن",
  "defaultCategory": "upper_body"
}
```

If `mode` is "selected" and the current product ID is not in `products`, the widget does not render.

### 11.4 Privacy Considerations

- User photos are uploaded to Bunny CDN under the merchant's folder
- Photos are processed by Replicate (third-party) — their privacy policy applies
- Result images are stored for 30 days then auto-deleted
- No user identification is stored — photos are anonymous
- EXIF data is stripped before upload
- Widget does not use cookies or tracking

---

## 12. Success Metrics

### 12.1 Business Metrics

| Metric | Target (3 months) | Target (6 months) |
|--------|-------------------|-------------------|
| Merchants installed | 100 | 500 |
| Paid subscribers | 20 | 100 |
| Monthly try-on jobs | 5,000 | 25,000 |
| MRR (Monthly Recurring Revenue) | $1,500 | $7,500 |
| Churn rate | < 10% | < 8% |

### 12.2 Product Metrics

| Metric | Target |
|--------|--------|
| Widget click-through rate | > 5% of product page visitors |
| Try-on completion rate | > 70% of uploads |
| Customer satisfaction (result quality) | > 4.0/5.0 |
| Average processing time | < 10 seconds |
| Job failure rate | < 10% |

### 12.3 Technical Metrics

| Metric | Target |
|--------|--------|
| API uptime | > 99.5% |
| Webhook processing latency | < 1 second |
| Dashboard load time (FCP) | < 2 seconds |
| Widget load impact on store | < 50ms |
| Credit system accuracy | 100% (zero unaccounted transactions) |

---

## 13. Risks and Mitigations

| # | Risk | Probability | Impact | Mitigation |
|---|------|------------|--------|------------|
| 1 | Replicate model unavailability | Low | Critical | Retry logic + alternative model fallback |
| 2 | Poor AI quality on certain garments | Medium | High | Quality scoring + user feedback + category restrictions |
| 3 | Salla webhook delivery failure | Low | High | Idempotency + dead letter queue + manual sync |
| 4 | Credit race conditions | Low | High | Atomic PostgreSQL operations (FOR UPDATE) |
| 5 | Widget performance impact on stores | Medium | High | < 50KB bundle + lazy loading + async |
| 6 | High storage costs at scale | Medium | Medium | 30-day auto-cleanup + image optimization |
| 7 | Salla API rate limiting | Medium | Medium | Caching + backoff + rate limit awareness |
| 8 | Privacy concerns with user photos | Medium | High | EXIF stripping + auto-deletion + no tracking |
| 9 | Model cost increase at scale | Low | Medium | Monitor per-job cost + explore self-hosted models |
| 10 | Arabic RTL rendering issues | Medium | Medium | Thorough RTL testing + Salla design guidelines |

---

## 14. Out of Scope (v1)

| Feature | Reason | Potential v2 |
|---------|--------|-------------|
| Video try-on | Complexity + cost | If demand exists |
| Accessories (shoes, bags, hats) | Model limitation | When models support it |
| Multi-person photos | Model limitation | Not planned |
| AR (augmented reality) live view | Requires mobile app | Possible future |
| Custom AI model training | Cost + complexity | For enterprise tier |
| Non-Salla platforms | Focus on Salla first | Shopify, Zid later |
| Analytics dashboard for merchants | MVP scope | v2 with detailed insights |
| Bulk try-on (multiple products at once) | UX complexity | If merchants request |

---

## 15. Timeline

| Week | Phase | Deliverable |
|------|-------|-------------|
| 1 | Setup + Salla Auth | Working monorepo + embedded auth + webhook processing |
| 2 | Core API + Credits | All REST endpoints + credit system + image upload |
| 3 | AI Pipeline + Jobs | Replicate integration + job processor + realtime updates |
| 4 | Dashboard | All 5 pages with full functionality |
| 5 | Widget + Testing + Deploy | Storefront widget + security hardening + Salla App Store |

**Total: 5 weeks to MVP launch**

---

## 16. Appendices

### Appendix A: Environment Variables

```
SALLA_CLIENT_ID, SALLA_CLIENT_SECRET, SALLA_WEBHOOK_SECRET, SALLA_APP_ID
SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY
REPLICATE_API_TOKEN
BUNNY_STORAGE_ZONE, BUNNY_API_KEY, BUNNY_CDN_URL
APP_URL, API_URL, JWT_SECRET, ENCRYPTION_KEY, NODE_ENV, PORT
```

### Appendix B: Salla Documentation References

- OAuth and Auth: https://docs.salla.dev/doc-421118
- Embedded App SDK: https://docs.salla.dev/embedded-sdk/authentication
- App Events: https://docs.salla.dev/421413m0
- Merchant API: https://docs.salla.dev/426392m0
- Checkout Module: https://docs.salla.dev/embedded-sdk/modules/checkout/create

### Appendix C: API Endpoints Summary

16 endpoints across 6 groups: Auth (2), Webhooks (1), Jobs (3), Credits (1), Products (2), Upload (1), Widget (3), System (1).

See Execution Plan for full route table.
