import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Receipt, CalendarClock, ShieldCheck, XCircle } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { formatCurrency, formatDate, humanize } from '@/lib/utils'
import { Badge, Button, Card, EmptyState } from '@/components/ui'
import { ProductImage } from '@/components/ui/ProductImage'
import { OrderTracker } from '@/components/shared/OrderTracker'
import { orderStatusLabel, orderStatusTone, paymentTone } from '@/components/shared/status'
import { toast } from '@/components/ui/toast'

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const order = useStore((s) => s.orders.find((o) => o.id === id))
  const cancelOrder = useStore((s) => s.cancelOrder)

  if (!order) {
    return <EmptyState title="Order not found" action={<Button onClick={() => navigate('/orders')}>Back to orders</Button>} />
  }

  const canCancel = order.status === 'placed' || order.status === 'confirmed'

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            {order.code}
            <Badge tone={orderStatusTone[order.status]}>{orderStatusLabel[order.status]}</Badge>
          </h1>
          <p className="text-sm text-slate-400">Placed {formatDate(order.createdAt, true)}</p>
        </div>
        {order.placedByAdminId && (
          <Badge tone="purple">
            <ShieldCheck size={12} /> Placed on your behalf by admin
          </Badge>
        )}
      </div>

      {/* Tracker */}
      <Card className="p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold">Order tracking</h2>
          <span className="flex items-center gap-1.5 text-sm text-slate-500">
            <CalendarClock size={15} /> Expected by {formatDate(order.expectedDelivery)}
          </span>
        </div>
        <OrderTracker order={order} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold">Items</h2>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {order.items.map((it) => (
              <div key={it.productId} className="flex items-center gap-3 py-3">
                <ProductImage src={it.image} alt={it.name} className="h-14 w-14 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{it.name}</p>
                  <p className="text-xs text-slate-400">
                    {it.brand} · {it.quantity} {it.unit} × {formatCurrency(it.price)}
                  </p>
                </div>
                <p className="text-sm font-semibold">{formatCurrency(it.price * it.quantity)}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Summary + address */}
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
              <Receipt size={18} className="text-brand-500" /> Payment
            </h2>
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-slate-500">{humanize(order.payment.method)}</span>
              <Badge tone={paymentTone[order.payment.status]}>{humanize(order.payment.status)}</Badge>
            </div>
            <dl className="space-y-1.5 border-t border-slate-100 pt-3 text-sm dark:border-slate-800">
              <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd>{formatCurrency(order.subtotal)}</dd></div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600"><dt>Discount {order.couponCode ? `(${order.couponCode})` : ''}</dt><dd>− {formatCurrency(order.discount)}</dd></div>
              )}
              <div className="flex justify-between"><dt className="text-slate-500">GST</dt><dd>{formatCurrency(order.gst)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Shipping</dt><dd>{order.shipping === 0 ? 'FREE' : formatCurrency(order.shipping)}</dd></div>
              <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-bold dark:border-slate-800"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
            </dl>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
              <MapPin size={18} className="text-brand-500" /> Delivery
            </h2>
            <p className="text-sm font-semibold">{order.address.label}</p>
            <p className="text-sm text-slate-500">
              {order.address.line1}, {order.address.city}, {order.address.state} – {order.address.pincode}
            </p>
          </Card>

          {canCancel && (
            <Button
              variant="danger"
              className="w-full"
              onClick={() => {
                cancelOrder(order.id)
                toast.info('Order cancelled')
              }}
            >
              <XCircle size={16} /> Cancel order
            </Button>
          )}
          <Link to="/chat">
            <Button variant="outline" className="w-full">Need help? Chat with seller</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
