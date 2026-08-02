import { useState } from 'react'
import { Package } from 'lucide-react'
import { CATEGORICAL_PALETTE } from '@/components/charts/palette'
import { cn } from '@/lib/utils/cn'
import { getProductImageUrl } from './productImages'
import type { Product } from '@/lib/api/types'

const PIXEL_SIZE = { sm: 80, md: 112, lg: 192, xl: 320 }

/**
 * Renders a real product photo when one is known for the SKU (see
 * productImages.ts). No image-upload pipeline exists in this app, so most
 * seeded products don't have a matched photo; those, and any image that
 * fails to load, fall back to a deterministic category-colored placeholder
 * tile instead of a broken image or blank column.
 */
export function ProductThumbnail({ product, size = 'sm', className }: { product: Product; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const [imageFailed, setImageFailed] = useState(false)
  const color = CATEGORICAL_PALETTE[product.category_id % CATEGORICAL_PALETTE.length]
  const sizeClasses = { sm: 'size-10 rounded-md', md: 'size-14 rounded-lg', lg: 'size-24 rounded-xl', xl: 'size-40 rounded-2xl' }
  const iconSizes = { sm: 'size-4.5', md: 'size-6', lg: 'size-10', xl: 'size-16' }
  const imageUrl = getProductImageUrl(product.sku, PIXEL_SIZE[size])

  if (imageUrl && !imageFailed) {
    return (
      <img
        src={imageUrl}
        alt={product.name}
        onError={() => setImageFailed(true)}
        className={cn('shrink-0 border border-border object-cover', sizeClasses[size], className)}
      />
    )
  }

  return (
    <div
      className={cn('flex shrink-0 items-center justify-center', sizeClasses[size], className)}
      style={{ background: `${color}26`, border: `1px solid ${color}55` }}
    >
      <Package className={iconSizes[size]} style={{ color }} />
    </div>
  )
}
