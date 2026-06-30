import { forwardRef } from 'react'
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'

// ---------------------------------------------------------------- Button
type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg' | 'icon'

const variants: Record<Variant, string> = {
  primary:
    'bg-brand-500 text-white hover:bg-brand-600 shadow-sm shadow-brand-500/20',
  secondary:
    'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white',
  outline:
    'border border-slate-300 bg-transparent hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800',
  ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800',
  danger: 'bg-red-500 text-white hover:bg-red-600',
}
const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'h-10 w-10',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'focus-ring inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
)
Button.displayName = 'Button'

// ---------------------------------------------------------------- Card
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('card', className)} {...props} />
}

// ---------------------------------------------------------------- Badge
type Tone = 'gray' | 'amber' | 'green' | 'red' | 'blue' | 'purple'
const tones: Record<Tone, string> = {
  gray: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  amber: 'bg-brand-100 text-brand-800 dark:bg-brand-500/15 dark:text-brand-300',
  green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  red: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
}
export function Badge({
  tone = 'gray',
  className,
  children,
}: {
  tone?: Tone
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

// ---------------------------------------------------------------- Input
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'focus-ring h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'focus-ring w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
        className,
      )}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'focus-ring h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
)
Select.displayName = 'Select'

// ---------------------------------------------------------------- Rating
export function Rating({ value, count, size = 14 }: { value: number; count?: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <span className="inline-flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={cn(
              i <= Math.round(value)
                ? 'fill-brand-500 text-brand-500'
                : 'fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700',
            )}
          />
        ))}
      </span>
      <span className="font-medium text-slate-700 dark:text-slate-300">{value.toFixed(1)}</span>
      {count !== undefined && <span className="text-slate-400">({count})</span>}
    </span>
  )
}

// ---------------------------------------------------------------- Skeleton
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />
}

// ---------------------------------------------------------------- Empty state
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center dark:border-slate-700">
      {icon && <div className="mb-4 text-slate-400">{icon}</div>}
      <h3 className="text-base font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

// ---------------------------------------------------------------- Stat tile
export function Stat({
  label,
  value,
  delta,
  icon,
  tone = 'amber',
}: {
  label: string
  value: string
  delta?: string
  icon?: ReactNode
  tone?: Tone
}) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
          {delta && <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">{delta}</p>}
        </div>
        {icon && (
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
              tones[tone],
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
