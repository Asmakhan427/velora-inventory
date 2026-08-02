import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { ConfirmDialog, type ConfirmOptions } from '@/components/ui/ConfirmDialog'

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn | null>(null)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ open: boolean; options: ConfirmOptions }>({
    open: false,
    options: { title: '', message: '' },
  })
  const resolver = useRef<(value: boolean) => void>(null)

  const confirm = useCallback<ConfirmFn>((options) => {
    setState({ open: true, options })
    return new Promise((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const handle = (result: boolean) => {
    setState((s) => ({ ...s, open: false }))
    resolver.current?.(result)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog open={state.open} {...state.options} onConfirm={() => handle(true)} onCancel={() => handle(false)} />
    </ConfirmContext.Provider>
  )
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider')
  return ctx
}
