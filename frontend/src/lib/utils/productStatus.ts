import type { ProductStatus } from '@/lib/api/types'

const LOW_STOCK_THRESHOLD = 10

export function getProductStatus(quantity: number): ProductStatus {
  if (quantity <= 0) return 'out_of_stock'
  if (quantity < LOW_STOCK_THRESHOLD) return 'low_stock'
  return 'in_stock'
}

export const STATUS_LABEL: Record<ProductStatus, string> = {
  in_stock: 'In stock',
  low_stock: 'Low stock',
  out_of_stock: 'Out of stock',
}

export const STATUS_TONE: Record<ProductStatus, 'success' | 'warning' | 'danger'> = {
  in_stock: 'success',
  low_stock: 'warning',
  out_of_stock: 'danger',
}
