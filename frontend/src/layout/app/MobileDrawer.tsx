import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from './Sidebar'

export function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-100 lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            className="relative z-10 h-full"
          >
            <Sidebar mobile onClose={onClose} onNavigate={onClose} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
