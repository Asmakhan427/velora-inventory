import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Field, TextareaField } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { useCreateCategory, useUpdateCategory } from '@/lib/queries/useCategories'
import { useToast } from '@/components/ui/Toast'
import { ApiClientError } from '@/lib/api/client'
import type { Category } from '@/lib/api/types'

interface CategoryFormModalProps {
  open: boolean
  onClose: () => void
  category: Category | null
}

export function CategoryFormModal({ open, onClose, category }: CategoryFormModalProps) {
  const isEdit = !!category
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const create = useCreateCategory()
  const update = useUpdateCategory()
  const toast = useToast()

  useEffect(() => {
    if (open) {
      setName(category?.name ?? '')
      setDescription(category?.description ?? '')
      setErrors({})
    }
  }, [open, category])

  const loading = create.isPending || update.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    const input = { name, description: description || undefined }
    try {
      if (isEdit) {
        await update.mutateAsync({ id: category.id, input })
        toast.success('Category updated.')
      } else {
        await create.mutateAsync(input)
        toast.success('Category created.')
      }
      onClose()
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.details) setErrors(err.details as Record<string, string>)
        else toast.error(err.message)
      } else {
        toast.error('Something went wrong.')
      }
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit category' : 'New category'}
      subtitle={isEdit ? `Updating "${category?.name}"` : 'Add a new product category.'}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {isEdit ? 'Save changes' : 'Create category'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} required maxLength={120} />
        <TextareaField label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} error={errors.description} maxLength={500} />
      </form>
    </Modal>
  )
}
