import { useState } from 'react'
import { motion } from 'framer-motion'
import { Package, DollarSign, TrendingDown, XCircle, type LucideIcon } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { StatCounter } from '@/components/ui/StatCounter'
import { StatCardSkeleton } from '@/components/ui/Skeleton'
import { formatCurrency } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import type { DashboardSummary } from '@/lib/api/types'

interface StatDef {
  key: string
  label: string
  value: number
  format?: (n: number) => string
  icon: LucideIcon
  tone: 'primary' | 'secondary' | 'warning' | 'danger'
  detail: string
}

function buildStats(summary: DashboardSummary): StatDef[] {
  return [
    { key: 'total', label: 'Total products', value: summary.totalProducts, icon: Package, tone: 'primary', detail: `Across ${summary.categoryCount} categories and ${summary.supplierCount} suppliers.` },
    { key: 'value', label: 'Total stock value', value: summary.totalStockValue, format: formatCurrency, icon: DollarSign, tone: 'secondary', detail: `${summary.totalUnits.toLocaleString()} units currently on hand.` },
    { key: 'low', label: 'Low stock items', value: summary.lowStockCount, icon: TrendingDown, tone: 'warning', detail: 'Products with fewer than 10 units remaining.' },
    { key: 'out', label: 'Out of stock', value: summary.outOfStockCount, icon: XCircle, tone: 'danger', detail: 'Products at zero quantity — restock to avoid missed orders.' },
  ]
}

const toneClasses = {
  primary: { icon: 'bg-primary-soft text-primary', glow: 'primary' as const },
  secondary: { icon: 'bg-secondary-soft text-secondary-fg', glow: 'secondary' as const },
  warning: { icon: 'bg-warning-soft text-warning', glow: 'accent' as const },
  danger: { icon: 'bg-danger-soft text-danger', glow: 'accent' as const },
}

export function StatCards({ summary, loading }: { summary?: DashboardSummary; loading?: boolean }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (loading || !summary) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  const stats = buildStats(summary)

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat, i) => {
        const isOpen = expanded === stat.key
        const tone = toneClasses[stat.tone]
        return (
          <motion.div
            key={stat.key}
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
          >
            <GlassCard
              hoverLift
              glow={tone.glow}
              layout
              role="button"
              tabIndex={0}
              aria-expanded={isOpen}
              onClick={() => setExpanded(isOpen ? null : stat.key)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setExpanded(isOpen ? null : stat.key)
                }
              }}
              className="cursor-pointer select-none"
            >
              <div className="flex items-start justify-between">
                <div className={cn('flex size-10 items-center justify-center rounded-lg', tone.icon)}>
                  <stat.icon className="size-5" />
                </div>
              </div>
              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-text-muted">{stat.label}</p>
              <p className="mt-1.5 font-display text-2xl font-semibold text-text sm:text-3xl">
                <StatCounter value={stat.value} format={stat.format} />
              </p>
              {isOpen && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 border-t border-border pt-3 text-xs text-text-muted"
                >
                  {stat.detail}
                </motion.p>
              )}
            </GlassCard>
          </motion.div>
        )
      })}
    </div>
  )
}
