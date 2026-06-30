import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  IndianRupee,
  ShoppingCart,
  Package,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useStore } from '@/store/useStore'
import { useCurrentUser } from '@/store/selectors'
import { formatCompact, formatCurrency } from '@/lib/utils'
import { Badge, Card, Stat } from '@/components/ui'
import { orderStatusLabel, orderStatusTone } from '@/components/shared/status'

const CHART_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16']

export default function ErpDashboard() {
  const user = useCurrentUser()
  const activeRole = useStore((s) => s.activeRole)
  const isAdmin = activeRole === 'admin'
  const allOrders = useStore((s) => s.orders)
  const products = useStore((s) => s.products)
  const inventory = useStore((s) => s.inventory)
  const categories = useStore((s) => s.categories)
  const sellerProfileId = user?.sellerProfileId

  // Scope orders/products to seller when not admin
  const myProducts = useMemo(
    () => (isAdmin ? products : products.filter((p) => p.sellerProfileId === sellerProfileId)),
    [isAdmin, products, sellerProfileId],
  )
  const orders = useMemo(
    () =>
      isAdmin
        ? allOrders
        : allOrders.filter((o) => o.items.some((i) => i.sellerProfileId === sellerProfileId)),
    [isAdmin, allOrders, sellerProfileId],
  )

  const revenue = useMemo(
    () =>
      orders
        .filter((o) => o.status !== 'cancelled')
        .reduce((sum, o) => {
          if (isAdmin) return sum + o.total
          // seller revenue = only their line items
          return (
            sum +
            o.items
              .filter((i) => i.sellerProfileId === sellerProfileId)
              .reduce((s, i) => s + i.price * i.quantity, 0)
          )
        }, 0),
    [orders, isAdmin, sellerProfileId],
  )

  const lowStock = myProducts.filter((p) => {
    const inv = inventory.find((i) => i.productId === p.id)
    return inv ? inv.quantity <= inv.reorderLevel : p.stock <= 15
  })

  // Revenue trend (group orders by day-of-month label)
  const revenueTrend = useMemo(() => {
    const buckets: Record<string, number> = {}
    orders
      .filter((o) => o.status !== 'cancelled')
      .forEach((o) => {
        const label = new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
        buckets[label] = (buckets[label] ?? 0) + o.total
      })
    return Object.entries(buckets)
      .map(([name, value]) => ({ name, value }))
      .slice(-8)
  }, [orders])

  // Top products by revenue
  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; revenue: number }> = {}
    orders.forEach((o) =>
      o.items
        .filter((i) => isAdmin || i.sellerProfileId === sellerProfileId)
        .forEach((i) => {
          map[i.productId] ??= { name: i.name, revenue: 0 }
          map[i.productId].revenue += i.price * i.quantity
        }),
    )
    return Object.values(map)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((p) => ({ name: p.name.length > 18 ? p.name.slice(0, 18) + '…' : p.name, revenue: p.revenue }))
  }, [orders, isAdmin, sellerProfileId])

  // Order funnel by status
  const funnel = useMemo(() => {
    const map: Record<string, number> = {}
    orders.forEach((o) => (map[o.status] = (map[o.status] ?? 0) + 1))
    return Object.entries(map).map(([status, count]) => ({
      name: orderStatusLabel[status as keyof typeof orderStatusLabel],
      value: count,
    }))
  }, [orders])

  // Category split
  const categorySplit = useMemo(() => {
    const map: Record<string, number> = {}
    myProducts.forEach((p) => {
      const cat = categories.find((c) => c.id === p.categoryId)?.name ?? 'Other'
      map[cat] = (map[cat] ?? 0) + 1
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [myProducts, categories])

  const recent = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{isAdmin ? 'Admin dashboard' : 'Seller dashboard'}</h1>
        <p className="text-sm text-slate-500">
          {isAdmin ? 'Platform-wide overview' : 'Performance for your storefront'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Revenue" value={formatCurrency(revenue)} delta="+12.4% vs last month" icon={<IndianRupee size={18} />} />
        <Stat label="Orders" value={String(orders.length)} delta={`${orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length} active`} icon={<ShoppingCart size={18} />} tone="blue" />
        <Stat label={isAdmin ? 'Products' : 'My products'} value={String(myProducts.length)} icon={<Package size={18} />} tone="green" />
        <Stat label="Low stock" value={String(lowStock.length)} delta="needs reorder" icon={<AlertTriangle size={18} />} tone="red" />
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold">
            <TrendingUp size={16} className="text-brand-500" /> Revenue trend
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueTrend} margin={{ left: -16, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => formatCompact(v)} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-base font-bold">Catalog by category</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={categorySplit} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                {categorySplit.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2">
            {categorySplit.map((c, i) => (
              <span key={c.name} className="flex items-center gap-1 text-xs text-slate-500">
                <span className="h-2 w-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                {c.name}
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 text-base font-bold">Top products by revenue</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topProducts} layout="vertical" margin={{ left: 10, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => formatCompact(v)} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" width={110} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={tooltipStyle} />
              <Bar dataKey="revenue" fill="#f59e0b" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-base font-bold">Order funnel</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={funnel} margin={{ left: -16, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent orders + low stock */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold">Recent orders</h2>
            <Link to="/erp/orders" className="flex items-center gap-1 text-sm text-brand-600 hover:underline">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recent.map((o) => (
              <Link key={o.id} to={`/erp/orders`} className="flex items-center justify-between py-2.5 text-sm hover:opacity-80">
                <div>
                  <p className="font-semibold">{o.code}</p>
                  <p className="text-xs text-slate-400">{o.items.length} items · {formatCurrency(o.total)}</p>
                </div>
                <Badge tone={orderStatusTone[o.status]}>{orderStatusLabel[o.status]}</Badge>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-bold">
              <AlertTriangle size={16} className="text-amber-500" /> Low stock alerts
            </h2>
            <Link to="/erp/inventory" className="flex items-center gap-1 text-sm text-brand-600 hover:underline">
              Manage <ArrowRight size={14} />
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">All products well stocked 🎉</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {lowStock.slice(0, 6).map((p) => {
                const inv = inventory.find((i) => i.productId === p.id)
                return (
                  <div key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                    <p className="truncate pr-2 font-medium">{p.name}</p>
                    <Badge tone="red">{inv?.quantity ?? p.stock} left</Badge>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  fontSize: 12,
  background: '#fff',
  color: '#0f172a',
}
