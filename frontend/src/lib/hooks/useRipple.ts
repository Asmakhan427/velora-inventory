import { useState, useCallback, type MouseEvent } from 'react'

interface Ripple {
  id: number
  x: number
  y: number
  size: number
}

let rippleId = 0

export function useRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([])

  const addRipple = useCallback((event: MouseEvent<HTMLElement>) => {
    const target = event.currentTarget
    const rect = target.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 2
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2
    const id = rippleId++
    setRipples((prev) => [...prev, { id, x, y, size }])
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id))
    }, 650)
  }, [])

  return { ripples, addRipple }
}
