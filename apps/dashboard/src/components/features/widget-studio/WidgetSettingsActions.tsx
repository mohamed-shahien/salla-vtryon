import React from 'react'
import { Save, RotateCcw, Undo2, Loader2, Check, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { SaveStatus } from './hooks/use-widget-studio'

interface WidgetSettingsActionsProps {
  isDirty: boolean
  saveStatus: SaveStatus
  onSave: () => void
  onReset: () => void
  onDiscard: () => void
}

const SAVE_ICON_MAP: Record<SaveStatus, React.ReactNode> = {
  idle: <Save className="size-3.5" />,
  saving: <Loader2 className="size-3.5 animate-spin" />,
  saved: <Check className="size-3.5" />,
  error: <AlertCircle className="size-3.5" />,
}

const SAVE_LABEL_MAP: Record<SaveStatus, string> = {
  idle: 'حفظ ونشر',
  saving: 'جاري الحفظ...',
  saved: 'تم الحفظ',
  error: 'فشل الحفظ',
}

export const WidgetSettingsActions = React.memo(function WidgetSettingsActions({
  isDirty,
  saveStatus,
  onSave,
  onReset,
  onDiscard,
}: WidgetSettingsActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {isDirty && (
        <Button
          variant="ghost"
          onClick={onDiscard}
          className="rounded-lg font-bold text-[10px] h-8 px-3 text-muted-foreground hover:text-foreground"
        >
          <Undo2 className="me-1.5 size-3" />
          تراجع
        </Button>
      )}

      <Button
        variant="outline"
        onClick={onReset}
        className="rounded-lg font-bold text-[10px] h-8 px-3 border-border/60 bg-card/50"
      >
        <RotateCcw className="me-1.5 size-3" />
        افتراضي
      </Button>

      <Button
        onClick={onSave}
        disabled={!isDirty || saveStatus === 'saving'}
        className="rounded-lg font-black text-[10px] h-8 px-5 shadow-lg shadow-primary/20 bg-primary transition-all active:scale-[0.97]"
      >
        <span className="me-1.5">{SAVE_ICON_MAP[saveStatus]}</span>
        {SAVE_LABEL_MAP[saveStatus]}
      </Button>
    </div>
  )
})
