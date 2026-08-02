import { forwardRef, useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Field } from './Field'

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  error?: string
  hint?: string
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(({ label, error, hint, ...props }, ref) => {
  const [visible, setVisible] = useState(false)
  return (
    <Field
      ref={ref}
      label={label}
      error={error}
      hint={hint}
      type={visible ? 'text' : 'password'}
      suffix={
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          className="flex items-center justify-center text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      }
      {...props}
    />
  )
})
PasswordField.displayName = 'PasswordField'
