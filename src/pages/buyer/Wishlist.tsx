import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Button, EmptyState } from '@/components/ui'
import { ProductCard } from '@/components/shared/ProductCard'

export default function Wishlist() {
  const wishlist = useStore((s) => s.wishlist)
  const products = useStore((s) => s.products.filter((p) => s.wishlist.includes(p.id)))

  if (wishlist.length === 0) {
    return (
      <EmptyState
        icon={<Heart size={48} />}
        title="Your wishlist is empty"
        description="Tap the heart on any product to save it for later."
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
      <h1 className="mb-6 text-2xl font-bold">Wishlist ({products.length})</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}
