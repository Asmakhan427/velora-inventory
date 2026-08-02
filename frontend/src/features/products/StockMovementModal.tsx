import { useState } from 'react'
import { ArrowDownRight, ArrowUpRight, PackageSearch } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Tabs } from '@/components/ui/Tabs'
import { Field, TextareaField } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Table, type TableColumn } from '@/components/ui/Table'
import { Pagination } from '@/components/ui/Pagination'
import { Badge } from '@/components/ui/Badge'
import { useProduct } from '@/lib/queries/useProducts'
import { useRecordMovement, useStockMovements } from '@/lib/queries/useStockMovements'
import { useToast } from '@/components/ui/Toast'
import { useIsAdmin } from '@/store/authStore'
import { ApiClientError } from '@/lib/api/client'
import { formatDate } from '@/lib/utils/format'
import type { Product, StockMovement, StockMovementType } from '@/lib/api/types'

interface StockMovementModalProps {
  open: boolean
  onClose: () => void
  product: Product | null
}

export function StockMovementModal({ open, onClose, product }: StockMovementModalProps) {
  const [tab, setTab] = useState('record')
  const isAdmin = useIsAdmin()
  const { data: liveProduct } = useProduct(open ? (product?.id ?? null) : null)
  const current = liveProduct ?? product

  if (!current) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isAdmin ? 'Manage stock' : 'Stock history'}
      subtitle={`${current.name} · SKU ${current.sku}`}
      size="md"
    >
      <div className="mb-5 flex items-center gap-3 rounded-lg border border-border bg-surface-2/50 p-4">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <PackageSearch className="size-5" />
        </div>
        <div>
          <p className="text-xs text-text-muted">Current quantity</p>
          <p className="text-xl font-semibold text-text tabular-nums">{current.quantity_in_stock}</p>
        </div>
      </div>

      {isAdmin ? (
        <Tabs
          value={tab}
          onValueChange={setTab}
          items={[
            { value: 'record', label: 'Record movement', content: <RecordMovementForm productId={current.id} /> },
            { value: 'history', label: 'History & balance', content: tab === 'history' ? <MovementHistory productId={current.id} /> : null },
          ]}
        />
      ) : (
        <MovementHistory productId={current.id} />
      )}
    </Modal>
  )
}

function RecordMovementForm({ productId }: { productId: number }) {
  const [type, setType] = useState<StockMovementType>('IN')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const record = useRecordMovement(productId)
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await record.mutateAsync({ type, quantity: Number(quantity), reason: reason || undefined })
      toast.success(`Recorded ${type === 'IN' ? '+' : '-'}${quantity} units.`)
      setQuantity('')
      setReason('')
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.details?.quantity ? String(err.details.quantity) : err.message)
      } else {
        setError('Something went wrong.')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => setType('IN')}
          className={`flex items-center justify-center gap-2 rounded-md border py-2.5 text-sm font-medium transition-colors cursor-pointer ${
            type === 'IN' ? 'border-success/40 bg-success-soft text-[#86d99b]' : 'border-border-strong text-text-secondary hover:bg-white/5'
          }`}
        >
          <ArrowUpRight className="size-4" /> Stock IN
        </button>
        <button
          type="button"
          onClick={() => setType('OUT')}
          className={`flex items-center justify-center gap-2 rounded-md border py-2.5 text-sm font-medium transition-colors cursor-pointer ${
            type === 'OUT' ? 'border-danger/40 bg-danger-soft text-[#fca5a5]' : 'border-border-strong text-text-secondary hover:bg-white/5'
          }`}
        >
          <ArrowDownRight className="size-4" /> Stock OUT
        </button>
      </div>
      <Field label="Quantity" type="number" min="1" step="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} error={error ?? undefined} required />
      <TextareaField label="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} />
      <Button type="submit" loading={record.isPending} className="w-full">
        Record movement
      </Button>
    </form>
  )
}

function MovementHistory({ productId }: { productId: number }) {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useStockMovements(productId, page)

  const columns: TableColumn<StockMovement>[] = [
    {
      key: 'type',
      header: 'Type',
      render: (m) =>
        m.type === 'IN' ? (
          <Badge tone="success">
            <ArrowUpRight className="size-3" /> IN
          </Badge>
        ) : (
          <Badge tone="danger">
            <ArrowDownRight className="size-3" /> OUT
          </Badge>
        ),
    },
    { key: 'quantity', header: 'Qty', align: 'right', render: (m) => <span className="tabular-nums text-text">{m.quantity}</span> },
    { key: 'balance', header: 'Balance', align: 'right', render: (m) => <span className="tabular-nums font-medium text-text">{m.running_balance}</span> },
    { key: 'reason', header: 'Reason', render: (m) => <span className="text-text-muted">{m.reason || '—'}</span> },
    { key: 'date', header: 'Date', render: (m) => <span className="text-xs text-text-muted">{formatDate(m.created_at)}</span> },
  ]

  return (
    <div className="flex flex-col gap-3">
      <Table
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(m) => m.id}
        loading={isLoading}
        emptyTitle="No movements yet"
        emptyMessage="Record an IN or OUT movement to see history here."
      />
      {data?.meta && data.meta.total > data.meta.pageSize && <Pagination meta={data.meta} onPageChange={setPage} />}
    </div>
  )
}
