import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Field, TextareaField } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { useCreateSupplier, useUpdateSupplier } from '@/lib/queries/useSuppliers'
import { useToast } from '@/components/ui/Toast'
import { ApiClientError } from '@/lib/api/client'
import type { Supplier } from '@/lib/api/types'

interface SupplierFormModalProps {
  open: boolean
  onClose: () => void
  supplier: Supplier | null
}

export function SupplierFormModal({ open, onClose, supplier }: SupplierFormModalProps) {
  const isEdit = !!supplier
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [country, setCountry] = useState('')
  const [website, setWebsite] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const create = useCreateSupplier()
  const update = useUpdateSupplier()
  const toast = useToast()

  useEffect(() => {
    if (open) {
      setName(supplier?.name ?? '')
      setEmail(supplier?.contact_email ?? '')
      setPhone(supplier?.phone ?? '')
      setAddress(supplier?.address ?? '')
      setContactPerson(supplier?.contact_person ?? '')
      setCountry(supplier?.country ?? '')
      setWebsite(supplier?.website ?? '')
      setErrors({})
    }
  }, [open, supplier])

  const loading = create.isPending || update.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    const input = {
      name,
      contact_email: email,
      phone: phone || undefined,
      address: address || undefined,
      contact_person: contactPerson || undefined,
      country: country || undefined,
      website: website || undefined,
    }
    try {
      if (isEdit) {
        await update.mutateAsync({ id: supplier.id, input })
        toast.success('Supplier updated.')
      } else {
        await create.mutateAsync(input)
        toast.success('Supplier created.')
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
      title={isEdit ? 'Edit supplier' : 'New supplier'}
      subtitle={isEdit ? `Updating "${supplier?.name}"` : 'Add a new supplier.'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {isEdit ? 'Save changes' : 'Create supplier'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Company name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} required maxLength={150} wrapperClassName="sm:col-span-2" />
        <Field label="Contact person" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} error={errors.contact_person} maxLength={150} />
        <Field label="Contact email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.contact_email} required />
        <Field label="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} maxLength={40} />
        <Field label="Country (optional)" value={country} onChange={(e) => setCountry(e.target.value)} error={errors.country} maxLength={100} />
        <Field label="Website (optional)" value={website} onChange={(e) => setWebsite(e.target.value)} error={errors.website} maxLength={200} hint="e.g. https://example.com" wrapperClassName="sm:col-span-2" />
        <TextareaField label="Address (optional)" value={address} onChange={(e) => setAddress(e.target.value)} error={errors.address} maxLength={300} wrapperClassName="sm:col-span-2" />
      </form>
    </Modal>
  )
}
