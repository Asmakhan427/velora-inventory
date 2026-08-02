import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp, ArrowDown, ChevronsUpDown, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { TableSkeleton } from './Skeleton'

export interface TableColumn<T> {
  key: string
  header: string
  sortable?: boolean
  align?: 'left' | 'right' | 'center'
  render: (row: T) => ReactNode
  className?: string
}

interface TableProps<T> {
  columns: TableColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string | number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  onSort?: (key: string) => void
  loading?: boolean
  emptyTitle?: string
  emptyMessage?: string
  emptyAction?: ReactNode
  footer?: ReactNode
}

export function Table<T>({
  columns,
  rows,
  rowKey,
  sortBy,
  sortDir,
  onSort,
  loading,
  emptyTitle = 'Nothing here yet',
  emptyMessage = 'No records match your current view.',
  emptyAction,
  footer,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="glass-card overflow-hidden p-0">
        <TableSkeleton cols={columns.length} />
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-white/5 text-text-muted">
          <Inbox className="size-6" />
        </div>
        <div>
          <p className="font-medium text-text">{emptyTitle}</p>
          <p className="mt-1 text-sm text-text-muted">{emptyMessage}</p>
        </div>
        {emptyAction}
      </div>
    )
  }

  return (
    <div className="glass-card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-surface-2/95 backdrop-blur-md">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && onSort?.(col.key)}
                  className={cn(
                    'border-b border-border px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-text-muted whitespace-nowrap',
                    col.sortable && 'cursor-pointer select-none hover:text-text-secondary',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                  )}
                >
                  <span className={cn('inline-flex items-center gap-1.5', col.align === 'right' && 'flex-row-reverse')}>
                    {col.header}
                    {col.sortable && <SortIcon active={sortBy === col.key} dir={sortDir} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {rows.map((row, i) => (
                <motion.tr
                  key={rowKey(row)}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn('border-b border-border/70 last:border-0 transition-colors duration-150 hover:bg-white/[0.04]', i % 2 === 1 && 'bg-white/[0.015]')}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-4 py-3.5 text-text-secondary', col.align === 'right' && 'text-right', col.align === 'center' && 'text-center', col.className)}>
                      {col.render(row)}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      {footer}
    </div>
  )
}

function SortIcon({ active, dir }: { active: boolean; dir?: 'asc' | 'desc' }) {
  if (!active) return <ChevronsUpDown className="size-3.5 opacity-50" />
  return dir === 'asc' ? <ArrowUp className="size-3.5 text-accent" /> : <ArrowDown className="size-3.5 text-accent" />
}
