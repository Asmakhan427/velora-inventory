import { forwardRef, useId, type InputHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface BaseFieldProps {
  label: string
  error?: string
  hint?: string
  suffix?: ReactNode
  wrapperClassName?: string
}

const fieldWrapper = 'relative w-full'
const fieldInputBase = cn(
  'peer w-full rounded-md border bg-surface-2/60 px-3.5 pt-5 pb-2 text-sm text-text outline-none',
  'transition-[border-color,box-shadow] duration-200 placeholder-transparent',
  'border-border-strong focus:border-accent focus:shadow-[0_0_0_3px_rgba(166,124,82,0.3)]',
)
const floatingLabel = cn(
  'pointer-events-none absolute left-3.5 top-3.5 text-sm text-text-muted origin-left',
  'transition-all duration-200',
  'peer-focus:top-2 peer-focus:text-[11px] peer-focus:text-accent',
  'peer-not-placeholder-shown:top-2 peer-not-placeholder-shown:text-[11px]',
)

interface InputFieldProps extends BaseFieldProps, InputHTMLAttributes<HTMLInputElement> {}

export const Field = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, hint, suffix, id, className, wrapperClassName, ...props }, ref) => {
    const autoId = useId()
    const fieldId = id ?? autoId
    return (
      <div className={cn(fieldWrapper, wrapperClassName)}>
        <input ref={ref} id={fieldId} placeholder=" " className={cn(fieldInputBase, error && 'border-danger', suffix && 'pr-10', className)} {...props} />
        <label htmlFor={fieldId} className={floatingLabel}>
          {label}
        </label>
        {suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>}
        <FieldMessage error={error} hint={hint} />
      </div>
    )
  },
)
Field.displayName = 'Field'

interface TextareaFieldProps extends BaseFieldProps, TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, hint, id, className, wrapperClassName, ...props }, ref) => {
    const autoId = useId()
    const fieldId = id ?? autoId
    return (
      <div className={cn(fieldWrapper, wrapperClassName)}>
        <textarea ref={ref} id={fieldId} placeholder=" " rows={3} className={cn(fieldInputBase, 'resize-none', error && 'border-danger', className)} {...props} />
        <label htmlFor={fieldId} className={floatingLabel}>
          {label}
        </label>
        <FieldMessage error={error} hint={hint} />
      </div>
    )
  },
)
TextareaField.displayName = 'TextareaField'

function FieldMessage({ error, hint }: { error?: string; hint?: string }) {
  return (
    <AnimatePresence mode="wait">
      {error ? (
        <motion.p
          key="error"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.18 }}
          className="mt-1.5 flex items-center gap-1 text-xs text-danger overflow-hidden"
        >
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
        </motion.p>
      ) : hint ? (
        <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1.5 text-xs text-text-muted">
          {hint}
        </motion.p>
      ) : null}
    </AnimatePresence>
  )
}
