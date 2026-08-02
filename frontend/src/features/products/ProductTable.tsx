import { useCallback, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Pencil, Trash2, ArrowUp, ArrowDown, ChevronsUpDown, PackageX } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { IconButton } from '@/components/ui/IconButton'
import { Button } from '@/components/ui/Button'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { ProductThumbnail } from './ProductThumbnail'
import { useIsAdmin } from '@/store/authStore'
import { formatCurrency, formatDateShort } from '@/lib/utils/format'
import { getProductStatus, STATUS_LABEL, STATUS_TONE } from '@/lib/utils/productStatus'
import { cn } from '@/lib/utils/cn'
import type { Product, ProductListParams } from '@/lib/api/types'

interface ColumnDef {
  key: string
  header: string
  sortable?: boolean
  align?: 'left' | 'right' | 'center'
  minWidth: number
}

const COLUMNS: ColumnDef[] = [
  { key: 'name', header: 'Product', sortable: true, minWidth: 260 },
  { key: 'sku', header: 'SKU', sortable: true, minWidth: 130 },
  { key: 'category', header: 'Category', minWidth: 140 },
  { key: 'supplier', header: 'Supplier', minWidth: 150 },
  { key: 'unit_price', header: 'Unit Price', sortable: true, align: 'right', minWidth: 110 },
  { key: 'quantity_in_stock', header: 'Stock', sortable: true, align: 'right', minWidth: 100 },
  { key: 'status', header: 'Status', align: 'center', minWidth: 130 },
  { key: 'updated_at', header: 'Last Updated', minWidth: 140 },
]

const DEFAULT_WIDTHS: Record<string, number> = Object.fromEntries(COLUMNS.map((c) => [c.key, c.minWidth]))

interface ProductTableProps {
  products: Product[]
  loading?: boolean
  sortBy?: ProductListParams['sortBy']
  sortDir?: ProductListParams['sortDir']
  onSort: (key: string) => void
  onRowClick: (product: Product) => void
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  onAdd: () => void
  footer?: ReactNode
}

export function ProductTable({ products, loading, sortBy, sortDir, onSort, onRowClick, onEdit, onDelete, onAdd, footer }: ProductTableProps) {
  const isAdmin = useIsAdmin()
  const [widths, setWidths] = useState<Record<string, number>>(DEFAULT_WIDTHS)
  const resizing = useRef<{ key: string; startX: number; startWidth: number } | null>(null)

  const onResizeMove = useCallback((e: PointerEvent) => {
    const r = resizing.current
    if (!r) return
    const delta = e.clientX - r.startX
    setWidths((w) => ({ ...w, [r.key]: Math.max(70, r.startWidth + delta) }))
  }, [])

  const onResizeEnd = useCallback(() => {
    resizing.current = null
    window.removeEventListener('pointermove', onResizeMove)
    window.removeEventListener('pointerup', onResizeEnd)
  }, [onResizeMove])

  const startResize = (key: string) => (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    resizing.current = { key, startX: e.clientX, startWidth: widths[key] }
    window.addEventListener('pointermove', onResizeMove)
    window.addEventListener('pointerup', onResizeEnd)
  }

  if (loading) {
    return (
      <div className="glass-card overflow-hidden p-0">
        <TableSkeleton cols={9} />
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
    <div className="glass-card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 64 }} />
            {COLUMNS.map((c) => (
              <col key={c.key} style={{ width: widths[c.key] }} />
            ))}
            <col style={{ width: 96 }} />
          </colgroup>
          <thead className="sticky top-0 z-10 bg-surface-2/95 backdrop-blur-md">
            <tr>
              <th className="border-b border-border px-4 py-3.5" />
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && onSort(col.key)}
                  className={cn(
                    'relative border-b border-border px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-text-muted whitespace-nowrap',
                    col.sortable && 'cursor-pointer select-none hover:text-text-secondary',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                  )}
                >
                  <span className={cn('inline-flex items-center gap-1.5', col.align === 'right' && 'flex-row-reverse')}>
                    {col.header}
                    {col.sortable && <SortIcon active={sortBy === col.key} dir={sortDir} />}
                  </span>
                  <span
                    onPointerDown={startResize(col.key)}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize touch-none select-none hover:bg-accent/40"
                  />
                </th>
              ))}
              <th className="border-b border-border px-4 py-3.5" />
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {products.map((p, i) => {
                const status = getProductStatus(p.quantity_in_stock)
                return (
                  <motion.tr
                    key={p.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => onRowClick(p)}
                    className={cn(
                      'group cursor-pointer border-b border-border/70 last:border-0 transition-colors duration-150 hover:bg-white/5',
                      i % 2 === 1 && 'bg-white/1.5',
                    )}
                  >
                    <td className="px-4 py-2.5">
                      <ProductThumbnail product={p} size="sm" className="transition-transform duration-200 group-hover:scale-105" />
                    </td>
                    <td className="truncate px-4 py-2.5">
                      <p className="truncate font-medium text-text">{p.name}</p>
                    </td>
                    <td className="truncate px-4 py-2.5 font-mono text-xs text-text-muted">{p.sku}</td>
                    <td className="truncate px-4 py-2.5 text-text-secondary">{p.category_name ?? '—'}</td>
                    <td className="truncate px-4 py-2.5 text-text-secondary">{p.supplier_name ?? '—'}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-text">{formatCurrency(p.unit_price)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-text">{p.quantity_in_stock}</td>
                    <td className="px-4 py-2.5 text-center">
                      <Badge tone={STATUS_TONE[status]} pulse={status !== 'in_stock'}>
                        {STATUS_LABEL[status]}
                      </Badge>
                    </td>
                    <td className="truncate px-4 py-2.5 text-xs text-text-muted">{formatDateShort(p.updated_at)}</td>
                    <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                      {isAdmin && (
                        <div className="flex items-center justify-end gap-1">
                          <IconButton icon={<Pencil className="size-4" />} label="Edit product" onClick={() => onEdit(p)} />
                          <IconButton icon={<Trash2 className="size-4" />} label="Delete product" tone="danger" onClick={() => onDelete(p)} />
                        </div>
                      )}
                    </td>
                  </motion.tr>
                )
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      {footer}
    </div>
  )
}

function SortIcon({ active, dir }: { active: boolean; dir?: 'asc' | 'desc' }) {
  if (!active) return <ChevronsUpDown className="size-3.5 opacity-50" />
  return dir === 'asc' ? <ArrowUp className="size-3.5 text-accent" /> : <ArrowDown className="size-3.5 text-accent" />
}
