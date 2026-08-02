import { Link } from 'react-router-dom'
import { Boxes, Mail, ArrowRight } from 'lucide-react'

const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#why-us', label: 'Why Us' },
  { href: '#products', label: 'Products' },
  { href: '#showcase', label: 'Showcase' },
  { href: '#contact', label: 'Contact' },
]

const CONTACT_EMAIL = 'info@gmail.com'

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-bg py-14">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-5 sm:px-8 lg:grid-cols-3 lg:items-start lg:gap-6">
        <div className="flex flex-col items-center gap-3 lg:items-start">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
              <Boxes className="size-4.5" />
            </div>
            <span className="font-display text-base font-semibold text-text">Velora Inventory</span>
          </div>
          <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-accent">
            <Mail className="size-3.5" />
            {CONTACT_EMAIL}
          </a>
        </div>

        <nav className="flex flex-col items-center gap-3 text-sm text-text-secondary">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="group relative w-fit transition-colors hover:text-text">
              {link.label}
              <span className="absolute -bottom-0.5 left-1/2 h-px w-0 -translate-x-1/2 bg-accent transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="flex justify-center lg:justify-end">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
          >
            Go to dashboard
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>

      <p className="mt-10 text-center text-xs text-text-muted">© {new Date().getFullYear()} Velora Inventory. All rights reserved.</p>
    </footer>
  )
}
