import { Navigate, useLocation } from 'react-router-dom'
import { useIsAuthenticated } from '@/store/authStore'

/**
 * Guests (no session) never reach the app shell — every /dashboard, /products,
 * /categories, /suppliers route redirects back to the landing page until the
 * user signs in. Staff and Admin both pass; per-action permissions (hiding
 * create/edit/delete) are handled separately inside each page.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useIsAuthenticated()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
