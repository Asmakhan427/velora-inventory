import { motion, AnimatePresence } from 'framer-motion'
import { Eye, PackageX } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProductThumbnail } from './ProductThumbnail'
import { formatCurrency } from '@/lib/utils/format'
import { getProductStatus, STATUS_LABEL, STATUS_TONE } from '@/lib/utils/productStatus'
import { useIsAdmin } from '@/store/authStore'
import type { Product } from '@/lib/api/types'

interface ProductGridProps {
  products: Product[]
  loading?: boolean
  onQuickView: (product: Product) => void
  onAdd: () => void
}

export function ProductGrid({ products, loading, onQuickView, onAdd }: ProductGridProps) {
  const isAdmin = useIsAdmin()

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="glass-card h-56 animate-pulse" />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-white/5 text-text-muted">
          <PackageX className="size-6" />
        </div>
        <div>
          <p className="font-medium text-text">No products match your filters</p>
          <p className="mt-1 text-sm text-text-muted">Try adjusting your search or filters, or add a new product.</p>
        </div>
        {isAdmin && (
          <Button size="sm" onClick={onAdd}>
            Add product
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <AnimatePresence initial={false}>
        {products.map((p) => {
          const status = getProductStatus(p.quantity_in_stock)
          return (
            <motion.div key={p.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <GlassCard
                hoverLift
                glow="primary"
                className="group flex h-full cursor-pointer flex-col p-5"
                onClick={() => onQuickView(p)}
              >
                <div className="flex items-start justify-between">
                  <ProductThumbnail product={p} size="lg" className="transition-transform duration-200 group-hover:scale-105" />
                  <Badge tone={STATUS_TONE[status]} pulse={status !== 'in_stock'}>
                    {STATUS_LABEL[status]}
                  </Badge>
                </div>

                <h3 className="mt-4 truncate font-semibold text-text">{p.name}</h3>
                <p className="mt-0.5 truncate text-xs text-text-muted">{p.category_name ?? '—'} · {p.supplier_name ?? '—'}</p>

                <div className="mt-auto flex items-end justify-between pt-4">
                  <div>
                    <p className="font-display text-lg font-semibold text-text">{formatCurrency(p.unit_price)}</p>
                    <p className="text-xs text-text-muted">{p.quantity_in_stock} in stock</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      onQuickView(p)
                    }}
                  >
                    <Eye className="size-3.5" />
                    Quick view
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
