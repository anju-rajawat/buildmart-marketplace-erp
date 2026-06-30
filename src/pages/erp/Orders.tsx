import { useMemo, useState } from 'react'
import { Plus, ChevronRight, ArrowUpCircle, ShieldCheck, Search, Trash2 } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useCurrentUser } from '@/store/selectors'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge, Button, Card, EmptyState, Input, Select } from '@/components/ui'
import { Modal } from '@/components/ui/Modal'
import { OrderTracker } from '@/components/shared/OrderTracker'
import { orderStatusLabel, orderStatusTone } from '@/components/shared/status'
import { ORDER_FLOW } from '@/types'
import type { OrderItem, OrderStatus, PaymentMethod } from '@/types'
import { toast } from '@/components/ui/toast'

export default function ErpOrders() {
  const user = useCurrentUser()
  const isAdmin = useStore((s) => s.activeRole === 'admin')
  const allOrders = useStore((s) => s.orders)
  const products = useStore((s) => s.products)
  const users = useStore((s) => s.users)
  const advance = useStore((s) => s.advanceOrderStatus)
  const setStatus = useStore((s) => s.setOrderStatus)
  const placeOrder = useStore((s) => s.placeOrder)

  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
  const [query, setQuery] = useState('')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const orders = useMemo(() => {
    let list = isAdmin
      ? allOrders
      : allOrders.filter((o) => o.items.some((i) => i.sellerProfileId === user?.sellerProfileId))
    if (filter !== 'all') list = list.filter((o) => o.status === filter)
    if (query)
      list = list.filter(
        (o) =>
          o.code.toLowerCase().includes(query.toLowerCase()) ||
          users.find((u) => u.id === o.buyerId)?.name.toLowerCase().includes(query.toLowerCase()),
      )
    return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [isAdmin, allOrders, filter, query, user?.sellerProfileId, users])

  const detail = allOrders.find((o) => o.id === detailId)
  const buyerName = (id: string) => users.find((u) => u.id === id)?.name ?? 'Unknown'

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-slate-500">{orders.length} orders</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={16} /> Place order for customer
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input className="pl-9" placeholder="Search order / customer…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={filter} onChange={(e) => setFilter(e.target.value as OrderStatus | 'all')} className="w-44">
          <option value="all">All statuses</option>
          {ORDER_FLOW.map((s) => (
            <option key={s} value={s}>{orderStatusLabel[s]}</option>
          ))}
          <option value="cancelled">Cancelled</option>
        </Select>
      </div>

      {orders.length === 0 ? (
        <EmptyState title="No orders match" />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {orders.map((o) => {
                const canAdvance =
                  o.status !== 'cancelled' && ORDER_FLOW.indexOf(o.status) < ORDER_FLOW.length - 1
                return (
                  <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <p className="flex items-center gap-1.5 font-semibold">
                        {o.code}
                        {o.placedByAdminId && <ShieldCheck size={13} className="text-purple-500" />}
                      </p>
                      <p className="text-xs text-slate-400">{o.items.length} items</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{buyerName(o.buyerId)}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(o.createdAt)}</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(o.total)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={orderStatusTone[o.status]}>{orderStatusLabel[o.status]}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {canAdvance && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              advance(o.id)
                              toast.success(`${o.code} advanced`)
                            }}
                          >
                            <ArrowUpCircle size={14} /> Advance
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => setDetailId(o.id)}>
                          View <ChevronRight size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}

      {/* Detail modal */}
      <Modal open={!!detail} onClose={() => setDetailId(null)} title={detail?.code} className="sm:max-w-2xl">
        {detail && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={orderStatusTone[detail.status]}>{orderStatusLabel[detail.status]}</Badge>
              <span className="text-sm text-slate-500">
                {buyerName(detail.buyerId)} · {formatCurrency(detail.total)}
              </span>
              {detail.placedByAdminId && <Badge tone="purple">Placed by admin</Badge>}
            </div>

            {/* status setter */}
            {detail.status !== 'cancelled' && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">Set status:</span>
                {ORDER_FLOW.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setStatus(detail.id, s)
                      toast.success(`Status set to ${orderStatusLabel[s]}`)
                    }}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${
                      detail.status === s
                        ? 'border-brand-500 bg-brand-500 text-white'
                        : 'border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'
                    }`}
                  >
                    {orderStatusLabel[s]}
                  </button>
                ))}
              </div>
            )}

            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <OrderTracker order={detail} />
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold">Items</h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {detail.items.map((it) => (
                  <div key={it.productId} className="flex items-center justify-between py-2 text-sm">
                    <span>{it.quantity} {it.unit} × {it.name}</span>
                    <span className="font-medium">{formatCurrency(it.price * it.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Place order on behalf modal */}
      {isAdmin && (
        <PlaceForCustomerModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onPlace={(buyerId, items, method) => {
            const buyer = users.find((u) => u.id === buyerId)
            const addr = buyer?.addresses.find((a) => a.isDefault) ?? buyer?.addresses[0]
            const order = placeOrder({
              buyerId,
              addressId: addr?.id ?? '',
              method,
              items,
              placedByAdminId: user?.id,
            })
            toast.success(`${order.code} placed for ${buyer?.name}`)
            setCreateOpen(false)
          }}
        />
      )}
    </div>
  )
}

function PlaceForCustomerModal({
  open,
  onClose,
  onPlace,
}: {
  open: boolean
  onClose: () => void
  onPlace: (buyerId: string, items: OrderItem[], method: PaymentMethod) => void
}) {
  const users = useStore((s) => s.users)
  const products = useStore((s) => s.products)
  const buyers = users.filter((u) => u.roles.includes('buyer'))

  const [buyerId, setBuyerId] = useState(buyers[0]?.id ?? '')
  const [method, setMethod] = useState<PaymentMethod>('credit')
  const [picked, setPicked] = useState<Record<string, number>>({})
  const [search, setSearch] = useState('')

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())).slice(0, 8)
  const items: OrderItem[] = Object.entries(picked)
    .filter(([, q]) => q > 0)
    .map(([pid, q]) => {
      const p = products.find((x) => x.id === pid)!
      return {
        productId: p.id,
        name: p.name,
        brand: p.brand,
        unit: p.unit,
        price: p.price,
        quantity: q,
        image: p.images[0],
        sellerProfileId: p.sellerProfileId,
      }
    })
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <Modal open={open} onClose={onClose} title="Place order for a customer" className="sm:max-w-2xl">
      <div className="space-y-4">
        <div className="rounded-xl bg-purple-50 px-3 py-2 text-xs text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
          <ShieldCheck size={13} className="mr-1 inline" />
          This order will be recorded as placed by you (admin) on the customer's behalf.
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Customer</label>
            <Select value={buyerId} onChange={(e) => setBuyerId(e.target.value)}>
              {buyers.map((b) => (
                <option key={b.id} value={b.id}>{b.name} ({b.email})</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Payment</label>
            <Select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
              <option value="credit">Credit (30 days)</option>
              <option value="cod">Cash on Delivery</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
            </Select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Add products</label>
          <Input placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
            {filtered.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <span className="min-w-0 flex-1 truncate">{p.name} · {formatCurrency(p.price)}</span>
                <input
                  type="number"
                  min={0}
                  value={picked[p.id] ?? 0}
                  onChange={(e) => setPicked({ ...picked, [p.id]: Number(e.target.value) })}
                  className="h-8 w-20 rounded-lg border border-slate-300 px-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
            ))}
          </div>
        </div>

        {items.length > 0 && (
          <div className="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800">
            <div className="mb-2 flex items-center justify-between font-semibold">
              <span>{items.length} item(s)</span>
              <span>{formatCurrency(total)}</span>
            </div>
            {items.map((i) => (
              <div key={i.productId} className="flex items-center justify-between text-xs text-slate-500">
                <span>{i.quantity} {i.unit} × {i.name}</span>
                <button onClick={() => setPicked({ ...picked, [i.productId]: 0 })} aria-label="Remove">
                  <Trash2 size={13} className="text-red-400" />
                </button>
              </div>
            ))}
          </div>
        )}

        <Button
          className="w-full"
          disabled={!buyerId || items.length === 0}
          onClick={() => onPlace(buyerId, items, method)}
        >
          Place order {items.length > 0 && `· ${formatCurrency(total)}`}
        </Button>
      </div>
    </Modal>
  )
}
