import React from 'react'
import type { WidgetStudioConfig } from '../schema/widget-studio.schema'
import type { PreviewDevice } from './PreviewDeviceToggle'
import { PreviewStoreFrame } from './PreviewStoreFrame'
interface WidgetLivePreviewProps {
  config: WidgetStudioConfig
  device: PreviewDevice
}
export const WidgetLivePreview = React.memo(function WidgetLivePreview({
  config,
  device,
}: WidgetLivePreviewProps) {
  return (
    <div className="flex-1 w-full h-full flex flex-col items-stretch overflow-hidden relative">
      <div className="flex-1 w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-muted/5 group">
         <div className="absolute -inset-40 bg-linear-to-tr from-primary/10 via-transparent to-primary/5 rounded-full blur-[120px] opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity duration-1000" />
         
         <div className="relative transition-all duration-700 ease-in-out transform-gpu w-full h-full flex items-center justify-center p-2">
            <div className="relative overflow-hidden w-full h-full">
              <PreviewStoreFrame config={config} device={device} />
            </div>
         </div>
      </div>
    </div>
  )
})
