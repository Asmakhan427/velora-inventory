import { Boxes, LineChart, History, ShieldCheck } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { StaggerGroup, StaggerItem } from '@/components/motion/ScrollReveal'
import { FlipReveal } from '@/components/motion/FlipReveal'

const FEATURES = [
  { icon: Boxes, title: 'Live stock tracking', desc: 'Real-time quantity and status, computed instantly.' },
  { icon: LineChart, title: 'Multi-category catalog', desc: 'Fast, filterable search across products and suppliers.' },
  { icon: History, title: 'Full audit trail', desc: 'Every movement recorded atomically, never unaccounted for.' },
  { icon: ShieldCheck, title: 'Role-based access', desc: 'Destructive actions stay gated behind admin roles.' },
]

export function Features() {
  return (
    <section id="features" className="relative border-t border-border bg-section-alt py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <FlipReveal>
          <h2 className="text-center font-display text-3xl font-semibold text-text sm:text-4xl">Everything an operations team needs</h2>
        </FlipReveal>

        <StaggerGroup className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <StaggerItem key={f.title}>
              <GlassCard hoverLift glow="primary" className="group relative h-full overflow-hidden transition-colors duration-300 hover:border-primary/50">
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/6 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <div className="relative flex size-11 items-center justify-center rounded-lg bg-primary-soft text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                  <f.icon className="size-5" />
                </div>
                <h3 className="relative mt-4 font-semibold text-text">{f.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-text-muted">{f.desc}</p>
              </GlassCard>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  )
}
