import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Field, TextareaField } from '@/components/ui/Field'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useCreateProduct, useUpdateProduct } from '@/lib/queries/useProducts'
import { useCategories } from '@/lib/queries/useCategories'
import { useSuppliers } from '@/lib/queries/useSuppliers'
import { useToast } from '@/components/ui/Toast'
import { ApiClientError } from '@/lib/api/client'
import type { Product } from '@/lib/api/types'

interface ProductFormModalProps {
  open: boolean
  onClose: () => void
  product: Product | null
}

export function ProductFormModal({ open, onClose, product }: ProductFormModalProps) {
  const isEdit = !!product
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [description, setDescription] = useState('')
  const [initialQuantity, setInitialQuantity] = useState('0')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: categories } = useCategories({ page: 1, pageSize: 100 })
  const { data: suppliers } = useSuppliers({ page: 1, pageSize: 100 })
  const create = useCreateProduct()
  const update = useUpdateProduct()
  const toast = useToast()

  useEffect(() => {
    if (open) {
      setName(product?.name ?? '')
      setSku(product?.sku ?? '')
      setUnitPrice(product ? String(product.unit_price) : '')
      setCategoryId(product ? String(product.category_id) : '')
      setSupplierId(product ? String(product.supplier_id) : '')
      setDescription(product?.description ?? '')
      setInitialQuantity('0')
      setErrors({})
    }
  }, [open, product])

  const loading = create.isPending || update.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const priceNum = Number(unitPrice)
    const categoryNum = Number(categoryId)
    const supplierNum = Number(supplierId)

    const nextErrors: Record<string, string> = {}
    if (!categoryId) nextErrors.category_id = 'Select a category.'
    if (!supplierId) nextErrors.supplier_id = 'Select a supplier.'
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    try {
      if (isEdit) {
        await update.mutateAsync({
          id: product.id,
          input: { name, sku, unit_price: priceNum, category_id: categoryNum, supplier_id: supplierNum, description: description || undefined },
        })
        toast.success('Product updated.')
      } else {
        await create.mutateAsync({
          name,
          sku,
          unit_price: priceNum,
          category_id: categoryNum,
          supplier_id: supplierNum,
          description: description || undefined,
          quantity_in_stock: Number(initialQuantity) || 0,
        })
        toast.success('Product created.')
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

  const categoryOptions = categories?.data.map((c) => ({ value: String(c.id), label: c.name })) ?? []
  const supplierOptions = suppliers?.data.map((s) => ({ value: String(s.id), label: s.name })) ?? []

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit product' : 'New product'}
      subtitle={isEdit ? `Updating "${product?.name}"` : 'Add a new product to your catalog.'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {isEdit ? 'Save changes' : 'Create product'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} required maxLength={150} wrapperClassName="sm:col-span-2" />
        <Field label="SKU" value={sku} onChange={(e) => setSku(e.target.value)} error={errors.sku} required maxLength={60} />
        <Field label="Unit price" type="number" min="0" step="0.01" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} error={errors.unit_price} required />

        <Select label="Category" value={categoryId} onValueChange={setCategoryId} options={categoryOptions} placeholder="Select category" />
        <Select label="Supplier" value={supplierId} onValueChange={setSupplierId} options={supplierOptions} placeholder="Select supplier" />
        {(errors.category_id || errors.supplier_id) && (
          <p className="sm:col-span-2 -mt-2 text-xs text-danger">{errors.category_id || errors.supplier_id}</p>
        )}

        {isEdit ? (
          <Field
            label="Current stock"
            value={String(product?.quantity_in_stock ?? 0)}
            disabled
            hint="Use “Manage stock” to record an IN/OUT movement instead."
          />
        ) : (
          <Field label="Initial quantity in stock" type="number" min="0" step="1" value={initialQuantity} onChange={(e) => setInitialQuantity(e.target.value)} error={errors.quantity_in_stock} />
        )}

        <TextareaField
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          maxLength={1000}
          wrapperClassName="sm:col-span-2"
        />
      </form>
    </Modal>
  )
}
