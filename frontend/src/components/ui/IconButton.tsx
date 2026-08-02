import { forwardRef, type ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { Tooltip } from './Tooltip'

type Tone = 'default' | 'danger' | 'primary'

interface IconButtonProps extends HTMLMotionProps<'button'> {
  icon: ReactNode
  label: string
  tone?: Tone
  size?: 'sm' | 'md'
}

const toneClasses: Record<Tone, string> = {
  default: 'text-text-secondary hover:text-text hover:bg-white/8',
  danger: 'text-text-secondary hover:text-danger hover:bg-danger-soft',
  primary: 'text-text-secondary hover:text-primary hover:bg-primary-soft',
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, tone = 'default', size = 'md', className, ...props }, ref) => (
    <Tooltip content={label}>
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.9 }}
        aria-label={label}
        className={cn(
          'inline-flex items-center justify-center rounded-md transition-colors duration-150 cursor-pointer',
          size === 'sm' ? 'size-8' : 'size-9.5',
          toneClasses[tone],
          className,
        )}
        {...props}
      >
        {icon}
      </motion.button>
    </Tooltip>
  ),
)
IconButton.displayName = 'IconButton'
