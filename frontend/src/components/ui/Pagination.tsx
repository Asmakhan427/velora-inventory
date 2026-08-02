import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import type { Meta } from '@/lib/api/types'

interface PaginationProps {
  meta: Meta
  onPageChange: (page: number) => void
}

function buildPageList(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set<number>([1, total, current, current - 1, current + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const result: (number | 'ellipsis')[] = []
  let prev = 0
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push('ellipsis')
    result.push(p)
    prev = p
  }
  return result
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  const { page, totalPages, total, pageSize, hasNextPage, hasPrevPage } = meta
  if (total === 0) return null

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)
  const pages = buildPageList(page, totalPages)

  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-text-muted">
        Showing <span className="text-text-secondary">{start}–{end}</span> of <span className="text-text-secondary">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <NavButton disabled={!hasPrevPage} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
          <ChevronLeft className="size-4" />
        </NavButton>
        <AnimatePresence mode="popLayout" initial={false}>
          {pages.map((p, i) =>
            p === 'ellipsis' ? (
              <span key={`e-${i}`} className="px-1.5 text-text-muted">
                …
              </span>
            ) : (
              <motion.button
                key={p}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                onClick={() => onPageChange(p)}
                className={cn(
                  'relative flex size-8 items-center justify-center rounded-md text-xs font-medium transition-colors cursor-pointer',
                  p === page ? 'text-white' : 'text-text-secondary hover:bg-white/6',
                )}
              >
                {p === page && (
                  <motion.span
                    layoutId="pagination-active"
                    className="absolute inset-0 -z-10 rounded-md bg-primary"
                    transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                  />
                )}
                {p}
              </motion.button>
            ),
          )}
        </AnimatePresence>
        <NavButton disabled={!hasNextPage} onClick={() => onPageChange(page + 1)} aria-label="Next page">
          <ChevronRight className="size-4" />
        </NavButton>
      </div>
    </div>
  )
}

function NavButton({ disabled, onClick, children, ...props }: { disabled: boolean; onClick: () => void; children: React.ReactNode; [key: string]: unknown }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex size-8 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-white/6 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
      {...props}
    >
      {children}
    </button>
  )
}
