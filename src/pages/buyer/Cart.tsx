import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingCart, Tag, ArrowRight } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { formatCurrency } from '@/lib/utils'
import { Button, Card, EmptyState, Input } from '@/components/ui'
import { ProductImage } from '@/components/ui/ProductImage'
import { toast } from '@/components/ui/toast'

export default function Cart() {
  const navigate = useNavigate()
  const cart = useStore((s) => s.cart)
  const products = useStore((s) => s.products)
  const updateQty = useStore((s) => s.updateCartQty)
  const removeFromCart = useStore((s) => s.removeFromCart)
  const applyCoupon = useStore((s) => s.applyCoupon)
  const removeCoupon = useStore((s) => s.removeCoupon)
  const appliedCoupon = useStore((s) => s.appliedCoupon)
  const totals = useStore((s) => s.cartTotals())
  const [code, setCode] = useState('')

  const lines = cart
    .map((c) => ({ item: c, product: products.find((p) => p.id === c.productId)! }))
    .filter((l) => l.product)

  if (lines.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingCart size={48} />}
        title="Your cart is empty"
        description="Browse the catalog and add construction materials to your cart."
        action={<Button onClick={() => navigate('/catalog')}>Start shopping</Button>}
      />
    )
  }

  function handleApply() {
    const res = applyCoupon(code)
    res.ok ? toast.success(res.message) : toast.error(res.message)
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Shopping cart ({lines.length})</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="space-y-3 lg:col-span-2">
          {lines.map(({ item, product }) => (
            <Card key={product.id} className="flex gap-4 p-3 sm:p-4">
              <Link to={`/product/${product.slug}`}>
                <ProductImage src={product.images[0]} alt={product.name} className="h-20 w-20 shrink-0 rounded-xl sm:h-24 sm:w-24" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase text-brand-600">{product.brand}</p>
                    <Link to={`/product/${product.slug}`} className="line-clamp-2 text-sm font-medium hover:text-brand-600">
                      {product.name}
                    </Link>
                  </div>
                  <button
                    onClick={() => {
                      removeFromCart(product.id)
                      toast.info('Removed from cart')
                    }}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                    aria-label="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center rounded-lg border border-slate-300 dark:border-slate-700">
                    <button onClick={() => updateQty(product.id, item.quantity - 1)} className="px-2 py-1.5" aria-label="Decrease">
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQty(product.id, item.quantity + 1)} className="px-2 py-1.5" aria-label="Increase">
                      <Plus size={14} />
                    </button>
                  </div>
                  <p className="text-base font-bold">{formatCurrency(product.price * item.quantity)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <div>
          <Card className="sticky top-20 p-5">
            <h2 className="mb-4 text-lg font-bold">Order summary</h2>

            {/* Coupon */}
            <div className="mb-4">
              {appliedCoupon ? (
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 text-sm dark:bg-emerald-500/10">
                  <span className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-300">
                    <Tag size={14} /> {appliedCoupon} applied
                  </span>
                  <button onClick={removeCoupon} className="text-xs font-medium text-red-500 hover:underline">
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input placeholder="Coupon code" value={code} onChange={(e) => setCode(e.target.value)} />
                  <Button variant="outline" onClick={handleApply}>Apply</Button>
                </div>
              )}
              <p className="mt-1.5 text-xs text-slate-400">Try FIRST10, BUILD500 or TILE5</p>
            </div>

            <dl className="space-y-2 border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
              <Row label="Subtotal" value={formatCurrency(totals.subtotal)} />
              {totals.discount > 0 && (
                <Row label="Discount" value={`− ${formatCurrency(totals.discount)}`} tone="green" />
              )}
              <Row label="GST (18%)" value={formatCurrency(totals.gst)} />
              <Row label="Shipping" value={totals.shipping === 0 ? 'FREE' : formatCurrency(totals.shipping)} />
              <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-bold dark:border-slate-800">
                <span>Total</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>
            </dl>

            <Button className="mt-5 w-full" size="lg" onClick={() => navigate('/checkout')}>
              Proceed to checkout <ArrowRight size={16} />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, tone }: { label: string; value: string; tone?: 'green' }) {
  return (
    <div className="flex justify-between">
      <dt className="text-slate-500">{label}</dt>
      <dd className={tone === 'green' ? 'font-medium text-emerald-600' : 'font-medium'}>{value}</dd>
    </div>
  )
}
