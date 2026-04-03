# Virtual Try-On Project Plan
# 🚀 Virtual Try-On — Project Master Plan

## مُتحقق من Salla Docs ✅

كل الخطوات اللي في الخطة دي متبنية على Salla Developer Documentation الرسمي:
- Embedded SDK Authentication (Trust-but-Verify model)
- App Events (webhooks with payloads)
- Checkout Module (addon purchases)
- Merchant API (Products, Settings, etc.)
- Embedded SDK Modules (Auth, Page, UI, Nav, Checkout)

---

## 📋 Project Phases Overview

| Phase | الاسم | المدة المقدرة | التبعيات |
|-------|-------|--------------|----------|
| 0 | Project Setup & Infrastructure | 2 أيام | — |
| 1 | Salla Integration (Auth + Webhooks) | 3 أيام | Phase 0 |
| 2 | Database Schema & Core API | 2 أيام | Phase 0 |
| 3 | Credit System | 1.5 يوم | Phase 2 |
| 4 | AI Pipeline (Replicate + Bunny) | 3 أيام | Phase 2 |
| 5 | Job Processing Engine | 2 أيام | Phase 3 + 4 |
| 6 | Merchant Dashboard (React) | 4 أيام | Phase 1 + 5 |
| 7 | Storefront Widget | 2.5 يوم | Phase 5 |
| 8 | Testing & Security Hardening | 2 أيام | All |
| 9 | Deploy & Go Live | 1.5 يوم | Phase 8 |

**المجموع التقديري: ~23 يوم عمل (4-5 أسابيع)**

---

## Phase 0: Project Setup & Infrastructure

### 0.1 — Monorepo Setup
- [ ] Initialize monorepo with npm workspaces
- [ ] Create folder structure: `apps/api`, `apps/dashboard`, `apps/widget`, `supabase/`
- [ ] Setup root `package.json` with workspace config
- [ ] Add shared `.env.example` with all required keys

### 0.2 — Backend Bootstrap (Express)
- [ ] Init `apps/api` with Express 5
- [ ] Setup folder structure: `config/`, `middleware/`, `routes/`, `services/`, `jobs/`, `utils/`
- [ ] Configure environment variables loader (dotenv)
- [ ] Setup Supabase client (`@supabase/supabase-js`)
- [ ] Setup Replicate client (`replicate`)
- [ ] Setup CORS, Helmet, compression, morgan logger
- [ ] Setup global error handler middleware
- [ ] Create health check endpoint `GET /health`

### 0.3 — Frontend Bootstrap (React 19)
- [ ] Init `apps/dashboard` with Vite + React 19
- [ ] Install and configure Tailwind CSS 4
- [ ] Install and configure shadcn/ui (with RTL support)
- [ ] Setup folder structure: `components/`, `pages/`, `hooks/`, `lib/`, `stores/`
- [ ] Install Salla Embedded SDK: `@anthropic/salla-embedded-sdk` (or CDN script)
- [ ] Setup Zustand for state management
- [ ] Setup React Router v7
- [ ] Configure Vite proxy for API calls in development

### 0.4 — Supabase Setup
- [ ] Create Supabase project (if not exists)
- [ ] Enable Row Level Security on all tables
- [ ] Setup migration tooling (`supabase/migrations/`)
- [ ] Configure connection pooling (for production)

**Deliverable:** Running monorepo with empty but working API + Dashboard + Supabase connected

---

## Phase 1: Salla Integration (Auth + Webhooks)

### 1.1 — Embedded App Authentication
**مرجع:** https://docs.salla.dev/embedded-sdk/authentication

- [ ] Create `hooks/useSalla.js` — Initialize Embedded SDK
  ```
  embedded.init() → embedded.auth.getToken() → send to backend → embedded.ready()
  ```
- [ ] Create `POST /api/auth/verify` endpoint
  - Receive token from frontend
  - Call Salla Introspect API: `POST https://api.salla.dev/exchange-authority/v1/introspect`
  - Header: `S-Source: {APP_ID}`
  - Extract `merchant_id`, `user_id`, `exp`
  - Create/update merchant in DB
  - Return session JWT (short-lived, 1hr)
- [ ] Create auth middleware that validates session JWT
- [ ] Handle token refresh flow: catch 401 → `embedded.auth.refresh()` → re-verify
- [ ] Create `embedded.ready()` call after successful auth
- [ ] Create `embedded.destroy()` call on auth failure

### 1.2 — Webhook Handler
**مرجع:** https://docs.salla.dev/421413m0

- [ ] Create `POST /webhooks/salla` endpoint (NO auth middleware — uses signature)
- [ ] Implement webhook signature verification middleware:
  ```javascript
  const crypto = require('crypto');
  const verify = (payload, signature, secret) => {
    const hash = crypto.createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  };
  ```
- [ ] Implement idempotency check (store event in `webhook_events` table, skip if exists)
- [ ] Handle each event:

#### app.installed
```javascript
// Payload: { event, merchant, data: { id, app_name, installation_date, store_type } }
→ Create merchant record (salla_merchant_id = payload.merchant)
→ Create credits record (free tier: 10 credits)
→ Log event
```

#### app.store.authorize
```javascript
// Payload: { data: { access_token, refresh_token, expires, scope } }
→ Encrypt tokens (AES-256-GCM)
→ Update merchant: access_token_encrypted, refresh_token_encrypted, token_expires_at
```

#### app.uninstalled
```javascript
→ Soft-delete: set is_active = false, uninstalled_at = now()
→ Cancel any pending jobs
→ Do NOT delete data (merchant might reinstall)
```

#### app.subscription.started
```javascript
// Payload: { data: { plan_name, start_date, expiry_date } }
→ Update merchant plan + plan_status = 'active'
→ Set credits based on plan tier
```

#### app.subscription.renewed
```javascript
→ Reset used_credits to 0
→ Update reset_at timestamp
```

#### app.subscription.canceled / expired
```javascript
→ Set plan_status = 'inactive'
→ Block new job creation (check in job creation endpoint)
```

#### app.trial.started / expired
```javascript
→ Handle trial state (limited credits)
```

#### app.settings.updated
```javascript
→ Sync settings to merchant.settings JSONB
```

### 1.3 — Salla API Service
- [ ] Create `services/salla.service.js`
  - `getProducts(merchantId)` — Fetch merchant products
  - `getProduct(merchantId, productId)` — Fetch single product with images
  - `refreshToken(merchantId)` — Use refresh_token to get new access_token
  - Handle token expiry: auto-refresh before API calls
  - Respect rate limits (check `X-RateLimit-*` headers)

**Deliverable:** Working auth flow from Salla → Dashboard → Backend + All webhooks processed

---

## Phase 2: Database Schema & Core API

### 2.1 — Database Migrations
- [ ] Create migration `001_initial_schema.sql` with all tables (see SKILL.md)
- [ ] Create migration `002_rls_policies.sql` — RLS policies for multi-tenant isolation
- [ ] Create migration `003_indexes.sql` — Performance indexes
- [ ] Create migration `004_functions.sql` — Helper functions:
  - `deduct_credit(merchant_uuid)` — Atomic credit deduction
  - `refund_credit(merchant_uuid, job_uuid)` — Refund on failure
  - `check_credits(merchant_uuid)` — Returns available credits count
- [ ] Run migrations and verify

### 2.2 — Core API Endpoints
- [ ] `GET /api/merchants/me` — Get current merchant (from JWT session)
- [ ] `GET /api/credits` — Get credit balance and history
- [ ] `POST /api/jobs` — Create try-on job (validates credits first)
- [ ] `GET /api/jobs` — List jobs with pagination + filters (status, date)
- [ ] `GET /api/jobs/:id` — Get single job with result
- [ ] `GET /api/products` — Proxy to Salla Products API (cached)
- [ ] Add request validation middleware (Joi or Zod)

### 2.3 — Image Upload Flow
- [ ] `POST /api/upload` — Handle user image upload
  - Validate: image type (jpg, png, webp), size (< 5MB), dimensions
  - Generate unique filename: `{merchantId}/{uuid}.{ext}`
  - Upload to Bunny Storage
  - Return CDN URL
  - Set signed URL expiry for temporary access

**Deliverable:** Full CRUD API + Database ready + Image upload working

---

## Phase 3: Credit System

### 3.1 — Credit Service
- [ ] Create `services/credits.service.js`
  - `getBalance(merchantId)` — Read from credits table
  - `hasCredits(merchantId)` — Boolean check (total - used > 0)
  - `deductCredit(merchantId, jobId)` — Atomic deduction + transaction log
  - `refundCredit(merchantId, jobId)` — Refund + transaction log
  - `resetCredits(merchantId, newTotal)` — On subscription renewal
  - `addCredits(merchantId, amount, reason)` — Manual top-up / purchase

### 3.2 — Credit Check Middleware
- [ ] Create middleware that checks credits before job creation
- [ ] Return clear error: `{ error: 'NO_CREDITS', credits_remaining: 0 }`
- [ ] Include upgrade prompt in response

### 3.3 — Credit Purchase (via Salla Checkout)
- [ ] Integrate `embedded.checkout.create()` for addon purchases
  ```javascript
  embedded.checkout.create({
    type: 'addon',
    slug: 'extra-credits-50',
    quantity: 1
  });
  ```
- [ ] Handle `embedded.checkout.onResult()` callback
- [ ] Create webhook handler for addon purchase confirmation
- [ ] Add credits upon successful purchase

**Deliverable:** Full credit system with purchase, deduction, refund, and reset

---

## Phase 4: AI Pipeline (Replicate + Bunny)

### 4.1 — Replicate Integration
- [ ] Create `services/replicate.service.js`
  - `createPrediction(humanImg, garmentImg, category)` — Start try-on job
  - `getPrediction(predictionId)` — Check status
  - `cancelPrediction(predictionId)` — Cancel if needed
- [ ] Test with IDM-VTON model (`cuuupid/idm-vton`) or latest
- [ ] Handle model input requirements:
  - Human image: full body or upper body photo
  - Garment image: flat lay or product photo
  - Category: upper_body, lower_body, dresses
- [ ] Implement retry logic (max 3 retries on transient errors)
- [ ] Handle Replicate errors gracefully (quota, model errors, timeouts)

### 4.2 — Bunny CDN Integration
- [ ] Create `services/bunny.service.js`
  - `uploadImage(buffer, path)` — Upload to storage zone
  - `deleteImage(path)` — Cleanup old images
  - `getSignedUrl(path, expiryMinutes)` — For temporary access
- [ ] Setup folder structure in Bunny:
  ```
  /{merchantId}/uploads/{uuid}.jpg     # User photos
  /{merchantId}/results/{uuid}.jpg     # AI results
  /{merchantId}/products/{uuid}.jpg    # Cached product images
  ```
- [ ] Configure CDN pull zone with appropriate caching headers
- [ ] Setup image cleanup cron (delete results older than 30 days)

### 4.3 — Image Preprocessing
- [ ] Validate uploaded images (corrupted, too small, not a person)
- [ ] Resize to optimal dimensions for AI model (max 1024x1024)
- [ ] Convert to supported format (JPEG)
- [ ] Use Sharp library for image processing

**Deliverable:** Working AI pipeline: upload → process → result on CDN

---

## Phase 5: Job Processing Engine

### 5.1 — Job Queue (Database-Driven)
**ملاحظة:** استخدام Supabase كـ queue بدل Redis/BullMQ للبساطة في MVP

- [ ] Create `jobs/processor.js`
  - Poll `tryon_jobs` WHERE status = 'pending' ORDER BY created_at LIMIT 5
  - Use `SELECT ... FOR UPDATE SKIP LOCKED` for concurrent safety
  - Process each job:
    1. Update status → `processing`
    2. Call Replicate API
    3. Poll Replicate every 3 seconds
    4. On success: upload result to Bunny → update status → `completed`
    5. On failure: refund credit → update status → `failed`
  - Run as interval (every 5 seconds)

### 5.2 — Job Status Updates (Realtime)
- [ ] Use Supabase Realtime to push job status changes
- [ ] Frontend subscribes to job changes for current merchant
  ```javascript
  supabase
    .channel('jobs')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'tryon_jobs',
      filter: `merchant_id=eq.${merchantId}`
    }, handler)
    .subscribe();
  ```

### 5.3 — Job Timeout & Cleanup
- [ ] Set max job duration: 120 seconds
- [ ] Cron: mark stale `processing` jobs as `failed` (stuck jobs)
- [ ] Cron: cleanup old completed jobs (keep metadata, delete images after 30d)
- [ ] Implement job retry (max 2 retries on AI failure)

**Deliverable:** Autonomous job processor that handles full lifecycle

---

## Phase 6: Merchant Dashboard (React 19)

### 6.1 — Auth & Shell
- [ ] Implement Salla Embedded SDK initialization flow
- [ ] Create `AuthProvider` with session management
- [ ] Setup `embedded.page.resize()` for auto iframe sizing
- [ ] Create app shell with sidebar navigation (shadcn)
- [ ] RTL layout support (Arabic)
- [ ] Dark/Light mode synced with Salla theme

### 6.2 — Dashboard Home Page
- [ ] Credit balance widget (used / total)
- [ ] Recent try-on jobs (last 10)
- [ ] Quick stats: total jobs, success rate, credits used this month
- [ ] Quick action: "New Try-On" button

### 6.3 — Try-On Page (Core Feature)
- [ ] Step 1: Select product (fetch from Salla Products API)
  - Search/filter products
  - Show product image preview
  - Select specific product image
- [ ] Step 2: Upload user photo
  - Drag & drop / file picker
  - Camera capture (mobile)
  - Image preview + crop
  - Size/format validation
- [ ] Step 3: Choose category (upper_body / lower_body / dresses)
- [ ] Step 4: Submit job
  - Show credit cost
  - Confirm button
  - Loading state with progress
- [ ] Step 5: Result display
  - Before/After comparison slider
  - Download result button
  - Share result (optional)
  - Try another button

### 6.4 — Jobs History Page
- [ ] Paginated list of all try-on jobs
- [ ] Filter by status (pending, completed, failed)
- [ ] View job details + result
- [ ] Retry failed jobs

### 6.5 — Credits Page
- [ ] Current balance display
- [ ] Usage chart (last 30 days)
- [ ] Transaction history
- [ ] Buy more credits button (via `embedded.checkout.create()`)
- [ ] Plan upgrade prompt

### 6.6 — Settings Page
- [ ] Widget configuration (enable/disable, custom text, allowed products)
- [ ] Default try-on category
- [ ] Webhook status (last received events)
- [ ] API key for widget (if needed)

**Deliverable:** Full merchant dashboard with all CRUD + real-time updates

---

## Phase 7: Storefront Widget

### 7.1 — Widget Core
- [ ] Create self-contained IIFE bundle (< 50KB)
- [ ] Inject via `<script>` tag in Salla storefront
- [ ] No external dependencies (vanilla JS)
- [ ] Scoped CSS (BEM or CSS modules via build step)
- [ ] Auto-detect product page + product ID

### 7.2 — Widget UI
- [ ] "جرّب الآن" / "Try It On" floating button
- [ ] Modal/drawer with:
  - Upload photo section
  - Camera capture (mobile)
  - Loading animation (shimmer / skeleton)
  - Result display with before/after
  - Download / share result
  - Error state with retry
- [ ] Mobile-first responsive design
- [ ] RTL support
- [ ] Smooth animations (CSS transitions)
- [ ] Non-blocking (doesn't affect page performance)

### 7.3 — Widget API Integration
- [ ] Create `GET /api/widget/config/:merchantId` — Get widget settings
- [ ] Create `POST /api/widget/job` — Submit try-on from widget
  - Auth: merchant-specific widget token (embedded in script)
  - Rate limit: per IP/session
- [ ] Create `GET /api/widget/job/:id` — Poll job status
- [ ] Handle credit exhaustion gracefully (show "credits depleted" message)

### 7.4 — Widget Build Pipeline
- [ ] Bundle with esbuild/rollup to single file
- [ ] Minify + gzip
- [ ] Version in filename for cache busting
- [ ] Host on Bunny CDN
- [ ] Provide installation snippet for merchants

**Deliverable:** Installable widget that works on any Salla store

---

## Phase 8: Testing & Security Hardening

### 8.1 — Security
- [ ] Token encryption service (AES-256-GCM for Salla tokens)
- [ ] Rate limiting: 100 req/min per merchant, 10 req/min per IP for widget
- [ ] CORS whitelist: `*.salla.sa`, `*.salla.dev`, app domain
- [ ] Input sanitization on all endpoints
- [ ] Image upload validation (magic bytes check, not just extension)
- [ ] Helmet.js security headers
- [ ] SQL injection prevention (parameterized queries via Supabase)
- [ ] XSS prevention in widget (CSP headers)
- [ ] CSRF protection for session endpoints

### 8.2 — Testing
- [ ] Unit tests for credit service (deduct, refund, check)
- [ ] Unit tests for webhook signature verification
- [ ] Integration tests for auth flow
- [ ] Integration tests for job lifecycle (create → process → complete)
- [ ] E2E test for widget flow
- [ ] Load test for concurrent job processing

### 8.3 — Error Handling & Monitoring
- [ ] Structured error responses (consistent format)
- [ ] Error logging with context (merchant, job, event)
- [ ] Dead letter queue for failed webhooks (retry 3 times)
- [ ] Health check endpoint with dependency status

**Deliverable:** Hardened, tested application ready for production

---

## Phase 9: Deploy & Go Live

### 9.1 — Deployment Setup
- [ ] Deploy API to Railway / Render / VPS
- [ ] Deploy Dashboard to Vercel / Netlify
- [ ] Configure Supabase production project
- [ ] Setup Bunny CDN production zone
- [ ] Configure custom domain + SSL
- [ ] Set all environment variables

### 9.2 — Salla App Store
- [ ] Register app on Salla Partner Portal (salla.partners)
- [ ] Configure OAuth callback URL
- [ ] Configure Webhook URL
- [ ] Set app permissions/scopes
- [ ] Create app pricing plans
- [ ] Upload app screenshots + description
- [ ] Submit for review

### 9.3 — Post-Launch
- [ ] Monitor webhook delivery
- [ ] Monitor job processing times
- [ ] Monitor credit usage patterns
- [ ] Setup alerts for failures
- [ ] Gather merchant feedback

**Deliverable:** Live app on Salla App Store

---

## 🔑 Environment Variables Reference

```env
# ── Salla ──
SALLA_CLIENT_ID=your_client_id
SALLA_CLIENT_SECRET=your_client_secret
SALLA_WEBHOOK_SECRET=your_webhook_secret
SALLA_APP_ID=your_app_id

# ── Supabase ──
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx
SUPABASE_ANON_KEY=eyJxxx
DATABASE_URL=postgresql://...

# ── Replicate ──
REPLICATE_API_TOKEN=r8_xxx

# ── Bunny CDN ──
BUNNY_STORAGE_ZONE=virtual-tryon
BUNNY_API_KEY=xxx
BUNNY_CDN_URL=https://virtual-tryon.b-cdn.net

# ── App ──
APP_URL=https://your-app.com
API_URL=https://api.your-app.com
JWT_SECRET=random_32_char_secret
ENCRYPTION_KEY=random_32_char_key
NODE_ENV=production
PORT=3000
```

---

## 📊 Data Flow Diagrams

### Auth Flow
```
Merchant opens app in Salla Dashboard
    ↓
Salla loads iframe with session token in URL
    ↓
Dashboard: embedded.init() → embedded.auth.getToken()
    ↓
Dashboard sends token to: POST /api/auth/verify
    ↓
Backend calls: POST https://api.salla.dev/.../introspect
    ↓
Salla returns: { merchant_id, user_id, exp }
    ↓
Backend creates session JWT → returns to Dashboard
    ↓
Dashboard: embedded.ready() → App is usable
```

### Try-On Flow
```
User uploads photo + selects product
    ↓
Dashboard: POST /api/jobs { user_image, product_image, category }
    ↓
Backend: Check credits → Deduct 1 credit → Create job (pending)
    ↓
Job Processor picks up job → Sends to Replicate
    ↓
Replicate processes (3-10 seconds)
    ↓
Processor uploads result to Bunny CDN
    ↓
Job updated: status=completed, result_image_url=cdn_url
    ↓
Dashboard receives update via Supabase Realtime
    ↓
User sees result with before/after comparison
```

### Widget Flow
```
Customer visits product page on Salla store
    ↓
Widget script loads → Detects product page
    ↓
Shows "جرّب الآن" button
    ↓
Customer clicks → Upload photo modal opens
    ↓
Widget: POST /api/widget/job { user_image, product_id, merchant_id }
    ↓
Same job processing pipeline as dashboard
    ↓
Widget polls GET /api/widget/job/:id every 3s
    ↓
Shows result in modal with download option
```

---

## ⚠️ Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Replicate downtime | Jobs stuck | Retry logic + timeout + user notification |
| Salla webhook delivery failure | Missed events | Dead letter queue + manual sync endpoint |
| Credit race condition | Over-deduction | Atomic DB operations (`FOR UPDATE`) |
| Large image uploads | Slow/timeout | Client-side resize before upload |
| Salla token expiry | API calls fail | Auto-refresh before calls |
| High concurrency | DB bottleneck | Connection pooling + job batch limits |
| Poor AI results | Bad UX | Quality scoring + user feedback |
