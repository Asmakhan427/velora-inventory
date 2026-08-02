import { NavLink, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, Package, Tag, Truck, Boxes, X, Home } from 'lucide-react'
import { UserChip } from '@/features/auth/UserChip'
import { cn } from '@/lib/utils/cn'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/categories', label: 'Categories', icon: Tag },
  { to: '/suppliers', label: 'Suppliers', icon: Truck },
]

export function Sidebar({ onNavigate, onClose, mobile }: { onNavigate?: () => void; onClose?: () => void; mobile?: boolean }) {
  return (
    <div className="flex h-full w-66 flex-col border-r border-border bg-sidebar px-4 py-5">
      <div className="mb-6 flex items-center justify-between px-2">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-white shadow-glow-primary">
            <Boxes className="size-5" />
          </div>
          <span className="font-display text-lg font-semibold text-text">Velora</span>
        </div>
        {mobile && (
          <button onClick={onClose} className="rounded-md p-1.5 text-text-muted hover:bg-white/8 cursor-pointer" aria-label="Close menu">
            <X className="size-5" />
          </button>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'relative flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'text-white' : 'text-text-secondary hover:bg-white/5 hover:text-text',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 -z-10 rounded-lg bg-primary/90"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <item.icon className="size-4.5" />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <Link
        to="/"
        className="mb-3 flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-white/5 hover:text-text-secondary"
      >
        <Home className="size-4.5" />
        Back to Home
      </Link>

      <UserChip variant="sidebar" />
    </div>
  )
}
