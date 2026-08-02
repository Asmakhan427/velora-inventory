import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Boxes, Menu, X } from 'lucide-react'
import { UserChip } from '@/features/auth/UserChip'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils/cn'

const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#why-us', label: 'Why Us' },
  { href: '#products', label: 'Products' },
  { href: '#showcase', label: 'Showcase' },
  { href: '#contact', label: 'Contact' },
]

export function LandingNavbar() {
  const user = useAuthStore((s) => s.user)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300',
        scrolled ? 'border-b border-border bg-bg/70 backdrop-blur-xl' : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-white shadow-glow-primary">
            <Boxes className="size-5" />
          </div>
          <span className="font-display text-lg font-semibold text-text">Velora Inventory</span>
        </a>

        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3.5 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text hover:bg-white/5"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {!user && (
          <div className="hidden items-center lg:flex">
            <UserChip variant="navbar" />
          </div>
        )}

        <button onClick={() => setMobileOpen((v) => !v)} className="rounded-md p-2 text-text lg:hidden cursor-pointer" aria-label="Toggle menu">
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-border bg-bg/95 backdrop-blur-xl px-5 py-4 lg:hidden"
        >
          <nav className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-white/5 hover:text-text"
              >
                {link.label}
              </a>
            ))}
            {!user && (
              <div className="mt-2 border-t border-border pt-3">
                <UserChip variant="navbar" />
              </div>
            )}
          </nav>
        </motion.div>
      )}
    </motion.header>
  )
}
