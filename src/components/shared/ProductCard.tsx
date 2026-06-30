import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Plus } from 'lucide-react'
import type { Product } from '@/types'
import { useStore } from '@/store/useStore'
import { cn, formatCurrency } from '@/lib/utils'
import { Badge, Rating } from '@/components/ui'
import { ProductImage } from '@/components/ui/ProductImage'
import { toast } from '@/components/ui/toast'

export function ProductCard({ product }: { product: Product }) {
  const addToCart = useStore((s) => s.addToCart)
  const toggleWishlist = useStore((s) => s.toggleWishlist)
  const wished = useStore((s) => s.wishlist.includes(product.id))
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100)
  const lowStock = product.stock > 0 && product.stock <= 15

  return (
    <div className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <Link to={`/product/${product.slug}`} className="relative block">
        <ProductImage
          src={product.images[0]}
          alt={product.name}
          className="aspect-[4/3] w-full transition-transform duration-300 group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="absolute left-2 top-2 rounded-md bg-brand-500 px-2 py-0.5 text-xs font-bold text-white">
            {discount}% OFF
          </span>
        )}
        <button
          onClick={(e) => {
            e.preventDefault()
            toggleWishlist(product.id)
            toast.info(wished ? 'Removed from wishlist' : 'Added to wishlist')
          }}
          className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-slate-600 shadow-sm backdrop-blur hover:text-red-500 dark:bg-slate-900/80"
          aria-label="Wishlist"
        >
          <Heart size={16} className={cn(wished && 'fill-red-500 text-red-500')} />
        </button>
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
            {product.brand}
          </span>
          {lowStock && <Badge tone="red">Only {product.stock} left</Badge>}
          {product.stock === 0 && <Badge tone="gray">Out of stock</Badge>}
        </div>
        <Link
          to={`/product/${product.slug}`}
          className="line-clamp-2 text-sm font-medium leading-snug hover:text-brand-600"
        >
          {product.name}
        </Link>
        <div className="mt-1">
          <Rating value={product.rating} count={product.ratingCount} size={12} />
        </div>

        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <p className="text-base font-bold">{formatCurrency(product.price)}</p>
            <p className="text-xs text-slate-400">
              <span className="line-through">{formatCurrency(product.mrp)}</span> / {product.unit}
            </p>
          </div>
          <button
            disabled={product.stock === 0}
            onClick={() => {
              addToCart(product.id)
              toast.success('Added to cart')
            }}
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white transition-colors hover:bg-brand-600 disabled:opacity-40"
            aria-label="Add to cart"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden p-3">
      <div className="skeleton mb-3 aspect-[4/3] w-full rounded-xl" />
      <div className="skeleton mb-2 h-3 w-1/3" />
      <div className="skeleton mb-2 h-4 w-full" />
      <div className="skeleton h-4 w-1/2" />
    </div>
  )
}
