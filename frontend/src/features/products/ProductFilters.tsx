import { Search, Download, Plus } from 'lucide-react'
import { Field } from '@/components/ui/Field'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useCategories } from '@/lib/queries/useCategories'
import { useSuppliers } from '@/lib/queries/useSuppliers'
import { useIsAdmin } from '@/store/authStore'
import type { ProductStatus } from '@/lib/api/types'

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'in_stock', label: 'In stock' },
  { value: 'low_stock', label: 'Low stock' },
  { value: 'out_of_stock', label: 'Out of stock' },
]

interface ProductFiltersProps {
  search: string
  onSearchChange: (v: string) => void
  category: string
  onCategoryChange: (v: string) => void
  supplier: string
  onSupplierChange: (v: string) => void
  status: string
  onStatusChange: (v: ProductStatus | '') => void
  onExportCsv: () => void
  onAdd: () => void
}

export function ProductFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  supplier,
  onSupplierChange,
  status,
  onStatusChange,
  onExportCsv,
  onAdd,
}: ProductFiltersProps) {
  const { data: categories } = useCategories({ page: 1, pageSize: 100 })
  const { data: suppliers } = useSuppliers({ page: 1, pageSize: 100 })
  const isAdmin = useIsAdmin()

  const categoryOptions = [{ value: '', label: 'All categories' }, ...(categories?.data.map((c) => ({ value: String(c.id), label: c.name })) ?? [])]
  const supplierOptions = [{ value: '', label: 'All suppliers' }, ...(suppliers?.data.map((s) => ({ value: String(s.id), label: s.name })) ?? [])]

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Search name or SKU" value={search} onChange={(e) => onSearchChange(e.target.value)} suffix={<Search className="size-4 text-text-muted" />} />
        <Select value={category} onValueChange={onCategoryChange} options={categoryOptions} placeholder="All categories" />
        <Select value={supplier} onValueChange={onSupplierChange} options={supplierOptions} placeholder="All suppliers" />
        <Select value={status} onValueChange={(v) => onStatusChange(v as ProductStatus | '')} options={STATUS_OPTIONS} placeholder="All statuses" />
      </div>
      <div className="flex justify-end gap-2.5">
        <Button variant="outline" size="sm" onClick={onExportCsv}>
          <Download className="size-4" />
          Export CSV
        </Button>
        {isAdmin && (
          <Button size="sm" onClick={onAdd}>
            <Plus className="size-4" />
            Add product
          </Button>
        )}
      </div>
    </div>
  )
}
