import { useState } from 'react'
import { ClipboardList, Download } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { purchaseOrders as seedPOs } from '@/data/erp'
import { formatCurrency, formatDate, humanize } from '@/lib/utils'
import { exportCsv } from '@/lib/csv'
import { Badge, Button, Card, Select, Stat } from '@/components/ui'
import type { POStatus, PurchaseOrder } from '@/types'

const tone: Record<POStatus, 'gray' | 'amber' | 'green' | 'red' | 'blue'> = {
  draft: 'gray',
  sent: 'amber',
  received: 'green',
  cancelled: 'red',
}

export default function PurchaseOrders() {
  const sellers = useStore((s) => s.sellerProfiles)
  const [pos, setPos] = useState<PurchaseOrder[]>(seedPOs)
  const [filter, setFilter] = useState<POStatus | 'all'>('all')

  const vendorName = (id: string) => sellers.find((s) => s.id === id)?.businessName ?? '—'
  const list = filter === 'all' ? pos : pos.filter((p) => p.status === filter)
  const totalValue = pos.filter((p) => p.status !== 'cancelled').reduce((s, p) => s + p.total, 0)

  function setStatus(id: string, status: POStatus) {
    setPos((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)))
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Purchase Orders</h1>
          <p className="text-sm text-slate-500">{pos.length} POs to vendors</p>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            exportCsv(
              'purchase-orders.csv',
              ['PO', 'Vendor', 'Date', 'Status', 'Total (INR)'],
              pos.map((p) => [p.code, vendorName(p.vendorId), formatDate(p.createdAt), humanize(p.status), p.total]),
            )
          }
        >
          <Download size={16} /> Export CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Open POs" value={String(pos.filter((p) => p.status === 'sent' || p.status === 'draft').length)} icon={<ClipboardList size={18} />} />
        <Stat label="Received" value={String(pos.filter((p) => p.status === 'received').length)} icon={<ClipboardList size={18} />} tone="green" />
        <Stat label="Total value" value={formatCurrency(totalValue)} icon={<ClipboardList size={18} />} tone="amber" />
      </div>

      <Select value={filter} onChange={(e) => setFilter(e.target.value as POStatus | 'all')} className="w-44">
        <option value="all">All statuses</option>
        <option value="draft">Draft</option>
        <option value="sent">Sent</option>
        <option value="received">Received</option>
        <option value="cancelled">Cancelled</option>
      </Select>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
            <tr>
              <th className="px-4 py-3 font-semibold">PO</th>
              <th className="px-4 py-3 font-semibold">Vendor</th>
              <th className="px-4 py-3 font-semibold">Items</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Expected</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {list.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="px-4 py-3 font-semibold">{p.code}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{vendorName(p.vendorId)}</td>
                <td className="px-4 py-3 text-slate-500">{p.items.map((i) => `${i.quantity} ${i.unit} ${i.name}`).join(', ')}</td>
                <td className="px-4 py-3 font-semibold">{formatCurrency(p.total)}</td>
                <td className="px-4 py-3 text-slate-500">{formatDate(p.expectedDate)}</td>
                <td className="px-4 py-3">
                  <Select value={p.status} onChange={(e) => setStatus(p.id, e.target.value as POStatus)} className="h-8 w-32 text-xs">
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="received">Received</option>
                    <option value="cancelled">Cancelled</option>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <p className="text-xs text-slate-400">
        Demo note: status changes here are session-only (not persisted).
        <Badge tone={tone.received} className="ml-2">received</Badge>
      </p>
    </div>
  )
}
