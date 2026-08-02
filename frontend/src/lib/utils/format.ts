export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

/** Backend stores timestamps as SQLite `YYYY-MM-DD HH:MM:SS` text (UTC, no `T`/`Z`). */
export function parseSqliteDate(value: string): Date {
  return new Date(`${value.replace(' ', 'T')}Z`)
}

export function formatDate(value: string): string {
  const date = parseSqliteDate(value)
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export function formatDateShort(value: string): string {
  const date = parseSqliteDate(value)
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date)
}
