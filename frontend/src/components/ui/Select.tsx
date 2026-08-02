import * as SelectPrimitive from '@radix-ui/react-select'
import { motion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  label?: string
  className?: string
}

export function Select({ value, onValueChange, options, placeholder = 'Select...', label, className }: SelectProps) {
  // Radix only learns an item's label once its Select.Item has actually
  // mounted, which only happens after the dropdown is opened at least once.
  // Resolving the label ourselves means a pre-filled value (e.g. editing an
  // existing product) shows correctly on first render, not just after the
  // user opens the dropdown.
  const selectedLabel = options.find((opt) => opt.value === value)?.label

  return (
    <div className={cn('relative', className)}>
      {label && <label className="mb-1.5 block text-xs font-medium text-text-muted">{label}</label>}
      <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
        <SelectPrimitive.Trigger
          className={cn(
            'flex h-11 w-full items-center justify-between gap-2 rounded-md border border-border-strong bg-surface-2/60 px-3.5 text-sm text-text',
            'outline-none transition-[border-color,box-shadow] duration-200 cursor-pointer',
            'focus:border-accent focus:shadow-[0_0_0_3px_rgba(166,124,82,0.3)] data-[placeholder]:text-text-muted',
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder}>{selectedLabel}</SelectPrimitive.Value>
          <SelectPrimitive.Icon>
            <ChevronDown className="size-4 text-text-muted transition-transform duration-200 data-[state=open]:rotate-180" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content position="popper" sideOffset={6} className="z-110 overflow-hidden rounded-md border border-border-strong bg-surface-3/95 backdrop-blur-xl shadow-lg" asChild>
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="w-[var(--radix-select-trigger-width)]"
            >
              <SelectPrimitive.Viewport className="p-1">
                {options.map((opt) => (
                  <SelectPrimitive.Item
                    key={opt.value}
                    value={opt.value}
                    className={cn(
                      'relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm text-text-secondary outline-none',
                      'data-[highlighted]:bg-primary-soft data-[highlighted]:text-text',
                      'data-[state=checked]:text-text',
                    )}
                  >
                    <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                    <SelectPrimitive.ItemIndicator className="absolute right-3">
                      <Check className="size-3.5 text-accent" />
                    </SelectPrimitive.ItemIndicator>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.Viewport>
            </motion.div>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  )
}
