import { CATEGORICAL_PALETTE } from '@/components/charts/palette'
import { cn } from '@/lib/utils/cn'
import type { Supplier } from '@/lib/api/types'

/**
 * No logo-upload pipeline exists in this app, so this renders a deterministic
 * monogram tile instead — same supplier always renders the same color/initials.
 */
export function SupplierLogo({ supplier, size = 'md', className }: { supplier: Supplier; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const color = CATEGORICAL_PALETTE[supplier.id % CATEGORICAL_PALETTE.length]
  const initials = supplier.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')

  const sizeClasses = { sm: 'size-10 rounded-md text-xs', md: 'size-14 rounded-lg text-base', lg: 'size-20 rounded-xl text-2xl', xl: 'size-28 rounded-2xl text-4xl' }

  return (
    <div
      className={cn('flex shrink-0 items-center justify-center font-display font-semibold', sizeClasses[size], className)}
      style={{ background: `${color}26`, border: `1px solid ${color}55`, color }}
    >
      {initials || supplier.name[0]}
    </div>
  )
}
