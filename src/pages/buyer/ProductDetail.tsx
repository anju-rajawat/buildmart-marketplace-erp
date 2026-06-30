import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  Truck,
  ShieldCheck,
  MessageCircle,
  FileText,
  Star,
  ChevronRight,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useCurrentUser } from '@/store/selectors'
import { whatsapp } from '@/lib/whatsapp'
import { cn, formatCurrency } from '@/lib/utils'
import { Badge, Button, Card, EmptyState, Rating, Textarea } from '@/components/ui'
import { ProductImage } from '@/components/ui/ProductImage'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/toast'
import { ProductCard } from '@/components/shared/ProductCard'

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const user = useCurrentUser()
  const product = useStore((s) => s.products.find((p) => p.slug === slug))
  const products = useStore((s) => s.products)
  const sellerProfiles = useStore((s) => s.sellerProfiles)
  const users = useStore((s) => s.users)
  const reviews = useStore((s) => s.reviews.filter((r) => r.productId === product?.id))
  const addToCart = useStore((s) => s.addToCart)
  const toggleWishlist = useStore((s) => s.toggleWishlist)
  const wished = useStore((s) => (product ? s.wishlist.includes(product.id) : false))
  const addReview = useStore((s) => s.addReview)
  const createQuotation = useStore((s) => s.createQuotation)
  const startThread = useStore((s) => s.startThread)
  const sendMessage = useStore((s) => s.sendMessage)

  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [rfqOpen, setRfqOpen] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' })
  const [rfqForm, setRfqForm] = useState({ quantity: 10, note: '' })

  if (!product) {
    return (
      <EmptyState
        title="Product not found"
        action={<Button onClick={() => navigate('/catalog')}>Back to catalog</Button>}
      />
    )
  }

  const seller = sellerProfiles.find((s) => s.id === product.sellerProfileId)
  const sellerUser = users.find((u) => u.id === seller?.userId)
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100)
  const related = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4)

  function submitReview() {
    if (!user) return
    addReview({
      productId: product!.id,
      userId: user.id,
      userName: user.name,
      rating: reviewForm.rating,
      title: reviewForm.title || 'Review',
      body: reviewForm.body,
    })
    setReviewOpen(false)
    setReviewForm({ rating: 5, title: '', body: '' })
    toast.success('Review submitted')
  }

  function submitRfq() {
    if (!user || !seller) return
    createQuotation({
      buyerId: user.id,
      sellerProfileId: seller.id,
      items: [
        { productId: product!.id, name: product!.name, quantity: rfqForm.quantity, unit: product!.unit },
      ],
      note: rfqForm.note,
    })
    setRfqOpen(false)
    toast.success('Quotation request sent')
    navigate('/quotations')
  }

  function chatOnWhatsApp() {
    if (!sellerUser) return
    const text = `Hi, I'm interested in ${product!.name} (${formatCurrency(product!.price)}/${product!.unit}). Is it available?`
    // Open the real WhatsApp deep link
    window.open(whatsapp.deepLink(sellerUser.phone, text), '_blank')
    // Also record it as an in-app/WhatsApp thread
    if (user) {
      const tid = startThread({
        participantIds: [user.id, sellerUser.id],
        subject: product!.name,
        whatsappPhone: sellerUser.phone,
      })
      sendMessage(tid, user.id, text)
      toast.success('Opened WhatsApp & saved to your chats')
    }
  }

  return (
    <div className="space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-slate-500">
        <Link to="/" className="hover:text-brand-600">Home</Link>
        <ChevronRight size={14} />
        <Link to="/catalog" className="hover:text-brand-600">Catalog</Link>
        <ChevronRight size={14} />
        <span className="truncate text-slate-700 dark:text-slate-300">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <Card className="overflow-hidden">
            <ProductImage
              src={product.images[activeImg]}
              alt={product.name}
              className="aspect-[4/3] w-full"
            />
          </Card>
          <div className="mt-3 flex gap-3">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={cn(
                  'overflow-hidden rounded-xl border-2',
                  i === activeImg ? 'border-brand-500' : 'border-transparent',
                )}
              >
                <ProductImage src={img} alt="" className="h-16 w-20" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="amber">{product.brand}</Badge>
            {product.stock > 0 ? (
              <Badge tone="green">In stock</Badge>
            ) : (
              <Badge tone="red">Out of stock</Badge>
            )}
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{product.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <Rating value={product.rating} count={product.ratingCount} />
          </div>

          <div className="mt-4 flex items-end gap-3">
            <span className="text-3xl font-extrabold">{formatCurrency(product.price)}</span>
            <span className="text-lg text-slate-400 line-through">{formatCurrency(product.mrp)}</span>
            <span className="pb-1 text-sm font-semibold text-emerald-600">{discount}% off</span>
            <span className="pb-1 text-sm text-slate-500">/ {product.unit}</span>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {product.description}
          </p>

          {/* Seller */}
          {seller && (
            <Link
              to="#"
              className="mt-5 flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800"
            >
              <img src={seller.logo} alt="" className="h-10 w-10 rounded-full object-cover" />
              <div className="flex-1">
                <p className="flex items-center gap-1 text-sm font-semibold">
                  {seller.businessName}
                  {seller.verified && <ShieldCheck size={14} className="text-emerald-500" />}
                </p>
                <p className="text-xs text-slate-500">
                  {seller.city}, {seller.state} · ⭐ {seller.rating}
                </p>
              </div>
            </Link>
          )}

          {/* Quantity + actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3 py-2.5 hover:text-brand-600"
                aria-label="Decrease"
              >
                <Minus size={16} />
              </button>
              <span className="w-10 text-center text-sm font-semibold">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="px-3 py-2.5 hover:text-brand-600"
                aria-label="Increase"
              >
                <Plus size={16} />
              </button>
            </div>
            <Button
              size="lg"
              disabled={product.stock === 0}
              onClick={() => {
                addToCart(product.id, qty)
                toast.success(`${qty} × added to cart`)
              }}
            >
              <ShoppingCart size={18} /> Add to cart
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                addToCart(product.id, qty)
                navigate('/cart')
              }}
            >
              Buy now
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12"
              onClick={() => toggleWishlist(product.id)}
              aria-label="Wishlist"
            >
              <Heart size={18} className={cn(wished && 'fill-red-500 text-red-500')} />
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap gap-3">
            <Button variant="outline" onClick={chatOnWhatsApp}>
              <MessageCircle size={16} className="text-green-500" /> Chat on WhatsApp
            </Button>
            <Button variant="outline" onClick={() => setRfqOpen(true)}>
              <FileText size={16} /> Request bulk quote
            </Button>
          </div>

          {/* delivery */}
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/60">
            <Truck size={16} className="text-brand-500" />
            <span>Free delivery on orders above {formatCurrency(50000)} · GST invoice included</span>
          </div>
        </div>
      </div>

      {/* Specs */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 text-lg font-bold">Specifications</h2>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            {Object.entries(product.specs).map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-slate-100 py-2 text-sm dark:border-slate-800">
                <dt className="text-slate-500">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>

        {/* Reviews */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Reviews ({reviews.length})</h2>
            <Button size="sm" variant="outline" onClick={() => setReviewOpen(true)}>
              Write a review
            </Button>
          </div>
          {reviews.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">No reviews yet. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="border-b border-slate-100 pb-3 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{r.userName}</span>
                    <Rating value={r.rating} size={12} />
                  </div>
                  <p className="mt-1 text-sm font-medium">{r.title}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{r.body}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold">Related materials</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Review modal */}
      <Modal open={reviewOpen} onClose={() => setReviewOpen(false)} title="Write a review">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium">Your rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button key={i} onClick={() => setReviewForm((f) => ({ ...f, rating: i }))}>
                  <Star
                    size={28}
                    className={cn(
                      i <= reviewForm.rating
                        ? 'fill-brand-500 text-brand-500'
                        : 'fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700',
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
          <input
            placeholder="Review title"
            value={reviewForm.title}
            onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
            className="focus-ring h-10 w-full rounded-xl border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
          <Textarea
            rows={4}
            placeholder="Share your experience…"
            value={reviewForm.body}
            onChange={(e) => setReviewForm((f) => ({ ...f, body: e.target.value }))}
          />
          <Button className="w-full" onClick={submitReview}>Submit review</Button>
        </div>
      </Modal>

      {/* RFQ modal */}
      <Modal open={rfqOpen} onClose={() => setRfqOpen(false)} title="Request bulk quotation">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Get a custom price for <span className="font-medium">{product.name}</span> from{' '}
            {seller?.businessName}.
          </p>
          <div>
            <label className="mb-1 block text-sm font-medium">Quantity ({product.unit})</label>
            <input
              type="number"
              min={1}
              value={rfqForm.quantity}
              onChange={(e) => setRfqForm((f) => ({ ...f, quantity: Number(e.target.value) }))}
              className="focus-ring h-10 w-full rounded-xl border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          <Textarea
            rows={3}
            placeholder="Any specific requirements, delivery location, timeline…"
            value={rfqForm.note}
            onChange={(e) => setRfqForm((f) => ({ ...f, note: e.target.value }))}
          />
          <Button className="w-full" onClick={submitRfq}>Send request</Button>
        </div>
      </Modal>
    </div>
  )
}
