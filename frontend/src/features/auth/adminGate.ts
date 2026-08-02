import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/components/ui/Toast'
import { useConfirm } from '@/lib/hooks/useConfirm'
import { ApiClientError } from '@/lib/api/client'

export function useRequireAdmin() {
  const isAdmin = useAuthStore((s) => s.user?.role === 'ADMIN')
  const toast = useToast()
  return (actionLabel: string) => {
    if (!isAdmin) {
      toast.error(`Sign in as an Admin to ${actionLabel}.`)
      return false
    }
    return true
  }
}

interface ConfirmAndDeleteArgs {
  actionLabel: string
  title: string
  message: string
  successMessage: string
  mutate: () => Promise<unknown>
}

/** Reproduces the products/categories/suppliers delete flow: admin gate (toast if not admin) -> confirm dialog -> mutation. */
export function useConfirmAndDelete() {
  const requireAdmin = useRequireAdmin()
  const confirm = useConfirm()
  const toast = useToast()

  return async ({ actionLabel, title, message, successMessage, mutate }: ConfirmAndDeleteArgs) => {
    if (!requireAdmin(actionLabel)) return
    const confirmed = await confirm({ title, message, confirmLabel: 'Delete', danger: true })
    if (!confirmed) return
    try {
      await mutate()
      toast.success(successMessage)
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Something went wrong.')
    }
  }
}
