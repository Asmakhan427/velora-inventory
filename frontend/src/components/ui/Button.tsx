import { forwardRef, type ReactNode } from 'react'
import { AnimatePresence, motion, type HTMLMotionProps } from 'framer-motion'
import { Loader2, Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useRipple } from '@/lib/hooks/useRipple'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant
  size?: Size
  loading?: boolean
  success?: boolean
  children?: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-white shadow-glow-primary hover:brightness-110',
  secondary: 'bg-surface-2 text-text border border-border-strong hover:bg-surface-3',
  ghost: 'bg-transparent text-text-secondary hover:bg-white/5 hover:text-text',
  danger: 'bg-danger text-white shadow-[0_8px_24px_-6px_rgba(185,28,28,0.5)] hover:brightness-110',
  outline: 'bg-transparent border border-border-strong text-text hover:border-primary/60 hover:bg-primary-soft',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-13 px-7 text-base gap-2.5',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, success, className, children, disabled, onClick, ...props }, ref) => {
    const { ripples, addRipple } = useRipple()

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
        disabled={disabled || loading}
        onClick={(e) => {
          addRipple(e)
          onClick?.(e)
        }}
        className={cn(
          'relative isolate overflow-hidden inline-flex items-center justify-center rounded-md font-medium',
          'transition-[filter,transform,box-shadow] duration-200 disabled:opacity-50 disabled:pointer-events-none',
          'cursor-pointer select-none',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        <span className={cn('inline-flex items-center gap-2 transition-opacity', loading && 'opacity-0')}>{children}</span>
        <AnimatePresence>
          {loading && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Loader2 className="size-4 animate-spin" />
            </motion.span>
          )}
          {success && !loading && (
            <motion.span
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="absolute inset-0 flex items-center justify-center bg-success"
            >
              <Check className="size-4" />
            </motion.span>
          )}
        </AnimatePresence>
        {ripples.map((r) => (
          <span
            key={r.id}
            className="pointer-events-none absolute rounded-full bg-white/30 animate-[ripple_0.65s_ease-out]"
            style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
          />
        ))}
      </motion.button>
    )
  },
)
Button.displayName = 'Button'
