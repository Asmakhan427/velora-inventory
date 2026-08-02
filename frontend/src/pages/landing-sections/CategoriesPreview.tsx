import { Tag } from 'lucide-react'
import { ScrollReveal, StaggerGroup, StaggerItem } from '@/components/motion/ScrollReveal'
import { GlassCard } from '@/components/ui/GlassCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { useCategories } from '@/lib/queries/useCategories'

export function CategoriesPreview() {
  const { data, isLoading } = useCategories({ page: 1, pageSize: 6 })
  const categories = data?.data ?? []

  return (
    <section id="categories" className="relative py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">Categories</span>
          <h2 className="mt-3 font-display text-3xl font-semibold text-text sm:text-4xl">Organized from the ground up</h2>
          <p className="mt-4 text-text-secondary">A live snapshot of the categories currently in your catalog.</p>
        </ScrollReveal>

        {isLoading ? (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="mt-12 text-center text-sm text-text-muted">No categories yet — they'll appear here once added.</p>
        ) : (
          <StaggerGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <StaggerItem key={cat.id}>
                <GlassCard hoverLift glow="accent" className="flex items-center gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                    <Tag className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-text">{cat.name}</h3>
                    <p className="text-xs text-text-muted">{cat.product_count ?? 0} products</p>
                  </div>
                </GlassCard>
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </div>
    </section>
  )
}
