import { Link } from 'react-router-dom'
import { Mail, Phone, ArrowRight } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'
import { SupplierLogo } from './SupplierLogo'
import type { Supplier } from '@/lib/api/types'

export function SupplierCard({ supplier }: { supplier: Supplier }) {
  return (
    <Link to={`/suppliers/${supplier.id}`} className="block h-full">
      <GlassCard hoverLift glow="primary" className="group flex h-full flex-col gap-4">
        <div className="flex items-start justify-between">
          <SupplierLogo supplier={supplier} size="md" />
          <Badge tone="neutral">{supplier.product_count ?? 0} products</Badge>
        </div>

        <div>
          <h3 className="truncate font-semibold text-text">{supplier.name}</h3>
          {supplier.contact_person && <p className="mt-0.5 truncate text-xs text-text-muted">{supplier.contact_person}</p>}
        </div>

        <div className="flex flex-col gap-1.5 text-xs text-text-muted">
          <span className="flex items-center gap-1.5 truncate">
            <Mail className="size-3.5 shrink-0" /> {supplier.contact_email}
          </span>
          {supplier.phone && (
            <span className="flex items-center gap-1.5 truncate">
              <Phone className="size-3.5 shrink-0" /> {supplier.phone}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center gap-1.5 pt-2 text-sm font-medium text-accent transition-transform group-hover:translate-x-0.5">
          View details
          <ArrowRight className="size-3.5" />
        </div>
      </GlassCard>
    </Link>
  )
}
