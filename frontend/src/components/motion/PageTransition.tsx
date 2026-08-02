import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

const variants = {
  initial: { opacity: 0, y: 14, scale: 0.985, filter: 'blur(6px)', rotateX: 2 },
  animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', rotateX: 0 },
  exit: { opacity: 0, y: -10, scale: 0.99, filter: 'blur(4px)' },
}

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 1200, transformStyle: 'preserve-3d' }}
    >
      {children}
    </motion.div>
  )
}
