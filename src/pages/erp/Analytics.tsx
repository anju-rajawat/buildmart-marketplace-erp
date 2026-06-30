import { useMemo } from 'react'
import { IndianRupee, ShoppingCart, TrendingUp, Users } from 'lucide-react'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { useStore } from '@/store/useStore'
import { formatCompact, formatCurrency } from '@/lib/utils'
import { Card, Stat } from '@/components/ui'
import { orderStatusLabel } from '@/components/shared/status'

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16']
const tip = { borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, background: '#fff', color: '#0f172a' }

export default function Analytics() {
  const orders = useStore((s) => s.orders)
  const products = useStore((s) => s.products)
  const categories = useStore((s) => s.categories)
  const users = useStore((s) => s.users)

  const paid = orders.filter((o) => o.status !== 'cancelled')
  const revenue = paid.reduce((s, o) => s + o.total, 0)
  const aov = paid.length ? Math.round(revenue / paid.length) : 0

  const trend = useMemo(() => {
    const b: Record<string, number> = {}
    paid.forEach((o) => {
      const k = new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
      b[k] = (b[k] ?? 0) + o.total
    })
    return Object.entries(b).map(([name, value]) => ({ name, value })).slice(-10)
  }, [orders])

  const byCat = useMemo(() => {
    const b: Record<string, number> = {}
    paid.forEach((o) => o.items.forEach((i) => {
      const p = products.find((x) => x.id === i.productId)
      const cat = categories.find((c) => c.id === p?.categoryId)?.name ?? 'Other'
      b[cat] = (b[cat] ?? 0) + i.price * i.quantity
    }))
    return Object.entries(b).map(([name, value]) => ({ name, value }))
  }, [orders, products, categories])

  const topProducts = useMemo(() => {
    const b: Record<string, { name: string; v: number }> = {}
    paid.forEach((o) => o.items.forEach((i) => {
      b[i.productId] ??= { name: i.name, v: 0 }
      b[i.productId].v += i.price * i.quantity
    }))
    return Object.values(b).sort((a, b) => b.v - a.v).slice(0, 6)
      .map((p) => ({ name: p.name.length > 16 ? p.name.slice(0, 16) + '…' : p.name, value: p.v }))
  }, [orders])

  const funnel = useMemo(() => {
    const b: Record<string, number> = {}
    orders.forEach((o) => (b[o.status] = (b[o.status] ?? 0) + 1))
    return Object.entries(b).map(([k, v]) => ({ name: orderStatusLabel[k as keyof typeof orderStatusLabel], value: v }))
  }, [orders])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-slate-500">Sales & performance insights</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Revenue" value={formatCurrency(revenue)} icon={<IndianRupee size={18} />} />
        <Stat label="Orders" value={String(orders.length)} icon={<ShoppingCart size={18} />} tone="blue" />
        <Stat label="Avg order value" value={formatCurrency(aov)} icon={<TrendingUp size={18} />} tone="green" />
        <Stat label="Customers" value={String(users.filter((u) => u.roles.includes('buyer')).length)} icon={<Users size={18} />} tone="purple" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-4 text-base font-bold">Revenue trend</h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trend} margin={{ left: -16, right: 8, top: 8 }}>
              <defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} /><stop offset="100%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => formatCompact(v)} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={tip} />
              <Area type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} fill="url(#a)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 text-base font-bold">Revenue by category</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={byCat} dataKey="value" nameKey="name" innerRadius={45} outerRadius={85} paddingAngle={3}>
                {byCat.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={tip} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 text-base font-bold">Top products</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topProducts} layout="vertical" margin={{ left: 10, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => formatCompact(v)} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" width={110} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={tip} />
              <Bar dataKey="value" fill="#f59e0b" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 text-base font-bold">Orders by status</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={funnel} margin={{ left: -16, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip contentStyle={tip} />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}
