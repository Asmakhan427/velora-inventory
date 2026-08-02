import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LayoutDashboard, Package, Truck, Circle } from 'lucide-react'
import { ScrollReveal } from '@/components/motion/ScrollReveal'
import { FlipReveal } from '@/components/motion/FlipReveal'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'
import { StatCounter } from '@/components/ui/StatCounter'
import { CategoryValueBar } from '@/components/charts/CategoryValueBar'
import { StatusDonut } from '@/components/charts/StatusDonut'
import { ProductThumbnail } from '@/features/products/ProductThumbnail'
import { SupplierLogo } from '@/features/suppliers/SupplierLogo'
import { useDashboardSummary } from '@/lib/queries/useDashboard'
import { useProducts } from '@/lib/queries/useProducts'
import { useSuppliers } from '@/lib/queries/useSuppliers'
import { formatCurrency } from '@/lib/utils/format'
import { getProductStatus, STATUS_LABEL, STATUS_TONE } from '@/lib/utils/productStatus'

const SCREENS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'products', label: 'Products', icon: Package },
  { key: 'suppliers', label: 'Suppliers', icon: Truck },
] as const

const CYCLE_MS = 4500

export function InterfaceShowcase() {
  const [active, setActive] = useState(0)

  const { data: summary } = useDashboardSummary()
  const { data: products } = useProducts({ page: 1, pageSize: 4, sortBy: 'created_at', sortDir: 'desc' })
  const { data: suppliers } = useSuppliers({ page: 1, pageSize: 3 })

  useEffect(() => {
    const timer = window.setInterval(() => setActive((i) => (i + 1) % SCREENS.length), CYCLE_MS)
    return () => window.clearInterval(timer)
  }, [])

  const inStock = summary ? summary.totalProducts - summary.lowStockCount - summary.outOfStockCount : 0

  return (
    <section id="showcase" className="relative border-t border-border bg-bg py-20">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <FlipReveal>
          <h2 className="text-center font-display text-3xl font-semibold text-text sm:text-4xl">One system, every view</h2>
        </FlipReveal>

        <ScrollReveal delay={0.1} className="mt-10">
          <GlassCard className="mx-auto overflow-hidden p-0">
            <div className="flex items-center gap-2 border-b border-border bg-surface-2/60 px-5 py-3">
              <span className="size-2.5 rounded-full bg-danger/60" />
              <span className="size-2.5 rounded-full bg-warning/60" />
              <span className="size-2.5 rounded-full bg-success/60" />
              <span className="ml-3 flex items-center gap-1.5 text-xs text-text-muted">
                <Circle className="size-2 fill-current text-success" /> {SCREENS[active].label} live preview
              </span>
              <div className="ml-auto flex items-center gap-1 rounded-md border border-border-strong bg-surface-3/60 p-1">
                {SCREENS.map((s, i) => (
                  <button
                    key={s.key}
                    onClick={() => setActive(i)}
                    aria-label={`Show ${s.label}`}
                    className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                      active === i ? 'bg-primary text-white' : 'text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    <s.icon className="size-3" />
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-[22rem] p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {active === 0 && (
                  <motion.div key="dashboard" initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }} transition={{ duration: 0.4 }} className="grid gap-6 lg:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Total stock value</p>
                      <p className="mt-2 font-display text-3xl font-semibold text-text">
                        <StatCounter value={summary?.totalStockValue ?? 0} format={(n) => formatCurrency(n)} />
                      </p>
                      <div className="mt-6">
                        <CategoryValueBar data={summary?.byCategory ?? []} />
                      </div>
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-muted">Stock status</p>
                      <StatusDonut inStock={Math.max(inStock, 0)} lowStock={summary?.lowStockCount ?? 0} outOfStock={summary?.outOfStockCount ?? 0} />
                    </div>
                  </motion.div>
                )}

                {active === 1 && (
                  <motion.div key="products" initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }} transition={{ duration: 0.4 }} className="flex flex-col gap-3">
                    {(products?.data ?? []).map((p) => {
                      const status = getProductStatus(p.quantity_in_stock)
                      return (
                        <div key={p.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface-2/40 px-3.5 py-2.5">
                          <ProductThumbnail product={p} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-text">{p.name}</p>
                            <p className="truncate text-xs text-text-muted">{p.category_name}</p>
                          </div>
                          <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
                          <span className="w-16 shrink-0 text-right text-sm tabular-nums text-text">{formatCurrency(p.unit_price)}</span>
                        </div>
                      )
                    })}
                  </motion.div>
                )}

                {active === 2 && (
                  <motion.div key="suppliers" initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }} transition={{ duration: 0.4 }} className="grid gap-4 sm:grid-cols-3">
                    {(suppliers?.data ?? []).map((s) => (
                      <div key={s.id} className="flex flex-col items-center gap-3 rounded-lg border border-border bg-surface-2/40 px-4 py-6 text-center">
                        <SupplierLogo supplier={s} size="md" />
                        <div>
                          <p className="truncate font-medium text-text">{s.name}</p>
                          <p className="mt-1 text-xs text-text-muted">{s.product_count ?? 0} products</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </GlassCard>
        </ScrollReveal>
      </div>
    </section>
  )
}
