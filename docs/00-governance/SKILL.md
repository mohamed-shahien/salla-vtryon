# SKILL


---
name: virtual-tryon-salla
description: |
  Build and maintain the Virtual Try-On SaaS application integrated with Salla e-commerce platform.
  Use this skill for ANY task related to: Salla OAuth/Embedded SDK integration, webhook handling,
  merchant dashboard (React 19 + shadcn), Express API routes, Supabase database schema/queries,
  Replicate AI virtual try-on pipeline, Bunny CDN storage/delivery, credit system, job queue processing,
  storefront widget injection, or multi-tenant architecture. Also trigger when the user mentions:
  try-on, virtual fitting, AI clothing, merchant credits, Salla app, embedded app, webhook events,
  or any component from the project stack (React 19, Express, Supabase, Replicate, Bunny CDN, shadcn/ui).
---

# Virtual Try-On — Salla SaaS App

## Project Overview

Multi-tenant SaaS app integrated with Salla that adds virtual clothing try-on to product pages.
User uploads photo → AI fits the product on them → returns final image in seconds.

## Tech Stack (Locked)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19 + Vite + shadcn/ui + Tailwind CSS 4 | Merchant Dashboard (Embedded App) |
| Backend | Node.js 20 + Express 5 | REST API + Webhook handler |
| Database | Supabase (PostgreSQL + Auth + Realtime) | Multi-tenant data + RLS |
| AI Engine | Replicate API | Virtual try-on model (async) |
| Storage/CDN | Bunny.net (Storage Zone + CDN) | Image upload/delivery |
| Widget | Vanilla JS (injected script) | "Try Now" button on storefront |

## Architecture Pattern

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Salla       │────▶│  Express API │────▶│  Supabase    │
│  Dashboard   │     │  (Backend)   │     │  (Database)  │
│  (Embedded)  │     └──────┬───────┘     └──────────────┘
└─────────────┘            │
                           ▼
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Storefront  │────▶│  Job Queue   │────▶│  Replicate   │
│  Widget      │     │  (in-DB)     │     │  (AI Model)  │
└─────────────┘     └──────┬───────┘     └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Bunny CDN   │
                    │  (Storage)   │
                    └──────────────┘
```

## Salla Integration Rules (CRITICAL)

### Authentication — Embedded App Model
- Dashboard runs as Embedded App inside Salla merchant dashboard
- Auth flow: `embedded.init()` → `embedded.auth.getToken()` → Backend introspect → `embedded.ready()`
- Backend verifies token via POST to `https://api.salla.dev/exchange-authority/v1/introspect`
- Header required: `S-Source: YOUR_APP_ID`
- Response gives: `merchant_id`, `user_id`, `exp`
- NEVER use email as identifier — always `merchant_id`
- Token refresh via `embedded.auth.refresh()` on 401

### Webhook Events to Handle
| Event | Action |
|-------|--------|
| `app.installed` | Create merchant record + assign free credits |
| `app.store.authorize` | Store encrypted access_token + refresh_token |
| `app.uninstalled` | Soft-delete merchant, revoke tokens |
| `app.subscription.started` | Activate plan, set credit quota |
| `app.subscription.renewed` | Reset monthly credits |
| `app.subscription.canceled` | Mark plan inactive, block new jobs |
| `app.subscription.expired` | Same as canceled |
| `app.trial.started` | Activate trial with limited credits |
| `app.trial.expired` | Block if no paid subscription |
| `app.settings.updated` | Sync merchant settings |

### Webhook Security
- Verify `X-Salla-Signature` header using HMAC-SHA256 with SALLA_WEBHOOK_SECRET
- Reject if signature mismatch
- Idempotency: store event_id, skip duplicates

### Salla Merchant API Usage
- Base URL: `https://api.salla.dev/admin/v2`
- Auth: `Bearer {access_token}` from `app.store.authorize` event
- Use Products API to fetch product images for try-on
- Rate limit: respect Salla's rate limiting headers

### Embedded SDK Modules to Use
- `embedded.auth` — Token management
- `embedded.page.resize()` — Auto-resize iframe
- `embedded.page.setTitle()` — Set page title
- `embedded.ui.toast()` — Show notifications
- `embedded.ui.loading()` — Loading states
- `embedded.checkout.create()` — Trigger addon/credit purchases
- `embedded.checkout.onResult()` — Handle payment results

## Project Structure

```
virtual-tryon/
├── apps/
│   ├── api/                    # Express Backend
│   │   ├── src/
│   │   │   ├── config/         # env, supabase client, replicate client
│   │   │   ├── middleware/      # auth, rate-limit, webhook-verify, error-handler
│   │   │   ├── routes/          # merchants, jobs, credits, webhooks, widget
│   │   │   ├── services/        # salla, replicate, bunny, credits, jobs
│   │   │   ├── jobs/            # job processor (poll-based)
│   │   │   ├── utils/           # crypto, validators, helpers
│   │   │   └── app.js
│   │   ├── package.json
│   │   └── .env
│   │
│   ├── dashboard/              # React 19 Embedded App
│   │   ├── src/
│   │   │   ├── components/     # shadcn/ui based components
│   │   │   ├── pages/          # Dashboard, TryOn, Credits, Settings
│   │   │   ├── hooks/          # useSalla, useAuth, useCredits, useJobs
│   │   │   ├── lib/            # api client, salla-embedded, utils
│   │   │   ├── stores/         # zustand stores
│   │   │   └── App.jsx
│   │   ├── package.json
│   │   └── vite.config.js
│   │
│   └── widget/                 # Storefront Widget
│       ├── src/
│       │   ├── widget.js       # Main entry (IIFE)
│       │   ├── ui.js           # DOM manipulation
│       │   ├── api.js          # Communication with backend
│       │   └── styles.css      # Scoped styles
│       └── build.js            # Bundle to single file
│
├── supabase/
│   └── migrations/             # SQL migrations
│
└── package.json                # Monorepo root (workspaces)
```

## Database Schema (Supabase)

```sql
-- Merchants (source of truth)
CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salla_merchant_id BIGINT UNIQUE NOT NULL,
  store_name TEXT,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  plan TEXT DEFAULT 'free',
  plan_status TEXT DEFAULT 'active',
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  installed_at TIMESTAMPTZ DEFAULT now(),
  uninstalled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Credits
CREATE TABLE credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  total_credits INT DEFAULT 0,
  used_credits INT DEFAULT 0,
  reset_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(merchant_id)
);

-- Try-On Jobs
CREATE TABLE tryon_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',  -- pending, processing, completed, failed
  user_image_url TEXT NOT NULL,
  product_image_url TEXT NOT NULL,
  product_id TEXT,
  result_image_url TEXT,
  replicate_prediction_id TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Webhook Events (idempotency)
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE,
  event_name TEXT NOT NULL,
  merchant_id BIGINT,
  payload JSONB,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Credit Transactions (audit trail)
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  type TEXT NOT NULL, -- 'debit' | 'credit' | 'reset'
  reason TEXT,
  job_id UUID REFERENCES tryon_jobs(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE tryon_jobs ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_jobs_status ON tryon_jobs(status) WHERE status IN ('pending', 'processing');
CREATE INDEX idx_jobs_merchant ON tryon_jobs(merchant_id);
CREATE INDEX idx_merchants_salla ON merchants(salla_merchant_id);
CREATE INDEX idx_webhook_event_id ON webhook_events(event_id);
```

## API Routes

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/webhooks/salla` | Signature | Handle Salla webhook events |
| POST | `/api/auth/verify` | Embedded Token | Verify embedded token, create session |
| GET | `/api/merchants/me` | Session | Get current merchant info |
| GET | `/api/credits` | Session | Get credit balance |
| POST | `/api/jobs` | Session | Create try-on job |
| GET | `/api/jobs` | Session | List merchant jobs |
| GET | `/api/jobs/:id` | Session | Get job status + result |
| POST | `/api/widget/job` | Widget Token | Create job from widget |
| GET | `/api/widget/job/:id` | Widget Token | Poll job from widget |
| GET | `/api/widget/config/:merchantId` | Public | Get widget config |

## AI Pipeline (Replicate)

```javascript
// Use virtual-try-on model on Replicate
const prediction = await replicate.predictions.create({
  model: "cuuupid/idm-vton",  // or latest virtual-try-on model
  input: {
    human_img: userImageUrl,
    garm_img: productImageUrl,
    category: "upper_body", // upper_body | lower_body | dresses
  }
});
// Poll prediction.status until 'succeeded' or 'failed'
// Upload result to Bunny CDN
```

### Job Processing Flow
1. Job created with status `pending`
2. Processor picks up pending jobs (polling every 5s)
3. Submit to Replicate → status `processing`
4. Poll Replicate prediction until done
5. Upload result image to Bunny CDN
6. Update job with `result_image_url` → status `completed`
7. On error → status `failed` + `error_message`

## Bunny CDN Integration

```javascript
// Upload to Bunny Storage
const uploadToBunny = async (buffer, filename) => {
  const url = `https://storage.bunnycdn.com/${STORAGE_ZONE}/${filename}`;
  await fetch(url, {
    method: 'PUT',
    headers: {
      'AccessKey': BUNNY_API_KEY,
      'Content-Type': 'application/octet-stream',
    },
    body: buffer,
  });
  return `${BUNNY_CDN_URL}/${filename}`;
};
```

## Credit System Rules
- Free plan: 10 credits/month
- Check credits BEFORE creating job
- Deduct 1 credit per successful job submission
- Refund credit if job fails (AI error, not user error)
- Track all transactions in credit_transactions table
- Reset credits on subscription renewal

## Security Checklist
- [ ] Encrypt Salla tokens at rest (AES-256)
- [ ] Verify webhook signatures (HMAC-SHA256)
- [ ] Rate limit all API endpoints
- [ ] Signed URLs for user uploads (expire in 15min)
- [ ] CORS restricted to Salla domains + your domain
- [ ] Input validation on all uploads (image type, size < 5MB)
- [ ] Helmet.js for Express security headers
- [ ] No tokens in frontend — server-only

## Design System (Dashboard)
- Use shadcn/ui as base component library
- RTL support required (Arabic merchants)
- Follow Salla's embedded app design guidelines
- Dark/light mode via Salla's theme detection
- Mobile responsive (merchants use mobile dashboard)
- Toast notifications via `embedded.ui.toast()`

## Project Decisions (Locked)
- Dashboard: Embedded inside Salla + Standalone dev mode (dual mode)
  - Dev mode: uses mock auth with fake merchant_id for local development
  - Production: uses Salla Embedded SDK auth flow
- Widget: Supports both "all products" and "selected products" via toggle in merchant settings
  - Default: all products enabled
  - Merchant can toggle to "selected only" and pick specific products from dashboard
  - Widget checks config endpoint before rendering on product page
- Execution order: Phase 0+1 first (Setup + Salla Auth)

## Anti-Patterns (NEVER DO)
- ❌ Sync AI processing in request handler
- ❌ Store Salla tokens in frontend/localStorage
- ❌ Use email instead of merchant_id
- ❌ Build AI model from scratch
- ❌ Skip webhook signature verification
- ❌ Process jobs without credit check
- ❌ Use polling interval < 3 seconds
- ❌ Skip error handling on Replicate calls
- ❌ Hardcode Salla API URLs (use env vars)
- ❌ Skip idempotency on webhook processing
