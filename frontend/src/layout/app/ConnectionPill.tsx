import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { authApi } from '@/lib/api/auth'
import { cn } from '@/lib/utils/cn'

export function ConnectionPill() {
  const [online, setOnline] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    const check = () => {
      authApi
        .health()
        .then(() => !cancelled && setOnline(true))
        .catch(() => !cancelled && setOnline(false))
    }
    check()
    const interval = window.setInterval(check, 20_000)
    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [])

  return (
    <div className={cn('flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium', online === false ? 'border-danger/30 bg-danger-soft text-[#fca5a5]' : 'border-success/30 bg-success-soft text-[#86d99b]')}>
      <motion.span
        className={cn('size-1.5 rounded-full', online === false ? 'bg-danger' : 'bg-success')}
        animate={online === null ? {} : { opacity: [1, 0.4, 1] }}
        transition={{ duration: 1.6, repeat: Infinity }}
      />
      {online === null ? 'Checking…' : online ? 'API connected' : 'API unreachable'}
    </div>
  )
}
