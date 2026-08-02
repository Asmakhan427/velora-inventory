import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cn } from '@/lib/utils/cn'

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label?: string
  id?: string
  disabled?: boolean
}

export function Switch({ checked, onCheckedChange, label, id, disabled }: SwitchProps) {
  return (
    <label htmlFor={id} className="inline-flex items-center gap-2.5 cursor-pointer select-none">
      <SwitchPrimitive.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full border border-border-strong outline-none cursor-pointer',
          'transition-colors duration-200 ease-out',
          'data-[state=checked]:bg-primary data-[state=checked]:border-transparent',
          'data-[state=unchecked]:bg-surface-3',
        )}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            'block size-4.5 translate-x-0.5 rounded-full bg-white shadow-sm',
            'transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
            'data-[state=checked]:translate-x-5.5',
          )}
        />
      </SwitchPrimitive.Root>
      {label && <span className="text-sm text-text-secondary">{label}</span>}
    </label>
  )
}
