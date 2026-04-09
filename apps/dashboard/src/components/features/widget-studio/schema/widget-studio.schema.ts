import {
  widgetSettingsSchema,
  createDefaultWidgetSettings,
  type WidgetSettings,
  type ButtonPresetId,
  type WindowPresetId,
  type BackdropStyle,
  type CornerRadius,
} from '@virtual-tryon/shared-types'

/**
 * Re-exporting unified types for the Dashboard Studio.
 * We pivot the studio to strictly follow the centralized unified schema.
 */

export {
  widgetSettingsSchema,
  createDefaultWidgetSettings,
}

export type {
  WidgetSettings,
  ButtonPresetId,
  WindowPresetId,
  BackdropStyle,
  CornerRadius,
}

// Any dashboard-specific UI state can be added here
export interface StudioState {
  isSaving: boolean
  hasChanges: boolean
  activeSection: string
  previewLoading: boolean
}
