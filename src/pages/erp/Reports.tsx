import { FileBarChart, Download, IndianRupee, ShoppingCart, Package, Users } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { formatCurrency, formatDate, humanize } from '@/lib/utils'
import { exportCsv } from '@/lib/csv'
import { Button, Card, Stat } from '@/components/ui'

export default function Reports() {
  const orders = useStore((s) => s.orders)
  const products = useStore((s) => s.products)
  const users = useStore((s) => s.users)
  const categories = useStore((s) => s.categories)

  const paid = orders.filter((o) => o.status !== 'cancelled')
  const revenue = paid.reduce((s, o) => s + o.total, 0)
  const gst = paid.reduce((s, o) => s + o.gst, 0)
  const buyerName = (id: string) => users.find((u) => u.id === id)?.name ?? '—'

  const reports = [
    {
      title: 'Sales Report',
      desc: 'All orders with totals, status & payment.',
      run: () =>
        exportCsv(
          'sales-report.csv',
          ['Order', 'Customer', 'Date', 'Status', 'Subtotal', 'GST', 'Total'],
          orders.map((o) => [o.code, buyerName(o.buyerId), formatDate(o.createdAt), humanize(o.status), o.subtotal, o.gst, o.total]),
        ),
    },
    {
      title: 'Product Catalog Report',
      desc: 'Every product with price, stock & category.',
      run: () =>
        exportCsv(
          'product-report.csv',
          ['Name', 'Brand', 'Category', 'Price', 'Stock'],
          products.map((p) => [p.name, p.brand, categories.find((c) => c.id === p.categoryId)?.name ?? '', p.price, p.stock]),
        ),
    },
    {
      title: 'GST / Tax Report',
      desc: 'Taxable value & GST collected per order.',
      run: () =>
        exportCsv(
          'gst-report.csv',
          ['Order', 'Date', 'Taxable (Subtotal-Disc)', 'GST 18%', 'Total'],
          paid.map((o) => [o.code, formatDate(o.createdAt), o.subtotal - o.discount, o.gst, o.total]),
        ),
    },
    {
      title: 'Customer Report',
      desc: 'Customers with order count & lifetime spend.',
      run: () =>
        exportCsv(
          'customer-report.csv',
          ['Name', 'Email', 'Orders', 'Spent'],
          users.filter((u) => u.roles.includes('buyer')).map((u) => {
            const us = orders.filter((o) => o.buyerId === u.id && o.status !== 'cancelled')
            return [u.name, u.email, us.length, us.reduce((s, o) => s + o.total, 0)]
          }),
        ),
    },
    {
      title: 'Low Stock Report',
      desc: 'Products at or below 15 units.',
      run: () =>
        exportCsv(
          'low-stock-report.csv',
          ['Name', 'Brand', 'Stock'],
          products.filter((p) => p.stock <= 15).map((p) => [p.name, p.brand, p.stock]),
        ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-slate-500">Download business reports as CSV</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Revenue" value={formatCurrency(revenue)} icon={<IndianRupee size={18} />} />
        <Stat label="Orders" value={String(orders.length)} icon={<ShoppingCart size={18} />} tone="blue" />
        <Stat label="Products" value={String(products.length)} icon={<Package size={18} />} tone="green" />
        <Stat label="GST collected" value={formatCurrency(gst)} icon={<Users size={18} />} tone="amber" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((r) => (
          <Card key={r.title} className="flex flex-col p-5">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
              <FileBarChart size={20} />
            </div>
            <h3 className="font-semibold">{r.title}</h3>
            <p className="mb-4 mt-1 flex-1 text-sm text-slate-500">{r.desc}</p>
            <Button variant="outline" onClick={r.run}>
              <Download size={16} /> Download CSV
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
