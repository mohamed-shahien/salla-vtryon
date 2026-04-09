/**
 * Window/Modal Preset Registry
 *
 * Defines 10 distinct modal/window presets with unique visual identities.
 * Uses animations from Modal-imations.md as the source of truth.
 */

import type { WindowPresetId, MotionProfile, BackdropStyle, CloseStyle, ResultLayout } from '@virtual-tryon/shared-types'

// ============================================================================
// Window Preset Definition
// ============================================================================

export interface WindowPreset {
  id: WindowPresetId
  name: string
  nameAr: string
  description: string

  // Animation reference from Modal-imations.md
  animationRef: 'one' | 'two' | 'three' | 'four' | 'five' | 'six' | 'seven' | 'eight' | 'nine' | 'fallback'

  // Motion profile (mapped from animation)
  motionProfile: MotionProfile
  backdrop: BackdropStyle
  closeStyle: CloseStyle
  resultLayout: ResultLayout

  // Layout characteristics
  shellShape: 'centered' | 'bottom-sheet' | 'side-drawer' | 'lightbox' | 'focus-frame'
  headerStyle: 'minimal' | 'prominent' | 'none'
  contentSpacing: 'compact' | 'comfortable' | 'spacious'
  footerStyle: 'inline' | 'bottom-bar' | 'floating'
}

// ============================================================================
// Window Preset Registry
// ============================================================================

export const WINDOW_PRESETS: WindowPreset[] = [
  // 1. Classic Center Modal - centered, balanced, standard fade-scale
  {
    id: 'classic-center-modal',
    name: 'Classic Center',
    nameAr: 'نافذة مركزية كلاسيكية',
    description: 'نافذة مركزية متوازنة مع تأثير تلاشي وتكبير',
    animationRef: 'two',
    motionProfile: 'soft-scale',
    backdrop: 'blur-dark',
    closeStyle: 'icon-top-corner',
    resultLayout: 'before-after-prominent',
    shellShape: 'centered',
    headerStyle: 'minimal',
    contentSpacing: 'comfortable',
    footerStyle: 'bottom-bar',
  },

  // 2. Soft Scale Dialog - compact dialog with smooth scale spring
  {
    id: 'soft-scale-dialog',
    name: 'Soft Scale',
    nameAr: 'مقياس ناعم',
    description: 'حوار مضغوط مع تكوين ناعم',
    animationRef: 'two',
    motionProfile: 'zoom-in',
    backdrop: 'blur-light',
    closeStyle: 'icon-top-inline',
    resultLayout: 'side-by-side',
    shellShape: 'centered',
    headerStyle: 'minimal',
    contentSpacing: 'compact',
    footerStyle: 'inline',
  },

  // 3. Slide-Up Sheet - mobile-first bottom sheet
  {
    id: 'slide-up-sheet',
    name: 'Slide Up',
    nameAr: 'انزلاق للأعلى',
    description: 'تنبثق من أسفل الشاشة، محسّن للجوال',
    animationRef: 'two',
    motionProfile: 'slide-up',
    backdrop: 'blur-dark',
    closeStyle: 'icon-bottom-right',
    resultLayout: 'stacked',
    shellShape: 'bottom-sheet',
    headerStyle: 'prominent',
    contentSpacing: 'comfortable',
    footerStyle: 'bottom-bar',
  },

  // 4. Side Panel Right - right drawer for modern product flow
  {
    id: 'side-panel-right',
    name: 'Side Panel',
    nameAr: 'لوحة جانبية',
    description: 'لوحة من الجانب الأيمن لتدفق المنتج الحديث',
    animationRef: 'five',
    motionProfile: 'side-drawer',
    backdrop: 'dim',
    closeStyle: 'icon-top-corner',
    resultLayout: 'side-by-side',
    shellShape: 'side-drawer',
    headerStyle: 'prominent',
    contentSpacing: 'comfortable',
    footerStyle: 'bottom-bar',
  },

  // 5. Premium Lightbox - media-first immersive lightbox
  {
    id: 'premium-lightbox',
    name: 'Premium Lightbox',
    nameAr: 'نافذة فاخرة غامرة',
    description: 'نافذة إعلامية غامرة مع تأثير زجاجي',
    animationRef: 'eight',
    motionProfile: 'cinematic',
    backdrop: 'blur-light',
    closeStyle: 'icon-top-inline',
    resultLayout: 'result-first',
    shellShape: 'lightbox',
    headerStyle: 'none',
    contentSpacing: 'spacious',
    footerStyle: 'floating',
  },

  // 6. Focus Frame - minimal chrome, stronger image focus
  {
    id: 'focus-frame',
    name: 'Focus Frame',
    nameAr: 'إطار مركّز',
    description: 'حدود بسيطة مع تركيز أقوى على الصورة',
    animationRef: 'six',
    motionProfile: 'fade-scale',
    backdrop: 'dim',
    closeStyle: 'icon-top-corner',
    resultLayout: 'before-after-prominent',
    shellShape: 'focus-frame',
    headerStyle: 'minimal',
    contentSpacing: 'compact',
    footerStyle: 'inline',
  },

  // 7. Card Stack Modal - layered card entry with depth
  {
    id: 'card-stack-modal',
    name: 'Card Stack',
    nameAr: 'كومة بطاقات',
    description: 'دخول متعدد الطبقات مع عمق بصري',
    animationRef: 'three',
    motionProfile: 'soft-scale',
    backdrop: 'blur-dark',
    closeStyle: 'icon-top-inline',
    resultLayout: 'stacked',
    shellShape: 'centered',
    headerStyle: 'minimal',
    contentSpacing: 'comfortable',
    footerStyle: 'bottom-bar',
  },

  // 8. Split Preview Modal - upload/result split layout
  {
    id: 'split-preview-modal',
    name: 'Split Preview',
    nameAr: 'معاينة مقسمة',
    description: 'تخطيط مقسم للرفع والنتيجة',
    animationRef: 'four',
    motionProfile: 'cinematic',
    backdrop: 'blur-dark',
    closeStyle: 'icon-top-corner',
    resultLayout: 'side-by-side',
    shellShape: 'centered',
    headerStyle: 'minimal',
    contentSpacing: 'comfortable',
    footerStyle: 'bottom-bar',
  },

  // 9. Progressive Wizard - stepper-oriented modal with stage memory
  {
    id: 'progressive-wizard',
    name: 'Progressive Wizard',
    nameAr: 'مرشد تقدمي',
    description: 'نافذة موجهة بخطوات متقدمة',
    animationRef: 'one',
    motionProfile: 'minimal',
    backdrop: 'dim',
    closeStyle: 'text-only',
    resultLayout: 'upload-first',
    shellShape: 'centered',
    headerStyle: 'prominent',
    contentSpacing: 'spacious',
    footerStyle: 'bottom-bar',
  },

  // 10. Cinematic Overlay - dim backdrop, dramatic entrance, strong result reveal
  {
    id: 'cinematic-overlay',
    name: 'Cinematic',
    nameAr: 'سينمائي',
    description: 'دخول درامي مع إظهار قوي للنتيجة',
    animationRef: 'nine',
    motionProfile: 'cinematic',
    backdrop: 'blur-dark',
    closeStyle: 'icon-top-corner',
    resultLayout: 'result-first',
    shellShape: 'lightbox',
    headerStyle: 'none',
    contentSpacing: 'spacious',
    footerStyle: 'floating',
  },
]

// ============================================================================
// Preset Lookup
// ============================================================================

const WINDOW_PRESET_MAP = new Map<WindowPresetId, WindowPreset>(
  WINDOW_PRESETS.map((preset) => [preset.id, preset])
)

export function getWindowPreset(id: WindowPresetId): WindowPreset | undefined {
  return WINDOW_PRESET_MAP.get(id)
}

export function getAllWindowPresets(): WindowPreset[] {
  return WINDOW_PRESETS
}

// ============================================================================
// CSS Animation Classes (mapped from Modal-imations.md)
// ============================================================================

export interface ModalAnimationClasses {
  containerClass: string
  modalClass: string
  enterAnimations: string
  exitAnimations: string
}

export function getPresetAnimationClasses(preset: WindowPreset): ModalAnimationClasses {
  const baseClasses = {
    containerClass: 'modal-container',
    modalClass: 'modal',
    enterAnimations: '',
    exitAnimations: '',
  }

  // Map animation references to CSS classes
  switch (preset.animationRef) {
    case 'one': // Unfolding
      return {
        ...baseClasses,
        containerClass: `${baseClasses.containerClass} one`,
        enterAnimations: 'unfoldIn 1s cubic-bezier(0.165, 0.84, 0.44, 1) forwards',
        exitAnimations: 'unfoldOut 1s 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) forwards',
      }

    case 'two': // Revealing / Soft Scale
      return {
        ...baseClasses,
        containerClass: `${baseClasses.containerClass} two`,
        enterAnimations: 'scaleUp 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards',
        exitAnimations: 'scaleDown 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards',
      }

    case 'three': // Uncovering / Card Stack
      return {
        ...baseClasses,
        containerClass: `${baseClasses.containerClass} three`,
        enterAnimations: 'moveUp 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards',
        exitAnimations: 'moveDown 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards',
      }

    case 'four': // Blow Up
      return {
        ...baseClasses,
        containerClass: `${baseClasses.containerClass} four`,
        enterAnimations: 'blowUpModal 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards',
        exitAnimations: 'blowUpModalTwo 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards',
      }

    case 'five': // Meep Meep / Side Panel
      return {
        ...baseClasses,
        containerClass: `${baseClasses.containerClass} five`,
        enterAnimations: 'roadRunnerIn 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) forwards',
        exitAnimations: 'roadRunnerOut 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards',
      }

    case 'six': // Sketch / Focus Frame
      return {
        ...baseClasses,
        containerClass: `${baseClasses.containerClass} six`,
        enterAnimations: 'modalFadeIn 0.5s 0.8s cubic-bezier(0.165, 0.84, 0.44, 1) forwards',
        exitAnimations: 'modalFadeOut 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards',
      }

    case 'seven': // Bond
      return {
        ...baseClasses,
        containerClass: `${baseClasses.containerClass} seven`,
        enterAnimations: 'bondJamesBond 1.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards',
        exitAnimations: 'killShot 1s cubic-bezier(0.165, 0.84, 0.44, 1) forwards',
      }

    case 'eight': // Aurora / Premium Lightbox
      return {
        ...baseClasses,
        containerClass: `${baseClasses.containerClass} eight`,
        enterAnimations: 'auroraModalIn 0.65s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards',
        exitAnimations: 'auroraModalOut 0.35s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards',
      }

    case 'nine': // Cyber Pulse / Cinematic
      return {
        ...baseClasses,
        containerClass: `${baseClasses.containerClass} nine`,
        enterAnimations: 'hologramIn 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        exitAnimations: 'hologramOut 0.35s cubic-bezier(0.7, 0, 0.84, 0) forwards',
      }

    default: // Fallback
      return {
        ...baseClasses,
        enterAnimations: 'fadeIn 0.2s ease forwards',
        exitAnimations: 'fadeOut 0.2s ease forwards',
      }
  }
}

// ============================================================================
// CSS Variable Generator for Window Presets
// ============================================================================

export interface WindowPresetCSSVariables {
  '--modal-bg': string
  '--modal-text': string
  '--modal-border': string
  '--modal-backdrop': string
  '--modal-radius': string
  '--modal-shadow': string
  '--modal-backdrop-blur': string
  '--modal-padding': string
  '--modal-header-spacing': string
  '--modal-footer-spacing': string
}

export function getPresetCSSVariables(
  preset: WindowPreset,
  brandColor: string
): WindowPresetCSSVariables {
  // Map spacing
  const getSpacing = () => {
    switch (preset.contentSpacing) {
      case 'compact':
        return '16px'
      case 'comfortable':
        return '24px'
      case 'spacious':
        return '32px'
    }
  }

  const getHeaderSpacing = () => {
    switch (preset.headerStyle) {
      case 'none':
        return '0'
      case 'minimal':
        return '12px'
      case 'prominent':
        return '24px'
    }
  }

  const getFooterSpacing = () => {
    switch (preset.footerStyle) {
      case 'inline':
        return '0'
      case 'bottom-bar':
        return '24px'
      case 'floating':
        return '16px'
    }
  }

  // Map backdrop
  const getBackdrop = () => {
    switch (preset.backdrop) {
      case 'none':
        return 'transparent'
      case 'dim':
        return 'rgba(0, 0, 0, 0.7)'
      case 'blur-dark':
        return 'rgba(3, 7, 18, 0.58)'
      case 'blur-light':
        return 'rgba(255, 255, 255, 0.1)'
      case 'gradient':
        return `linear-gradient(135deg, ${brandColor}33, rgba(0, 0, 0, 0.5))`
    }
  }

  // Map backdrop blur
  const getBackdropBlur = () => {
    switch (preset.backdrop) {
      case 'none':
      case 'dim':
      case 'gradient':
        return '0px'
      case 'blur-dark':
        return '10px'
      case 'blur-light':
        return '18px'
    }
  }

  // Map shell shape to radius
  const getRadius = () => {
    switch (preset.shellShape) {
      case 'focus-frame':
        return '8px'
      case 'centered':
      case 'lightbox':
        return '16px'
      case 'bottom-sheet':
        return '20px 20px 0 0'
      case 'side-drawer':
        return '0'
    }
  }

  // Map to CSS variables
  return {
    '--modal-bg': preset.shellShape === 'lightbox'
      ? `linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.08))`
      : '#ffffff',
    '--modal-text': '#ffffff',
    '--modal-border': `${brandColor}38`,
    '--modal-backdrop': getBackdrop(),
    '--modal-radius': getRadius(),
    '--modal-shadow': '0 24px 80px rgba(0, 0, 0, 0.35)',
    '--modal-backdrop-blur': getBackdropBlur(),
    '--modal-padding': getSpacing(),
    '--modal-header-spacing': getHeaderSpacing(),
    '--modal-footer-spacing': getFooterSpacing(),
  }
}

// ============================================================================
// Reduced Motion Support
// ============================================================================

export function getReducedMotionClasses(): string {
  // Fallback animation for prefers-reduced-motion
  return 'transition-opacity duration-200 ease-in-out'
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
