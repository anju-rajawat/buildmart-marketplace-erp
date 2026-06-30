import { useMemo } from 'react'
import { Truck, ArrowUpCircle, CalendarClock } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge, Button, Card, EmptyState, Stat } from '@/components/ui'
import { OrderTracker } from '@/components/shared/OrderTracker'
import { orderStatusLabel, orderStatusTone } from '@/components/shared/status'
import { ORDER_FLOW } from '@/types'
import { toast } from '@/components/ui/toast'

const ACTIVE = ['confirmed', 'packed', 'shipped', 'out_for_delivery'] as const

export default function DeliveryTracking() {
  const orders = useStore((s) => s.orders)
  const users = useStore((s) => s.users)
  const advance = useStore((s) => s.advanceOrderStatus)

  const active = useMemo(
    () => orders.filter((o) => (ACTIVE as readonly string[]).includes(o.status)).sort((a, b) => a.expectedDelivery.localeCompare(b.expectedDelivery)),
    [orders],
  )
  const buyerName = (id: string) => users.find((u) => u.id === id)?.name ?? '—'

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Delivery Tracking</h1>
        <p className="text-sm text-slate-500">Shipments in progress</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="In transit" value={String(orders.filter((o) => o.status === 'shipped').length)} icon={<Truck size={18} />} />
        <Stat label="Out for delivery" value={String(orders.filter((o) => o.status === 'out_for_delivery').length)} icon={<Truck size={18} />} tone="amber" />
        <Stat label="Delivered" value={String(orders.filter((o) => o.status === 'delivered').length)} icon={<Truck size={18} />} tone="green" />
      </div>

      {active.length === 0 ? (
        <EmptyState icon={<Truck size={40} />} title="No active deliveries" />
      ) : (
        <div className="space-y-4">
          {active.map((o) => {
            const canAdvance = ORDER_FLOW.indexOf(o.status) < ORDER_FLOW.length - 1
            return (
              <Card key={o.id} className="p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="flex items-center gap-2 font-semibold">{o.code}<Badge tone={orderStatusTone[o.status]}>{orderStatusLabel[o.status]}</Badge></p>
                    <p className="text-xs text-slate-400">{buyerName(o.buyerId)} · {o.items.length} items · {formatCurrency(o.total)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-sm text-slate-500"><CalendarClock size={14} /> {formatDate(o.expectedDelivery)}</span>
                    {canAdvance && (
                      <Button size="sm" onClick={() => { advance(o.id); toast.success(`${o.code} advanced`) }}>
                        <ArrowUpCircle size={14} /> Advance
                      </Button>
                    )}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <OrderTracker order={o} />
                </div>
                <p className="mt-3 text-sm text-slate-500">
                  📍 {o.address.line1}, {o.address.city}, {o.address.state} – {o.address.pincode}
                </p>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
