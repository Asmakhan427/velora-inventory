import { cn } from '@/lib/utils/cn'
import { GlowOrb } from '@/components/ui/GlowOrb'

interface AnimatedMeshGradientProps {
  className?: string
  variant?: 'full' | 'subtle'
}

/** A single monochrome accent glow for ambient depth — no multi-color blending. */
export function AnimatedMeshGradient({ className, variant = 'full' }: AnimatedMeshGradientProps) {
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <GlowOrb color="accent" size={520} className={cn('left-1/2 top-1/3 -translate-x-1/2', variant === 'subtle' && 'opacity-50')} />
    </div>
  )
}
