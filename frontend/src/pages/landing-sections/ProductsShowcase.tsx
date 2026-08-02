import { GlassCard } from '@/components/ui/GlassCard'
import { StaggerGroup, StaggerItem } from '@/components/motion/ScrollReveal'
import { FlipReveal } from '@/components/motion/FlipReveal'
import { ProductThumbnail } from '@/features/products/ProductThumbnail'
import { useProducts } from '@/lib/queries/useProducts'
import { formatCurrency } from '@/lib/utils/format'

export function ProductsShowcase() {
  const { data } = useProducts({ page: 1, pageSize: 4, sortBy: 'created_at', sortDir: 'desc' })
  const products = data?.data ?? []

  if (products.length === 0) return null

  return (
    <section id="products" className="relative border-t border-border bg-section-alt py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <FlipReveal>
          <h2 className="text-center font-display text-3xl font-semibold text-text sm:text-4xl">Every product, one clear view</h2>
        </FlipReveal>

        <StaggerGroup className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {products.map((p) => (
            <StaggerItem key={p.id}>
              <GlassCard hoverLift glow="accent" className="group flex flex-col items-center gap-4 text-center transition-colors duration-300 hover:border-accent/50">
                <ProductThumbnail product={p} size="lg" className="transition-transform duration-300 group-hover:scale-105" />
                <div>
                  <h3 className="truncate font-medium text-text">{p.name}</h3>
                  <p className="mt-1 font-display text-lg font-semibold text-accent">{formatCurrency(p.unit_price)}</p>
                </div>
              </GlassCard>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  )
}
