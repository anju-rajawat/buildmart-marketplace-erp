import { Link } from 'react-router-dom'
import { Package, ChevronRight, ShieldCheck } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useCurrentUser } from '@/store/selectors'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge, Button, Card, EmptyState } from '@/components/ui'
import { ProductImage } from '@/components/ui/ProductImage'
import { orderStatusLabel, orderStatusTone } from '@/components/shared/status'

export default function Orders() {
  const user = useCurrentUser()
  const orders = useStore((s) =>
    s.orders.filter((o) => o.buyerId === user?.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  )

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<Package size={48} />}
        title="No orders yet"
        description="When you place an order it will appear here with live tracking."
        action={
          <Link to="/catalog">
            <Button>Browse materials</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">My orders</h1>
      <div className="space-y-4">
        {orders.map((o) => (
          <Card key={o.id} className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <p className="flex items-center gap-2 font-semibold">
                  {o.code}
                  {o.placedByAdminId && (
                    <Badge tone="purple">
                      <ShieldCheck size={11} /> Placed by admin
                    </Badge>
                  )}
                </p>
                <p className="text-xs text-slate-400">Ordered {formatDate(o.createdAt)}</p>
              </div>
              <Badge tone={orderStatusTone[o.status]}>{orderStatusLabel[o.status]}</Badge>
            </div>

            <div className="flex flex-wrap items-center gap-4 py-3">
              <div className="flex -space-x-3">
                {o.items.slice(0, 4).map((it) => (
                  <ProductImage
                    key={it.productId}
                    src={it.image}
                    alt={it.name}
                    className="h-12 w-12 rounded-xl border-2 border-white dark:border-slate-900"
                  />
                ))}
                {o.items.length > 4 && (
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-white bg-slate-100 text-xs font-semibold dark:border-slate-900 dark:bg-slate-800">
                    +{o.items.length - 4}
                  </span>
                )}
              </div>
              <div className="text-sm text-slate-500">
                {o.items.length} item{o.items.length > 1 ? 's' : ''} ·{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatCurrency(o.total)}
                </span>
              </div>
              <Link to={`/orders/${o.id}`} className="ml-auto">
                <Button variant="outline" size="sm">
                  Track order <ChevronRight size={15} />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
