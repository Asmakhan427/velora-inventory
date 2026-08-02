import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { motion } from 'framer-motion'
import { STATUS_COLORS } from './palette'
import { formatNumber } from '@/lib/utils/format'

interface StatusDonutProps {
  inStock: number
  lowStock: number
  outOfStock: number
}

export function StatusDonut({ inStock, lowStock, outOfStock }: StatusDonutProps) {
  const total = inStock + lowStock + outOfStock
  const data = [
    { key: 'in_stock', label: 'In stock', value: inStock, color: STATUS_COLORS.in_stock },
    { key: 'low_stock', label: 'Low stock', value: lowStock, color: STATUS_COLORS.low_stock },
    { key: 'out_of_stock', label: 'Out of stock', value: outOfStock, color: STATUS_COLORS.out_of_stock },
  ]

  if (total === 0) {
    return <div className="flex h-52 items-center justify-center text-sm text-text-muted">No products yet.</div>
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="relative h-48 w-48 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={58}
              outerRadius={80}
              paddingAngle={3}
              stroke="none"
              isAnimationActive
              animationDuration={800}
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'rgba(28,28,28,0.95)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10,
                fontSize: 12,
                color: '#BDBDBD',
              }}
              formatter={(value, name) => [formatNumber(Number(value)), String(name)]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-text font-display">{formatNumber(total)}</span>
          <span className="text-[11px] text-text-muted">products</span>
        </div>
      </motion.div>
      <ul className="flex flex-col gap-2.5 text-sm">
        {data.map((d) => (
          <li key={d.key} className="flex items-center gap-2.5">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
            <span className="text-text-secondary">{d.label}</span>
            <span className="ml-auto pl-4 font-medium text-text tabular-nums">{formatNumber(d.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
