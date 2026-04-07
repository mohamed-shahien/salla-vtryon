"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"

const Accordion = AccordionPrimitive.Root

const AccordionItem = ({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) => (
  <AccordionPrimitive.Item
    data-slot="accordion-item"
    className={cn("border-b", className)}
    {...props}
  />
)

const AccordionTrigger = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      data-slot="accordion-trigger"
      className={cn(
        "flex flex-1 items-center justify-between py-4 text-left text-sm font-medium transition-all hover:underline [&&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
)

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all"
    {...props}
  >
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ 
        height: "auto", 
        opacity: 1,
        transition: {
          height: {
            duration: 0.4,
            ease: [0.04, 0.62, 0.23, 0.98]
          },
          opacity: {
            duration: 0.25,
            delay: 0.1
          }
        }
      }}
      exit={{ 
        height: 0, 
        opacity: 0,
        transition: {
          height: {
            duration: 0.3,
            ease: [0.04, 0.62, 0.23, 0.98]
          },
          opacity: {
            duration: 0.2
          }
        }
      }}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </motion.div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
