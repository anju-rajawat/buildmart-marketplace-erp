import { useMemo, useState } from 'react'
import { IndianRupee, Download, Wallet, CircleAlert } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { formatCurrency, formatDate, humanize } from '@/lib/utils'
import { exportCsv } from '@/lib/csv'
import { Badge, Button, Card, Select, Stat } from '@/components/ui'
import { paymentTone } from '@/components/shared/status'
import type { PaymentStatus } from '@/types'

export default function Payments() {
  const orders = useStore((s) => s.orders)
  const users = useStore((s) => s.users)
  const [filter, setFilter] = useState<PaymentStatus | 'all'>('all')

  const rows = useMemo(
    () => orders.map((o) => ({ o, p: o.payment, buyer: users.find((u) => u.id === o.buyerId)?.name ?? '—' })),
    [orders, users],
  )
  const list = filter === 'all' ? rows : rows.filter((r) => r.p.status === filter)

  const collected = rows.filter((r) => r.p.status === 'paid').reduce((s, r) => s + r.p.amount, 0)
  const pending = rows.filter((r) => r.p.status === 'pending').reduce((s, r) => s + r.p.amount, 0)
  const refunded = rows.filter((r) => r.p.status === 'refunded').reduce((s, r) => s + r.p.amount, 0)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-sm text-slate-500">{rows.length} transactions</p>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            exportCsv(
              'payments.csv',
              ['Txn', 'Order', 'Customer', 'Method', 'Status', 'Amount (INR)', 'Date'],
              rows.map((r) => [r.p.transactionRef, r.o.code, r.buyer, humanize(r.p.method), humanize(r.p.status), r.p.amount, formatDate(r.o.createdAt)]),
            )
          }
        >
          <Download size={16} /> Export CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Collected" value={formatCurrency(collected)} icon={<IndianRupee size={18} />} tone="green" />
        <Stat label="Pending" value={formatCurrency(pending)} icon={<CircleAlert size={18} />} tone="amber" />
        <Stat label="Refunded" value={formatCurrency(refunded)} icon={<Wallet size={18} />} tone="blue" />
      </div>

      <Select value={filter} onChange={(e) => setFilter(e.target.value as PaymentStatus | 'all')} className="w-44">
        <option value="all">All statuses</option>
        <option value="paid">Paid</option>
        <option value="pending">Pending</option>
        <option value="refunded">Refunded</option>
        <option value="failed">Failed</option>
      </Select>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
            <tr>
              <th className="px-4 py-3 font-semibold">Transaction</th>
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Method</th>
              <th className="px-4 py-3 font-semibold">Amount</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {list.map((r) => (
              <tr key={r.p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="px-4 py-3 font-mono text-xs">{r.p.transactionRef}</td>
                <td className="px-4 py-3 font-semibold">{r.o.code}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{r.buyer}</td>
                <td className="px-4 py-3 text-slate-500">{humanize(r.p.method)}</td>
                <td className="px-4 py-3 font-semibold">{formatCurrency(r.p.amount)}</td>
                <td className="px-4 py-3"><Badge tone={paymentTone[r.p.status]}>{humanize(r.p.status)}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
