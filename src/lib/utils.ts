import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes safely. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/** Format a number as Indian Rupees. */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

/** Compact number (e.g. 12.4k). */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(
    value,
  )
}

/** Format an ISO date string into a readable label. */
export function formatDate(iso: string, withTime = false): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  })
}

/** Relative time like "2h ago". */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(iso)
}

/** Generate a short pseudo-unique id (deterministic-friendly, no crypto needed). */
let _counter = 1000
export function uid(prefix = 'id'): string {
  _counter += 1
  return `${prefix}_${_counter.toString(36)}${(Date.now() % 100000).toString(36)}`
}

/** Clamp helper. */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max)
}

/** Title-case a slug or status. */
export function humanize(value: string): string {
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}
