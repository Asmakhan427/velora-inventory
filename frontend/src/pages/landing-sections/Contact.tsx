import { useState } from 'react'
import { Mail, Send } from 'lucide-react'
import { ScrollReveal } from '@/components/motion/ScrollReveal'
import { GlassCard } from '@/components/ui/GlassCard'
import { Field, TextareaField } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'

const CONTACT_EMAIL = 'info@gmail.com'

export function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Velora Inventory, message from ${name || 'website visitor'}`)
    const body = encodeURIComponent(`${message}\n\nFrom ${name} (${email})`)
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
  }

  return (
    <section id="contact" className="relative border-t border-border bg-section-alt py-20">
      <div className="mx-auto grid max-w-5xl gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:items-start">
        <ScrollReveal>
          <span className="text-xs font-semibold uppercase tracking-widest text-secondary-fg">Contact</span>
          <h2 className="mt-3 font-display text-3xl font-semibold text-text sm:text-4xl">Let's talk inventory</h2>
          <p className="mt-4 max-w-md text-text-secondary">Send a note, it opens directly in your mail client.</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="group mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent">
            <Mail className="size-4 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />
            <span className="relative">
              {CONTACT_EMAIL}
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-accent transition-all duration-300 group-hover:w-full" />
            </span>
          </a>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <GlassCard className="transition-colors duration-300 hover:border-accent/50">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Field label="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
              <Field label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <TextareaField label="Message" value={message} onChange={(e) => setMessage(e.target.value)} required />
              <Button type="submit" className="w-full">
                <Send className="size-4" />
                Open in mail client
              </Button>
            </form>
          </GlassCard>
        </ScrollReveal>
      </div>
    </section>
  )
}
