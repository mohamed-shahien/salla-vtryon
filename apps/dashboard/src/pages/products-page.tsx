import { useDeferredValue, useEffect, useState } from 'react'

import { Panel } from '@/components/ui/panel'
import { StatusPill } from '@/components/ui/status-pill'
import {
  fetchCurrentMerchant,
  fetchMerchantProducts,
  fetchWidgetSettings,
  updateWidgetSettings,
  type MerchantWidgetSettings,
  type SallaProduct,
} from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'

function getProductImage(product: SallaProduct) {
  return product.main_image ?? product.thumbnail ?? product.images?.[0]?.url ?? null
}

function formatMoney(product: SallaProduct) {
  const price = product.sale_price ?? product.price

  if (!price?.currency || typeof price.amount !== 'number') {
    return 'Price unavailable'
  }

  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: price.currency,
    maximumFractionDigits: 0,
  }).format(price.amount)
}

export function ProductsPage() {
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated)

  const [productsStatus, setProductsStatus] = useState<'idle' | 'loading' | 'ready' | 'failed'>(
    'idle',
  )
  const [products, setProducts] = useState<SallaProduct[]>([])
  const [productsError, setProductsError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const deferredQuery = useDeferredValue(searchQuery)

  const [settings, setSettings] = useState<MerchantWidgetSettings | null>(null)
  const [settingsError, setSettingsError] = useState<string | null>(null)
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([])
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'ready' | 'failed'>('idle')
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadPage() {
      setProductsStatus('loading')
      setProductsError(null)
      setSettingsError(null)

      try {
        const [productsResponse, settingsResponse] = await Promise.all([
          fetchMerchantProducts(1),
          fetchWidgetSettings(),
        ])

        if (!active) {
          return
        }

        setProducts(productsResponse.data)
        setProductsStatus('ready')
        setSettings(settingsResponse.data)
        setSelectedProductIds(settingsResponse.data.widget_products)
      } catch (error) {
        if (!active) {
          return
        }

        const message =
          error instanceof Error ? error.message : 'Failed to load products and widget settings.'

        setProducts([])
        setProductsStatus('failed')
        setProductsError(message)
        setSettingsError(message)
      }
    }

    void loadPage()

    return () => {
      active = false
    }
  }, [])

  const filteredProducts = products.filter((product) => {
    if (!deferredQuery.trim()) {
      return true
    }

    return product.name.toLowerCase().includes(deferredQuery.trim().toLowerCase())
  })

  const isSelectedMode = settings?.widget_mode === 'selected'

  async function refreshIdentity() {
    const merchant = await fetchCurrentMerchant()

    if (merchant) {
      setAuthenticated(merchant.data)
    }
  }

  function toggleProduct(productId: number) {
    if (!isSelectedMode) {
      return
    }

    setSelectedProductIds((current) =>
      current.includes(productId)
        ? current.filter((value) => value !== productId)
        : [...current, productId],
    )
    setSaveStatus('idle')
    setSaveMessage(null)
  }

  async function handleSaveSelectedProducts() {
    if (!settings) {
      return
    }

    setSaveStatus('saving')
    setSaveMessage(null)

    try {
      const response = await updateWidgetSettings({
        widget_products: selectedProductIds,
      })

      setSettings(response.data)
      setSelectedProductIds(response.data.widget_products)
      setSaveStatus('ready')
      setSaveMessage('Selected products were saved for the storefront widget.')
      await refreshIdentity()
    } catch (error) {
      setSaveStatus('failed')
      setSaveMessage(
        error instanceof Error ? error.message : 'Failed to save selected products.',
      )
    }
  }

  return (
    <div className="space-y-5">
      <Panel
        eyebrow="Products"
        title="Choose where the shopper widget appears"
        description="This page is for merchant control only. It shows real Salla products and lets the merchant decide which product pages should expose the storefront try-on widget."
      >
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-slate-400">Catalog Status</p>
            <div className="mt-3">
              <StatusPill
                ok={productsStatus === 'ready'}
                label={productsStatus === 'ready' ? `${products.length} loaded` : productsStatus}
              />
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-slate-400">Widget Mode</p>
            <p className="mt-2 font-medium text-white">{settings?.widget_mode ?? 'unknown'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-slate-400">Widget Enabled</p>
            <div className="mt-3">
              <StatusPill
                ok={Boolean(settings?.widget_enabled)}
                label={settings?.widget_enabled ? 'enabled' : 'disabled'}
              />
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-slate-400">Selected Products</p>
            <p className="mt-2 font-medium text-white">{selectedProductIds.length}</p>
          </div>
        </div>

        {settingsError ? (
          <div className="mt-4 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">
            {settingsError}
          </div>
        ) : null}

        {!isSelectedMode ? (
          <div className="mt-4 rounded-2xl border border-sky-300/30 bg-sky-400/10 p-4 text-sm text-sky-100">
            The widget is currently in `all products` mode. Every eligible product page can render
            the shopper widget. Switch to `selected` mode in Settings if you want manual product
            control.
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            Selected mode is active. Toggle the product cards below, then save the list that should
            show the shopper widget.
          </div>
        )}

        <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
          <label className="text-xs uppercase tracking-[0.22em] text-slate-400" htmlFor="product-search">
            Search Products
          </label>
          <input
            id="product-search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by product name"
            className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300/40"
          />
        </div>

        {productsError ? (
          <div className="mt-4 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">
            {productsError}
          </div>
        ) : null}

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => {
            const productImage = getProductImage(product)
            const selected = selectedProductIds.includes(product.id)
            const selectable = isSelectedMode

            return (
              <button
                key={product.id}
                type="button"
                onClick={() => toggleProduct(product.id)}
                disabled={!selectable}
                className={`overflow-hidden rounded-3xl border text-left transition ${
                  selected
                    ? 'border-emerald-400/40 bg-emerald-500/10'
                    : 'border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/6'
                } ${!selectable ? 'cursor-default' : ''}`}
              >
                <div className="aspect-[4/3] bg-slate-900/80">
                  {productImage ? (
                    <img
                      src={productImage}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-500">
                      No image
                    </div>
                  )}
                </div>

                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-base font-semibold text-white">{product.name}</h4>
                      <p className="mt-1 text-sm text-slate-400">Product #{product.id}</p>
                    </div>
                    <StatusPill
                      ok={isSelectedMode ? selected : Boolean(settings?.widget_enabled)}
                      label={
                        isSelectedMode
                          ? selected
                            ? 'selected'
                            : 'hidden'
                          : settings?.widget_enabled
                            ? 'eligible'
                            : 'disabled'
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>{formatMoney(product)}</span>
                    <span>{product.is_available ? 'available' : 'unavailable'}</span>
                  </div>

                  {product.urls?.customer ? (
                    <a
                      href={product.urls.customer}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition hover:border-white/20 hover:bg-white/15"
                    >
                      Open storefront page
                    </a>
                  ) : null}
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void handleSaveSelectedProducts()}
            disabled={!isSelectedMode || saveStatus === 'saving'}
            className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-5 py-2.5 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saveStatus === 'saving' ? 'Saving selected products...' : 'Save selected products'}
          </button>
          <span className="text-sm text-slate-400">
            Shopper uploads stay in the storefront widget. This page only manages eligibility.
          </span>
        </div>

        {saveMessage ? (
          <div
            className={`mt-4 rounded-2xl border p-4 text-sm ${
              saveStatus === 'failed'
                ? 'border-amber-300/30 bg-amber-300/10 text-amber-100'
                : 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100'
            }`}
          >
            {saveMessage}
          </div>
        ) : null}
      </Panel>
    </div>
  )
}
