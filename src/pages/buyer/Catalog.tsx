import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, Search } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { ProductCard } from '@/components/shared/ProductCard'
import { Button, EmptyState, Select } from '@/components/ui'
import { cn } from '@/lib/utils'

type SortKey = 'relevance' | 'price_asc' | 'price_desc' | 'rating'

export default function Catalog() {
  const [params, setParams] = useSearchParams()
  const products = useStore((s) => s.products)
  const categories = useStore((s) => s.categories)

  const q = params.get('q') ?? ''
  const categorySlug = params.get('category') ?? ''
  const [sort, setSort] = useState<SortKey>('relevance')
  const [maxPrice, setMaxPrice] = useState<number>(100000)
  const [brands, setBrands] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const allBrands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand))).sort(),
    [products],
  )

  const filtered = useMemo(() => {
    let list = products
    if (categorySlug) {
      const cat = categories.find((c) => c.slug === categorySlug)
      if (cat) list = list.filter((p) => p.categoryId === cat.id)
    }
    if (q) {
      const term = q.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.brand.toLowerCase().includes(term) ||
          p.tags.some((t) => t.includes(term)),
      )
    }
    if (brands.length) list = list.filter((p) => brands.includes(p.brand))
    list = list.filter((p) => p.price <= maxPrice)

    switch (sort) {
      case 'price_asc':
        list = [...list].sort((a, b) => a.price - b.price)
        break
      case 'price_desc':
        list = [...list].sort((a, b) => b.price - a.price)
        break
      case 'rating':
        list = [...list].sort((a, b) => b.rating - a.rating)
        break
    }
    return list
  }, [products, categories, q, categorySlug, brands, maxPrice, sort])

  function setCategory(slug: string) {
    const next = new URLSearchParams(params)
    if (slug) next.set('category', slug)
    else next.delete('category')
    setParams(next)
  }

  function toggleBrand(b: string) {
    setBrands((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]))
  }

  const filterPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-semibold">Category</h3>
        <div className="flex flex-wrap gap-2 md:flex-col">
          <button
            onClick={() => setCategory('')}
            className={cn(
              'rounded-lg px-3 py-1.5 text-left text-sm',
              !categorySlug
                ? 'bg-brand-50 font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800',
            )}
          >
            All categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.slug)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-left text-sm',
                categorySlug === c.slug
                  ? 'bg-brand-50 font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800',
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Max price: ₹{maxPrice.toLocaleString('en-IN')}</h3>
        <input
          type="range"
          min={100}
          max={100000}
          step={100}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-brand-500"
        />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Brand</h3>
        <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto md:flex-col">
          {allBrands.map((b) => (
            <label key={b} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={brands.includes(b)}
                onChange={() => toggleBrand(b)}
                className="h-4 w-4 rounded accent-brand-500"
              />
              {b}
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div>
      {/* mobile search */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const next = new URLSearchParams(params)
          const val = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value
          if (val) next.set('q', val)
          else next.delete('q')
          setParams(next)
        }}
        className="relative mb-4 sm:hidden"
      >
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Search materials…"
          className="focus-ring h-11 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </form>

      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">
            {categorySlug
              ? categories.find((c) => c.slug === categorySlug)?.name
              : q
                ? `Results for "${q}"`
                : 'All materials'}
          </h1>
          <p className="text-sm text-slate-500">{filtered.length} products</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="md:hidden"
            onClick={() => setShowFilters(true)}
          >
            <SlidersHorizontal size={15} /> Filters
          </Button>
          <Select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="w-44">
            <option value="relevance">Sort: Relevance</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </Select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Desktop filters */}
        <aside className="hidden w-56 shrink-0 md:block">
          <div className="card sticky top-20 p-4">{filterPanel}</div>
        </aside>

        {/* Grid */}
        <div className="min-w-0 flex-1">
          {filtered.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try adjusting your filters or search term."
              action={
                <Button
                  onClick={() => {
                    setBrands([])
                    setMaxPrice(100000)
                    setCategory('')
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-slate-950/50" onClick={() => setShowFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-5 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button onClick={() => setShowFilters(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            {filterPanel}
            <Button className="mt-6 w-full" onClick={() => setShowFilters(false)}>
              Show {filtered.length} results
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
