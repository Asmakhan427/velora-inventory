import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Tag } from 'lucide-react'
import { useCategories, useDeleteCategory } from '@/lib/queries/useCategories'
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue'
import { useConfirmAndDelete } from '@/features/auth/adminGate'
import { useIsAdmin } from '@/store/authStore'
import { CategoryCard } from './CategoryCard'
import { CategoryFormModal } from './CategoryFormModal'
import { Pagination } from '@/components/ui/Pagination'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Category } from '@/lib/api/types'

const PAGE_SIZE = 9

export default function CategoriesPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const debouncedSearch = useDebouncedValue(search, 350)

  const { data, isLoading } = useCategories({ search: debouncedSearch, page, pageSize: PAGE_SIZE })
  const deleteCategory = useDeleteCategory()
  const confirmAndDelete = useConfirmAndDelete()
  const isAdmin = useIsAdmin()
  const categories = data?.data ?? []

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }
  const openEdit = (category: Category) => {
    setEditing(category)
    setModalOpen(true)
  }

  const handleDelete = (category: Category) =>
    confirmAndDelete({
      actionLabel: 'delete categories',
      title: 'Delete category',
      message: `Delete "${category.name}"? Categories with existing products cannot be deleted.`,
      successMessage: 'Category deleted.',
      mutate: () => deleteCategory.mutateAsync(category.id),
    })

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full max-w-xs">
          <Field
            label="Search categories"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            suffix={<Search className="size-4 text-text-muted" />}
          />
        </div>
        {isAdmin && (
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Add category
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-lg" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-white/5 text-text-muted">
            <Tag className="size-6" />
          </div>
          <div>
            <p className="font-medium text-text">No categories match your search</p>
            <p className="mt-1 text-sm text-text-muted">Try a different search, or add a new category.</p>
          </div>
          {isAdmin && (
            <Button size="sm" onClick={openCreate}>
              Add category
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence initial={false}>
            {categories.map((c) => (
              <motion.div key={c.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <CategoryCard category={c} onEdit={openEdit} onDelete={handleDelete} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {data?.meta && <Pagination meta={data.meta} onPageChange={setPage} />}

      <CategoryFormModal open={modalOpen} onClose={() => setModalOpen(false)} category={editing} />
    </div>
  )
}
