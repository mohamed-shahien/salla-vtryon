import { type VariantProps } from 'class-variance-authority';

import {
  ToggleGroup as ToggleGroupPrimitive,
  Toggle as TogglePrimitive,
  ToggleGroupHighlight as ToggleGroupHighlightPrimitive,
  ToggleHighlight as ToggleHighlightPrimitive,
  useToggleGroup as useToggleGroupPrimitive,
  type ToggleGroupProps as ToggleGroupPrimitiveProps,
  type ToggleProps as TogglePrimitiveProps,
} from '@/components/animate-ui/primitives/base/toggle-group';
import { toggleVariants } from './toggle';
import { cn } from '@/lib/utils';
import { getStrictContext } from '@/lib/get-strict-context';
import React from 'react';

const [ToggleGroupProvider, useToggleGroup] =
  getStrictContext<VariantProps<typeof toggleVariants>>('ToggleGroupContext');

type ToggleGroupProps = ToggleGroupPrimitiveProps &
  VariantProps<typeof toggleVariants>;

const ToggleGroup = React.memo(function ToggleGroup({
  className,
  variant,
  size,
  children,
  multiple,
  ...props
}: ToggleGroupProps) {
  return (
    <ToggleGroupPrimitive
      data-variant={variant}
      data-size={size}
      className={cn(
        'group/toggle-group flex justify-between gap-0.5 items-center rounded-lg data-[variant=outline]:shadow-xs data-[variant=outline]:border data-[variant=outline]:p-0.5',
        className,
      )}
      multiple={multiple}
      {...props}
    >
      <ToggleGroupProvider value={{ variant, size }}>
        {!multiple ? (
          <ToggleGroupHighlightPrimitive className="bg-primary/20 rounded-lg">
            {children}
          </ToggleGroupHighlightPrimitive>
        ) : (
          children
        )}
      </ToggleGroupProvider>
    </ToggleGroupPrimitive>
  );
});

type ToggleProps = TogglePrimitiveProps & VariantProps<typeof toggleVariants>;

const Toggle = React.memo(function Toggle({ className, children, variant, size, ...props }: ToggleProps) {
  const { variant: contextVariant, size: contextSize } = useToggleGroup();
  const { multiple } = useToggleGroupPrimitive();

  return (
    <ToggleHighlightPrimitive
      value={props.value?.toString()}
      className={cn(multiple && 'bg-accent rounded-lg')}
    >
      <TogglePrimitive
        data-variant={contextVariant || variant}
        data-size={contextSize || size}
        className={cn(
          toggleVariants({
            variant: contextVariant || variant,
            size: contextSize || size,
          }),
          'min-w-0 border-0 flex-1 shrink-0 shadow-none rounded-lg focus:z-10 focus-visible:z-10',
          className,
        )}
        {...props}
      >
        {children}
      </TogglePrimitive>
    </ToggleHighlightPrimitive>
  );
});

export { ToggleGroup, Toggle, type ToggleGroupProps, type ToggleProps };
