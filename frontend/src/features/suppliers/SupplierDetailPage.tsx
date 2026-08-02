import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Globe,
  Flag,
  Pencil,
  Trash2,
  Truck,
  PackageCheck,
  Gauge,
  Clock,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Table, type TableColumn } from '@/components/ui/Table'
import { ScrollReveal } from '@/components/motion/ScrollReveal'
import { SupplierLogo } from './SupplierLogo'
import { SupplierFormModal } from './SupplierFormModal'
import { useSupplier, useSupplierDeliveries, useDeleteSupplier } from '@/lib/queries/useSuppliers'
import { useProducts } from '@/lib/queries/useProducts'
import { useConfirmAndDelete } from '@/features/auth/adminGate'
import { useIsAdmin } from '@/store/authStore'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { getProductStatus, STATUS_LABEL, STATUS_TONE } from '@/lib/utils/productStatus'
import type { Product } from '@/lib/api/types'

export default function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>()
  const supplierId = Number(id)
  const navigate = useNavigate()
  const isAdmin = useIsAdmin()
  const [editOpen, setEditOpen] = useState(false)

  const { data: supplier, isLoading } = useSupplier(supplierId)
  const { data: deliveries, isLoading: deliveriesLoading } = useSupplierDeliveries(supplierId, 8)
  const { data: products, isLoading: productsLoading } = useProducts({ supplier: supplierId, pageSize: 8, sortBy: 'name', sortDir: 'asc' })
  const deleteSupplier = useDeleteSupplier()
  const confirmAndDelete = useConfirmAndDelete()

  const handleDelete = () => {
    if (!supplier) return
    confirmAndDelete({
      actionLabel: 'delete suppliers',
      title: 'Delete supplier',
      message: `Delete "${supplier.name}"? Suppliers with existing products cannot be deleted.`,
      successMessage: 'Supplier deleted.',
      mutate: async () => {
        await deleteSupplier.mutateAsync(supplier.id)
        navigate('/suppliers')
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!supplier) {
    return (
      <div className="glass-card flex flex-col items-center gap-3 py-16 text-center">
        <p className="font-medium text-text">Supplier not found</p>
        <Link to="/suppliers" className="text-sm font-medium text-accent hover:underline">
          Back to suppliers
        </Link>
      </div>
    )
  }

  const productRows = products?.data ?? []
  const outOfStockCount = productRows.filter((p) => p.quantity_in_stock === 0).length
  const totalProducts = supplier.product_count ?? productRows.length
  const totalDeliveries = deliveries?.totalDeliveries ?? 0
  const reliabilityScore =
    totalProducts === 0 ? null : Math.max(0, Math.min(100, 100 - Math.min(outOfStockCount * 10, 40) + Math.min(totalDeliveries * 2, 20)))

  const productColumns: TableColumn<Product>[] = [
    { key: 'name', header: 'Product', render: (p) => <span className="font-medium text-text">{p.name}</span> },
    { key: 'sku', header: 'SKU', render: (p) => <span className="font-mono text-xs text-text-muted">{p.sku}</span> },
    { key: 'price', header: 'Price', align: 'right', render: (p) => <span className="tabular-nums text-text">{formatCurrency(p.unit_price)}</span> },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (p) => {
        const status = getProductStatus(p.quantity_in_stock)
        return (
          <Badge tone={STATUS_TONE[status]} pulse={status !== 'in_stock'}>
            {STATUS_LABEL[status]}
          </Badge>
        )
      },
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <Link to="/suppliers" className="inline-flex w-fit items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text">
        <ArrowLeft className="size-4" /> Back to suppliers
      </Link>

      <ScrollReveal>
        <GlassCard className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <SupplierLogo supplier={supplier} size="xl" />
            <div>
              <h1 className="font-display text-2xl font-semibold text-text">{supplier.name}</h1>
              {supplier.contact_person && (
                <p className="mt-1 text-sm text-text-secondary">Contact: {supplier.contact_person}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-text-muted">
                <span className="flex items-center gap-1.5">
                  <Mail className="size-3.5" /> {supplier.contact_email}
                </span>
                {supplier.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="size-3.5" /> {supplier.phone}
                  </span>
                )}
                {supplier.address && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5" /> {supplier.address}
                  </span>
                )}
                {supplier.country && (
                  <span className="flex items-center gap-1.5">
                    <Flag className="size-3.5" /> {supplier.country}
                  </span>
                )}
                {supplier.website && (
                  <a href={supplier.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-accent hover:underline">
                    <Globe className="size-3.5" /> {supplier.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </div>
          </div>

          {isAdmin && (
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                <Pencil className="size-3.5" />
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDelete}>
                <Trash2 className="size-3.5" />
                Delete
              </Button>
            </div>
          )}
        </GlassCard>
      </ScrollReveal>

      {/* KPI row */}
      <ScrollReveal delay={0.05} className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Kpi icon={<Truck className="size-4.5" />} label="Products supplied" value={String(totalProducts)} tone="primary" />
        <Kpi icon={<PackageCheck className="size-4.5" />} label="Recent deliveries" value={String(totalDeliveries)} tone="secondary" />
        <Kpi
          icon={<Gauge className="size-4.5" />}
          label="Reliability score"
          value={reliabilityScore === null ? '—' : `${reliabilityScore}/100`}
          tone="accent"
        />
      </ScrollReveal>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Products supplied */}
        <ScrollReveal delay={0.1} className="lg:col-span-3">
          <div>
            <h2 className="mb-3 font-display text-base font-semibold text-text">Products from this supplier</h2>
            <Table
              columns={productColumns}
              rows={productRows}
              rowKey={(p) => p.id}
              loading={productsLoading}
              emptyTitle="No products yet"
              emptyMessage="Products assigned to this supplier will appear here."
            />
          </div>
        </ScrollReveal>

        {/* Recent deliveries timeline */}
        <ScrollReveal delay={0.15} className="lg:col-span-2">
          <GlassCard className="h-full">
            <h2 className="mb-3 font-display text-base font-semibold text-text">Recent deliveries</h2>
            {deliveriesLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : !deliveries || deliveries.deliveries.length === 0 ? (
              <p className="text-sm text-text-muted">No deliveries recorded yet.</p>
            ) : (
              <ol className="relative flex flex-col gap-4 border-l border-border pl-5">
                {deliveries.deliveries.map((d) => (
                  <li key={d.id} className="relative">
                    <span className="absolute -left-6.5 flex size-4 items-center justify-center rounded-full bg-success">
                      <PackageCheck className="size-2.5 text-white" />
                    </span>
                    <p className="text-sm text-text">
                      <span className="font-medium">+{d.quantity} units</span> <span className="text-text-muted">· {d.product_name}</span>
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-text-muted">
                      <Clock className="size-3" /> {formatDate(d.created_at)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
            <p className="mt-4 text-[11px] text-text-muted">
              Reliability score is computed from stock-out incidents and delivery frequency across this supplier's products — not a subjective rating.
            </p>
          </GlassCard>
        </ScrollReveal>
      </div>

      <SupplierFormModal open={editOpen} onClose={() => setEditOpen(false)} supplier={supplier} />
    </div>
  )
}

function Kpi({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: 'primary' | 'secondary' | 'accent' }) {
  const toneClasses = { primary: 'bg-primary-soft text-primary', secondary: 'bg-secondary-soft text-secondary-fg', accent: 'bg-accent-soft text-accent' }
  return (
    <GlassCard className="flex items-center gap-3">
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${toneClasses[tone]}`}>{icon}</div>
      <div className="min-w-0">
        <p className="truncate text-xs text-text-muted">{label}</p>
        <p className="font-display text-lg font-semibold text-text">{value}</p>
      </div>
    </GlassCard>
  )
}
