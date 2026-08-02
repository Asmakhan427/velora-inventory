import { Pencil, Trash2, Package, AlertTriangle } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'
import { IconButton } from '@/components/ui/IconButton'
import { CategoryIcon } from './CategoryIcon'
import { useIsAdmin } from '@/store/authStore'
import { formatCurrency } from '@/lib/utils/format'
import type { Category } from '@/lib/api/types'

interface CategoryCardProps {
  category: Category
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const isAdmin = useIsAdmin()
  const lowStockCount = category.low_stock_count ?? 0

  return (
    <GlassCard hoverLift glow="accent" className="flex h-full flex-col gap-4">
      <div className="flex items-start justify-between">
        <CategoryIcon category={category} size="md" />
        {isAdmin && (
          <div className="flex gap-1">
            <IconButton icon={<Pencil className="size-4" />} label="Edit category" onClick={() => onEdit(category)} />
            <IconButton icon={<Trash2 className="size-4" />} label="Delete category" tone="danger" onClick={() => onDelete(category)} />
          </div>
        )}
      </div>

      <div>
        <h3 className="truncate font-semibold text-text">{category.name}</h3>
        <p className="mt-1 line-clamp-2 text-xs text-text-muted">{category.description || 'No description provided.'}</p>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-3 border-t border-border pt-3.5">
        <div className="flex items-center gap-2">
          <Package className="size-3.5 text-text-muted" />
          <div>
            <p className="text-sm font-medium text-text">{category.product_count ?? 0}</p>
            <p className="text-[10px] text-text-muted">products</p>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-text">{formatCurrency(category.stock_value ?? 0)}</p>
          <p className="text-[10px] text-text-muted">inventory value</p>
        </div>
      </div>

      {lowStockCount > 0 && (
        <Badge tone="warning" pulse className="w-fit">
          <AlertTriangle className="size-3" />
          {lowStockCount} low stock
        </Badge>
      )}
    </GlassCard>
  )
}
