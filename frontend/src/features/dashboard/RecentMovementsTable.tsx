import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Table, type TableColumn } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils/format'
import type { RecentMovement } from '@/lib/api/types'

export function RecentMovementsTable({ movements, loading }: { movements: RecentMovement[]; loading?: boolean }) {
  const columns: TableColumn<RecentMovement>[] = [
    { key: 'product', header: 'Product', render: (m) => <span className="font-medium text-text">{m.product_name}</span> },
    { key: 'sku', header: 'SKU', render: (m) => <span className="font-mono text-xs text-text-muted">{m.sku}</span> },
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
    { key: 'reason', header: 'Reason', render: (m) => <span className="text-text-muted">{m.reason || '—'}</span> },
    { key: 'date', header: 'Date', render: (m) => <span className="text-xs text-text-muted">{formatDate(m.created_at)}</span> },
  ]

  return (
    <Table
      columns={columns}
      rows={movements}
      rowKey={(m) => m.id}
      loading={loading}
      emptyTitle="No stock movements yet"
      emptyMessage="Movements will appear here as stock is recorded."
    />
  )
}
