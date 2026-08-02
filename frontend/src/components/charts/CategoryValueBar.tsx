import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { motion } from 'framer-motion'
import { CATEGORICAL_PALETTE, CHART_GRID, CHART_TEXT_MUTED } from './palette'
import { formatCurrency } from '@/lib/utils/format'

interface CategoryValueBarProps {
  data: { category: string; product_count: number; stock_value: number }[]
}

export function CategoryValueBar({ data }: CategoryValueBarProps) {
  if (data.length === 0) {
    return <div className="flex h-64 items-center justify-center text-sm text-text-muted">No category data yet.</div>
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 24, top: 4, bottom: 4 }} barCategoryGap={14}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="category"
            width={110}
            tickLine={false}
            axisLine={false}
            tick={{ fill: CHART_TEXT_MUTED, fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: CHART_GRID }}
            contentStyle={{
              background: 'rgba(28,28,28,0.95)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10,
              fontSize: 12,
              color: '#BDBDBD',
              backdropFilter: 'blur(8px)',
            }}
            labelStyle={{ color: '#F5F5F5', fontWeight: 600, marginBottom: 4 }}
            formatter={(value) => [formatCurrency(Number(value)), 'Stock value']}
          />
          <Bar dataKey="stock_value" radius={[0, 4, 4, 0]} maxBarSize={22} isAnimationActive animationDuration={700}>
            {data.map((entry, index) => (
              <Cell key={entry.category} fill={CATEGORICAL_PALETTE[index % CATEGORICAL_PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
