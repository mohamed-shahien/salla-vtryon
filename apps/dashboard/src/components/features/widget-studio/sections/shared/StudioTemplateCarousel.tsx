import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

interface StudioTemplateCarouselProps<T> {
  title: string
  description: string
  icon: React.ReactNode
  items: T[]
  activeId: string
  renderVisual: (item: T, isActive: boolean) => React.ReactNode
  onSelect: (item: T) => void
  getItemName: (item: T) => string
  getItemDescription: (item: T) => string
  getItemId: (item: T) => string
}

export function StudioTemplateCarousel<T>({
  title,
  description,
  icon,
  items,
  activeId,
  renderVisual,
  onSelect,
  getItemName,
  getItemDescription,
  getItemId,
}: StudioTemplateCarouselProps<T>) {
  return (
    <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md rounded-lg text-right overflow-hidden">
      <CardHeader className="p-3 border-b border-border/10">
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {/* The Carousel context provides controls, but we'll use our own layout if needed or the built-in ones */}
          </div>
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-black flex items-center gap-2 justify-end">
              {title}
              {icon}
            </CardTitle>
            <CardDescription className="text-[9px] font-bold opacity-60">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3">
        <Carousel
          opts={{
            align: 'start',
            direction: 'rtl',
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2">
            {items.map((item) => {
              const id = getItemId(item)
              const isActive = activeId === id
              return (
                <CarouselItem key={id} className="pl-2 basis-auto">
                  <button
                    onClick={() => onSelect(item)}
                    className={cn(
                      "shrink-0 w-[130px] rounded-lg border p-2 transition-all duration-200 text-right space-y-1.5",
                      isActive
                        ? "border-primary bg-primary/5 ring-1 ring-primary/10 shadow-sm"
                        : "border-border/40 hover:bg-muted/20 opacity-80 hover:opacity-100"
                    )}
                  >
                    {renderVisual(item, isActive)}
                    <p className="text-[9px] font-black truncate">{getItemName(item)}</p>
                    <p className="text-[7px] font-bold text-muted-foreground truncate">
                      {getItemDescription(item)}
                    </p>
                  </button>
                </CarouselItem>
              )
            })}
          </CarouselContent>
          <div className="absolute -top-9 left-0 flex gap-1">
            <CarouselPrevious className="static translate-y-0 size-6 rounded-lg border-border/40 hover:bg-primary/5 hover:text-primary transition-all" />
            <CarouselNext className="static translate-y-0 size-6 rounded-lg border-border/40 hover:bg-primary/5 hover:text-primary transition-all" />
          </div>
        </Carousel>
      </CardContent>
    </Card>
  )
}
