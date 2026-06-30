import { Link } from 'react-router-dom'
import { ArrowRight, Truck, ShieldCheck, BadgePercent, Headset } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { ProductCard } from '@/components/shared/ProductCard'
import { DynamicIcon } from '@/components/shared/DynamicIcon'
import { HERO_IMAGE } from '@/lib/images'

export default function Home() {
  const categories = useStore((s) => s.categories)
  const products = useStore((s) => s.products)
  const featured = products.filter((p) => p.featured)
  const topRated = [...products].sort((a, b) => b.rating - a.rating).slice(0, 8)

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-12 text-white sm:px-12 sm:py-16">
        {/* real construction-site photo */}
        <img
          src={HERO_IMAGE}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-brand-900/40" />
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative max-w-xl">
          <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            India's construction supply hub
          </span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Cement to wiring — <span className="text-brand-400">delivered to site.</span>
          </h1>
          <p className="mt-3 text-sm text-slate-300 sm:text-base">
            Genuine brands, bulk pricing, GST invoices and live order tracking. Built for
            contractors, builders & homeowners.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/catalog"
              className="focus-ring inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold hover:bg-brand-600"
            >
              Shop materials <ArrowRight size={16} />
            </Link>
            <Link
              to="/quotations"
              className="focus-ring inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold hover:bg-white/10"
            >
              Request a quote
            </Link>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Truck, title: 'Site delivery', sub: 'Pan-India logistics' },
          { icon: ShieldCheck, title: 'Verified sellers', sub: 'BIS-certified brands' },
          { icon: BadgePercent, title: 'Bulk pricing', sub: 'Best rates on volume' },
          { icon: Headset, title: 'WhatsApp support', sub: 'Chat with sellers' },
        ].map((f) => {
          const Icon = f.icon
          return (
            <div key={f.title} className="card flex items-center gap-3 p-3 sm:p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                <Icon size={18} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{f.title}</p>
                <p className="truncate text-xs text-slate-400">{f.sub}</p>
              </div>
            </div>
          )
        })}
      </section>

      {/* Categories */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Shop by category</h2>
          <Link to="/catalog" className="text-sm font-medium text-brand-600 hover:underline">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/catalog?category=${c.slug}`}
              className="card flex flex-col items-center gap-2 p-4 text-center transition-colors hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/5"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-brand-600 dark:bg-slate-800 dark:text-brand-400">
                <DynamicIcon name={c.icon} size={22} />
              </span>
              <span className="text-xs font-semibold">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Featured materials</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Top rated */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Top rated</h2>
          <Link to="/catalog" className="text-sm font-medium text-brand-600 hover:underline">
            See more
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {topRated.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  )
}
