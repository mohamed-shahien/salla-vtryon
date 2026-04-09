/**
 * Unified Widget Studio Hook
 *
 * Manages widget settings with live preview support.
 * Integrates with unified API endpoints for real-time configuration.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { toast } from 'sonner'

import { 
  createDefaultWidgetSettings,
  type WidgetSettings 
} from '@virtual-tryon/shared-types'

export type StudioStatus = 'idle' | 'loading' | 'ready' | 'error'
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

/**
 * Deep equality check for unified widget settings
 */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a === null || b === null) return a === b
  if (typeof a !== typeof b) return false
  if (typeof a !== 'object') return a === b
  if (Array.isArray(a) !== Array.isArray(b)) return false

  if (Array.isArray(a)) {
    if (a.length !== (b as unknown[]).length) return false
    return a.every((item, i) => deepEqual(item, (b as unknown[])[i]))
  }

  const aKeys = Object.keys(a as Record<string, unknown>)
  const bKeys = Object.keys(b as Record<string, unknown>)
  if (aKeys.length !== bKeys.length) return false

  for (const key of aKeys) {
    if (!bKeys.includes(key)) return false
    if (!deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) {
      return false
    }
  }
  return true
}

interface UseWidgetStudioOptions {
  apiUrl: string
  autoSave?: boolean
  autoSaveDelay?: number
}

export function useWidgetStudio({
  apiUrl,
  autoSave = false,
  autoSaveDelay = 2000,
}: UseWidgetStudioOptions) {
  const [status, setStatus] = useState<StudioStatus>('idle')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')

  const [serverConfig, setServerConfig] = useState<WidgetSettings | null>(null)
  const [config, setConfig] = useState<WidgetSettings>(createDefaultWidgetSettings())

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const response = await fetch(`${apiUrl}/api/widget/settings`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`Failed to load settings: ${response.status}`)
      }

      const result = await response.json()

      if (result.ok && result.data && result.data.widget_config) {
        const settings = result.data.widget_config as WidgetSettings
        setServerConfig(settings)
        setConfig(settings)
      } else {
        const defaults = createDefaultWidgetSettings()
        setServerConfig(defaults)
        setConfig(defaults)
      }

      setStatus('ready')
    } catch (error) {
      console.error('[WidgetStudio] Load error:', error)
      setStatus('error')
      toast.error('تعذر تحميل إعدادات الويدجت')
    }
  }, [apiUrl])

  useEffect(() => {
    void load()
  }, [load])

  const isDirty = useMemo(() => {
    if (serverConfig === null) return false
    return !deepEqual(config, serverConfig)
  }, [config, serverConfig])

  const updateConfig = useCallback(<K extends keyof WidgetSettings>(
    section: K,
    patch: Partial<WidgetSettings[K]>,
  ) => {
    setConfig((prev) => ({
      ...prev,
      [section]: typeof prev[section] === 'object' && prev[section] !== null
        ? { ...(prev[section] as Record<string, unknown>), ...patch }
        : patch,
    }))
  }, [])

  const updateButtonSettings = useCallback((patch: Partial<WidgetSettings['button']>) => {
    updateConfig('button', patch)
  }, [updateConfig])

  const updateWindowSettings = useCallback((patch: Partial<WidgetSettings['window']>) => {
    updateConfig('window', patch)
  }, [updateConfig])

  const updateVisualIdentity = useCallback((patch: Partial<WidgetSettings['visual_identity']>) => {
    updateConfig('visual_identity', patch)
  }, [updateConfig])

  const updateDisplayRules = useCallback((patch: Partial<WidgetSettings['display_rules']>) => {
    updateConfig('display_rules', patch)
  }, [updateConfig])

  const updateRuntimeSafeguards = useCallback((patch: Partial<WidgetSettings['runtime_safeguards']>) => {
    updateConfig('runtime_safeguards', patch)
  }, [updateConfig])

  const setFullConfig = useCallback((next: WidgetSettings) => {
    setConfig(next)
  }, [])

  const save = useCallback(async () => {
    setSaveStatus('saving')
    try {
      const response = await fetch(`${apiUrl}/api/widget/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ widget_config: config }),
      })

      if (!response.ok) {
        throw new Error(`Failed to save settings: ${response.status}`)
      }

      const result = await response.json()

      if (result.ok) {
        setServerConfig(config)
        setSaveStatus('saved')
        toast.success('تم حفظ الإعدادات بنجاح')

        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
        autoSaveTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2000)
      } else {
        throw new Error(result.message || 'Failed to save')
      }
    } catch (error) {
      console.error('[WidgetStudio] Save error:', error)
      setSaveStatus('error')
      toast.error('فشل في حفظ الإعدادات')
    }
  }, [apiUrl, config])

  useEffect(() => {
    if (!autoSave || !isDirty) return
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    autoSaveTimerRef.current = setTimeout(() => {
      void save()
    }, autoSaveDelay)
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    }
  }, [autoSave, isDirty, config, autoSaveDelay, save])

  const resetToDefaults = useCallback(() => {
    const defaults = createDefaultWidgetSettings()
    setConfig(defaults)
    toast.info('تم إعادة الإعدادات للقيم الافتراضية')
  }, [])

  const discardChanges = useCallback(() => {
    if (serverConfig) {
      setConfig(serverConfig)
      toast.info('تم التراجع عن التغييرات')
    }
  }, [serverConfig])

  const applyButtonPreset = useCallback((presetId: string) => {
    updateConfig('button', {
      ...config.button,
      preset: presetId as WidgetSettings['button']['preset'],
    })
  }, [config.button, updateConfig])

  const applyWindowPreset = useCallback((presetId: string) => {
    updateConfig('window', {
      ...config.window,
      preset: presetId as WidgetSettings['window']['preset'],
    })
  }, [config.window, updateConfig])

  return {
    status,
    saveStatus,
    config,
    isDirty,
    updateConfig,
    updateButtonSettings,
    updateWindowSettings,
    updateVisualIdentity,
    updateDisplayRules,
    updateRuntimeSafeguards,
    setFullConfig,
    save,
    resetToDefaults,
    discardChanges,
    reload: load,
    applyButtonPreset,
    applyWindowPreset,
  }
}
