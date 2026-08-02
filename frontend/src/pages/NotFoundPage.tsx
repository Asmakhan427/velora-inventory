import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { AnimatedMeshGradient } from '@/components/motion/AnimatedMeshGradient'

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-bg px-6 text-center">
      <AnimatedMeshGradient variant="subtle" />
      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary-soft text-primary">
          <Compass className="size-8" />
        </div>
        <h1 className="font-display text-4xl font-semibold text-text">Page not found</h1>
        <p className="max-w-sm text-text-muted">The page you're looking for doesn't exist or has moved.</p>
        <Link
          to="/"
          className="btn-glow inline-flex h-11 items-center justify-center rounded-md bg-accent px-6 text-sm font-medium text-white transition hover:brightness-110"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
