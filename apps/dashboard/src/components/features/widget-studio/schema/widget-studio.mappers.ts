import type { MerchantWidgetSettings } from '@/lib/api'
import type { WidgetStudioConfig } from './widget-studio.schema'
import { createDefaultWidgetStudioConfig } from './widget-studio.defaults'

/**
 * Deep-merge stored widget_config with defaults to fill any missing keys.
 * This ensures forward/backward compatibility when new config keys are added.
 */
function deepMerge<T extends Record<string, unknown>>(defaults: T, source: Partial<T>): T {
  const result = { ...defaults }

  for (const key of Object.keys(source) as (keyof T)[]) {
    const sourceVal = source[key]
    const defaultVal = defaults[key]

    if (
      sourceVal != null &&
      typeof sourceVal === 'object' &&
      !Array.isArray(sourceVal) &&
      typeof defaultVal === 'object' &&
      defaultVal != null &&
      !Array.isArray(defaultVal)
    ) {
      result[key] = deepMerge(
        defaultVal as Record<string, unknown>,
        sourceVal as Record<string, unknown>,
      ) as T[keyof T]
    } else if (sourceVal !== undefined) {
      result[key] = sourceVal as T[keyof T]
    }
  }

  return result
}

/**
 * Convert server settings response to Widget Studio local config.
 * Falls back to defaults for any missing widget_config keys.
 */
export function mapServerToStudioConfig(
  settings: MerchantWidgetSettings,
): { legacyEnabled: boolean; config: WidgetStudioConfig } {
  const defaults = createDefaultWidgetStudioConfig()

  const serverConfig = (settings as unknown as Record<string, unknown>).widget_config as
    | Partial<WidgetStudioConfig>
    | null
    | undefined

  const config = serverConfig
    ? deepMerge(defaults, serverConfig)
    : {
        ...defaults,
        // Seed from legacy flat fields
        launch: {
          ...defaults.launch,
          button_label: settings.widget_button_text || defaults.launch.button_label,
          mode: settings.widget_enabled ? defaults.launch.mode : ('disabled' as const),
        },
      }

  return {
    legacyEnabled: settings.widget_enabled,
    config,
  }
}

/**
 * Convert Widget Studio local config to API request payload.
 * Syncs legacy flat fields for backward compatibility.
 */
export function mapStudioConfigToPayload(
  config: WidgetStudioConfig,
): Partial<MerchantWidgetSettings> & { widget_config: WidgetStudioConfig } {
  return {
    widget_enabled: config.launch.mode !== 'disabled',
    widget_button_text: config.launch.button_label,
    widget_config: config,
  }
}
