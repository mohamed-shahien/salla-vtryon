import React, { useState } from 'react'
import { Eye } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import type { WidgetStudioConfig } from '../schema/widget-studio.schema'
import { PreviewDeviceToggle, type PreviewDevice } from './PreviewDeviceToggle'
import { PreviewStoreFrame } from './PreviewStoreFrame'

interface WidgetLivePreviewProps {
  config: WidgetStudioConfig
}

export const WidgetLivePreview = React.memo(function WidgetLivePreview({
  config,
}: WidgetLivePreviewProps) {
  const [device, setDevice] = useState<PreviewDevice>('desktop')

  return (
    <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md rounded-lg text-right transition-all duration-500 overflow-hidden">
      <CardHeader className="p-3 border-b border-border/10 pb-2">
        <div className="flex items-center justify-between gap-4">
          <PreviewDeviceToggle device={device} onChange={setDevice} />
          <div className="space-y-0.5">
            <CardTitle className="text-xs font-black flex items-center gap-2 justify-end">
              معاينة مباشرة
              <Eye className="size-4 text-primary" />
            </CardTitle>
            <CardDescription className="text-[8px] font-bold opacity-60">
              تحديث فوري أثناء التعديل
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1.5 justify-end">
          <Badge variant="outline" className="text-[7px] font-bold px-1.5 py-0 bg-emerald-100/50 text-emerald-600 border-emerald-200/50 rounded-md">
            مباشر
          </Badge>
          <span className="text-[8px] font-bold text-muted-foreground opacity-60">
            اضغط على الزر لمعاينة النافذة
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0 bg-muted/5">
        <div className="p-3 flex justify-center items-center min-h-[400px]">
          <PreviewStoreFrame config={config} device={device} />
        </div>
      </CardContent>
    </Card>
  )
})

