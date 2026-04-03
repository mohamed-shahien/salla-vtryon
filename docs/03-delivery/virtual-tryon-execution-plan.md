# Virtual Try-On Execution Plan
# 🚀 Virtual Try-On — خطة التنفيذ المثالية

---

## الرؤية العامة

بناء SaaS App مدمج مع سلة يتيح لعملاء المتاجر تجربة الملابس افتراضيًا على صورهم.
التاجر يثبّت التطبيق ← Widget يظهر في المتجر ← العميل يرفع صورته ← AI يركّب المنتج ← النتيجة خلال ثواني.

---

## المعتمد عليه (Validated)

كل عنصر في الخطة متحقق من Salla Developer Docs الرسمي:

| العنصر | المصدر | الحالة |
|--------|--------|--------|
| Embedded SDK Auth | docs.salla.dev/embedded-sdk/authentication | ✅ Trust-but-Verify model عبر introspect endpoint |
| App Events (Webhooks) | docs.salla.dev/421413m0 | ✅ 13 event مع payloads كاملة |
| Checkout Module | docs.salla.dev/embedded-sdk/modules/checkout/create | ✅ addon purchases عبر embedded.checkout.create() |
| Merchant API | docs.salla.dev/426392m0 | ✅ Products + Settings + Store Info |
| Embedded SDK Modules | docs.salla.dev/embedded-sdk | ✅ Auth, Page, UI, Nav, Checkout |

---

## Stack التقنيات (مقفول)

| الطبقة | التقنية | الدور |
|--------|---------|-------|
| Frontend | React 19 + Vite + shadcn/ui + Tailwind 4 | Dashboard التاجر (Embedded + Standalone) |
| Backend | Node.js 20 + Express 5 | REST API + Webhooks |
| Database | Supabase (PostgreSQL + RLS + Realtime) | بيانات Multi-tenant |
| AI | Replicate API (IDM-VTON model) | تركيب الملابس |
| Storage | Bunny.net (Storage + CDN) | تخزين وتوصيل الصور |
| Widget | Vanilla JS (IIFE bundle) | زر "جرّب الآن" في واجهة المتجر |

---

## القرارات المعتمدة

- **Dashboard Mode**: مزدوج — Embedded inside Salla (production) + Standalone dev mode (تطوير)
- **Widget Mode**: الاتنين — "كل المنتجات" أو "منتجات محددة" بـ toggle في الإعدادات
- **Queue**: Database-driven (Supabase polling) مش Redis — أبسط في MVP
- **Auth Source**: merchant_id من Salla — مش email أبدًا

---

## هيكل المشروع النهائي

```
virtual-tryon/
│
├── apps/
│   ├── api/                          # Express Backend
│   │   └── src/
│   │       ├── config/               # env, supabase client, replicate client
│   │       ├── middleware/            # auth, rate-limit, webhook-verify, error-handler
│   │       ├── routes/               # auth, webhooks, jobs, credits, products, widget
│   │       ├── services/             # salla, replicate, bunny, credits, jobs
│   │       ├── jobs/                 # job processor (poll-based)
│   │       ├── utils/                # crypto, validators, image-processing
│   │       └── app.js                # Entry point
│   │
│   ├── dashboard/                    # React 19 Embedded App
│   │   └── src/
│   │       ├── components/           # shadcn/ui based
│   │       │   ├── ui/               # Button, Card, Dialog, Toast...
│   │       │   ├── layout/           # Shell, Sidebar, Header
│   │       │   └── features/         # TryOnWizard, CreditBalance, JobCard
│   │       ├── pages/                # Dashboard, TryOn, Jobs, Credits, Settings
│   │       ├── hooks/                # useSalla, useAuth, useCredits, useJobs
│   │       ├── lib/                  # api client, salla-embedded wrapper, utils
│   │       ├── stores/               # zustand (auth, jobs, credits)
│   │       └── App.jsx
│   │
│   └── widget/                       # Storefront Widget
│       └── src/
│           ├── widget.js             # Main entry (IIFE)
│           ├── ui.js                 # DOM manipulation
│           ├── api.js                # Backend communication
│           └── styles.css            # Scoped CSS
│
├── supabase/
│   └── migrations/                   # SQL migration files
│
├── .env.example
└── package.json                      # Monorepo workspaces
```

---

## Database Schema

### جدول merchants (المصدر الأساسي)
| Column | Type | الوصف |
|--------|------|-------|
| id | UUID PK | معرّف داخلي |
| salla_merchant_id | BIGINT UNIQUE | معرّف التاجر من سلة (الأساسي) |
| store_name | TEXT | اسم المتجر |
| access_token_encrypted | TEXT | Access token مشفّر (AES-256-GCM) |
| refresh_token_encrypted | TEXT | Refresh token مشفّر |
| token_expires_at | TIMESTAMPTZ | تاريخ انتهاء التوكن |
| plan | TEXT | free / trial / basic / professional / enterprise |
| plan_status | TEXT | active / inactive |
| is_active | BOOLEAN | هل التطبيق مثبّت |
| settings | JSONB | إعدادات الـ widget (mode, products, button_text) |
| installed_at | TIMESTAMPTZ | تاريخ التثبيت |
| uninstalled_at | TIMESTAMPTZ | تاريخ الإزالة (soft delete) |

### جدول credits
| Column | Type | الوصف |
|--------|------|-------|
| merchant_id | UUID FK UNIQUE | التاجر |
| total_credits | INT | إجمالي الكريديت |
| used_credits | INT | المستخدم |
| reset_at | TIMESTAMPTZ | آخر ريست |

### جدول tryon_jobs
| Column | Type | الوصف |
|--------|------|-------|
| id | UUID PK | معرّف الجوب |
| merchant_id | UUID FK | التاجر |
| status | TEXT | pending → processing → completed / failed / canceled |
| user_image_url | TEXT | صورة المستخدم (Bunny CDN) |
| product_image_url | TEXT | صورة المنتج |
| product_id | TEXT | معرّف المنتج من سلة |
| category | TEXT | upper_body / lower_body / dresses |
| result_image_url | TEXT | صورة النتيجة (Bunny CDN) |
| replicate_prediction_id | TEXT | معرّف التنبؤ من Replicate |
| error_message | TEXT | رسالة الخطأ لو فشل |

### جدول webhook_events (Idempotency)
| Column | Type | الوصف |
|--------|------|-------|
| event_id | TEXT UNIQUE | معرّف فريد: {event}_{merchant}_{created_at} |
| event_name | TEXT | اسم الحدث |
| processed | BOOLEAN | هل تم المعالجة |

### جدول credit_transactions (Audit Trail)
| Column | Type | الوصف |
|--------|------|-------|
| merchant_id | UUID FK | التاجر |
| amount | INT | المبلغ (+1 أو -1) |
| type | TEXT | debit / credit / reset / refund |
| reason | TEXT | السبب |
| job_id | UUID FK | الجوب المرتبط |

### Database Functions
| Function | الوصف |
|----------|-------|
| deduct_credit(merchant_id, job_id) | خصم atomic + log — يرجع false لو مفيش رصيد |
| refund_credit(merchant_id, job_id) | استرداد + log |
| update_updated_at() trigger | تحديث تلقائي لـ updated_at |

### RLS + Indexes
- RLS مفعّل على كل الجداول
- Service Role Key يتخطى RLS (للـ backend)
- Indexes على: salla_merchant_id, jobs.status, jobs.merchant_id, webhook_events.event_id

---

## API Routes

### Auth
| Method | Path | Auth | الوظيفة |
|--------|------|------|---------|
| POST | /api/auth/verify | Embedded Token | يستقبل token من frontend → introspect مع سلة → يرجع JWT session |
| GET | /api/auth/me | JWT Session | يرجع بيانات التاجر + الكريديت |

### Webhooks
| Method | Path | Auth | الوظيفة |
|--------|------|------|---------|
| POST | /webhooks/salla | HMAC Signature | يستقبل كل أحداث سلة |

### Jobs
| Method | Path | Auth | الوظيفة |
|--------|------|------|---------|
| POST | /api/jobs | JWT Session | إنشاء جوب try-on (يتحقق من الكريديت أولاً) |
| GET | /api/jobs | JWT Session | قائمة الجوبات مع pagination + filters |
| GET | /api/jobs/:id | JWT Session | تفاصيل جوب + النتيجة |

### Credits
| Method | Path | Auth | الوظيفة |
|--------|------|------|---------|
| GET | /api/credits | JWT Session | الرصيد + التاريخ |

### Products
| Method | Path | Auth | الوظيفة |
|--------|------|------|---------|
| GET | /api/products | JWT Session | Proxy لـ Salla Products API (cached) |
| GET | /api/products/:id | JWT Session | تفاصيل منتج واحد |

### Upload
| Method | Path | Auth | الوظيفة |
|--------|------|------|---------|
| POST | /api/upload | JWT Session | رفع صورة المستخدم → Bunny → URL |

### Widget
| Method | Path | Auth | الوظيفة |
|--------|------|------|---------|
| GET | /api/widget/config/:merchantId | Public | إعدادات الـ widget (enabled, mode, products) |
| POST | /api/widget/job | Widget Token | إنشاء جوب من Widget |
| GET | /api/widget/job/:id | Widget Token | حالة الجوب للـ widget |

### System
| Method | Path | Auth | الوظيفة |
|--------|------|------|---------|
| GET | /health | None | Health check |

---

## Webhook Events المطلوب معالجتها

| Event | الإجراء |
|-------|---------|
| app.installed | إنشاء merchant + credits (10 free) |
| app.store.authorize | تخزين tokens مشفّرة |
| app.uninstalled | Soft delete + إلغاء jobs pending |
| app.subscription.started | تفعيل الخطة + تحديد الكريديت حسب الخطة |
| app.subscription.renewed | ريست الكريديت المستخدم إلى 0 |
| app.subscription.canceled | تعطيل الخطة + منع jobs جديدة |
| app.subscription.expired | نفس canceled |
| app.trial.started | تفعيل trial + 5 credits |
| app.trial.expired | تعطيل لو مفيش اشتراك مدفوع |
| app.settings.updated | مزامنة الإعدادات |

---

## AI Pipeline Flow

```
1. User uploads photo
   ↓
2. Backend validates: type (jpg/png/webp), size (< 5MB), dimensions
   ↓
3. Resize to 1024x1024 max (Sharp library)
   ↓
4. Upload to Bunny: /{merchantId}/uploads/{uuid}.jpg
   ↓
5. Create job record (status: pending)
   ↓
6. Check credits → Deduct 1 credit (atomic)
   ↓
7. Job Processor picks up (polling every 5s)
   ↓
8. Send to Replicate:
   - model: cuuupid/idm-vton (or latest)
   - input: { human_img, garm_img, category }
   ↓
9. Poll Replicate every 3s until done (max 120s timeout)
   ↓
10. On success:
    - Download result image
    - Upload to Bunny: /{merchantId}/results/{uuid}.jpg
    - Update job: status=completed, result_image_url
   ↓
11. On failure:
    - Refund credit (atomic)
    - Update job: status=failed, error_message
   ↓
12. Frontend receives update via Supabase Realtime
```

---

## Dashboard Pages

### 1. Home (الرئيسية)
- بطاقة الكريديت (مستخدم / إجمالي)
- إحصائيات سريعة (إجمالي الجوبات، نسبة النجاح، كريديت الشهر)
- آخر 10 جوبات
- زر "تجربة جديدة"

### 2. Try-On (التجربة)
- **Step 1**: اختيار المنتج (بحث + فلترة من Salla Products API)
- **Step 2**: رفع صورة المستخدم (drag & drop + camera + crop)
- **Step 3**: اختيار الفئة (upper_body / lower_body / dresses)
- **Step 4**: التأكيد + إرسال (مع عرض تكلفة الكريديت)
- **Step 5**: عرض النتيجة (before/after slider + download)

### 3. Jobs History (سجل التجارب)
- قائمة paginated بكل الجوبات
- فلترة بالحالة (pending, completed, failed)
- عرض تفاصيل + إعادة المحاولة

### 4. Credits (الرصيد)
- الرصيد الحالي
- رسم بياني (آخر 30 يوم)
- سجل المعاملات
- زر "شراء كريديت إضافي" (via embedded.checkout.create)

### 5. Settings (الإعدادات)
- تفعيل/تعطيل Widget
- وضع Widget: كل المنتجات / منتجات محددة
- اختيار المنتجات المحددة
- نص زر Widget (مخصص)
- الفئة الافتراضية

---

## Widget (واجهة المتجر)

### المتطلبات
- Bundle واحد < 50KB (IIFE, vanilla JS)
- Zero dependencies
- Scoped CSS (لا يأثر على الموقع)
- Mobile-first responsive
- RTL support
- Non-blocking (لا يبطئ الصفحة)

### السلوك
1. يتحقق من /api/widget/config/:merchantId (هل الـ widget مفعّل + هل المنتج مسموح)
2. يظهر زر "جرّب الآن" floating
3. عند الضغط: modal/drawer بـ upload photo
4. بعد الرفع: loading animation
5. بعد النتيجة: before/after + download
6. لو الكريديت خلص: رسالة مناسبة

---

## Security Checklist

| البند | التفاصيل |
|-------|----------|
| تشفير Tokens | AES-256-GCM لتخزين Salla access/refresh tokens |
| Webhook Signature | HMAC-SHA256 + timingSafeEqual مع SALLA_WEBHOOK_SECRET |
| Rate Limiting | 100 req/min per merchant, 10 req/min per IP للـ widget |
| CORS | Salla domains + app domain فقط |
| Image Validation | Magic bytes check + type + size (< 5MB) |
| Headers | Helmet.js (CSP, HSTS, X-Frame-Options) |
| Tokens | Server-only — لا يتم تخزينها في frontend أبدًا |
| Signed URLs | للصور المؤقتة (15 دقيقة) |
| Idempotency | تخزين event_id + skip duplicates |
| Atomic Operations | SELECT FOR UPDATE على الكريديت |
| Input Validation | Zod schemas على كل الـ endpoints |

---

## Credit System Rules

| القاعدة | التفاصيل |
|---------|----------|
| Free Plan | 10 credits/شهر |
| Trial | 5 credits |
| Basic | 50 credits/شهر |
| Professional | 200 credits/شهر |
| Enterprise | 1000 credits/شهر |
| Check Before Job | لازم يتحقق من الرصيد قبل إنشاء الجوب |
| Deduct | -1 credit عند إنشاء الجوب (atomic) |
| Refund | +1 credit لو الجوب فشل (AI error) |
| Reset | عند تجديد الاشتراك → used_credits = 0 |
| Purchase | عبر embedded.checkout.create() → addon credits |

---

## 🔴🟡🟢 Phases التنفيذ بالتفصيل

---

### Phase 0 — Project Setup (يوم 1-2)

**الهدف**: Monorepo شغّال مع backend + frontend فاضيين لكن متصلين

#### Task 0.1 — Monorepo Init
- تهيئة المشروع بـ npm workspaces
- إنشاء هيكل الفولدرات الكامل
- إعداد .env.example بكل المتغيرات
- إعداد .gitignore

**معيار القبول**: `npm install` من الـ root ينجح

#### Task 0.2 — Backend Bootstrap
- Express 5 مع ES Modules
- Middleware stack: helmet, cors, compression, morgan
- Global error handler (structured JSON responses)
- Rate limiting configs (api, auth, widget)
- Health check: `GET /health`
- Supabase client config
- Environment loader مع validation

**معيار القبول**: `npm run dev:api` → الـ server يشتغل + /health يرجع 200

#### Task 0.3 — Frontend Bootstrap
- React 19 + Vite + Tailwind 4
- shadcn/ui configured مع RTL support
- Vite proxy config (API calls تروح للـ backend)
- Basic App shell مع React Router
- Zustand store setup
- IBM Plex Sans Arabic font

**معيار القبول**: `npm run dev:dashboard` → صفحة فاضية تظهر بدون errors

#### Task 0.4 — Supabase Setup
- Migration file بالـ schema الكامل
- تشغيل الـ migration على Supabase
- التحقق من الجداول + RLS + Functions
- إعداد Connection Pooling

**معيار القبول**: كل الجداول موجودة + RLS مفعّل + Functions شغّالة

---

### Phase 1 — Salla Integration (يوم 3-5)

**الهدف**: Auth flow كامل + كل الـ webhooks معالجة

#### Task 1.1 — Salla Embedded SDK Wrapper
- كتابة wrapper يدعم dual mode:
  - **Embedded mode**: يستخدم SDK الحقيقي (embedded.init → getToken → ready)
  - **Dev mode**: Mock SDK يرجع fake token + يحاكي كل الـ methods
- Auto-detect: هل نحن في iframe (embedded) أو لا (standalone)
- تغليف كل الـ modules: auth, page, ui, checkout

**معيار القبول**: Dev mode يشتغل بدون Salla dashboard + Embedded mode يبدأ بشكل صحيح في iframe

#### Task 1.2 — Auth Flow (Backend)
- `POST /api/auth/verify`:
  - يستقبل token من frontend
  - Dev mode: يقبل 'dev_mock_token' ويرجع fake session
  - Production: يبعت POST لـ Salla introspect endpoint
  - Header: `S-Source: {APP_ID}`
  - يستخرج merchant_id, user_id, exp
  - يعمل findOrCreate للـ merchant
  - يرجع JWT session (1 hour expiry)
- Auth middleware: يتحقق من JWT في كل request
- Token refresh: لو 401 → frontend يستدعي embedded.auth.refresh()

**معيار القبول**: 
- Dev mode: verify → session token → /me يرجع بيانات
- الـ middleware يرفض requests بدون token

#### Task 1.3 — Webhook Handler
- `POST /webhooks/salla`:
  - Signature verification middleware (HMAC-SHA256)
  - Idempotency check (event_id في webhook_events)
  - Route إلى handler حسب event name
- Handlers لكل event (11 handler):
  - app.installed → create merchant + 10 free credits
  - app.store.authorize → encrypt + store tokens
  - app.uninstalled → soft delete + cancel pending jobs
  - app.subscription.* → update plan + credits
  - app.trial.* → handle trial state
  - app.settings.updated → sync settings

**معيار القبول**: 
- Webhook بدون signature يتم رفضه (401)
- Duplicate events يتم تخطيها
- كل event يعمل الـ action المطلوب في الـ DB

#### Task 1.4 — Auth Provider (Frontend)
- AuthProvider component يلف التطبيق
- useSalla hook: init → getToken → verify → ready
- useAuth hook: session state + logout + refresh
- Loading state أثناء الـ auth
- Error state لو الـ auth فشل (مع embedded.destroy)

**معيار القبول**: التطبيق يمر بالـ auth flow كامل ويظهر الـ dashboard بعد النجاح

#### Task 1.5 — Salla API Service (Backend)
- sallaApi helper: يستخدم access_token المشفّر
- Auto-refresh لو التوكن expired
- getProducts(merchantId, page)
- getProduct(merchantId, productId)
- Rate limit awareness (X-RateLimit headers)

**معيار القبول**: نقدر نجيب منتجات التاجر من Salla API

---

### Phase 2 — Core API & Upload (يوم 6-7)

**الهدف**: API endpoints الأساسية + رفع الصور

#### Task 2.1 — Merchant & Credits Endpoints
- `GET /api/auth/me` → بيانات التاجر + الكريديت
- `GET /api/credits` → الرصيد + سجل المعاملات
- Request validation بـ Zod على كل endpoint

#### Task 2.2 — Products Proxy
- `GET /api/products` → proxy لـ Salla Products API مع caching
- `GET /api/products/:id` → منتج واحد مع الصور
- Cache strategy: 5 دقائق في memory

#### Task 2.3 — Image Upload
- `POST /api/upload`:
  - Validate: نوع الصورة (magic bytes, مش بس extension)
  - Validate: حجم < 5MB
  - Resize بـ Sharp (max 1024x1024)
  - تحويل لـ JPEG
  - Upload لـ Bunny: `/{merchantId}/uploads/{uuid}.jpg`
  - Return CDN URL

#### Task 2.4 — Bunny CDN Service
- uploadImage(buffer, path) → CDN URL
- deleteImage(path)
- Folder structure: `/{merchantId}/uploads/` و `/{merchantId}/results/`

**معيار القبول**: رفع صورة → تظهر على CDN + كل الـ endpoints ترجع data صحيح

---

### Phase 3 — Credit System (يوم 8-9)

**الهدف**: نظام كريديت كامل مع atomic operations

#### Task 3.1 — Credit Service
- hasCredits(merchantId) → boolean
- deductCredit(merchantId, jobId) → يستخدم DB function (atomic)
- refundCredit(merchantId, jobId) → atomic refund
- resetCredits(merchantId, newTotal) → للـ subscription renewal
- getBalance(merchantId) → remaining + history

#### Task 3.2 — Credit Check Middleware
- يتحقق من الرصيد قبل إنشاء أي job
- رسالة خطأ واضحة: `{ error: 'NO_CREDITS', remaining: 0 }`
- يشمل prompt للترقية

#### Task 3.3 — Credit Purchase (Salla Checkout)
- Integration مع embedded.checkout.create():
  - type: 'addon', slug: 'extra-credits-50'
- embedded.checkout.onResult() → callback
- Webhook handler لتأكيد الشراء → add credits

**معيار القبول**: Deduct → Refund → Purchase → Reset كلهم شغّالين بشكل atomic

---

### Phase 4 — AI Pipeline (يوم 10-12)

**الهدف**: Replicate integration كامل

#### Task 4.1 — Replicate Service
- createPrediction(humanImg, garmentImg, category)
- getPrediction(predictionId) → status check
- cancelPrediction(predictionId)
- Retry logic: max 3 retries على transient errors
- Timeout: max 120 seconds

#### Task 4.2 — Image Preprocessing
- Validate: هل الصورة فيها شخص (basic check)
- Resize لأبعاد مثالية للـ model
- Convert لـ supported format

#### Task 4.3 — Model Testing
- اختبار مع صور مختلفة (رجال، نساء، أوضاع مختلفة)
- اختبار الـ 3 categories (upper_body, lower_body, dresses)
- تسجيل الـ latency المتوسطة
- تحديد الحالات اللي بتفشل

**معيار القبول**: إرسال صورتين → نتيجة على CDN خلال 10-15 ثانية

---

### Phase 5 — Job Processing Engine (يوم 13-14)

**الهدف**: معالج جوبات autonomous

#### Task 5.1 — Job Creation Endpoint
- `POST /api/jobs`:
  - يستقبل user_image_url + product_image_url + category
  - يتحقق من الكريديت
  - يخصم 1 credit (atomic)
  - ينشئ job record (status: pending)
  - يرجع job_id

#### Task 5.2 — Job Processor
- Polling loop: كل 5 ثواني
- SELECT ... FOR UPDATE SKIP LOCKED (concurrent safety)
- Process flow:
  1. pending → processing
  2. Send to Replicate
  3. Poll Replicate كل 3 ثواني
  4. Success → upload result to Bunny → completed
  5. Failure → refund credit → failed
- Batch size: 5 jobs per poll

#### Task 5.3 — Realtime Updates
- Supabase Realtime subscription:
  - Frontend يسمع على postgres_changes
  - Filter: merchant_id = current merchant
  - يحدّث الـ UI فورًا عند تغيير الحالة

#### Task 5.4 — Timeout & Cleanup
- Max job duration: 120 seconds → mark as failed
- Cron: cleanup stuck processing jobs
- Cron: حذف صور النتائج بعد 30 يوم
- Job retry: max 2 retries على AI failure

**معيار القبول**: Job lifecycle كامل من creation → processing → completion/failure مع realtime updates

---

### Phase 6 — Merchant Dashboard (يوم 15-18)

**الهدف**: Dashboard كامل بكل الصفحات

#### Task 6.1 — App Shell
- Sidebar navigation (shadcn)
- RTL layout
- Dark/Light mode (synced مع Salla theme)
- embedded.page.resize() لـ iframe sizing
- Mobile responsive

#### Task 6.2 — Home Page
- Credit balance widget
- Quick stats cards
- Recent jobs list
- "تجربة جديدة" CTA

#### Task 6.3 — Try-On Page (الأهم)
- Multi-step wizard:
  - Step 1: Product picker (بحث + grid مع صور)
  - Step 2: Photo upload (drag & drop + camera + crop + preview)
  - Step 3: Category selector
  - Step 4: Confirm + submit
  - Step 5: Result viewer (before/after slider + download)
- Loading states واضحة
- Error handling مع retry

#### Task 6.4 — Jobs Page
- Paginated table/grid
- Filters: status, date range
- Job detail modal
- Retry failed jobs

#### Task 6.5 — Credits Page
- Balance display
- Usage chart (آخر 30 يوم)
- Transaction history
- Buy credits button (embedded.checkout)
- Upgrade plan prompt

#### Task 6.6 — Settings Page
- Widget toggle (enable/disable)
- Widget mode: all / selected
- Product picker (لو selected mode)
- Custom button text
- Default category

**معيار القبول**: كل الصفحات شغّالة مع data حقيقي + RTL + responsive

---

### Phase 7 — Storefront Widget (يوم 19-21)

**الهدف**: Widget جاهز للتثبيت على أي متجر سلة

#### Task 7.1 — Widget Core
- IIFE bundle بـ esbuild/rollup
- Auto-detect product page + product ID
- Check /api/widget/config/:merchantId
- لو disabled أو المنتج مش مسموح → لا يظهر

#### Task 7.2 — Widget UI
- Floating button "جرّب الآن"
- Modal/Drawer:
  - Upload photo (+ camera mobile)
  - Loading animation (shimmer)
  - Result display (before/after)
  - Download + retry
  - Error state
- Scoped CSS (BEM)
- RTL + responsive
- Smooth CSS transitions

#### Task 7.3 — Widget API Integration
- POST /api/widget/job (مع widget token)
- GET /api/widget/job/:id (polling كل 3 ثواني)
- Handle credit exhaustion gracefully

#### Task 7.4 — Widget Build & Distribution
- Bundle < 50KB minified + gzipped
- Version في filename (cache busting)
- Host على Bunny CDN
- Installation snippet للتجار:
  ```
  <script src="https://cdn.../widget.v1.js" data-merchant="xxx"></script>
  ```

**معيار القبول**: Widget يشتغل على أي متجر سلة + ينتج نتيجة + responsive + RTL

---

### Phase 8 — Testing & Security (يوم 22-23)

**الهدف**: تطبيق آمن ومختبر

#### Task 8.1 — Security Hardening
- Token encryption verification
- Rate limiting testing
- CORS testing
- Image validation (malicious files)
- Helmet.js headers audit
- SQL injection testing (parameterized queries)
- XSS prevention في Widget

#### Task 8.2 — Unit Tests
- Credit service: deduct, refund, check, race conditions
- Webhook signature verification
- Crypto: encrypt/decrypt roundtrip
- Job status transitions

#### Task 8.3 — Integration Tests
- Auth flow: embedded token → session → API calls
- Webhook flow: event → DB changes
- Job lifecycle: create → process → complete
- Credit lifecycle: deduct → refund → reset

#### Task 8.4 — E2E Testing
- Widget flow: load → upload → result
- Dashboard flow: login → try-on → view result

**معيار القبول**: كل الـ tests تعدّي + Security audit نظيف

---

### Phase 9 — Deploy & Go Live (يوم 24-25)

**الهدف**: التطبيق live على Salla App Store

#### Task 9.1 — Deployment
- Deploy API: Railway أو Render أو VPS
- Deploy Dashboard: Vercel أو Netlify
- Supabase production project
- Bunny CDN production zone
- Custom domain + SSL
- Environment variables production

#### Task 9.2 — Salla App Store
- تسجيل التطبيق على salla.partners
- تحديد OAuth callback URL
- تحديد Webhook URL
- تحديد App permissions/scopes
- إنشاء خطط الأسعار
- Screenshots + وصف التطبيق (عربي + إنجليزي)
- تقديم للمراجعة

#### Task 9.3 — Monitoring & Launch
- مراقبة webhook delivery
- مراقبة job processing times
- مراقبة credit usage
- إعداد alerts للأخطاء
- جمع feedback من التجار الأوائل

**معيار القبول**: التطبيق متاح على Salla App Store + أول تاجر يستخدمه بنجاح

---

## ⚠️ Anti-Patterns (ممنوع تمامًا)

| ❌ ممنوع | ✅ البديل |
|----------|----------|
| AI sync في request handler | Async queue (database polling) |
| تخزين Salla tokens في frontend | Server-only + AES-256 encryption |
| استخدام email بدل merchant_id | merchant_id من introspect هو المعرّف الأساسي |
| بناء model AI من الصفر | Replicate API مع model جاهز |
| تخطي webhook signature | HMAC-SHA256 verification دائمًا |
| إنشاء job بدون credit check | Credit check middleware قبل أي job |
| Polling interval < 3 ثواني | 3s minimum للـ Replicate, 5s للـ job processor |
| تخطي error handling على Replicate | Retry logic + timeout + refund |
| Hardcode Salla API URLs | Environment variables |
| تخطي idempotency | تخزين event_id + skip duplicates |

---

## 📊 Risk Register

| المخاطرة | التأثير | التخفيف |
|----------|---------|---------|
| Replicate downtime | Jobs stuck | Retry 3x + timeout 120s + user notification |
| Salla webhook delivery failure | Events مفقودة | Dead letter queue + manual sync endpoint |
| Credit race condition | خصم زائد | Atomic DB operations (FOR UPDATE) |
| صور كبيرة | بطء/timeout | Client-side resize قبل الرفع |
| Salla token expiry | API calls تفشل | Auto-refresh قبل كل call |
| High concurrency | DB bottleneck | Connection pooling + job batch limits |
| نتائج AI ضعيفة | UX سيء | Quality scoring + user feedback |
| Widget يأثر على performance | تجربة سيئة للمتجر | Lazy loading + < 50KB + non-blocking |

---

## الجدول الزمني

| الأسبوع | الـ Phases | الإنجاز |
|---------|-----------|---------|
| Week 1 | Phase 0 + 1 | Monorepo + Salla Auth + Webhooks |
| Week 2 | Phase 2 + 3 | Core API + Credits + Upload |
| Week 3 | Phase 4 + 5 | AI Pipeline + Job Processing |
| Week 4 | Phase 6 | Merchant Dashboard (كل الصفحات) |
| Week 5 | Phase 7 + 8 + 9 | Widget + Testing + Deploy |

**المجموع: ~25 يوم عمل (5 أسابيع)**
