import { PackagePlus, ArrowLeftRight, Gauge, FileDown } from 'lucide-react'
import { ScrollReveal, StaggerGroup, StaggerItem } from '@/components/motion/ScrollReveal'

const STEPS = [
  { icon: PackagePlus, title: 'Add products', desc: 'Create products with SKU, pricing, category and supplier — validated as you go.' },
  { icon: ArrowLeftRight, title: 'Track movements', desc: 'Record IN and OUT stock movements atomically, each with a reason and timestamp.' },
  { icon: Gauge, title: 'Monitor the dashboard', desc: 'Watch stock value, low-stock alerts, and category breakdowns update in real time.' },
  { icon: FileDown, title: 'Export & report', desc: 'Pull a filtered CSV export whenever you need to report, reconcile, or audit.' },
]

export function HowItWorks() {
  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">How it works</span>
          <h2 className="mt-3 font-display text-3xl font-semibold text-text sm:text-4xl">From first product to full visibility</h2>
          <p className="mt-4 text-text-secondary">Four steps stand between you and complete inventory clarity.</p>
        </ScrollReveal>

        <StaggerGroup className="relative mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-linear-to-r from-transparent via-border-strong to-transparent lg:block" />
          {STEPS.map((step, i) => (
            <StaggerItem key={step.title}>
              <div className="relative flex flex-col items-center text-center lg:items-start lg:text-left">
                <div className="relative z-10 flex size-12 items-center justify-center rounded-full bg-primary text-white shadow-glow-primary">
                  <step.icon className="size-5" />
                </div>
                <span className="mt-4 text-xs font-semibold text-text-muted">Step {i + 1}</span>
                <h3 className="mt-1 font-semibold text-text">{step.title}</h3>
                <p className="mt-2 text-sm text-text-muted">{step.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  )
}
