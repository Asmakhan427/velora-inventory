import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type ToastVariant = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const variantConfig: Record<ToastVariant, { icon: typeof CheckCircle2; className: string }> = {
  success: { icon: CheckCircle2, className: 'text-success' },
  error: { icon: XCircle, className: 'text-danger' },
  info: { icon: Info, className: 'text-[#cbaa86]' },
}

let toastId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (variant: ToastVariant, message: string) => {
      const id = toastId++
      setToasts((prev) => [...prev, { id, message, variant }])
      window.setTimeout(() => dismiss(id), 4200)
    },
    [dismiss],
  )

  const value: ToastContextValue = {
    success: (message) => push('success', message),
    error: (message) => push('error', message),
    info: (message) => push('info', message),
  }

  const root = typeof document !== 'undefined' ? document.getElementById('toast-root') : null

  return (
    <ToastContext.Provider value={value}>
      {children}
      {root &&
        createPortal(
          <div className="fixed bottom-5 right-5 z-200 flex flex-col gap-2.5 w-full max-w-sm">
            <AnimatePresence>
              {toasts.map((t) => {
                const { icon: Icon, className } = variantConfig[t.variant]
                return (
                  <motion.div
                    key={t.id}
                    layout
                    initial={{ opacity: 0, x: 40, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="glass-card flex items-start gap-3 p-4 shadow-lg"
                  >
                    <Icon className={cn('size-5 shrink-0 mt-0.5', className)} />
                    <p className="flex-1 text-sm text-text-secondary">{t.message}</p>
                    <button onClick={() => dismiss(t.id)} className="text-text-muted hover:text-text cursor-pointer" aria-label="Dismiss">
                      <X className="size-4" />
                    </button>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>,
          root,
        )}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
