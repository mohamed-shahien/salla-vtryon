# [ARCHIVED - COMPLETED 2026-04-09]
# Widget Settings Revamp Plan

> [!IMPORTANT]
> This plan has been **FULLY IMPLEMENTED** and the architecture has been **UNIFIED**. 
> All logic described here now resides in the centralized `@virtual-tryon/shared-types` package. 
> Do not use this document for new planning; refer to the current `WidgetSettings` schema instead.

## الهدف
إعادة بناء صفحة إعدادات الـ Widget بحيث تصبح منتج فعلي لإدارة شكل الزر، شكل النافذة، الهوية البصرية، قواعد التشغيل، مكان الظهور، وصلاحيات الوصول — مع فصل واضح بين:
- **Merchant Dashboard / Embedded App** داخل سلة
- **Storefront Widget Runtime** داخل المتجر عبر App Snippet / Device Mode

> مبدأ أساسي: أي setting لا ينعكس على الـ widget runtime في المتجر لا قيمة له، وأي setting يحتاج Salla SDK لازم يتنفذ في dashboard context فقط، وليس داخل storefront widget.

---

## السياق المعتمد
- المشروع الحالي مبني على **Hybrid architecture**: لوحة التاجر تعمل كـ Embedded App، بينما الـ widget نفسه يعمل داخل المتجر عبر App Snippet / Device Mode.
- الـ widget يجب أن يبقى **IIFE / Vanilla JS / Scoped CSS / RTL / non-blocking**.
- الإعدادات الحالية في الخطة الأصلية كانت محدودة جدًا: تفعيل/تعطيل الـ widget، mode، اختيار المنتجات، نص الزر، والفئة الافتراضية. المطلوب الآن هو تطويرها إلى **configuration system** حقيقي.
- يوجد بالفعل تدقيق سابق أكد أن الـ widget architecture سليم من ناحية Shadow DOM، widget token، polling timeout، image pipeline، وfallbacks؛ لذلك المطلوب هنا **revamp مضبوط فوق المعمارية الحالية** وليس إعادة بناء من الصفر.

---

## القرارات المعمارية التي يجب عدم كسرها
1. **Dashboard settings** تُدار من React dashboard داخل Salla باستخدام Embedded SDK عند الحاجة فقط.
2. **Storefront rendering** يطبق الإعدادات من config endpoint/runtime config فقط، وليس من Salla SDK مباشرة.
3. **merchant_id** هو المرجع الأساسي لكل الإعدادات.
4. يجب الحفاظ على:
   - bundle صغير
   - Shadow DOM isolation
   - zero style leakage
   - selected-products eligibility
   - graceful failures
5. لا نضيف settings شكلية لا تؤثر فعليًا على runtime.

---

## المشكلة الحالية

### 1) قوالب الزر
القوالب الحالية غير مميزة، وبعضها لا ينعكس على المتجر بشكل ثابت. المطلوب ليس “نص زر” فقط، بل **preset library** حقيقية للزر الذي يفتح الـ modal.

### 2) قوالب النافذة
النافذة الحالية تحتاج فصل واضح بين:
- layout
- animation in/out
- hierarchy
- CTA styling
- state presentation

### 3) قواعد التشغيل
القسم الحالي لا يعطي قيمة كفاية، وبعض خياراته ضعيفة أو لا تعكس behavior فعلي في المنتج.

### 4) التصميم والهوية
القسم الحالي ناقص جدًا. يوجد settings عامة، لكن لا يوجد **visual system** يضبط مظهر الزر والنافذة والـ states بشكل موحّد.

### 5) مكان الظهور وصلاحيات الوصول
المنطق جيد مبدئيًا، لكن يجب التأكد أن كل option يعمل فعليًا داخل storefront runtime، وأن ما يعتمد على Salla APIs / SDK / snippet lifecycle مغطى بتجارب واضحة.

---

## النتيجة المطلوبة
إخراج صفحة إعدادات جديدة تحتوي على 5 أقسام رئيسية:
1. **Button Templates**
2. **Window Templates**
3. **Visual Identity**
4. **Display Rules**
5. **Access & Runtime Safeguards**

مع preview حقيقي، persistence صحيح، وتطبيق مباشر على widget runtime داخل المتجر.

---

# 1) إعادة تصميم Settings Information Architecture

## A. Button Templates
هذا القسم مسؤول فقط عن شكل زر فتح الـ widget، ولا علاقة له بالمكان أو الظهور أو الصلاحيات.

### المطلوب
- مكتبة **20 preset** للزر
- كل preset له:
  - اسم واضح
  - preview card
  - icon style
  - background recipe
  - border recipe
  - hover behavior
  - motion behavior
  - emphasis level
  - compact/mobile behavior
- التاجر يختار preset واحد فقط
- يمكن تخصيص:
  - label text
  - icon on/off
  - icon position
  - size: sm / md / lg
  - full-width or inline
  - sticky mobile or inline near CTA
- **لا يوجد “button style” عام منفصل**؛ القالب نفسه هو الذي يحدد style family

### الـ 20 Button Presets المقترحة
1. **Core Solid** — solid primary + subtle lift
2. **Soft Glow** — soft gradient + glow hover
3. **Glass Air** — translucent glass + blur
4. **Outline Pulse** — outline + pulse ring
5. **Premium Gold** — luxury gradient + shine sweep
6. **Mono Sharp** — clean monochrome + crisp border
7. **Rounded Soft** — friendly rounded pill + soft shadow
8. **Floating Fab** — floating action feel + depth hover
9. **Neon Edge** — dark surface + bright outline
10. **Ghost Highlight** — low-emphasis ghost + active fill
11. **Split Icon** — separated icon capsule + label block
12. **Elevated Card CTA** — mini card style with micro copy area
13. **Badge Trigger** — compact badge / chip style
14. **Underline Motion** — text-first CTA + animated underline
15. **Shimmer Strip** — shimmer pass on hover
16. **Gradient Aura** — rich gradient with aura shadow
17. **Editorial Minimal** — premium text-first editorial feel
18. **Tech Panel** — angular border + panel depth
19. **Soft Outline Fill** — outline idle, filled on hover
20. **Mobile Sticky CTA** — optimized fixed mobile pill

### تنفيذ تقني
- كل preset عبارة عن tokenized config وليس CSS حر
- لا تسمح بإدخال custom CSS من لوحة التاجر
- كل preset يخرج إلى runtime shape مثل:

```json
{
  "button": {
    "preset": "soft-glow",
    "size": "md",
    "label": "جرّب الآن",
    "icon": {
      "enabled": true,
      "name": "sparkles",
      "position": "start"
    },
    "placement_mode": "inline",
    "mobile_mode": "sticky"
  }
}
```

---

## B. Window Templates
هذا القسم مسؤول عن شكل النافذة فقط: layout + entrance/exit animation + CTA structure + states framing.

### المطلوب
- مكتبة **10 modal/window presets**
- كل preset يغيّر:
  - shell shape
  - header structure
  - content spacing
  - footer actions layout
  - close affordance
  - loading/result layout
  - entrance + exit animation
- يجب ربط animations مع ملف `Modal-imations.md` إن كان موجودًا داخل الريبو
- لا يتم اختراع animations من الصفر قبل مراجعة الملف المذكور

### الـ 10 Window Presets المقترحة
1. **Classic Center Modal** — centered, balanced, standard fade-scale
2. **Soft Scale Dialog** — compact dialog with smooth scale spring
3. **Slide-Up Sheet** — mobile-first bottom sheet
4. **Side Panel Right** — right drawer for modern product flow
5. **Premium Lightbox** — media-first immersive lightbox
6. **Focus Frame** — minimal chrome, stronger image focus
7. **Card Stack Modal** — layered card entry with depth
8. **Split Preview Modal** — upload/result split layout
9. **Progressive Wizard** — stepper-oriented modal with stage memory
10. **Cinematic Overlay** — dim backdrop, dramatic entrance, strong result reveal

### ملاحظات تنفيذ
- كل preset يجب أن يحدد behavior لكل state:
  - idle
  - upload
  - validating
  - processing
  - result
  - error
  - no credits
- يجب أن يوجد fallback motion profile إذا فشل preset animation
- يجب احترام `prefers-reduced-motion`

### مثال config
```json
{
  "window": {
    "preset": "premium-lightbox",
    "motion_profile": "cinematic",
    "backdrop": "blur-dark",
    "close_style": "icon-top-inline",
    "result_layout": "before-after-prominent"
  }
}
```

---

## C. Visual Identity
هذا القسم هو البديل الصحيح عن الجزء الحالي الضعيف.

### احذف / استبدل
- **احذف “نمط الأزرار”** لأن style مربوط بالقالب
- **احذف “عرض النافذة”** كخيار مستقل لأن هذا جزء من window preset/layout scale
- **استبدل “شدة الظل”** بخيار أكثر قيمة: **surface depth** أو **visual intensity**

### الإعدادات الجديدة المقترحة
1. **Brand Color**
   - primary only
   - auto-generate derived states (hover, active, tint, ring)
2. **Surface Style**
   - solid
   - soft
   - elevated
   - glass
   - outline
3. **Corner Radius**
   - compact
   - balanced
   - rounded
   - pill-heavy
4. **Spacing Density**
   - compact
   - comfortable
   - spacious
5. **Typography Tone**
   - neutral
   - modern
   - premium
   - bold-commerce
6. **Visual Intensity**
   - quiet
   - balanced
   - expressive
   - bold
7. **Icon Style**
   - line
   - duotone
   - filled
8. **Backdrop Style**
   - dim
   - blur
   - gradient
   - none
9. **Motion Energy**
   - minimal
   - smooth
   - lively
10. **State Emphasis**
   - result-first
   - upload-first
   - balanced

### الهدف من القسم
بدل ما التاجر يعدل تفاصيل مشتتة، يختار visual tokens تتحول تلقائيًا إلى مظهر coherent على:
- الزر
- النافذة
- الـ CTA الداخلية
- loading UI
- result UI
- alerts/status banners

### مثال config
```json
{
  "visual_identity": {
    "brand_color": "#7c3aed",
    "surface_style": "glass",
    "corner_radius": "balanced",
    "spacing_density": "comfortable",
    "typography_tone": "modern",
    "visual_intensity": "balanced",
    "icon_style": "line",
    "backdrop_style": "blur",
    "motion_energy": "smooth",
    "state_emphasis": "result-first"
  }
}
```

---

## D. Display Rules
هذا هو التطوير الحقيقي لقسم “قواعد التشغيل” و“مكان الظهور”.

### الهدف
قواعد ظهور وتشغيل لها قيمة فعلية، وليس مجرد toggle بسيط.

### الإعدادات المقترحة
1. **Widget Enablement**
   - enabled / disabled
2. **Eligibility Mode**
   - all products
   - selected products
   - selected categories (إذا كانت متاحة من بيانات المتجر)
3. **Placement Target**
   - under add-to-cart
   - above add-to-cart
   - inside product actions
   - floating corner
   - sticky mobile footer
   - auto-best-fit
4. **Display Timing**
   - immediate
   - after page stable
   - after image gallery ready
   - after CTA block detected
5. **Trigger Behavior**
   - render automatically
   - render on user intent only
6. **Availability Conditions**
   - hide on out-of-stock
   - hide on missing product image
   - hide on unsupported product type
   - hide when merchant inactive
   - hide when no credits (or show disabled CTA with explanation)
7. **Fallback Strategy**
   - if primary selector fails → fallback selector chain
   - if inline insertion fails → floating fallback
8. **Mobile/Desktop Variants**
   - same on all devices
   - dedicated mobile behavior
   - dedicated desktop behavior
9. **Localization Display**
   - Arabic only
   - English only
   - auto by storefront language
10. **State Messaging Policy**
   - concise
   - guided
   - conversion-focused

### قواعد مهمة
- “مكان الظهور” ليس UI-only؛ يجب ربطه فعليًا بـ selector strategy + fallback chain
- “auto-best-fit” يجب أن يعتمد على DOM heuristics حقيقية وليس random selector
- أي placement option لا يمكن ضمانه على ثيمات سلة المختلفة يجب أن يكون له fallback واضح

---

## E. Access & Runtime Safeguards
هذا القسم لتأكيد أن الإعدادات تعمل بأمان وبشكل متوافق مع صلاحيات المتجر والـ runtime.

### الإعدادات / المؤشرات المطلوبة
1. **Store Connection Status**
2. **Widget Runtime Status**
3. **Last Config Publish Time**
4. **Last Storefront Render Check**
5. **Last Salla Token Verification**
6. **Current Subscription / Credits Status**
7. **Protected Features Availability**
   - premium templates
   - premium animations
   - advanced display rules

### قواعد الوصول
- بعض presets يمكن ربطها بالباقات لاحقًا، لكن الآن يجب بناء النظام extensible
- إذا merchant غير active أو app uninstalled → config endpoint يرجع safe no-op config
- إذا credits = 0:
  - إما hide widget
  - أو show disabled state برسالة واضحة
  - هذا لازم يكون setting اختياري

---

# 2) التغييرات المطلوبة في البيانات والـ contracts

## تحديث merchant settings schema
يجب نقل settings من شكل بسيط إلى schema versioned:

```json
{
  "schema_version": 2,
  "button": {},
  "window": {},
  "visual_identity": {},
  "display_rules": {},
  "runtime_safeguards": {}
}
```

## المطلوب تقنيًا
- إضافة migration آمنة أو transform layer عند القراءة
- backward compatibility مع schema القديمة
- default resolver يحول merchants القديمة تلقائيًا إلى fallback config
- validation بـ Zod في backend + dashboard form layer

## ممنوع
- تخزين raw CSS strings من التاجر
- تخزين animation snippets غير موثقة
- ربط config بأسماء classes من الثيم بشكل hardcoded بدون fallback map

---

# 3) التنفيذ داخل الـ Dashboard

## المطلوب في UI
- صفحة Settings جديدة مقسمة tabs أو accordion sections:
  - Button Templates
  - Window Templates
  - Visual Identity
  - Display Rules
  - Access & Diagnostics
- Live Preview داخل dashboard
- Preview modes:
  - desktop
  - mobile
  - dark/light if relevant
- Reset to recommended defaults
- Publish / Save Draft لو مناسب للبنية الحالية

## سلوك الـ preview
- preview يجب أن يستخدم نفس config renderer المستخدم في الـ widget قدر الإمكان
- ممنوع وجود preview engine منفصل يخرج شكل مختلف عن المتجر

## Salla Embedded SDK usage داخل dashboard فقط
استخدم عند الحاجة:
- `embedded.page.resize()`
- `embedded.page.setTitle()`
- `embedded.ui.toast()`
- `embedded.ui.loading()`

ولا يتم استخدام Embedded SDK داخل storefront widget نفسه.

---

# 4) التنفيذ داخل الـ Widget Runtime

## المطلوب
- config loader يقرأ schema v2
- preset resolver يحول config إلى CSS variables + state classes + motion profile
- DOM insertion engine يدعم placement targets + fallback chain
- modal renderer يدعم 10 window presets
- button renderer يدعم 20 button presets
- reduced motion support
- no-style-leak guarantee عبر Shadow DOM أو scoping الحالي

## Runtime priorities
1. eligibility check
2. placement resolution
3. button render
4. interaction open
5. modal preset render
6. state-specific UI render

## Performance
- لا تحمل كل assets أو animation code upfront إذا كان يمكن تقسيمها بخفة
- حافظ على bundle discipline
- أي preset implementation يجب أن يعيد استخدام primitives بدل duplication

---

# 5) التعامل مع ملف Modal-imations.md

## المطلوب من المنفذ
- ابحث داخل الريبو عن ملف `Modal-imations.md`
- لو الاسم به typo، ابحث أيضًا عن:
  - `Modal-animations.md`
  - `modal-animations.md`
  - أي ملف قريب يحتوي motion recipes / modal transitions
- اعتبر هذا الملف **source of truth** لكل motion profiles الممكنة
- وزّع الـ animations على الـ 10 window presets بدل اختراع motion language جديدة
- لو الملف غير موجود، وثّق ذلك صراحة في الـ handoff وطبّق fallback animation set محافظ

> ملاحظة: في الملفات المتاحة لي هنا لم يظهر هذا الملف، لذلك لازم المنفّذ يتحقق منه داخل الريبو نفسه قبل التطبيق.

---

# 6) التحقق من مكان الظهور وصلاحيات الوصول

## المطلوب من المنفذ
### أولًا: مكان الظهور
- راجع المنطق الحالي لكل placement option
- تأكد أنه يعمل على storefront فعليًا وليس في preview فقط
- اختبره على أكثر من DOM scenario داخل ثيمات سلة
- أضف fallback chain موثقة
- أضف diagnostic status داخل settings يوضح:
  - target found
  - fallback used
  - render mode used

### ثانيًا: صلاحيات الوصول
- راجع أي setting تعتمد على:
  - store auth state
  - merchant active state
  - subscription state
  - credits state
  - Salla app lifecycle
- تأكد أن config endpoint لا يسرّب إعدادات غير مسموحة أو presets غير مفعلة للباقه
- تأكد أن storefront لا يعتمد على dashboard session أو Embedded SDK

---

# 7) Deliverables المطلوبة

1. **Refactored settings information architecture**
2. **20 implemented button presets**
3. **10 implemented window presets**
4. **New visual identity settings model**
5. **Upgraded display rules system**
6. **Runtime-safe config schema v2**
7. **Dashboard live preview matching storefront behavior**
8. **Storefront diagnostics + fallback-safe placement**
9. **Tests + verification notes**
10. **Updated STATUS/HANDOFF if these files موجودة في المشروع**

---

# 8) معايير القبول

## Button templates
- 20 preset distinct فعلًا
- كل preset له identity واضح
- لا يوجد preset مكرر بتغيير ألوان فقط
- يعمل في desktop/mobile

## Window templates
- 10 preset distinct فعلًا
- entrance/exit animation واضح ومختلف
- states كلها مدعومة

## Visual identity
- settings الجديدة تؤثر فعليًا على الزر + النافذة + states
- لا توجد settings تجميلية بلا أثر runtime

## Display rules
- placement options تعمل فعليًا داخل المتجر
- fallback chain شغالة
- selected product logic لم ينكسر

## Runtime safety
- storefront لا يستخدم Embedded SDK
- dashboard فقط هو من يستخدم Salla Embedded SDK
- config endpoint يحترم merchant state / credits / subscription

## Stability
- لا infinite polling
- لا selector crashes
- لا data URI regressions
- لا style leakage
- لا تضخم bundle بشكل غير مبرر

---

# 9) ترتيب التنفيذ المقترح

## Phase A — Audit & Modeling
- اقرأ docs المشروع المتعلقة بالـ widget/settings
- راجع الكود الحالي للـ settings page والـ widget renderer
- راجع `Modal-imations.md` داخل الريبو
- صمّم schema v2 + migration/backward-compat strategy

## Phase B — Preset System Foundation
- ابنِ preset registry للزر
- ابنِ preset registry للنافذة
- ابنِ visual identity token system

## Phase C — Dashboard Settings Revamp
- ابنِ sections الجديدة
- أضف live preview
- أضف validation + save flow

## Phase D — Storefront Runtime Integration
- طبّق preset resolver
- طبّق placement upgrades + diagnostics
- طبّق modal motion mapping

## Phase E — Verification
- اختبر selected/all products
- اختبر mobile/desktop
- اختبر fallback placement
- اختبر no-credits / inactive / uninstalled / invalid config
- حدّث STATUS/HANDOFF

---

# 10) Prompt جاهز للإيجنت

Read the project docs first and treat them as source of truth.

Your task is to revamp the widget settings system end-to-end without breaking the current Virtual Try-On architecture.

Scope:
- Work only on the widget settings experience, config model, dashboard settings UI, widget preset system, modal preset system, visual identity settings, display rules, and runtime safeguards.
- Do not re-architect auth, credits, AI pipeline, or job processing unless a tiny supporting change is strictly required.

Critical architectural rules:
- Keep the existing hybrid model intact:
  - Dashboard = Embedded App inside Salla
  - Storefront widget = App Snippet / Device Mode runtime
- Embedded SDK is for dashboard context only.
- Do not make the storefront widget depend on Salla Embedded SDK.
- merchant_id remains the source of truth.
- Preserve Shadow DOM/style isolation, bundle discipline, selected-products logic, and existing runtime safety fixes.

Before coding:
1. Audit the current settings page, current widget config contract, and current storefront widget renderer.
2. Search the repo for `Modal-imations.md`.
   - Also check likely typo variants such as `Modal-animations.md` and `modal-animations.md`.
   - Use that file as the source of truth for modal/window animations.
3. Identify which current settings are purely cosmetic and not actually applied in storefront runtime.
4. Keep backward compatibility for existing merchant settings.

Implement the following:

1) Button Templates
- Build a registry of 20 distinct button presets for the widget trigger.
- Each preset must have a unique visual identity, not just color swaps.
- Support label, icon enable/disable, icon position, size, inline/full-width behavior, and mobile sticky option.
- Remove any generic “button style” setting that conflicts with preset ownership.

2) Window Templates
- Build a registry of 10 distinct modal/window presets.
- Each preset must define layout + motion + header/footer composition + state rendering behavior.
- Map animations from the modal animations doc instead of inventing a new motion language.
- Respect prefers-reduced-motion.

3) Visual Identity
- Replace the weak visual settings with a real token-based visual identity section.
- Keep brand color.
- Add settings such as surface style, corner radius, spacing density, typography tone, visual intensity, icon style, backdrop style, motion energy, and state emphasis.
- Remove “window width” as an isolated setting.
- Replace “shadow intensity” with a more valuable system like visual intensity or surface depth.

4) Display Rules
- Upgrade the current operational/display rules into a real runtime system.
- Support eligibility mode, placement target, display timing, trigger behavior, availability conditions, fallback strategy, device-specific behavior, localization mode, and state messaging policy.
- Ensure every rule is actually enforced in storefront runtime, not just saved in dashboard UI.

5) Access & Runtime Safeguards
- Add diagnostics/status indicators for config publish state, storefront render status, subscription/credits availability, and protected feature availability.
- Ensure inactive/uninstalled merchants return safe config behavior.
- Ensure zero-credit behavior is configurable and correctly enforced.

6) Data + Validation
- Introduce a versioned widget settings schema (v2).
- Add Zod validation and safe defaults.
- Keep backward compatibility with the existing schema.
- Do not store raw CSS or arbitrary merchant-provided styling.

7) Dashboard UI
- Rebuild the settings page sections with a clean, production-grade UX.
- Add live preview that uses the same rendering primitives/config logic as the storefront widget as much as possible.
- Use shadcn/ui patterns and keep the page embedded-friendly.

8) Storefront Runtime
- Implement config resolver + preset resolver + placement resolver.
- Maintain style isolation and performance discipline.
- Do not regress current polling/error/image safety fixes.

Verification requirements:
- Test desktop/mobile behavior.
- Test all-products vs selected-products eligibility.
- Test placement fallbacks.
- Test no-credits, inactive merchant, uninstalled app, and invalid config scenarios.
- Verify the new settings actually change storefront output.

Output requirements:
- Keep changes scoped.
- Update STATUS.md and HANDOFF.md when finished if they exist in the repo.
- Add a concise implementation summary and list exactly what was changed.
- Reference the plan in: `docs/02-architecture/widget-settings-revamp-plan.md`

Use this file as the implementation plan:
`docs/02-architecture/widget-settings-revamp-plan.md`
