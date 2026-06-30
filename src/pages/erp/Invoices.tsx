import { useMemo, useState } from 'react'
import { Receipt, Printer, Search, Download } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { formatCurrency, formatDate } from '@/lib/utils'
import { printInvoice } from '@/lib/print'
import { exportCsv } from '@/lib/csv'
import { Badge, Button, Card, Input, Stat } from '@/components/ui'
import { paymentTone } from '@/components/shared/status'
import { humanize } from '@/lib/utils'

export default function Invoices() {
  const orders = useStore((s) => s.orders)
  const users = useStore((s) => s.users)
  const [q, setQ] = useState('')

  const rows = useMemo(
    () =>
      orders
        .map((o) => ({ o, buyer: users.find((u) => u.id === o.buyerId)?.name ?? '—' }))
        .filter((r) => r.o.code.toLowerCase().includes(q.toLowerCase()) || r.buyer.toLowerCase().includes(q.toLowerCase()))
        .sort((a, b) => b.o.createdAt.localeCompare(a.o.createdAt)),
    [orders, users, q],
  )
  const totalBilled = orders.reduce((s, o) => s + o.total, 0)
  const totalGst = orders.reduce((s, o) => s + o.gst, 0)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-sm text-slate-500">{orders.length} GST invoices</p>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            exportCsv(
              'invoices.csv',
              ['Invoice', 'Customer', 'Date', 'Subtotal', 'GST', 'Total', 'Payment'],
              rows.map((r) => [r.o.code, r.buyer, formatDate(r.o.createdAt), r.o.subtotal, r.o.gst, r.o.total, humanize(r.o.payment.status)]),
            )
          }
        >
          <Download size={16} /> Export CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Invoices" value={String(orders.length)} icon={<Receipt size={18} />} />
        <Stat label="Total billed" value={formatCurrency(totalBilled)} icon={<Receipt size={18} />} tone="green" />
        <Stat label="GST collected" value={formatCurrency(totalGst)} icon={<Receipt size={18} />} tone="amber" />
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input className="pl-9" placeholder="Search invoice / customer…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
            <tr>
              <th className="px-4 py-3 font-semibold">Invoice</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">GST</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Payment</th>
              <th className="px-4 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((r) => (
              <tr key={r.o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="px-4 py-3 font-semibold">{r.o.code}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{r.buyer}</td>
                <td className="px-4 py-3 text-slate-500">{formatDate(r.o.createdAt)}</td>
                <td className="px-4 py-3">{formatCurrency(r.o.gst)}</td>
                <td className="px-4 py-3 font-semibold">{formatCurrency(r.o.total)}</td>
                <td className="px-4 py-3"><Badge tone={paymentTone[r.o.payment.status]}>{humanize(r.o.payment.status)}</Badge></td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="outline" onClick={() => printInvoice(r.o, r.buyer)}>
                    <Printer size={14} /> Print
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
