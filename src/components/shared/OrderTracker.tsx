import { Check, Package, ClipboardCheck, Box, Truck, MapPin, Home, XCircle } from 'lucide-react'
import type { Order, OrderStatus } from '@/types'
import { ORDER_FLOW } from '@/types'
import { cn, formatDate } from '@/lib/utils'
import { orderStatusLabel } from './status'

const stepIcon: Record<OrderStatus, typeof Package> = {
  placed: ClipboardCheck,
  confirmed: Check,
  packed: Box,
  shipped: Truck,
  out_for_delivery: MapPin,
  delivered: Home,
  cancelled: XCircle,
}

/** Horizontal (desktop) + vertical (mobile) order status stepper. */
export function OrderTracker({ order }: { order: Order }) {
  if (order.status === 'cancelled') {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-700 dark:bg-red-500/10 dark:text-red-300">
        <XCircle size={20} />
        <div>
          <p className="font-semibold">Order cancelled</p>
          <p className="text-sm opacity-80">
            This order was cancelled on {formatDate(order.tracking.at(-1)!.timestamp, true)}.
          </p>
        </div>
      </div>
    )
  }

  const currentIdx = ORDER_FLOW.indexOf(order.status)

  return (
    <div>
      {/* Horizontal — desktop */}
      <div className="hidden sm:flex">
        {ORDER_FLOW.map((status, i) => {
          const Icon = stepIcon[status]
          const done = i <= currentIdx
          const active = i === currentIdx
          return (
            <div key={status} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <div className={cn('h-1 flex-1 rounded-full', i === 0 ? 'opacity-0' : done ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700')} />
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                    done
                      ? 'border-brand-500 bg-brand-500 text-white'
                      : 'border-slate-300 bg-white text-slate-400 dark:border-slate-600 dark:bg-slate-900',
                    active && 'ring-4 ring-brand-500/20',
                  )}
                >
                  <Icon size={18} />
                </div>
                <div className={cn('h-1 flex-1 rounded-full', i === ORDER_FLOW.length - 1 ? 'opacity-0' : i < currentIdx ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700')} />
              </div>
              <span className={cn('mt-2 text-center text-xs font-medium', done ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400')}>
                {orderStatusLabel[status]}
              </span>
            </div>
          )
        })}
      </div>

      {/* Vertical timeline — mobile + event log */}
      <ol className="mt-2 space-y-0 sm:mt-6">
        {[...order.tracking].reverse().map((ev, i) => {
          const Icon = stepIcon[ev.status]
          return (
            <li key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className={cn('flex h-8 w-8 items-center justify-center rounded-full', i === 0 ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800')}>
                  <Icon size={15} />
                </span>
                {i < order.tracking.length - 1 && <span className="my-1 w-px flex-1 bg-slate-200 dark:bg-slate-700" />}
              </div>
              <div className="pb-4">
                <p className="text-sm font-semibold">{orderStatusLabel[ev.status]}</p>
                <p className="text-sm text-slate-500">{ev.note}</p>
                <p className="text-xs text-slate-400">
                  {ev.location ? `${ev.location} · ` : ''}
                  {formatDate(ev.timestamp, true)}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
