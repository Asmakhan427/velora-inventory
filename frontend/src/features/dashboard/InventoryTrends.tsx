import { useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'
import { useDashboardTrends } from '@/lib/queries/useDashboard'
import { formatDateShort } from '@/lib/utils/format'
import { STATUS_COLORS, CHART_GRID, CHART_TEXT_MUTED } from '@/components/charts/palette'

const RANGES = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
]

export function InventoryTrends() {
  const [days, setDays] = useState(30)
  const { data, isLoading } = useDashboardTrends(days)
  const points = data?.points ?? []
  const netChange = points.reduce((sum, p) => sum + (p.in_qty - p.out_qty), 0)

  return (
    <GlassCard className="h-full">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold text-text">Inventory trends</h2>
          <p className="mt-1 text-xs text-text-muted">Units received vs. shipped, over time</p>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-border-strong bg-surface-2/60 p-1">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setDays(r.days)}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                days === r.days ? 'bg-primary text-white' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {!isLoading && (
          <Badge tone={netChange >= 0 ? 'success' : 'danger'}>
            {netChange >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {netChange >= 0 ? '+' : ''}
            {netChange} units net over {days}d
          </Badge>
        )}
      </div>

      <div className="mt-4 h-56 w-full">
        {isLoading ? (
          <div className="h-full w-full animate-pulse rounded-lg bg-surface-2/50" />
        ) : points.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-text-muted">No movement activity in this range yet.</div>
        ) : (
          <motion.div key={days} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={points} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="inFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={STATUS_COLORS.in_stock} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={STATUS_COLORS.in_stock} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="outFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={STATUS_COLORS.out_of_stock} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={STATUS_COLORS.out_of_stock} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={CHART_GRID} vertical={false} />
                <XAxis dataKey="date" tickFormatter={(v) => formatDateShort(v).replace(/,.*/, '')} tick={{ fill: CHART_TEXT_MUTED, fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={24} />
                <YAxis tick={{ fill: CHART_TEXT_MUTED, fontSize: 11 }} tickLine={false} axisLine={false} width={32} />
                <Tooltip
                  contentStyle={{ background: 'rgba(28,28,28,0.95)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, fontSize: 12, color: '#BDBDBD' }}
                  labelFormatter={(v) => formatDateShort(String(v))}
                />
                <Area type="monotone" dataKey="in_qty" name="Received" stroke={STATUS_COLORS.in_stock} strokeWidth={2} fill="url(#inFill)" isAnimationActive animationDuration={700} />
                <Area type="monotone" dataKey="out_qty" name="Shipped" stroke={STATUS_COLORS.out_of_stock} strokeWidth={2} fill="url(#outFill)" isAnimationActive animationDuration={700} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>
      <div className="mt-2 flex items-center gap-4 text-[11px] text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ background: STATUS_COLORS.in_stock }} /> Received
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ background: STATUS_COLORS.out_of_stock }} /> Shipped
        </span>
      </div>
    </GlassCard>
  )
}
