import { useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { ConnectionPill } from './ConnectionPill'

const TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Live overview of your inventory' },
  '/products': { title: 'Products', subtitle: 'Manage your product catalog' },
  '/categories': { title: 'Categories', subtitle: 'Organize products by category' },
  '/suppliers': { title: 'Suppliers', subtitle: 'Manage supplier relationships' },
}

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const location = useLocation()
  const meta =
    TITLES[location.pathname] ??
    (location.pathname.startsWith('/suppliers/') ? { title: 'Supplier', subtitle: 'Supplier details' } : { title: '', subtitle: '' })

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-bg/70 px-5 py-4 backdrop-blur-xl sm:px-8">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="rounded-md p-1.5 text-text-secondary hover:bg-white/8 lg:hidden cursor-pointer" aria-label="Open menu">
          <Menu className="size-5" />
        </button>
        <div>
          <h1 className="font-display text-lg font-semibold text-text sm:text-xl">{meta.title}</h1>
          <p className="hidden text-xs text-text-muted sm:block">{meta.subtitle}</p>
        </div>
      </div>
      <ConnectionPill />
    </header>
  )
}
