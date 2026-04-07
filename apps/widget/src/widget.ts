import {
  createWidgetJob,
  fetchWidgetConfig,
  fetchWidgetJob,
  type WidgetCategory,
  type WidgetConfigResponse,
} from './api.js'

declare const __WIDGET_CSS__: string

// Capture document.currentScript synchronously at IIFE evaluation time.
// By the time initWidget() runs inside setTimeout, currentScript is already null.
const BOOTSTRAP_SCRIPT_ELEMENT: HTMLScriptElement | null =
  document.currentScript instanceof HTMLScriptElement ? document.currentScript : null

declare global {
  interface Window {
    VirtualTryOnWidgetConfig?: {
      merchantId?: number | string
      productId?: number | string
      apiUrl?: string
    }
    __VTRYON_WIDGET_BOOTED__?: boolean
    salla?: {
      config?: {
        get?: (key: string) => unknown
      }
    }
  }
}

const DEFAULT_BUTTON_TEXT = 'جرّب الآن'
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

const CATEGORY_OPTIONS: Array<{ value: WidgetCategory; label: string }> = [
  { value: 'upper_body', label: 'ملابس علوية' },
  { value: 'lower_body', label: 'ملابس سفلية' },
  { value: 'dresses', label: 'فساتين' },
]

interface BootstrapConfig {
  apiBaseUrl: string
  merchantId: number
  initialProductId: string | null
}

interface WidgetElements {
  shell: HTMLDivElement
  launchButton: HTMLButtonElement
  backdrop: HTMLDivElement
  panel: HTMLDivElement
  closeButton: HTMLButtonElement
  statusBox: HTMLDivElement
  cameraButton: HTMLButtonElement
  uploadButton: HTMLButtonElement
  cameraInput: HTMLInputElement
  uploadInput: HTMLInputElement
  previewImage: HTMLImageElement
  previewEmpty: HTMLDivElement
  previewFrame: HTMLDivElement
  submitButton: HTMLButtonElement
  uploadState: HTMLDivElement
  processingState: HTMLDivElement
  resultState: HTMLDivElement
  resultUserImages: HTMLImageElement[]
  resultImage: HTMLImageElement
  downloadLink: HTMLAnchorElement
  retryButton: HTMLButtonElement
  categoryButtons: HTMLButtonElement[]
}

function getBootstrapScript(): HTMLScriptElement | null {
  // Prefer the element captured at module evaluation time
  if (BOOTSTRAP_SCRIPT_ELEMENT) {
    return BOOTSTRAP_SCRIPT_ELEMENT
  }

  // Fallback: locate by any of the known widget data attributes
  return (
    document.querySelector<HTMLScriptElement>('script[data-merchant-id]') ??
    document.querySelector<HTMLScriptElement>('script[data-api-url]') ??
    document.querySelector<HTMLScriptElement>('script[src*="widget.js"]')
  )
}

function readDatasetValue(
  script: HTMLScriptElement | null,
  key: 'merchantId' | 'productId' | 'apiUrl',
) {
  const fromScript = script?.dataset[key]

  if (fromScript && fromScript.trim().length > 0) {
    return fromScript.trim()
  }

  const fromGlobal = window.VirtualTryOnWidgetConfig?.[key]

  if (typeof fromGlobal === 'number') {
    return String(fromGlobal)
  }

  if (typeof fromGlobal === 'string' && fromGlobal.trim().length > 0) {
    return fromGlobal.trim()
  }

  return null
}

function readSallaMerchantId(): string | null {
  // Try every config key that Salla themes use across versions
  const configKeys = ['merchant.id', 'store.id', 'merchant_id', 'store_id']

  for (const key of configKeys) {
    const value = window.salla?.config?.get?.(key)

    if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
      return String(value)
    }

    if (typeof value === 'string' && /^\d+$/.test(value.trim()) && value.trim() !== '0') {
      return value.trim()
    }
  }

  // Check meta tag: <meta name="merchant-id" content="123">
  const metaTag = document.querySelector<HTMLMetaElement>(
    'meta[name="merchant-id"], meta[name="store-id"], meta[property="store:id"]',
  )
  if (metaTag?.content && /^\d+$/.test(metaTag.content.trim())) {
    return metaTag.content.trim()
  }

  // Check common Salla global objects set by themes
  for (const key of ['sallaConfig', 'SallaConfig', 'SALLA_CONFIG']) {
    const obj = (window as unknown as Record<string, unknown>)[key]
    if (obj && typeof obj === 'object') {
      const candidate = (obj as Record<string, unknown>)
      const id = candidate.merchantId ?? candidate.merchant_id ?? candidate.storeId ?? candidate.store_id
      if (typeof id === 'number' && id > 0) return String(id)
      if (typeof id === 'string' && /^\d+$/.test(id.trim())) return id.trim()
    }
  }

  return null
}

function readSallaProductId(): string | null {
  // Try every config key Salla themes use for the current product/page entity
  const configKeys = ['product.id', 'page.id', 'page.entity_id', 'product_id']

  for (const key of configKeys) {
    const value = window.salla?.config?.get?.(key)

    if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
      return String(value)
    }

    if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
      return value.trim()
    }
  }

  // Meta tag: <meta name="product-id" content="...">
  const metaTag = document.querySelector<HTMLMetaElement>(
    'meta[name="product-id"], meta[name="entity-id"]',
  )
  if (metaTag?.content && /^\d+$/.test(metaTag.content.trim())) {
    return metaTag.content.trim()
  }

  return null
}

function findSliderShell() {
  return (
    document.querySelector('salla-slider[id^="details-slider-"]') ??
    document.querySelector('.details-slider[id^="details-slider-"]') ??
    document.querySelector('salla-slider.details-slider') ??
    document.querySelector('.details-slider') ??
    document.querySelector('salla-slider')
  )
}

function readProductIdFromSliderMarkup() {
  const slider = findSliderShell()

  if (!(slider instanceof HTMLElement) || !slider.id) {
    return null
  }

  const match = slider.id.match(/details-slider-(\d+)/)
  return match?.[1] ?? null
}

function readProductIdFromWishlistMarkup() {
  const candidates = [
    document.querySelector('.btn--wishlist[data-id]'),
    document.querySelector('salla-button[data-id]'),
    document.querySelector('[onclick*="wishlist.toggle"][data-id]'),
  ]

  for (const candidate of candidates) {
    const value = candidate?.getAttribute('data-id')?.trim()

    if (value && /^\d+$/.test(value)) {
      return value
    }
  }

  return null
}

function readProductIdFromGalleryMarkup() {
  const candidates = Array.from(
    document.querySelectorAll('[data-fslightbox],[data-caption],[aria-label]'),
  )

  for (const candidate of candidates) {
    const lightboxValue = candidate.getAttribute('data-fslightbox')
    const lightboxMatch = lightboxValue?.match(/product_(\d+)/)

    if (lightboxMatch?.[1]) {
      return lightboxMatch[1]
    }
  }

  return null
}

function resolveBootstrapConfig(script: HTMLScriptElement | null): BootstrapConfig | null {
  const merchantIdValue = readDatasetValue(script, 'merchantId') ?? readSallaMerchantId()
  const apiUrlValue = readDatasetValue(script, 'apiUrl') ?? 'http://localhost:3001'
  const initialProductId =
    readDatasetValue(script, 'productId') ??
    readSallaProductId() ??
    readProductIdFromSliderMarkup() ??
    readProductIdFromWishlistMarkup() ??
    readProductIdFromGalleryMarkup()

  const merchantId = merchantIdValue ? Number.parseInt(merchantIdValue, 10) : Number.NaN

  if (!Number.isInteger(merchantId) || merchantId <= 0) {
    console.error(
      '[VirtualTryOn] Cannot initialize: merchant ID not found.\n' +
      'Fix: add data-merchant-id="YOUR_SALLA_ID" to the script tag.\n' +
      'Example: <script src="..." data-merchant-id="123456" data-api-url="..." defer></script>',
    )
    return null
  }

  return {
    apiBaseUrl: apiUrlValue.replace(/\/$/, ''),
    merchantId,
    initialProductId: initialProductId ?? null,
  }
}

function resolveCurrentProductId(
  script: HTMLScriptElement | null,
  fallbackProductId: string | null,
) {
  return (
    readDatasetValue(script, 'productId') ??
    readSallaProductId() ??
    readProductIdFromSliderMarkup() ??
    readProductIdFromWishlistMarkup() ??
    readProductIdFromGalleryMarkup() ??
    fallbackProductId
  )
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function readProductImageFromSlider() {
  const selectors = [
    'salla-slider[id^="details-slider-"] .s-slider-container .swiper-wrapper .swiper-slide img',
    'salla-slider[id^="details-slider-"] .s-slider-container .swiper-slide-active img',
    'salla-slider .s-slider-container .swiper-wrapper .swiper-slide img',
    'salla-slider .s-slider-container .swiper-slide-active img',
    '.details-slider .s-slider-container .swiper-wrapper .swiper-slide img',
    '.details-slider .s-slider-container .swiper-slide-active img',
  ]

  for (const selector of selectors) {
    const image = document.querySelector(selector)

    if (image instanceof HTMLImageElement) {
      const url = image.currentSrc || image.src
      if (url.startsWith('https://') || url.startsWith('http://')) {
        return url
      }
    }
  }

  return null
}

async function waitForBootstrapConfig(
  script: HTMLScriptElement | null,
  attempts = 20,
  waitMs = 350,
): Promise<BootstrapConfig | null> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const resolvedConfig = resolveBootstrapConfig(script)

    if (resolvedConfig) {
      return resolvedConfig
    }

    await delay(waitMs)
  }

  return null
}

function validateShopperFile(file: File | null) {
  if (!file) {
    return 'اختر صورة أولًا.'
  }

  if (!file.type.startsWith('image/')) {
    return 'الملف المختار يجب أن يكون صورة.'
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return 'حجم الصورة يجب أن يكون أقل من 5MB.'
  }

  return null
}

function getLocalizedConfigReason(reason: string | null | undefined) {
  switch (reason) {
    case 'Merchant is not installed.':
      return 'هذا المتجر غير مفعل على الخدمة بعد.'
    case 'Widget is disabled for this merchant.':
      return 'الويدجيت غير مفعلة لهذا المتجر حاليًا.'
    case 'Product context is missing for this storefront page.':
      return 'تعذر تحديد المنتج الحالي من صفحة المتجر.'
    case 'Widget is not enabled for this product.':
      return 'هذه التجربة غير مفعلة لهذا المنتج.'
    default:
      return reason ?? 'تعذر تجهيز تجربة القياس لهذا المنتج الآن.'
  }
}

function getLocalizedJobErrorMessage(message: string | null | undefined) {
  if (!message) {
    return 'تعذر إكمال التجربة. حاول مرة أخرى بعد قليل.'
  }

  if (message.includes('429')) {
    return 'الخدمة مزدحمة الآن. حاول مرة أخرى بعد أقل من دقيقة.'
  }

  if (message.includes('402 Payment Required')) {
    return 'الخدمة غير متاحة مؤقتًا. حاول لاحقًا.'
  }

  if (message.includes('PRODUCT_IMAGE_MISSING')) {
    return 'صورة هذا المنتج غير صالحة للتجربة الآن.'
  }

  return message
}

function createWidgetElements() {
  const host = document.createElement('div')
  host.dataset.vtryonWidget = 'storefront'

  const shadowRoot = host.attachShadow({ mode: 'open' })
  const style = document.createElement('style')
  style.textContent = __WIDGET_CSS__

  const shell = document.createElement('div')
  shell.className = 'vtryon-widget'
  shell.innerHTML = `
    <button class="vtryon-widget__launch" type="button" aria-label="جرّب الآن">
      ${DEFAULT_BUTTON_TEXT}
    </button>
    <div class="vtryon-widget__backdrop" hidden></div>
    <div class="vtryon-widget__panel" hidden role="dialog" aria-modal="true" aria-label="Virtual try-on">
      <button class="vtryon-widget__close" type="button" aria-label="إغلاق">×</button>
      <div class="vtryon-widget__header">
        <p class="vtryon-widget__eyebrow">Virtual Try-On</p>
        <h3 class="vtryon-widget__title">جرّب المنتج على صورتك</h3>
        <p class="vtryon-widget__subtitle">
          صوّر نفسك أو ارفع صورة واضحة، ثم دعنا نولّد النتيجة لك بدون مغادرة الصفحة.
        </p>
      </div>

      <div class="vtryon-widget__status" hidden aria-live="polite"></div>

      <div class="vtryon-widget__state vtryon-widget__state--upload">
        <div class="vtryon-widget__entry-actions">
          <button class="vtryon-widget__entry-button" type="button" data-entry="camera">صور نفسك</button>
          <button class="vtryon-widget__entry-button" type="button" data-entry="upload">ارفع صورة</button>
        </div>

        <input class="vtryon-widget__file-input vtryon-widget__file-input--camera" type="file" accept="image/png,image/jpeg,image/webp,image/*" capture="user" hidden />
        <input class="vtryon-widget__file-input vtryon-widget__file-input--upload" type="file" accept="image/png,image/jpeg,image/webp,image/*" hidden />

        <div class="vtryon-widget__preview-frame">
          <img class="vtryon-widget__preview-image" alt="معاينة صورتك" hidden />
          <div class="vtryon-widget__preview-empty">ستظهر صورتك هنا قبل التوليد</div>
          <div class="vtryon-widget__preview-overlay" hidden>
            <div class="vtryon-widget__spinner"></div>
            <p>جاري توليد النتيجة...</p>
          </div>
        </div>

        <div class="vtryon-widget__categories">
          ${CATEGORY_OPTIONS.map(
    (option, index) =>
      `<button class="vtryon-widget__category${index === 0 ? ' is-active' : ''
      }" type="button" data-category="${option.value}">${option.label}</button>`,
  ).join('')}
        </div>

        <button class="vtryon-widget__submit" type="button" disabled>توليد</button>
      </div>

      <div class="vtryon-widget__state vtryon-widget__state--processing" hidden>
        <div class="vtryon-widget__preview-frame is-processing">
          <img class="vtryon-widget__result-user" alt="صورتك المرفوعة" />
          <div class="vtryon-widget__preview-overlay">
            <div class="vtryon-widget__spinner"></div>
            <p class="vtryon-widget__processing-text">نعالج الصورة الآن. النتيجة ستظهر هنا خلال لحظات.</p>
          </div>
        </div>
      </div>

      <div class="vtryon-widget__state vtryon-widget__state--result" hidden>
        <div class="vtryon-widget__result-grid">
          <div class="vtryon-widget__result-card">
            <p class="vtryon-widget__result-label">صورتك</p>
            <img class="vtryon-widget__result-user" alt="صورتك" />
          </div>
          <div class="vtryon-widget__result-card">
            <p class="vtryon-widget__result-label">النتيجة</p>
            <img class="vtryon-widget__result-image" alt="نتيجة القياس" />
          </div>
        </div>
        <div class="vtryon-widget__result-actions">
          <a class="vtryon-widget__download" href="#" target="_blank" rel="noreferrer">تحميل النتيجة</a>
          <button class="vtryon-widget__retry" type="button">جرّب صورة أخرى</button>
        </div>
      </div>
    </div>
  `

  shadowRoot.append(style, shell)
  document.body.appendChild(host)

  const launchButton = shadowRoot.querySelector('.vtryon-widget__launch')
  const backdrop = shadowRoot.querySelector('.vtryon-widget__backdrop')
  const panel = shadowRoot.querySelector('.vtryon-widget__panel')
  const closeButton = shadowRoot.querySelector('.vtryon-widget__close')
  const statusBox = shadowRoot.querySelector('.vtryon-widget__status')
  const cameraButton = shadowRoot.querySelector('[data-entry="camera"]')
  const uploadButton = shadowRoot.querySelector('[data-entry="upload"]')
  const cameraInput = shadowRoot.querySelector('.vtryon-widget__file-input--camera')
  const uploadInput = shadowRoot.querySelector('.vtryon-widget__file-input--upload')
  const previewImage = shadowRoot.querySelector('.vtryon-widget__preview-image')
  const previewEmpty = shadowRoot.querySelector('.vtryon-widget__preview-empty')
  const previewFrame = shadowRoot.querySelector('.vtryon-widget__preview-frame')
  const submitButton = shadowRoot.querySelector('.vtryon-widget__submit')
  const uploadState = shadowRoot.querySelector('.vtryon-widget__state--upload')
  const processingState = shadowRoot.querySelector('.vtryon-widget__state--processing')
  const resultState = shadowRoot.querySelector('.vtryon-widget__state--result')
  const resultUserImages = Array.from(
    shadowRoot.querySelectorAll('.vtryon-widget__result-user'),
  )
  const resultImage = shadowRoot.querySelector('.vtryon-widget__result-image')
  const downloadLink = shadowRoot.querySelector('.vtryon-widget__download')
  const retryButton = shadowRoot.querySelector('.vtryon-widget__retry')
  const categoryButtons = Array.from(shadowRoot.querySelectorAll('.vtryon-widget__category'))

  if (
    !(launchButton instanceof HTMLButtonElement) ||
    !(backdrop instanceof HTMLDivElement) ||
    !(panel instanceof HTMLDivElement) ||
    !(closeButton instanceof HTMLButtonElement) ||
    !(statusBox instanceof HTMLDivElement) ||
    !(cameraButton instanceof HTMLButtonElement) ||
    !(uploadButton instanceof HTMLButtonElement) ||
    !(cameraInput instanceof HTMLInputElement) ||
    !(uploadInput instanceof HTMLInputElement) ||
    !(previewImage instanceof HTMLImageElement) ||
    !(previewEmpty instanceof HTMLDivElement) ||
    !(previewFrame instanceof HTMLDivElement) ||
    !(submitButton instanceof HTMLButtonElement) ||
    !(uploadState instanceof HTMLDivElement) ||
    !(processingState instanceof HTMLDivElement) ||
    !(resultState instanceof HTMLDivElement) ||
    resultUserImages.length < 2 ||
    resultUserImages.some((image) => !(image instanceof HTMLImageElement)) ||
    !(resultImage instanceof HTMLImageElement) ||
    !(downloadLink instanceof HTMLAnchorElement) ||
    !(retryButton instanceof HTMLButtonElement) ||
    categoryButtons.some((button) => !(button instanceof HTMLButtonElement))
  ) {
    throw new Error('Widget DOM failed to initialize.')
  }

  return {
    shell,
    launchButton,
    backdrop,
    panel,
    closeButton,
    statusBox,
    cameraButton,
    uploadButton,
    cameraInput,
    uploadInput,
    previewImage,
    previewEmpty,
    previewFrame,
    submitButton,
    uploadState,
    processingState,
    resultState,
    resultUserImages: resultUserImages as HTMLImageElement[],
    resultImage,
    downloadLink,
    retryButton,
    categoryButtons: categoryButtons as HTMLButtonElement[],
    processingText: shadowRoot.querySelector('.vtryon-widget__processing-text') as HTMLParagraphElement,
  } satisfies WidgetElements & { processingText: HTMLParagraphElement }
}

function setOpen(elements: WidgetElements, open: boolean) {
  elements.backdrop.hidden = !open
  elements.panel.hidden = !open
}

function setStage(elements: WidgetElements, stage: 'upload' | 'processing' | 'result') {
  elements.uploadState.hidden = stage !== 'upload'
  elements.processingState.hidden = stage !== 'processing'
  elements.resultState.hidden = stage !== 'result'
}

function setStatus(
  elements: WidgetElements,
  kind: 'error' | 'info' | 'success',
  message: string | null,
) {
  if (!message) {
    elements.statusBox.hidden = true
    elements.statusBox.className = 'vtryon-widget__status'
    elements.statusBox.textContent = ''
    return
  }

  elements.statusBox.hidden = false
  elements.statusBox.className = `vtryon-widget__status is-${kind}`
  elements.statusBox.textContent = message
}

function updateCategoryButtons(elements: WidgetElements, selectedCategory: WidgetCategory) {
  for (const button of elements.categoryButtons) {
    button.classList.toggle('is-active', button.dataset.category === selectedCategory)
  }
}

function setPreviewProcessing(elements: WidgetElements, processing: boolean) {
  elements.previewFrame.classList.toggle('is-processing', processing)
}

async function initWidget() {
  if (typeof document === 'undefined' || !document.body) {
    return
  }

  if (window.__VTRYON_WIDGET_BOOTED__ || document.querySelector('[data-vtryon-widget="storefront"]')) {
    return
  }

  const bootstrapScript = getBootstrapScript()
  const bootstrapConfig = await waitForBootstrapConfig(bootstrapScript)

  if (!bootstrapConfig) {
    return
  }

  window.__VTRYON_WIDGET_BOOTED__ = true

  try {
    const elements = createWidgetElements()
    elements.shell.hidden = true  // stay hidden until config confirms widget is enabled
    let widgetConfig: WidgetConfigResponse | null = null
    let configPromise: Promise<WidgetConfigResponse | null> | null = null
    let selectedCategory: WidgetCategory = 'upper_body'
    let selectedFile: File | null = null
    let previewUrl: string | null = null
    let disposed = false

    function applyWidgetConfig(config: WidgetConfigResponse | null) {
      widgetConfig = config

      if (!config) {
        elements.shell.hidden = false
        elements.launchButton.textContent = DEFAULT_BUTTON_TEXT
        return
      }

      elements.launchButton.textContent = config.button_text || DEFAULT_BUTTON_TEXT
      selectedCategory = config.default_category
      updateCategoryButtons(elements, selectedCategory)

      if (!config.overall_enabled || !config.current_product_enabled || !config.widget_token) {
        elements.shell.hidden = true
        setOpen(elements, false)
        return
      }

      elements.shell.hidden = false
    }

    async function ensureWidgetConfig(force = false) {
      let productId = resolveCurrentProductId(bootstrapScript, bootstrapConfig?.initialProductId ?? null)

      if (!productId) {
        for (let attempt = 0; attempt < 12; attempt += 1) {
          await delay(250)
          productId = resolveCurrentProductId(bootstrapScript, bootstrapConfig?.initialProductId ?? null)

          if (productId) {
            break
          }
        }
      }

      if (!productId) {
        return widgetConfig
      }

      if (
        !force &&
        widgetConfig &&
        widgetConfig.current_product_id === productId &&
        widgetConfig.widget_token
      ) {
        return widgetConfig
      }

      if (!force && configPromise) {
        return configPromise
      }

      configPromise = fetchWidgetConfig(
        bootstrapConfig?.apiBaseUrl ?? '',
        bootstrapConfig?.merchantId ?? 0,
        productId,
      )
        .then((response) => {
          applyWidgetConfig(response.data)
          return response.data
        })
        .catch((error) => {
          console.error('[widget] failed to load config', error)
          setStatus(elements, 'error', 'تعذر تحميل إعدادات التجربة الآن.')
          return widgetConfig
        })
        .finally(() => {
          configPromise = null
        })

      return configPromise
    }

    function resetForRetry() {
      setStage(elements, 'upload')
      setStatus(elements, 'info', null)
      setPreviewProcessing(elements, false)
      elements.resultImage.removeAttribute('src')
      elements.downloadLink.href = '#'
    }

    function applyPreviewUrl(nextPreviewUrl: string | null) {
      if (!nextPreviewUrl) {
        elements.previewImage.hidden = true
        elements.previewImage.removeAttribute('src')
        elements.previewEmpty.hidden = false
        elements.submitButton.disabled = true
        return
      }

      elements.previewImage.src = nextPreviewUrl
      elements.previewImage.hidden = false
      elements.previewEmpty.hidden = true

      for (const image of elements.resultUserImages) {
        image.src = nextPreviewUrl
      }

      elements.submitButton.disabled = false
    }

    function updatePreview(file: File | null) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        previewUrl = null
      }

      if (!file) {
        applyPreviewUrl(null)
        return
      }

      previewUrl = URL.createObjectURL(file)
      applyPreviewUrl(previewUrl)
    }

    async function pollJob(jobId: string) {
      const POLL_TIMEOUT_MS = 3 * 60 * 1000
      const startedAt = Date.now()

      while (!disposed) {
        if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
          setStage(elements, 'upload')
          setPreviewProcessing(elements, false)
          setStatus(elements, 'error', 'استغرقت العملية وقتاً أطول من المتوقع. حاول مرة أخرى.')
          return
        }

        const currentConfig = widgetConfig

        if (!currentConfig?.widget_token) {
          setStage(elements, 'upload')
          setPreviewProcessing(elements, false)
          setStatus(elements, 'error', 'تعذر متابعة حالة التجربة الآن.')
          return
        }

        let jobResponse
        try {
          jobResponse = await fetchWidgetJob(
            bootstrapConfig?.apiBaseUrl ?? '',
            currentConfig.widget_token,
            jobId,
          )
        } catch (error) {
          // If we hit a rate limit (likely ngrok free tier), wait 10s and retry silently
          if (error instanceof Error && error.message.includes('429')) {
            console.warn('[widget] hit 429 rate limit, cooling down for 10s...')
            await delay(10000)
            continue
          }
          throw error
        }

        const job = jobResponse.data

        // Update progress text based on backend metadata
        if (job.status === 'processing' && elements.processingText) {
          const step = job.metadata?.current_step
          switch (step) {
            case 'PREPARING_GARMENT':
              elements.processingText.textContent = 'جاري تجهيز الملابس وفصل الخلفية...'
              break
            case 'GENERATING_RESULT':
              elements.processingText.textContent = 'جاري تطبيق الذكاء الاصطناعي للقياس...'
              break
            case 'FINALIZING':
              elements.processingText.textContent = 'جاري تحسين الجودة ورفع النتيجة...'
              break
            default:
              elements.processingText.textContent = 'نعالج الصورة الآن. النتيجة ستظهر هنا خلال لحظات.'
          }
        }

        if (job.status === 'completed' && job.result_image_url) {
          elements.resultImage.src = job.result_image_url
          elements.downloadLink.href = job.result_image_url
          setStatus(elements, 'success', 'تم تجهيز النتيجة بنجاح.')
          setPreviewProcessing(elements, false)
          setStage(elements, 'result')
          return
        }

        if (job.status === 'failed' || job.status === 'canceled') {
          setStage(elements, 'upload')
          setPreviewProcessing(elements, false)
          setStatus(elements, 'error', getLocalizedJobErrorMessage(job.error_message))
          return
        }

        await delay(3000)
      }
    }

    function handleFileSelection(fileList: FileList | null) {
      const file = fileList?.[0] ?? null
      const validationError = validateShopperFile(file)

      if (validationError) {
        selectedFile = null
        updatePreview(null)
        setStatus(elements, 'error', validationError)
        return
      }

      selectedFile = file
      updatePreview(selectedFile)
      resetForRetry()
    }

    elements.launchButton.addEventListener('click', async () => {
      setOpen(elements, true)
      setStage(elements, 'upload')
      setStatus(elements, 'info', 'اختر صورتك للبدء. نجهز المنتج في الخلفية الآن.')

      const currentConfig = await ensureWidgetConfig()

      if (
        !currentConfig ||
        !currentConfig.overall_enabled ||
        !currentConfig.current_product_enabled ||
        !currentConfig.widget_token
      ) {
        setStatus(
          elements,
          'error',
          getLocalizedConfigReason(currentConfig?.reason),
        )
        return
      }

      setStatus(elements, 'info', null)
    })

    elements.closeButton.addEventListener('click', () => {
      setOpen(elements, false)
    })

    elements.backdrop.addEventListener('click', () => {
      setOpen(elements, false)
    })

    elements.cameraButton.addEventListener('click', () => {
      elements.cameraInput.click()
    })

    elements.uploadButton.addEventListener('click', () => {
      elements.uploadInput.click()
    })

    elements.cameraInput.addEventListener('change', () => {
      handleFileSelection(elements.cameraInput.files)
    })

    elements.uploadInput.addEventListener('change', () => {
      handleFileSelection(elements.uploadInput.files)
    })

    for (const button of elements.categoryButtons) {
      button.addEventListener('click', () => {
        const value = button.dataset.category as WidgetCategory | undefined

        if (!value) {
          return
        }

        selectedCategory = value
        updateCategoryButtons(elements, selectedCategory)
      })
    }

    elements.submitButton.addEventListener('click', async () => {
      const fileError = validateShopperFile(selectedFile)

      if (fileError) {
        setStatus(elements, 'error', fileError)
        return
      }

      const currentConfig = await ensureWidgetConfig()

      if (
        !currentConfig ||
        !currentConfig.overall_enabled ||
        !currentConfig.current_product_enabled ||
        !currentConfig.widget_token
      ) {
        setStatus(
          elements,
          'error',
          getLocalizedConfigReason(currentConfig?.reason),
        )
        return
      }

      const sliderImageUrl = readProductImageFromSlider()

      elements.submitButton.disabled = true
      setStatus(elements, 'info', null)
      setPreviewProcessing(elements, true)
      setStage(elements, 'processing')

      try {
        const jobResponse = await createWidgetJob(
          bootstrapConfig.apiBaseUrl,
          currentConfig.widget_token,
          selectedFile as File,
          selectedCategory,
          sliderImageUrl,
        )

        await pollJob(jobResponse.data.id)
      } catch (error) {
        setStage(elements, 'upload')
        setPreviewProcessing(elements, false)
        setStatus(
          elements,
          'error',
          error instanceof Error ? error.message : 'فشل بدء عملية التوليد.',
        )
      } finally {
        elements.submitButton.disabled = selectedFile == null
      }
    })

    elements.retryButton.addEventListener('click', () => {
      resetForRetry()
    })

    window.addEventListener(
      'beforeunload',
      () => {
        disposed = true

        if (previewUrl) {
          URL.revokeObjectURL(previewUrl)
        }
      },
      { once: true },
    )

    void ensureWidgetConfig()
  } catch (error) {
    console.error('[widget] failed to initialize', error)
    window.__VTRYON_WIDGET_BOOTED__ = false
  }
}

let bootstrapTimer: number | null = null

function scheduleWidgetBootstrap(delayMs = 0) {
  if (bootstrapTimer != null) {
    return
  }

  bootstrapTimer = window.setTimeout(() => {
    bootstrapTimer = null
    void initWidget()
  }, delayMs)
}

function startWidgetBootstrapLifecycle() {
  scheduleWidgetBootstrap(0)

  window.addEventListener('load', () => {
    scheduleWidgetBootstrap(0)
  })

  const observer = new MutationObserver(() => {
    if (window.__VTRYON_WIDGET_BOOTED__ || document.querySelector('[data-vtryon-widget="storefront"]')) {
      observer.disconnect()
      return
    }

    scheduleWidgetBootstrap(200)
  })

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'id'],
  })

  window.setTimeout(() => {
    observer.disconnect()
  }, 30000)
}

startWidgetBootstrapLifecycle()
