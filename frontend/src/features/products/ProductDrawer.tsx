import { QRCodeSVG } from 'qrcode.react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  Pencil,
  Trash2,
  PackageSearch,
  ArrowUpRight,
  ArrowDownRight,
  Mail,
  Phone,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Tag,
  Truck,
  Clock,
} from 'lucide-react'
import { Drawer } from '@/components/ui/Drawer'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { ProductThumbnail } from './ProductThumbnail'
import { useSupplier } from '@/lib/queries/useSuppliers'
import { useStockMovements } from '@/lib/queries/useStockMovements'
import { useIsAdmin } from '@/store/authStore'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { getProductStatus, STATUS_LABEL, STATUS_TONE } from '@/lib/utils/productStatus'
import { CATEGORICAL_PALETTE, CHART_GRID } from '@/components/charts/palette'
import type { Product } from '@/lib/api/types'

const LOW_STOCK_THRESHOLD = 10

interface ProductDrawerProps {
  open: boolean
  onClose: () => void
  product: Product | null
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  onManageStock: (product: Product) => void
}

export function ProductDrawer({ open, onClose, product, onEdit, onDelete, onManageStock }: ProductDrawerProps) {
  const isAdmin = useIsAdmin()
  const { data: supplier } = useSupplier(open ? (product?.supplier_id ?? null) : null)
  const { data: movements, isLoading: movementsLoading } = useStockMovements(open ? (product?.id ?? null) : null, 1, 8)

  if (!product) return null

  const status = getProductStatus(product.quantity_in_stock)
  const recentMovements = movements?.data ?? []
  const chartData = [...recentMovements].reverse()
  const needsRestock = status !== 'in_stock'
  const suggestedReorder = Math.max(LOW_STOCK_THRESHOLD * 2 - product.quantity_in_stock, LOW_STOCK_THRESHOLD)

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={product.name}
      subtitle={`SKU ${product.sku}`}
      width="lg"
      footer={
        isAdmin ? (
          <>
            <Button variant="ghost" onClick={() => onDelete(product)}>
              <Trash2 className="size-4" />
              Delete
            </Button>
            <Button variant="outline" onClick={() => onManageStock(product)}>
              <PackageSearch className="size-4" />
              Manage stock
            </Button>
            <Button onClick={() => onEdit(product)}>
              <Pencil className="size-4" />
              Edit product
            </Button>
          </>
        ) : (
          <Button variant="outline" onClick={() => onManageStock(product)}>
            <PackageSearch className="size-4" />
            View stock history
          </Button>
        )
      }
    >
      <div className="flex flex-col gap-6">
        {/* Image + QR */}
        <div className="flex items-center gap-5">
          <ProductThumbnail product={product} size="xl" />
          <div className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-surface-2/50 p-3">
            <QRCodeSVG value={product.sku} size={72} bgColor="transparent" fgColor="#F5F5F5" level="M" />
            <span className="font-mono text-[10px] text-text-muted">{product.sku}</span>
          </div>
        </div>

        {product.description && <p className="text-sm leading-relaxed text-text-secondary">{product.description}</p>}

        {/* Key facts grid */}
        <div className="grid grid-cols-2 gap-3">
          <Fact icon={<Tag className="size-3.5" />} label="Category" value={product.category_name ?? '—'} />
          <Fact icon={<Truck className="size-3.5" />} label="Supplier" value={product.supplier_name ?? '—'} />
          <Fact label="Unit price" value={formatCurrency(product.unit_price)} />
          <Fact label="Current stock" value={String(product.quantity_in_stock)} />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2/50 px-4 py-3">
          <span className="text-sm text-text-secondary">Stock status</span>
          <Badge tone={STATUS_TONE[status]} pulse={status !== 'in_stock'}>
            {STATUS_LABEL[status]}
          </Badge>
        </div>

        {/* Supplier information */}
        <Section title="Supplier information">
          {!supplier ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <GlassCard className="p-4">
              <p className="font-medium text-text">{supplier.name}</p>
              <div className="mt-2 flex flex-col gap-1.5 text-xs text-text-muted">
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
              </div>
            </GlassCard>
          )}
        </Section>

        {/* Restocking information */}
        <Section title="Restocking information">
          <div className={`flex items-start gap-3 rounded-lg border p-4 ${needsRestock ? 'border-warning/30 bg-warning-soft' : 'border-success/30 bg-success-soft'}`}>
            {needsRestock ? (
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
            ) : (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
            )}
            <div className="text-sm">
              {needsRestock ? (
                <>
                  <p className="font-medium text-text">Restock recommended</p>
                  <p className="mt-1 text-text-muted">
                    {product.quantity_in_stock} on hand, below the {LOW_STOCK_THRESHOLD}-unit threshold. Consider ordering{' '}
                    <span className="font-medium text-text">{suggestedReorder} units</span> from {product.supplier_name ?? 'the supplier'}.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium text-text">Stock healthy</p>
                  <p className="mt-1 text-text-muted">{product.quantity_in_stock} units on hand — above the {LOW_STOCK_THRESHOLD}-unit threshold.</p>
                </>
              )}
            </div>
          </div>
        </Section>

        {/* Stock analytics */}
        <Section title="Stock analytics">
          {movementsLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : chartData.length === 0 ? (
            <p className="text-sm text-text-muted">No movement history yet to chart.</p>
          ) : (
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CATEGORICAL_PALETTE[0]} stopOpacity={0.45} />
                      <stop offset="100%" stopColor={CATEGORICAL_PALETTE[0]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="created_at" hide />
                  <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip
                    cursor={{ stroke: CHART_GRID }}
                    contentStyle={{ background: 'rgba(28,28,28,0.95)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, fontSize: 12, color: '#BDBDBD' }}
                    labelFormatter={(v) => formatDate(String(v))}
                    formatter={(value) => [String(value), 'Balance']}
                  />
                  <Area type="monotone" dataKey="running_balance" stroke={CATEGORICAL_PALETTE[0]} strokeWidth={2} fill="url(#balanceFill)" isAnimationActive animationDuration={600} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          <p className="mt-1 text-[11px] text-text-muted">Running stock balance across the most recent movements.</p>
        </Section>

        {/* Inventory timeline */}
        <Section title="Inventory timeline">
          {movementsLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : recentMovements.length === 0 ? (
            <p className="text-sm text-text-muted">No stock movements recorded yet.</p>
          ) : (
            <ol className="relative flex flex-col gap-4 border-l border-border pl-5">
              {recentMovements.map((m) => (
                <li key={m.id} className="relative">
                  <span
                    className={`absolute -left-6.5 flex size-4 items-center justify-center rounded-full ${m.type === 'IN' ? 'bg-success' : 'bg-danger'}`}
                  >
                    {m.type === 'IN' ? <ArrowUpRight className="size-2.5 text-white" /> : <ArrowDownRight className="size-2.5 text-white" />}
                  </span>
                  <p className="text-sm text-text">
                    <span className="font-medium">{m.type === 'IN' ? '+' : '-'}{m.quantity} units</span>{' '}
                    <span className="text-text-muted">· balance {m.running_balance}</span>
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-text-muted">
                    <Clock className="size-3" /> {formatDate(m.created_at)}
                    {m.reason && <span>· {m.reason}</span>}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </Section>

        <p className="text-xs text-text-muted">Last updated {formatDate(product.updated_at)}</p>
      </div>
    </Drawer>
  )
}

function Fact({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-2/50 px-3.5 py-2.5">
      <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-text-muted">
        {icon}
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-medium text-text">{value}</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-text-muted">{title}</h3>
      {children}
    </div>
  )
}
