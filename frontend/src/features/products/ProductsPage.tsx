import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, LayoutGrid, List } from 'lucide-react'
import { useProducts, useDeleteProduct } from '@/lib/queries/useProducts'
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue'
import { useConfirmAndDelete } from '@/features/auth/adminGate'
import { useIsAdmin } from '@/store/authStore'
import { productsApi } from '@/lib/api/products'
import { ProductFilters } from './ProductFilters'
import { ProductTable } from './ProductTable'
import { ProductGrid } from './ProductGrid'
import { ProductDrawer } from './ProductDrawer'
import { ProductFormModal } from './ProductFormModal'
import { StockMovementModal } from './StockMovementModal'
import { Pagination } from '@/components/ui/Pagination'
import { cn } from '@/lib/utils/cn'
import type { Product, ProductListParams, ProductStatus } from '@/lib/api/types'

const PAGE_SIZE = 10
type ViewMode = 'table' | 'grid'

export default function ProductsPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [supplier, setSupplier] = useState('')
  const [status, setStatus] = useState<ProductStatus | ''>('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<ProductListParams['sortBy']>('created_at')
  const [sortDir, setSortDir] = useState<ProductListParams['sortDir']>('desc')
  const [view, setView] = useState<ViewMode>('table')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [stockOpen, setStockOpen] = useState(false)
  const [stockProduct, setStockProduct] = useState<Product | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerProduct, setDrawerProduct] = useState<Product | null>(null)

  const debouncedSearch = useDebouncedValue(search, 350)
  const params: ProductListParams = {
    search: debouncedSearch || undefined,
    category: category || undefined,
    supplier: supplier || undefined,
    status: status || undefined,
    page,
    pageSize: PAGE_SIZE,
    sortBy,
    sortDir,
  }

  const { data, isLoading } = useProducts(params)
  const deleteProduct = useDeleteProduct()
  const confirmAndDelete = useConfirmAndDelete()
  const isAdmin = useIsAdmin()

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(key as ProductListParams['sortBy'])
      setSortDir('asc')
    }
    setPage(1)
  }

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (product: Product) => {
    setDrawerOpen(false)
    setEditing(product)
    setFormOpen(true)
  }
  const openStock = (product: Product) => {
    setDrawerOpen(false)
    setStockProduct(product)
    setStockOpen(true)
  }
  const openDrawer = (product: Product) => {
    setDrawerProduct(product)
    setDrawerOpen(true)
  }

  const handleDelete = (product: Product) => {
    setDrawerOpen(false)
    return confirmAndDelete({
      actionLabel: 'delete products',
      title: 'Delete product',
      message: `Delete "${product.name}"? This also removes its stock movement history.`,
      successMessage: 'Product deleted.',
      mutate: () => deleteProduct.mutateAsync(product.id),
    })
  }

  const handleExportCsv = () => {
    const url = productsApi.exportCsvUrl(params)
    window.open(url, '_blank')
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <ProductFilters
            search={search}
            onSearchChange={(v) => {
              setSearch(v)
              setPage(1)
            }}
            category={category}
            onCategoryChange={(v) => {
              setCategory(v)
              setPage(1)
            }}
            supplier={supplier}
            onSupplierChange={(v) => {
              setSupplier(v)
              setPage(1)
            }}
            status={status}
            onStatusChange={(v) => {
              setStatus(v)
              setPage(1)
            }}
            onExportCsv={handleExportCsv}
            onAdd={openCreate}
          />
        </div>

        <div className="flex shrink-0 items-center gap-1 self-start rounded-md border border-border-strong bg-surface-2/60 p-1">
          <ViewButton icon={<List className="size-4" />} label="Table view" active={view === 'table'} onClick={() => setView('table')} />
          <ViewButton icon={<LayoutGrid className="size-4" />} label="Grid view" active={view === 'grid'} onClick={() => setView('grid')} />
        </div>
      </div>

      {view === 'table' ? (
        <ProductTable
          products={data?.data ?? []}
          loading={isLoading}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          onRowClick={openDrawer}
          onEdit={openEdit}
          onDelete={handleDelete}
          onAdd={openCreate}
          footer={data?.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
        />
      ) : (
        <>
          <ProductGrid products={data?.data ?? []} loading={isLoading} onQuickView={openDrawer} onAdd={openCreate} />
          {data?.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
        </>
      )}

      <ProductFormModal open={formOpen} onClose={() => setFormOpen(false)} product={editing} />
      <StockMovementModal open={stockOpen} onClose={() => setStockOpen(false)} product={stockProduct} />
      <ProductDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        product={drawerProduct}
        onEdit={openEdit}
        onDelete={handleDelete}
        onManageStock={openStock}
      />

      {isAdmin && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          onClick={openCreate}
          aria-label="Add product"
          className="btn-glow fixed bottom-6 right-6 z-40 flex size-14 items-center justify-center rounded-full bg-accent text-white sm:hidden"
        >
          <Plus className="size-6" />
        </motion.button>
      )}
    </div>
  )
}

function ViewButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'flex size-8 items-center justify-center rounded transition-colors cursor-pointer',
        active ? 'bg-primary text-white' : 'text-text-muted hover:bg-white/5 hover:text-text-secondary',
      )}
    >
      {icon}
    </button>
  )
}
