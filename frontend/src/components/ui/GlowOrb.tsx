import { cn } from '@/lib/utils/cn'

interface GlowOrbProps {
  color?: 'primary' | 'secondary' | 'accent'
  size?: number
  className?: string
  delay?: number
}

const colorMap = {
  primary: 'rgba(111,78,55,0.45)',
  secondary: 'rgba(139,94,60,0.4)',
  accent: 'rgba(166,124,82,0.4)',
}

export function GlowOrb({ color = 'primary', size = 420, className, delay = 0 }: GlowOrbProps) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute rounded-full blur-3xl animate-orb-drift', className)}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${colorMap[color]}, transparent 70%)`,
        animationDelay: `${delay}s`,
      }}
    />
  )
}
