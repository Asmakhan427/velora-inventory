import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useDashboardSummary } from '@/lib/queries/useDashboard'
import { StatCards } from './StatCards'
import { RecentMovementsTable } from './RecentMovementsTable'
import { InventoryTrends } from './InventoryTrends'
import { GlassCard } from '@/components/ui/GlassCard'
import { CategoryValueBar } from '@/components/charts/CategoryValueBar'
import { SupplierValueBar } from '@/components/charts/SupplierValueBar'
import { StatusDonut } from '@/components/charts/StatusDonut'
import { ScrollReveal } from '@/components/motion/ScrollReveal'
import { Button } from '@/components/ui/Button'

export default function DashboardPage() {
  const { data: summary, isLoading, isError, refetch } = useDashboardSummary()

  if (isError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-danger-soft text-danger">
          <AlertTriangle className="size-7" />
        </div>
        <div>
          <h2 className="font-semibold text-text">Couldn't load the dashboard</h2>
          <p className="mt-1 text-sm text-text-muted">Check that the API server is running and try again.</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="size-4" />
          Retry
        </Button>
      </div>
    )
  }

  const inStock = summary ? summary.totalProducts - summary.lowStockCount - summary.outOfStockCount : 0

  return (
    <div className="flex flex-col gap-6">
      <StatCards summary={summary} loading={isLoading} />

      <div className="grid gap-6 lg:grid-cols-5">
        <ScrollReveal className="lg:col-span-3" y={16}>
          <GlassCard className="h-full">
            <h2 className="font-display text-base font-semibold text-text">Category distribution</h2>
            <p className="mt-1 text-xs text-text-muted">Total inventory value grouped by category.</p>
            <div className="mt-6">
              {isLoading || !summary ? (
                <div className="h-64 animate-pulse rounded-lg bg-surface-2/50" />
              ) : (
                <CategoryValueBar data={summary.byCategory} />
              )}
            </div>
          </GlassCard>
        </ScrollReveal>

        <ScrollReveal className="lg:col-span-2" y={16} delay={0.08}>
          <GlassCard className="h-full">
            <h2 className="font-display text-base font-semibold text-text">Stock health</h2>
            <p className="mt-1 text-xs text-text-muted">Distribution of in-stock, low, and out-of-stock items.</p>
            <div className="mt-6">
              {isLoading || !summary ? (
                <div className="h-52 animate-pulse rounded-lg bg-surface-2/50" />
              ) : (
                <StatusDonut inStock={Math.max(inStock, 0)} lowStock={summary.lowStockCount} outOfStock={summary.outOfStockCount} />
              )}
            </div>
          </GlassCard>
        </ScrollReveal>
      </div>

      <ScrollReveal y={16} delay={0.1}>
        <InventoryTrends />
      </ScrollReveal>

      <div className="grid gap-6 lg:grid-cols-5">
        <ScrollReveal className="lg:col-span-2" y={16} delay={0.12}>
          <GlassCard className="h-full">
            <h2 className="font-display text-base font-semibold text-text">Supplier performance</h2>
            <p className="mt-1 text-xs text-text-muted">Inventory value supplied, by supplier.</p>
            <div className="mt-6">
              {isLoading || !summary ? (
                <div className="h-64 animate-pulse rounded-lg bg-surface-2/50" />
              ) : (
                <SupplierValueBar data={summary.bySupplier} />
              )}
            </div>
          </GlassCard>
        </ScrollReveal>

        <ScrollReveal className="lg:col-span-3" y={16} delay={0.16}>
          <div>
            <h2 className="mb-3 font-display text-base font-semibold text-text">Recent activity</h2>
            <RecentMovementsTable movements={summary?.recentMovements ?? []} loading={isLoading} />
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
