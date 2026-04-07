import React, { useState } from 'react'
import { Eye } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import type { WidgetStudioConfig } from '../schema/widget-studio.schema'
import { PreviewDeviceToggle } from './PreviewDeviceToggle'
import { PreviewStoreFrame } from './PreviewStoreFrame'

interface WidgetLivePreviewProps {
  config: WidgetStudioConfig
}

export const WidgetLivePreview = React.memo(function WidgetLivePreview({
  config,
}: WidgetLivePreviewProps) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')

  return (
    <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md rounded-lg text-right sticky top-3">
      <CardHeader className="p-3 border-b border-border/10">
        <div className="flex items-center justify-between">
          <PreviewDeviceToggle device={device} onChange={setDevice} />
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-black flex items-center gap-2 justify-end">
              معاينة مباشرة
              <Eye className="size-4 text-primary" />
            </CardTitle>
            <CardDescription className="text-[9px] font-bold opacity-60">
              تحديث فوري أثناء تعديل الإعدادات
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1 justify-end">
          <Badge variant="outline" className="text-[7px] font-bold px-1.5 py-0 bg-emerald-50 text-emerald-600 border-emerald-200/50 rounded-md">
            مباشر
          </Badge>
          <span className="text-[8px] font-bold text-muted-foreground opacity-60">
            اضغط على الزر لمعاينة النافذة
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-3">
        <PreviewStoreFrame config={config} device={device} />
      </CardContent>
    </Card>
  )
})
