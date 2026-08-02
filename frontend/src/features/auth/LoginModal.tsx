import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Field } from '@/components/ui/Field'
import { PasswordField } from '@/components/ui/PasswordField'
import { Switch } from '@/components/ui/Switch'
import { Button } from '@/components/ui/Button'
import { authApi } from '@/lib/api/auth'
import { ApiClientError } from '@/lib/api/client'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/components/ui/Toast'

interface LoginModalProps {
  open: boolean
  onClose: () => void
}

export function LoginModal({ open, onClose }: LoginModalProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const login = useAuthStore((s) => s.login)
  const toast = useToast()
  const navigate = useNavigate()

  const reset = () => {
    setUsername('')
    setPassword('')
    setError(null)
    setLoading(false)
    setSuccess(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const result = await authApi.login({ username, password })
      login(result.token, result.user, rememberMe)
      setLoading(false)
      setSuccess(true)
      toast.success(`Welcome back, ${result.user.username}.`)
      window.setTimeout(() => {
        handleClose()
        navigate('/dashboard')
      }, 550)
    } catch (err) {
      setLoading(false)
      setError(err instanceof ApiClientError ? err.message : 'Something went wrong. Please try again.')
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Sign in" subtitle="Access admin controls and personalized views." size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
        <PasswordField label="Password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <div className="flex items-center justify-between">
          <Switch checked={rememberMe} onCheckedChange={setRememberMe} label="Remember me" id="remember-me" />
        </div>
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-md border border-danger/30 bg-danger-soft px-3.5 py-2.5 text-sm text-[#fca5a5]"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        <Button type="submit" loading={loading} success={success} className="mt-1 w-full">
          <LogIn className="size-4" />
          Sign in
        </Button>
      </form>
    </Modal>
  )
}
