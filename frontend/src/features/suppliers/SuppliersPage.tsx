import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Truck } from 'lucide-react'
import { useSuppliers } from '@/lib/queries/useSuppliers'
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue'
import { useIsAdmin } from '@/store/authStore'
import { SupplierCard } from './SupplierCard'
import { SupplierFormModal } from './SupplierFormModal'
import { Pagination } from '@/components/ui/Pagination'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Skeleton } from '@/components/ui/Skeleton'

const PAGE_SIZE = 9

export default function SuppliersPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const debouncedSearch = useDebouncedValue(search, 350)

  const { data, isLoading } = useSuppliers({ search: debouncedSearch, page, pageSize: PAGE_SIZE })
  const isAdmin = useIsAdmin()
  const suppliers = data?.data ?? []

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full max-w-xs">
          <Field
            label="Search suppliers"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            suffix={<Search className="size-4 text-text-muted" />}
          />
        </div>
        {isAdmin && (
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="size-4" />
            Add supplier
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-lg" />
          ))}
        </div>
      ) : suppliers.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-white/5 text-text-muted">
            <Truck className="size-6" />
          </div>
          <div>
            <p className="font-medium text-text">No suppliers match your search</p>
            <p className="mt-1 text-sm text-text-muted">Try a different search, or add a new supplier.</p>
          </div>
          {isAdmin && (
            <Button size="sm" onClick={() => setModalOpen(true)}>
              Add supplier
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence initial={false}>
            {suppliers.map((s) => (
              <motion.div key={s.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <SupplierCard supplier={s} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {data?.meta && <Pagination meta={data.meta} onPageChange={setPage} />}

      <SupplierFormModal open={modalOpen} onClose={() => setModalOpen(false)} supplier={null} />
    </div>
  )
}
