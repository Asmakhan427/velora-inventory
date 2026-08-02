import { Truck, Mail } from 'lucide-react'
import { ScrollReveal, StaggerGroup, StaggerItem } from '@/components/motion/ScrollReveal'
import { GlassCard } from '@/components/ui/GlassCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { useSuppliers } from '@/lib/queries/useSuppliers'

export function SuppliersPreview() {
  const { data, isLoading } = useSuppliers({ page: 1, pageSize: 6 })
  const suppliers = data?.data ?? []

  return (
    <section id="suppliers" className="relative py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-secondary-fg">Suppliers</span>
          <h2 className="mt-3 font-display text-3xl font-semibold text-text sm:text-4xl">Your supply network, visible</h2>
          <p className="mt-4 text-text-secondary">Every supplier feeding your catalog, at a glance.</p>
        </ScrollReveal>

        {isLoading ? (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : suppliers.length === 0 ? (
          <p className="mt-12 text-center text-sm text-text-muted">No suppliers yet — they'll appear here once added.</p>
        ) : (
          <StaggerGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {suppliers.map((sup) => (
              <StaggerItem key={sup.id}>
                <GlassCard hoverLift glow="secondary">
                  <div className="flex items-center gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary-soft text-secondary-fg">
                      <Truck className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-text">{sup.name}</h3>
                      <p className="text-xs text-text-muted">{sup.product_count ?? 0} products</p>
                    </div>
                  </div>
                  <p className="mt-3 flex items-center gap-1.5 truncate text-xs text-text-muted">
                    <Mail className="size-3.5 shrink-0" />
                    {sup.contact_email}
                  </p>
                </GlassCard>
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </div>
    </section>
  )
}
