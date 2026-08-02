import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

type Tone = 'primary' | 'secondary' | 'accent' | 'success' | 'danger' | 'warning' | 'neutral'

interface BadgeProps {
  children: ReactNode
  tone?: Tone
  pulse?: boolean
  className?: string
}

const toneClasses: Record<Tone, string> = {
  primary: 'bg-primary-soft text-[#d3b594] border-primary/30',
  secondary: 'bg-secondary-soft text-[#cbaa86] border-secondary/40',
  accent: 'bg-accent-soft text-[#e3c6a3] border-accent/30',
  success: 'bg-success-soft text-[#86d99b] border-success/30',
  danger: 'bg-danger-soft text-[#f1948a] border-danger/30',
  warning: 'bg-warning-soft text-[#f0c36b] border-warning/30',
  neutral: 'bg-white/6 text-text-secondary border-white/10',
}

const pulseDot: Record<Tone, string> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  accent: 'bg-accent',
  success: 'bg-success',
  danger: 'bg-danger',
  warning: 'bg-warning',
  neutral: 'bg-text-muted',
}

export function Badge({ children, tone = 'neutral', pulse, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap',
        toneClasses[tone],
        className,
      )}
    >
      {pulse && (
        <motion.span
          className={cn('size-1.5 rounded-full', pulseDot[tone])}
          animate={{ opacity: [1, 0.35, 1], scale: [1, 1.3, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      {children}
    </span>
  )
}
