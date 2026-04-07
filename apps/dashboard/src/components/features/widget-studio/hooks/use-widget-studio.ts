import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'

import { fetchWidgetSettings, updateWidgetSettings } from '@/lib/api'
import type { WidgetStudioConfig } from '../schema/widget-studio.schema'
import { createDefaultWidgetStudioConfig } from '../schema/widget-studio.defaults'
import { mapServerToStudioConfig, mapStudioConfigToPayload } from '../schema/widget-studio.mappers'

export type StudioStatus = 'idle' | 'loading' | 'ready' | 'error'
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useWidgetStudio() {
  const [status, setStatus] = useState<StudioStatus>('idle')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')

  // The persisted config (what's on the server)
  const [serverConfig, setServerConfig] = useState<WidgetStudioConfig | null>(null)
  // The local draft config (what the user is editing)
  const [config, setConfig] = useState<WidgetStudioConfig>(createDefaultWidgetStudioConfig)

  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Load ─────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const response = await fetchWidgetSettings()
      const { config: mapped } = mapServerToStudioConfig(response.data)
      setServerConfig(mapped)
      setConfig(mapped)
      setStatus('ready')
    } catch {
      setStatus('error')
      toast.error('تعذر تحميل إعدادات الويدجت')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  // ── Dirty Detection ──────────────────────────────────────────────────────

  const isDirty = serverConfig !== null && JSON.stringify(config) !== JSON.stringify(serverConfig)

  // ── Update (local only) ──────────────────────────────────────────────────

  const updateConfig = useCallback(
    <K extends keyof WidgetStudioConfig>(
      section: K,
      patch: Partial<WidgetStudioConfig[K]>,
    ) => {
      setConfig((prev) => ({
        ...prev,
        [section]: typeof prev[section] === 'object' && prev[section] !== null
          ? { ...(prev[section] as Record<string, unknown>), ...patch }
          : patch,
      }))
    },
    [],
  )

  const setFullConfig = useCallback((next: WidgetStudioConfig) => {
    setConfig(next)
  }, [])

  // ── Save ─────────────────────────────────────────────────────────────────

  const save = useCallback(async () => {
    setSaveStatus('saving')
    try {
      const payload = mapStudioConfigToPayload(config)
      await updateWidgetSettings(payload)
      setServerConfig(config)
      setSaveStatus('saved')
      toast.success('تم حفظ الإعدادات بنجاح')

      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
      savedTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setSaveStatus('error')
      toast.error('فشل في حفظ الإعدادات')
    }
  }, [config])

  // ── Reset ────────────────────────────────────────────────────────────────

  const resetToDefaults = useCallback(() => {
    setConfig(createDefaultWidgetStudioConfig())
    toast.info('تم إعادة الإعدادات للقيم الافتراضية')
  }, [])

  const discardChanges = useCallback(() => {
    if (serverConfig) {
      setConfig(serverConfig)
      toast.info('تم التراجع عن التغييرات')
    }
  }, [serverConfig])

  return {
    status,
    saveStatus,
    config,
    isDirty,
    updateConfig,
    setFullConfig,
    save,
    resetToDefaults,
    discardChanges,
    reload: load,
  }
}
