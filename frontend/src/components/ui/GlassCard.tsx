import { forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface GlassCardProps extends HTMLMotionProps<'div'> {
  hoverLift?: boolean
  glow?: 'primary' | 'secondary' | 'accent' | 'none'
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ hoverLift = false, glow = 'none', className, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          'glass-card p-6',
          hoverLift && 'transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1',
          hoverLift && glow === 'primary' && 'hover:shadow-glow-primary',
          hoverLift && glow === 'secondary' && 'hover:shadow-glow-secondary',
          hoverLift && glow === 'accent' && 'hover:shadow-glow-accent',
          className,
        )}
        {...props}
      >
        {children}
      </motion.div>
    )
  },
)
GlassCard.displayName = 'GlassCard'
