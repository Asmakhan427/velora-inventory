import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, ShieldCheck, User } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { LoginModal } from './LoginModal'
import { cn } from '@/lib/utils/cn'

interface UserChipProps {
  variant?: 'sidebar' | 'navbar'
}

export function UserChip({ variant = 'sidebar' }: UserChipProps) {
  const { user, logout } = useAuthStore()
  const [loginOpen, setLoginOpen] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.info('Signed out.')
    navigate('/')
  }

  if (!user) {
    return (
      <>
        <Button
          variant={variant === 'navbar' ? 'primary' : 'outline'}
          size={variant === 'navbar' ? 'md' : 'sm'}
          className={variant === 'sidebar' ? 'w-full' : ''}
          onClick={() => setLoginOpen(true)}
        >
          <User className="size-4" />
          Sign in
        </Button>
        <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      </>
    )
  }

  return (
    <div className={cn('flex items-center gap-3', variant === 'sidebar' && 'rounded-lg border border-border bg-surface-2/50 p-3')}>
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
        {user.username.slice(0, 2).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text">{user.username}</p>
        <p className="flex items-center gap-1 text-xs text-text-muted">
          {user.role === 'ADMIN' && <ShieldCheck className="size-3 text-accent" />}
          {user.role === 'ADMIN' ? 'Administrator' : 'Staff'}
        </p>
      </div>
      <button
        onClick={handleLogout}
        aria-label="Sign out"
        className="flex size-8 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-white/8 hover:text-danger cursor-pointer"
      >
        <LogOut className="size-4" />
      </button>
    </div>
  )
}
