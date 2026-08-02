import type { ReactNode, CSSProperties } from 'react'
import { motion } from 'framer-motion'

interface FlipRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  once?: boolean
}

/**
 * Section-entrance animation styled after a flip calendar/clock leaf: the
 * panel starts folded away below its top hinge and swings up flat into
 * place, rather than just fading/sliding in.
 */
export function FlipReveal({ children, className, delay = 0, once = true }: FlipRevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, rotateX: -70, y: 56 }}
      whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
      viewport={{ once, amount: 0.25 }}
      transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ transformPerspective: 1400, transformOrigin: 'top center' } as CSSProperties}
    >
      {children}
    </motion.div>
  )
}
