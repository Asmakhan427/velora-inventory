import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  tone?: 'primary' | 'accent' | 'danger' | 'warning'
}

const toneClasses = {
  primary: 'bg-primary',
  accent: 'bg-accent',
  danger: 'bg-danger',
  warning: 'bg-warning',
}

export function ProgressBar({ value, max = 100, className, tone = 'primary' }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-surface-3', className)}>
      <motion.div
        className={cn('h-full rounded-full', toneClasses[tone])}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  )
}
