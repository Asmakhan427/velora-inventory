import { Zap, GitBranch, ScrollText, Users } from 'lucide-react'
import { StaggerGroup, StaggerItem } from '@/components/motion/ScrollReveal'
import { FlipReveal } from '@/components/motion/FlipReveal'

const POINTS = [
  { icon: Zap, title: 'Fast by design', desc: 'Race-free reads and writes, no waiting on a round trip for every click.' },
  { icon: GitBranch, title: 'Atomic transactions', desc: 'A stock change either fully succeeds or leaves your data untouched.' },
  { icon: ScrollText, title: 'Audit-ready history', desc: 'Every movement timestamped, with a balance you can trace back to day one.' },
  { icon: Users, title: 'Built for teams', desc: 'One fast interface, destructive actions stay gated by role.' },
]

export function WhyChooseUs() {
  return (
    <section id="why-us" className="relative border-t border-border bg-bg py-20">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <FlipReveal>
          <h2 className="text-center font-display text-3xl font-semibold text-text sm:text-4xl">Precision, without the overhead</h2>
        </FlipReveal>

        <StaggerGroup className="mt-10 flex flex-col gap-4">
          {POINTS.map((p) => (
            <StaggerItem key={p.title}>
              <div className="group flex items-center gap-5 rounded-lg border border-border bg-surface/40 p-5 backdrop-blur-sm transition-colors duration-300 hover:border-accent/50 hover:bg-accent-soft">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
                  <p.icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-text">{p.title}</h3>
                  <p className="mt-1 text-sm text-text-muted">{p.desc}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  )
}
