import { Tag } from 'lucide-react'
import { CATEGORICAL_PALETTE } from '@/components/charts/palette'
import { cn } from '@/lib/utils/cn'
import type { Category } from '@/lib/api/types'

export function CategoryIcon({ category, size = 'md', className }: { category: Category; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const color = CATEGORICAL_PALETTE[category.id % CATEGORICAL_PALETTE.length]
  const sizeClasses = { sm: 'size-10 rounded-md', md: 'size-14 rounded-lg', lg: 'size-16 rounded-xl' }
  const iconSizes = { sm: 'size-4.5', md: 'size-6', lg: 'size-7' }

  return (
    <div className={cn('flex shrink-0 items-center justify-center', sizeClasses[size], className)} style={{ background: `${color}26`, border: `1px solid ${color}55` }}>
      <Tag className={iconSizes[size]} style={{ color }} />
    </div>
  )
}
