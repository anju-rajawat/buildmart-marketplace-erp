import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, MapPin, CreditCard, Wallet, Banknote, Landmark } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useCurrentUser } from '@/store/selectors'
import { cn, formatCurrency } from '@/lib/utils'
import { Button, Card, EmptyState } from '@/components/ui'
import { ProductImage } from '@/components/ui/ProductImage'
import { toast } from '@/components/ui/toast'
import type { PaymentMethod } from '@/types'

const methods: { id: PaymentMethod; label: string; icon: typeof CreditCard }[] = [
  { id: 'upi', label: 'UPI', icon: Wallet },
  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
  { id: 'cod', label: 'Cash on Delivery', icon: Banknote },
  { id: 'credit', label: 'Credit (30 days)', icon: Landmark },
]

export default function Checkout() {
  const navigate = useNavigate()
  const user = useCurrentUser()
  const cart = useStore((s) => s.cart)
  const products = useStore((s) => s.products)
  const totals = useStore((s) => s.cartTotals())
  const placeOrder = useStore((s) => s.placeOrder)

  const [addressId, setAddressId] = useState(
    user?.addresses.find((a) => a.isDefault)?.id ?? user?.addresses[0]?.id ?? '',
  )
  const [method, setMethod] = useState<PaymentMethod>('upi')

  if (!user) return null
  if (cart.length === 0) {
    return <EmptyState title="Nothing to checkout" action={<Button onClick={() => navigate('/catalog')}>Shop now</Button>} />
  }

  const lines = cart
    .map((c) => ({ item: c, product: products.find((p) => p.id === c.productId)! }))
    .filter((l) => l.product)

  function confirm() {
    if (!addressId) {
      toast.error('Please select a delivery address')
      return
    }
    const order = placeOrder({ buyerId: user!.id, addressId, method })
    toast.success('Order placed successfully!')
    navigate(`/orders/${order.id}`)
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Checkout</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Address */}
          <Card className="p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <MapPin size={18} className="text-brand-500" /> Delivery address
            </h2>
            {user.addresses.length === 0 ? (
              <p className="text-sm text-slate-500">No saved addresses. Add one in your account.</p>
            ) : (
              <div className="space-y-3">
                {user.addresses.map((a) => (
                  <label
                    key={a.id}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors',
                      addressId === a.id
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                        : 'border-slate-200 dark:border-slate-800',
                    )}
                  >
                    <input
                      type="radio"
                      name="addr"
                      checked={addressId === a.id}
                      onChange={() => setAddressId(a.id)}
                      className="mt-1 accent-brand-500"
                    />
                    <div className="text-sm">
                      <p className="font-semibold">{a.label}</p>
                      <p className="text-slate-500">
                        {a.line1}, {a.city}, {a.state} – {a.pincode}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </Card>

          {/* Payment */}
          <Card className="p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <CreditCard size={18} className="text-brand-500" /> Payment method
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {methods.map((m) => {
                const Icon = m.icon
                return (
                  <label
                    key={m.id}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition-colors',
                      method === m.id
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                        : 'border-slate-200 dark:border-slate-800',
                    )}
                  >
                    <input
                      type="radio"
                      name="method"
                      checked={method === m.id}
                      onChange={() => setMethod(m.id)}
                      className="accent-brand-500"
                    />
                    <Icon size={18} className="text-slate-500" />
                    <span className="font-medium">{m.label}</span>
                  </label>
                )
              })}
            </div>
            <p className="mt-3 text-xs text-slate-400">
              This is a demo — no real payment is processed.
            </p>
          </Card>
        </div>

        {/* Summary */}
        <div>
          <Card className="sticky top-20 p-5">
            <h2 className="mb-4 text-lg font-bold">Your order</h2>
            <div className="mb-4 max-h-56 space-y-3 overflow-y-auto">
              {lines.map(({ item, product }) => (
                <div key={product.id} className="flex items-center gap-3">
                  <ProductImage src={product.images[0]} alt="" className="h-12 w-12 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-slate-400">
                      {item.quantity} × {formatCurrency(product.price)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">
                    {formatCurrency(product.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <dl className="space-y-2 border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
              <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd>{formatCurrency(totals.subtotal)}</dd></div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-emerald-600"><dt>Discount</dt><dd>− {formatCurrency(totals.discount)}</dd></div>
              )}
              <div className="flex justify-between"><dt className="text-slate-500">GST (18%)</dt><dd>{formatCurrency(totals.gst)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Shipping</dt><dd>{totals.shipping === 0 ? 'FREE' : formatCurrency(totals.shipping)}</dd></div>
              <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-bold dark:border-slate-800">
                <span>Total</span><span>{formatCurrency(totals.total)}</span>
              </div>
            </dl>
            <Button className="mt-5 w-full" size="lg" onClick={confirm}>
              <CheckCircle2 size={18} /> Place order
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
