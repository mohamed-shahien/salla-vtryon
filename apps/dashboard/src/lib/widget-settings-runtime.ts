/**
 * Widget Settings Runtime Utilities
 *
 * Runtime helper functions for applying widget settings in the dashboard.
 * Generates CSS variables and resolves presets for live preview.
 */

import type {
  WidgetSettings,
  ButtonSettings,
  WindowSettings,
  VisualIdentity,
  ButtonPresetId,
  WindowPresetId,
} from '@virtual-tryon/shared-types'

// ============================================================================
// Button Preset Data (same as widget runtime)
// ============================================================================

export interface ButtonPreset {
  id: ButtonPresetId
  nameAr: string
  description: string
  styles: {
    background: string
    text: string
    border: string
    hover: {
      background: string
      text: string
      border: string
      shadow: string
    }
    disabled: {
      opacity: number
      grayscale: number
    }
  }
}

const BUTTON_PRESETS: Record<ButtonPresetId, ButtonPreset> = {
  'core-solid': {
    id: 'core-solid',
    nameAr: 'أساسي صلب',
    description: 'لون أساسي مع رفع خفيف',
    styles: {
      background: '#7c3aed',
      text: '#ffffff',
      border: 'transparent',
      hover: {
        background: '#6d28d9',
        text: '#ffffff',
        border: 'transparent',
        shadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
      },
      disabled: { opacity: 0.6, grayscale: 0.5 },
    },
  },
  'soft-glow': {
    id: 'soft-glow',
    nameAr: 'توهج ناعم',
    description: 'تدرج لوني مع توهج عند التحويم',
    styles: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      text: '#ffffff',
      border: 'transparent',
      hover: {
        background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
        text: '#ffffff',
        border: 'transparent',
        shadow: '0 0 20px rgba(102, 126, 234, 0.5)',
      },
      disabled: { opacity: 0.6, grayscale: 0.5 },
    },
  },
  'glass-air': {
    id: 'glass-air',
    nameAr: 'زجاج هوائي',
    description: 'زجاج شفاف مع ضبابية',
    styles: {
      background: 'rgba(124, 58, 237, 0.1)',
      text: '#7c3aed',
      border: '1px solid rgba(124, 58, 237, 0.2)',
      hover: {
        background: 'rgba(124, 58, 237, 0.2)',
        text: '#6d28d9',
        border: '1px solid rgba(124, 58, 237, 0.4)',
        shadow: '0 8px 32px rgba(124, 58, 237, 0.15)',
      },
      disabled: { opacity: 0.5, grayscale: 0.7 },
    },
  },
  'outline-pulse': {
    id: 'outline-pulse',
    nameAr: 'حدود نبض',
    description: 'حدود مع حلقة نبض متحركة',
    styles: {
      background: 'transparent',
      text: '#7c3aed',
      border: '2px solid #7c3aed',
      hover: {
        background: '#7c3aed',
        text: '#ffffff',
        border: '2px solid #7c3aed',
        shadow: '0 0 0 3px rgba(124, 58, 237, 0.2)',
      },
      disabled: { opacity: 0.5, grayscale: 0.7 },
    },
  },
  'premium-gold': {
    id: 'premium-gold',
    nameAr: 'ذهبي فاخر',
    description: 'تدرج ذهبي مع لمعان',
    styles: {
      background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
      text: '#1a1a1a',
      border: 'transparent',
      hover: {
        background: 'linear-gradient(135deg, #f5c542 0%, #f89657 100%)',
        text: '#1a1a1a',
        border: 'transparent',
        shadow: '0 4px 15px rgba(246, 211, 101, 0.4)',
      },
      disabled: { opacity: 0.6, grayscale: 0.5 },
    },
  },
  'mono-sharp': {
    id: 'mono-sharp',
    nameAr: 'أحادي حاد',
    description: 'أبيض وأسود نظيف',
    styles: {
      background: '#1a1a1a',
      text: '#ffffff',
      border: '1px solid #1a1a1a',
      hover: {
        background: '#333333',
        text: '#ffffff',
        border: '1px solid #333333',
        shadow: 'none',
      },
      disabled: { opacity: 0.5, grayscale: 0.7 },
    },
  },
  'rounded-soft': {
    id: 'rounded-soft',
    nameAr: 'دائري ناعم',
    description: 'زر حبة مع ظل ناعم',
    styles: {
      background: '#7c3aed',
      text: '#ffffff',
      border: 'transparent',
      hover: {
        background: '#6d28d9',
        text: '#ffffff',
        border: 'transparent',
        shadow: '0 6px 20px rgba(124, 58, 237, 0.25)',
      },
      disabled: { opacity: 0.6, grayscale: 0.5 },
    },
  },
  'floating-fab': {
    id: 'floating-fab',
    nameAr: 'زر عائم',
    description: 'دائري بارز مع عمق',
    styles: {
      background: '#7c3aed',
      text: '#ffffff',
      border: 'transparent',
      hover: {
        background: '#6d28d9',
        text: '#ffffff',
        border: 'transparent',
        shadow: '0 8px 25px rgba(124, 58, 237, 0.4)',
      },
      disabled: { opacity: 0.5, grayscale: 0.7 },
    },
  },
  'neon-edge': {
    id: 'neon-edge',
    nameAr: 'حافة نيون',
    description: 'سطح داكن مع حدود مضيئة',
    styles: {
      background: '#0f0f0f',
      text: '#00ff88',
      border: '1px solid #00ff88',
      hover: {
        background: '#1a1a1a',
        text: '#00ff88',
        border: '1px solid #00ff88',
        shadow: '0 0 15px rgba(0, 255, 136, 0.5)',
      },
      disabled: { opacity: 0.5, grayscale: 0.7 },
    },
  },
  'ghost-highlight': {
    id: 'ghost-highlight',
    nameAr: 'شبح مميز',
    description: 'خفيف مع ملء عند النشاط',
    styles: {
      background: 'rgba(124, 58, 237, 0.05)',
      text: '#7c3aed',
      border: '1px solid transparent',
      hover: {
        background: 'rgba(124, 58, 237, 0.15)',
        text: '#6d28d9',
        border: '1px solid rgba(124, 58, 237, 0.2)',
        shadow: 'none',
      },
      disabled: { opacity: 0.4, grayscale: 0.6 },
    },
  },
  'split-icon': {
    id: 'split-icon',
    nameAr: 'أيقونة منفصلة',
    description: 'كبسولة أيقونة منفصلة مع نص',
    styles: {
      background: '#f3f4f6',
      text: '#1f2937',
      border: '1px solid #e5e7eb',
      hover: {
        background: '#e5e7eb',
        text: '#111827',
        border: '1px solid #d1d5db',
        shadow: 'none',
      },
      disabled: { opacity: 0.5, grayscale: 0.7 },
    },
  },
  'elevated-card-cta': {
    id: 'elevated-card-cta',
    nameAr: 'بطاقة مرتفعة',
    description: 'نمط بطاقة مصغرة',
    styles: {
      background: '#ffffff',
      text: '#7c3aed',
      border: '1px solid #e5e7eb',
      hover: {
        background: '#f9fafb',
        text: '#6d28d9',
        border: '1px solid #d1d5db',
        shadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
      disabled: { opacity: 0.5, grayscale: 0.7 },
    },
  },
  'badge-trigger': {
    id: 'badge-trigger',
    nameAr: 'شارة مشغل',
    description: 'شارة أو شريحة صغيرة',
    styles: {
      background: '#7c3aed',
      text: '#ffffff',
      border: 'transparent',
      hover: {
        background: '#6d28d9',
        text: '#ffffff',
        border: 'transparent',
        shadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
      },
      disabled: { opacity: 0.6, grayscale: 0.5 },
    },
  },
  'underline-motion': {
    id: 'underline-motion',
    nameAr: 'تحت خط متحرك',
    description: 'نص أولاً مع تسطير متحرك',
    styles: {
      background: 'transparent',
      text: '#7c3aed',
      border: 'none',
      hover: {
        background: 'transparent',
        text: '#6d28d9',
        border: 'none',
        shadow: 'none',
      },
      disabled: { opacity: 0.4, grayscale: 0.6 },
    },
  },
  'shimmer-strip': {
    id: 'shimmer-strip',
    nameAr: 'شريط لامع',
    description: 'مرور لامع عند التحويم',
    styles: {
      background: '#7c3aed',
      text: '#ffffff',
      border: 'transparent',
      hover: {
        background: '#6d28d9',
        text: '#ffffff',
        border: 'transparent',
        shadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
      },
      disabled: { opacity: 0.6, grayscale: 0.5 },
    },
  },
  'gradient-aura': {
    id: 'gradient-aura',
    nameAr: 'هالة متدرجة',
    description: 'تدرج غني مع هالة',
    styles: {
      background: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #48dbfb 100%)',
      text: '#1a1a1a',
      border: 'transparent',
      hover: {
        background: 'linear-gradient(135deg, #ff5252 0%, #ffbd3f 50%, #0abde3 100%)',
        text: '#1a1a1a',
        border: 'transparent',
        shadow: '0 0 25px rgba(255, 107, 107, 0.4)',
      },
      disabled: { opacity: 0.6, grayscale: 0.5 },
    },
  },
  'editorial-minimal': {
    id: 'editorial-minimal',
    nameAr: 'تحريري بسيط',
    description: 'نص أولاً فاخر',
    styles: {
      background: 'transparent',
      text: '#1a1a1a',
      border: '1px solid #1a1a1a',
      hover: {
        background: '#1a1a1a',
        text: '#ffffff',
        border: '1px solid #1a1a1a',
        shadow: 'none',
      },
      disabled: { opacity: 0.4, grayscale: 0.6 },
    },
  },
  'tech-panel': {
    id: 'tech-panel',
    nameAr: 'لوحة تقنية',
    description: 'حدود زاوية مع عمق لوحة',
    styles: {
      background: '#0a0a0a',
      text: '#00f0ff',
      border: '1px solid #00f0ff',
      hover: {
        background: '#111111',
        text: '#00d0e0',
        border: '1px solid #00d0e0',
        shadow: '0 0 15px rgba(0, 240, 255, 0.3)',
      },
      disabled: { opacity: 0.5, grayscale: 0.7 },
    },
  },
  'soft-outline-fill': {
    id: 'soft-outline-fill',
    nameAr: 'حدود ناعمة ممتلئة',
    description: 'حدود عند الخمول، ممتلئ عند التحويم',
    styles: {
      background: 'transparent',
      text: '#7c3aed',
      border: '1px solid #7c3aed',
      hover: {
        background: '#7c3aed',
        text: '#ffffff',
        border: '1px solid #7c3aed',
        shadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
      },
      disabled: { opacity: 0.5, grayscale: 0.7 },
    },
  },
  'mobile-sticky-cta': {
    id: 'mobile-sticky-cta',
    nameAr: 'زر ثابت للجوال',
    description: 'حبة مثالية للجوال',
    styles: {
      background: '#7c3aed',
      text: '#ffffff',
      border: 'transparent',
      hover: {
        background: '#6d28d9',
        text: '#ffffff',
        border: 'transparent',
        shadow: '0 4px 12px rgba(124, 58, 237, 0.4)',
      },
      disabled: { opacity: 0.6, grayscale: 0.5 },
    },
  },
}

export function getButtonPreset(presetId: ButtonPresetId): ButtonPreset {
  return BUTTON_PRESETS[presetId] || BUTTON_PRESETS['core-solid']
}

// ============================================================================
// Window Preset Data (same as widget runtime)
// ============================================================================

export interface WindowPreset {
  id: WindowPresetId
  nameAr: string
  description: string
  animationRef: string
  animationClasses: {
    enter: string
    enterActive: string
    exit: string
    exitActive: string
  }
}

const WINDOW_PRESETS: Record<WindowPresetId, WindowPreset> = {
  'one': {
    id: 'one',
    nameAr: 'انفتاح طولي (Unfolding)',
    description: 'خط أفقي يتوسع ليصبح نافذة كاملة',
    animationRef: 'one',
    animationClasses: {
      enter: 'animate-unfold-in',
      enterActive: 'animate-unfold-in',
      exit: 'animate-unfold-out',
      exitActive: 'animate-unfold-out',
    },
  },
  'two': {
    id: 'two',
    nameAr: 'كشف درامي (Revealing)',
    description: 'صعود من الأسفل مع تكبير',
    animationRef: 'two',
    animationClasses: {
      enter: 'animate-reveal-in',
      enterActive: 'animate-reveal-in',
      exit: 'animate-reveal-out',
      exitActive: 'animate-reveal-out',
    },
  },
  'three': {
    id: 'three',
    nameAr: 'إزاحة المحتوى (Uncovering)',
    description: 'المحتوى يرتفع للأعلى لتظهر النافذة خلفه',
    animationRef: 'three',
    animationClasses: {
      enter: 'animate-uncover-in',
      enterActive: 'animate-uncover-in',
      exit: 'animate-uncover-out',
      exitActive: 'animate-uncover-out',
    },
  },
  'four': {
    id: 'four',
    nameAr: 'انفجار مركزي (Blow Up)',
    description: 'توسع سريع من المركز',
    animationRef: 'four',
    animationClasses: {
      enter: 'animate-blow-up-in',
      enterActive: 'animate-blow-up-in',
      exit: 'animate-blow-up-out',
      exitActive: 'animate-blow-up-out',
    },
  },
  'classic-center-modal': {
    id: 'classic-center-modal',
    nameAr: 'نافذة مركزية كلاسيكية',
    description: 'مركزية، متوازنة، تلاشي وتكبير قياسي',
    animationRef: 'two',
    animationClasses: {
      enter: 'opacity-0 scale-95',
      enterActive: 'opacity-100 scale-100 transition-all duration-300 ease-out',
      exit: 'opacity-100 scale-100',
      exitActive: 'opacity-0 scale-95 transition-all duration-200 ease-in',
    },
  },
  'soft-scale-dialog': {
    id: 'soft-scale-dialog',
    nameAr: 'حوار ناعم',
    description: 'حوار مدمج مع تكوين ناعم',
    animationRef: 'two',
    animationClasses: {
      enter: 'opacity-0 scale-90',
      enterActive: 'opacity-100 scale-100 transition-all duration-250 ease-out',
      exit: 'opacity-100 scale-100',
      exitActive: 'opacity-0 scale-90 transition-all duration-200 ease-in',
    },
  },
  'slide-up-sheet': {
    id: 'slide-up-sheet',
    nameAr: 'شريط من الأسفل',
    description: 'ورقة من الأسفل للجوال',
    animationRef: 'two',
    animationClasses: {
      enter: 'translate-y-full',
      enterActive: 'translate-y-0 transition-transform duration-300 ease-out',
      exit: 'translate-y-0',
      exitActive: 'translate-y-full transition-transform duration-200 ease-in',
    },
  },
  'side-panel-right': {
    id: 'side-panel-right',
    nameAr: 'لوحة جانبية',
    description: 'درج يمين لتدفق منتج حديث',
    animationRef: 'five',
    animationClasses: {
      enter: 'translate-x-full',
      enterActive: 'translate-x-0 transition-transform duration-300 ease-out',
      exit: 'translate-x-0',
      exitActive: 'translate-x-full transition-transform duration-200 ease-in',
    },
  },
  'premium-lightbox': {
    id: 'premium-lightbox',
    nameAr: 'لوحة فاخرة',
    description: 'وسائط أولاً غامرة',
    animationRef: 'eight',
    animationClasses: {
      enter: 'opacity-0 scale-90 blur-sm',
      enterActive: 'opacity-100 scale-100 blur-0 transition-all duration-400 ease-out',
      exit: 'opacity-100 scale-100 blur-0',
      exitActive: 'opacity-0 scale-90 blur-sm transition-all duration-300 ease-in',
    },
  },
  'focus-frame': {
    id: 'focus-frame',
    nameAr: 'إطار التركيز',
    description: 'كروم أقل، تركيز صورة أقوى',
    animationRef: 'six',
    animationClasses: {
      enter: 'opacity-0 scale-95',
      enterActive: 'opacity-100 scale-100 transition-all duration-200 ease-out',
      exit: 'opacity-100 scale-100',
      exitActive: 'opacity-0 scale-95 transition-all duration-150 ease-in',
    },
  },
  'card-stack-modal': {
    id: 'card-stack-modal',
    nameAr: 'نافذة كروت مكدسة',
    description: 'دخول بطقات متعددة مع عمق',
    animationRef: 'three',
    animationClasses: {
      enter: 'opacity-0 translate-y-4 rotate-2',
      enterActive: 'opacity-100 translate-y-0 rotate-0 transition-all duration-300 ease-out',
      exit: 'opacity-100 translate-y-0 rotate-0',
      exitActive: 'opacity-0 translate-y-4 -rotate-2 transition-all duration-200 ease-in',
    },
  },
  'split-preview-modal': {
    id: 'split-preview-modal',
    nameAr: 'نافذة معاينة منقسمة',
    description: 'تخطيط رفع/نتيجة منقسم',
    animationRef: 'four',
    animationClasses: {
      enter: 'opacity-0 scale-90',
      enterActive: 'opacity-100 scale-100 transition-all duration-350 ease-out',
      exit: 'opacity-100 scale-100',
      exitActive: 'opacity-0 scale-90 transition-all duration-250 ease-in',
    },
  },
  'progressive-wizard': {
    id: 'progressive-wizard',
    nameAr: 'معالج تدريجي',
    description: 'نافذة موجهة بمراحل مع ذاكرة المرحلة',
    animationRef: 'one',
    animationClasses: {
      enter: 'opacity-0 translate-y-8',
      enterActive: 'opacity-100 translate-y-0 transition-all duration-400 ease-out',
      exit: 'opacity-100 translate-y-0',
      exitActive: 'opacity-0 translate-y-8 transition-all duration-300 ease-in',
    },
  },
  'cinematic-overlay': {
    id: 'cinematic-overlay',
    nameAr: 'تراكب سينمائي',
    description: 'خلفية معتمة، دخول درامي، كشف قوي',
    animationRef: 'nine',
    animationClasses: {
      enter: 'opacity-0 scale-110',
      enterActive: 'opacity-100 scale-100 transition-all duration-500 ease-out',
      exit: 'opacity-100 scale-100',
      exitActive: 'opacity-0 scale-110 transition-all duration-400 ease-in',
    },
  },
}

export function getWindowPreset(presetId: WindowPresetId): WindowPreset {
  return WINDOW_PRESETS[presetId] || WINDOW_PRESETS['classic-center-modal']
}

export function getWindowBackdropClass(backdrop: WindowSettings['backdrop']): string {
  const backdropClasses: Record<WindowSettings['backdrop'], string> = {
    'dim': 'bg-black/60',
    'blur-dark': 'bg-black/40 backdrop-blur-md',
    'blur-light': 'bg-white/50 backdrop-blur-sm',
    'gradient': 'bg-gradient-to-b from-black/50 to-black/80',
    'none': 'bg-transparent',
  }
  return backdropClasses[backdrop] || backdropClasses['dim']
}

// ============================================================================
// CSS Variable Generators
// ============================================================================

export function generateButtonCSSVariables(settings: ButtonSettings): Record<string, string> {
  const preset = getButtonPreset(settings.preset)

  // Size mappings
  const sizePadding: Record<ButtonSettings['size'], string> = {
    sm: '8px 16px',
    md: '12px 24px',
    lg: '16px 32px',
  }

  const sizeFontSize: Record<ButtonSettings['size'], string> = {
    sm: '13px',
    md: '15px',
    lg: '17px',
  }

  return {
    '--vtryon-btn-bg': preset.styles.background,
    '--vtryon-btn-text': preset.styles.text,
    '--vtryon-btn-border': preset.styles.border,
    '--vtryon-btn-hover-bg': preset.styles.hover.background,
    '--vtryon-btn-hover-text': preset.styles.hover.text,
    '--vtryon-btn-hover-border': preset.styles.hover.border,
    '--vtryon-btn-hover-shadow': preset.styles.hover.shadow,
    '--vtryon-btn-disabled-opacity': String(preset.styles.disabled.opacity),
    '--vtryon-btn-disabled-grayscale': String(preset.styles.disabled.grayscale),
    '--vtryon-btn-padding': sizePadding[settings.size],
    '--vtryon-btn-font-size': sizeFontSize[settings.size],
    '--vtryon-btn-full-width': settings.full_width ? '100%' : 'auto',
    '--vtryon-btn-icon-display': settings.icon.enabled ? 'inline-flex' : 'none',
    '--vtryon-btn-icon-order': settings.icon.position === 'start' ? '-1' : '1',
  }
}

export function generateVisualIdentityCSSVariables(settings: VisualIdentity): Record<string, string> {
  // Surface style mappings
  const surfaceBackground: Record<VisualIdentity['surface_style'], string> = {
    solid: '#ffffff',
    soft: '#f9fafb',
    elevated: '#ffffff',
    glass: 'rgba(255, 255, 255, 0.8)',
    outline: '#ffffff',
  }

  const surfaceShadow: Record<VisualIdentity['surface_style'], string> = {
    solid: 'none',
    soft: 'none',
    elevated: '0 4px 12px rgba(0, 0, 0, 0.1)',
    glass: '0 8px 32px rgba(0, 0, 0, 0.08)',
    outline: 'none',
  }

  const surfaceBorder: Record<VisualIdentity['surface_style'], string> = {
    solid: '1px solid #e5e7eb',
    soft: '1px solid #f3f4f6',
    elevated: 'none',
    glass: '1px solid rgba(255, 255, 255, 0.2)',
    outline: '1px solid #d1d5db',
  }

  // Corner radius mappings
  const radiusMap: Record<VisualIdentity['corner_radius'], string> = {
    compact: '8px',
    balanced: '12px',
    rounded: '16px',
    'pill-heavy': '24px',
  }

  // Spacing density mappings
  const spacingMap: Record<VisualIdentity['spacing_density'], string> = {
    compact: '12px',
    comfortable: '16px',
    spacious: '24px',
  }

  // Backdrop style mappings
  const backdropFilter: Record<VisualIdentity['backdrop_style'], string> = {
    dim: 'none',
    'blur-dark': 'blur(8px)',
    'blur-light': 'blur(4px)',
    gradient: 'none',
    none: 'none',
  }

  const backdropBackground: Record<VisualIdentity['backdrop_style'], string> = {
    dim: 'rgba(0, 0, 0, 0.6)',
    'blur-dark': 'rgba(0, 0, 0, 0.4)',
    'blur-light': 'rgba(255, 255, 255, 0.4)',
    gradient: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.8))',
    none: 'transparent',
  }

  // Motion energy mappings
  const motionDuration: Record<VisualIdentity['motion_energy'], string> = {
    minimal: '0.15s',
    smooth: '0.3s',
    lively: '0.4s',
    dynamic: '0.5s',
  }

  const motionEasing: Record<VisualIdentity['motion_energy'], string> = {
    minimal: 'ease-out',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    lively: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    dynamic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  }

  return {
    '--vtryon-brand-color': settings.brand_color,
    '--vtryon-surface-bg': surfaceBackground[settings.surface_style],
    '--vtryon-surface-shadow': surfaceShadow[settings.surface_style],
    '--vtryon-surface-border': surfaceBorder[settings.surface_style],
    '--vtryon-radius': radiusMap[settings.corner_radius],
    '--vtryon-spacing': spacingMap[settings.spacing_density],
    '--vtryon-backdrop-filter': backdropFilter[settings.backdrop_style],
    '--vtryon-backdrop-bg': backdropBackground[settings.backdrop_style],
    '--vtryon-motion-duration': motionDuration[settings.motion_energy],
    '--vtryon-motion-easing': motionEasing[settings.motion_energy],
    '--vtryon-typography-weight': settings.typography_tone === 'bold' ? '900' : settings.typography_tone === 'modern' ? '700' : '400',
    '--vtryon-icon-stroke': settings.icon_style === 'bold' ? '3' : '2',
  }
}

/**
 * Generates all CSS variables from unified config
 */
export function generateAllCSSVariables(settings: WidgetSettings): Record<string, string> {
  const buttonVars = generateButtonCSSVariables(settings.button)
  const visualIdentityVars = generateVisualIdentityCSSVariables(settings.visual_identity)

  return {
    ...buttonVars,
    ...visualIdentityVars,
    '--vtryon-window-backdrop': getWindowBackdropClass(settings.window.backdrop),
    '--vtryon-window-motion-duration': settings.window.motion_profile === 'cinematic' ? '0.5s' : '0.3s',
  }
}
