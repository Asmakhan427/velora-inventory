import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { StatCounter } from '@/components/ui/StatCounter'
import { useDashboardSummary } from '@/lib/queries/useDashboard'
import { formatCurrency } from '@/lib/utils/format'
import heroImage from '@/assets/hero-warehouse.jpg'

const HEADLINE = 'Inventory intelligence, engineered for scale.'

const FALLBACK_STATS = { totalProducts: 240, totalStockValue: 186400, categoryCount: 12, supplierCount: 18 }

export function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const parallaxY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])

  const { data } = useDashboardSummary()
  const stats = data ?? FALLBACK_STATS

  const words = HEADLINE.split(' ')

  return (
    <section id="top" ref={ref} className="relative flex min-h-[92vh] items-center overflow-hidden bg-bg pt-28">
      {/* Background photo layer: slow Ken Burns zoom, scroll parallax on the wrapper */}
      <motion.div style={{ y: parallaxY }} className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `linear-gradient(160deg, rgba(17,17,17,0.6), rgba(17,17,17,0.82)), url(${heroImage})` }}
          initial={{ scale: 1.06 }}
          animate={{ scale: 1.16 }}
          transition={{ duration: 26, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        />
        <RackFloor />
        <ScanNodes />
      </motion.div>

      {/* Dark + single-tone brand overlay for legibility: monochrome depth only, no color blending */}
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 bg-linear-to-b from-bg/20 via-transparent to-bg" />
      <div className="absolute inset-0 bg-[linear-gradient(155deg,rgba(111,78,55,0.3)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(17,17,17,0.8)_100%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-5 py-10 text-center sm:px-8">
        <h1 className="font-display text-4xl font-semibold leading-[1.08] text-text sm:text-6xl lg:text-7xl [text-shadow:0_2px_24px_rgba(0,0,0,0.45)]">
          {words.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className={word === 'scale.' ? 'text-accent inline-block' : 'inline-block'}
            >
              {word}&nbsp;
            </motion.span>
          ))}
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-10 grid w-full max-w-3xl grid-cols-2 gap-6 border-t border-white/15 pt-8 sm:grid-cols-4"
        >
          <Stat value={stats.totalProducts} label="Products tracked" />
          <Stat value={stats.totalStockValue} label="Stock value" format={(n) => formatCurrency(n)} />
          <Stat value={stats.categoryCount} label="Categories" />
          <Stat value={stats.supplierCount} label="Suppliers" />
        </motion.div>
      </div>
    </section>
  )
}

function Stat({ value, label, format }: { value: number; label: string; format?: (n: number) => string }) {
  return (
    <div>
      <div className="font-display text-2xl font-semibold text-text sm:text-3xl">
        <StatCounter value={value} format={format} />
      </div>
      <p className="mt-1 text-xs text-text-secondary sm:text-sm">{label}</p>
    </div>
  )
}

function RackFloor() {
  return (
    <div
      aria-hidden
      className="absolute inset-x-0 bottom-0 h-[40%] opacity-[0.12]"
      style={{
        backgroundImage:
          'repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 64px), repeating-linear-gradient(0deg, rgba(255,255,255,0.35) 0px, rgba(255,255,255,0.35) 1px, transparent 1px, transparent 88px)',
        maskImage: 'linear-gradient(to top, black, transparent)',
        WebkitMaskImage: 'linear-gradient(to top, black, transparent)',
        transform: 'perspective(600px) rotateX(55deg)',
        transformOrigin: 'bottom',
      }}
    />
  )
}

const NODES = [
  { x: '18%', y: '28%', delay: 0 },
  { x: '32%', y: '52%', delay: 1.2 },
  { x: '68%', y: '22%', delay: 0.6 },
  { x: '78%', y: '46%', delay: 1.8 },
  { x: '52%', y: '16%', delay: 2.4 },
]

function ScanNodes() {
  return (
    <svg aria-hidden className="absolute inset-0 h-full w-full opacity-45" preserveAspectRatio="none">
      <defs>
        <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#d3ac82" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#d3ac82" stopOpacity="0" />
        </radialGradient>
      </defs>
      {NODES.map((n, i) => {
        const next = NODES[(i + 1) % NODES.length]
        return <line key={`l-${i}`} x1={n.x} y1={n.y} x2={next.x} y2={next.y} stroke="rgba(211,172,130,0.2)" strokeWidth={1} strokeDasharray="4 6" />
      })}
      {NODES.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r="16" fill="url(#nodeGlow)" />
          <motion.circle
            cx={n.x}
            cy={n.y}
            r="3"
            fill="#d3ac82"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: n.delay, ease: 'easeInOut' }}
          />
        </g>
      ))}
    </svg>
  )
}
