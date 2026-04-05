import { useEffect, useState } from 'react'

import { Panel } from '@/components/ui/panel'
import { StatusPill } from '@/components/ui/status-pill'
import {
  fetchCurrentMerchant,
  fetchWidgetSettings,
  updateWidgetSettings,
  type MerchantWidgetSettings,
  type TryOnCategory,
  type WidgetMode,
} from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'

const CATEGORY_OPTIONS: Array<{ value: TryOnCategory; label: string; description: string }> = [
  { value: 'upper_body', label: 'Upper Body', description: 'Tops, shirts, jackets, and blazers' },
  { value: 'lower_body', label: 'Lower Body', description: 'Pants, skirts, and similar pieces' },
  { value: 'dresses', label: 'Dresses', description: 'One-piece outfits and dresses' },
]

const MODE_OPTIONS: Array<{ value: WidgetMode; label: string; description: string }> = [
  {
    value: 'all',
    label: 'All products',
    description: 'Show the shopper widget on every eligible product page.',
  },
  {
    value: 'selected',
    label: 'Selected products',
    description: 'Render the shopper widget only on products chosen from the Products page.',
  },
]

export function SettingsPage() {
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'failed'>('idle')
  const [settings, setSettings] = useState<MerchantWidgetSettings | null>(null)
  const [draft, setDraft] = useState<MerchantWidgetSettings | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'ready' | 'failed'>('idle')
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadSettings() {
      setStatus('loading')
      setError(null)

      try {
        const response = await fetchWidgetSettings()

        if (!active) {
          return
        }

        setSettings(response.data)
        setDraft(response.data)
        setStatus('ready')
      } catch (loadError) {
        if (!active) {
          return
        }

        setStatus('failed')
        setError(
          loadError instanceof Error ? loadError.message : 'Failed to load widget settings.',
        )
      }
    }

    void loadSettings()

    return () => {
      active = false
    }
  }, [])

  async function refreshIdentity() {
    const merchant = await fetchCurrentMerchant()

    if (merchant) {
      setAuthenticated(merchant.data)
    }
  }

  async function handleSave() {
    if (!draft) {
      return
    }

    setSaveStatus('saving')
    setSaveMessage(null)

    try {
      const response = await updateWidgetSettings({
        widget_enabled: draft.widget_enabled,
        widget_mode: draft.widget_mode,
        widget_button_text: draft.widget_button_text,
        default_category: draft.default_category,
      })

      setSettings(response.data)
      setDraft(response.data)
      setSaveStatus('ready')
      setSaveMessage('Widget settings were saved for the storefront experience.')
      await refreshIdentity()
    } catch (saveError) {
      setSaveStatus('failed')
      setSaveMessage(
        saveError instanceof Error ? saveError.message : 'Failed to save widget settings.',
      )
    }
  }

  if (status === 'loading') {
    return (
      <Panel
        eyebrow="Settings"
        title="Storefront widget settings"
        description="Loading the merchant configuration for the shopper widget."
      >
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
          Loading widget settings...
        </div>
      </Panel>
    )
  }

  if (status === 'failed' || !draft) {
    return (
      <Panel
        eyebrow="Settings"
        title="Storefront widget settings"
        description="The dashboard could not load the current merchant configuration."
      >
        <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">
          {error ?? 'Widget settings are unavailable.'}
        </div>
      </Panel>
    )
  }

  const draftChanged =
    JSON.stringify({
      widget_enabled: draft.widget_enabled,
      widget_mode: draft.widget_mode,
      widget_button_text: draft.widget_button_text,
      default_category: draft.default_category,
    }) !==
    JSON.stringify({
      widget_enabled: settings?.widget_enabled,
      widget_mode: settings?.widget_mode,
      widget_button_text: settings?.widget_button_text,
      default_category: settings?.default_category,
    })

  return (
    <div className="space-y-5">
      <Panel
        eyebrow="Settings"
        title="Storefront widget configuration"
        description="This page controls how the shopper widget behaves on eligible product pages. It does not run try-on jobs itself."
      >
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-slate-400">Widget Status</p>
            <div className="mt-3">
              <StatusPill ok={draft.widget_enabled} label={draft.widget_enabled ? 'enabled' : 'disabled'} />
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-slate-400">Display Mode</p>
            <p className="mt-2 font-medium text-white">{draft.widget_mode}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-slate-400">Button Text</p>
            <p className="mt-2 font-medium text-white">{draft.widget_button_text}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-slate-400">Default Category</p>
            <p className="mt-2 font-medium text-white">{draft.default_category}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4 rounded-3xl border border-white/10 bg-black/20 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-sky-300/80">
                  Availability
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  Turn the shopper widget on or off for the whole store.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setDraft((current) =>
                    current ? { ...current, widget_enabled: !current.widget_enabled } : current,
                  )
                }
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  draft.widget_enabled
                    ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-100'
                    : 'border-white/10 bg-white/10 text-slate-200 hover:border-white/20 hover:bg-white/15'
                }`}
              >
                {draft.widget_enabled ? 'Disable widget' : 'Enable widget'}
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
              <label className="text-xs uppercase tracking-[0.22em] text-slate-400" htmlFor="widget-button-text">
                Button Text
              </label>
              <input
                id="widget-button-text"
                value={draft.widget_button_text}
                onChange={(event) =>
                  setDraft((current) =>
                    current
                      ? {
                          ...current,
                          widget_button_text: event.target.value,
                        }
                      : current,
                  )
                }
                maxLength={40}
                className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300/40"
              />
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-white/10 bg-black/20 p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-sky-300/80">
                Widget Mode
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Decide whether the shopper widget should appear on every eligible product page or
                only on products selected by the merchant.
              </p>
            </div>

            <div className="grid gap-3">
              {MODE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setDraft((current) =>
                      current
                        ? {
                            ...current,
                            widget_mode: option.value,
                          }
                        : current,
                    )
                  }
                  className={`rounded-2xl border p-4 text-left transition ${
                    draft.widget_mode === option.value
                      ? 'border-sky-300/50 bg-sky-400/10'
                      : 'border-white/10 bg-slate-950/70 hover:border-white/20 hover:bg-white/6'
                  }`}
                >
                  <p className="font-medium text-white">{option.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{option.description}</p>
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-300">
                Selected product count: <span className="font-medium text-white">{draft.widget_products.length}</span>
              </p>
              <p className="mt-2 text-xs leading-6 text-slate-500">
                Manage the exact product list from the Products page when `selected` mode is active.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-sky-300/80">
              Default Category
            </p>
            <p className="mt-2 text-sm text-slate-300">
              This is the category preselected for the shopper inside the storefront widget.
            </p>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {CATEGORY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setDraft((current) =>
                    current
                      ? {
                          ...current,
                          default_category: option.value,
                        }
                      : current,
                  )
                }
                className={`rounded-2xl border p-4 text-left transition ${
                  draft.default_category === option.value
                    ? 'border-sky-300/50 bg-sky-400/10'
                    : 'border-white/10 bg-slate-950/70 hover:border-white/20 hover:bg-white/6'
                }`}
              >
                <p className="font-medium text-white">{option.label}</p>
                <p className="mt-2 text-xs leading-6 text-slate-400">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={!draftChanged || saveStatus === 'saving'}
            className="rounded-full border border-sky-300/30 bg-sky-400/15 px-5 py-2.5 text-sm font-medium text-sky-100 transition hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saveStatus === 'saving' ? 'Saving widget settings...' : 'Save widget settings'}
          </button>
          <span className="text-sm text-slate-400">
            Shopper uploads and AI processing happen only in the storefront widget.
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
