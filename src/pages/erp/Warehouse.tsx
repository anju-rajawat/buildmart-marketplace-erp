import { useMemo } from 'react'
import { Warehouse as WhIcon, Boxes, AlertTriangle, MapPin } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Badge, Card, Stat } from '@/components/ui'

export default function Warehouse() {
  const warehouses = useStore((s) => s.warehouses)
  const inventory = useStore((s) => s.inventory)
  const products = useStore((s) => s.products)

  const rows = useMemo(
    () =>
      warehouses.map((w) => {
        const inv = inventory.filter((i) => i.warehouseId === w.id)
        const units = inv.reduce((s, i) => s + i.quantity, 0)
        const low = inv.filter((i) => i.quantity <= i.reorderLevel).length
        return { wh: w, skus: inv.length, units, low }
      }),
    [warehouses, inventory],
  )

  const totalUnits = rows.reduce((s, r) => s + r.units, 0)
  const totalLow = rows.reduce((s, r) => s + r.low, 0)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Warehouses</h1>
        <p className="text-sm text-slate-500">{warehouses.length} stock locations</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Warehouses" value={String(warehouses.length)} icon={<WhIcon size={18} />} />
        <Stat label="Total units" value={totalUnits.toLocaleString('en-IN')} icon={<Boxes size={18} />} tone="green" />
        <Stat label="Low-stock SKUs" value={String(totalLow)} icon={<AlertTriangle size={18} />} tone="red" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map(({ wh, skus, units, low }) => (
          <Card key={wh.id} className="p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                <WhIcon size={20} />
              </span>
              <div>
                <p className="font-semibold">{wh.name}</p>
                <p className="flex items-center gap-1 text-xs text-slate-400"><MapPin size={11} /> {wh.city}, {wh.state}</p>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-slate-50 py-2 dark:bg-slate-800/50"><dt className="text-xs text-slate-400">SKUs</dt><dd className="font-bold">{skus}</dd></div>
              <div className="rounded-lg bg-slate-50 py-2 dark:bg-slate-800/50"><dt className="text-xs text-slate-400">Units</dt><dd className="font-bold">{units.toLocaleString('en-IN')}</dd></div>
              <div className="rounded-lg bg-slate-50 py-2 dark:bg-slate-800/50"><dt className="text-xs text-slate-400">Low</dt><dd className="font-bold">{low > 0 ? <Badge tone="red">{low}</Badge> : 0}</dd></div>
            </dl>
          </Card>
        ))}
      </div>
    </div>
  )
}
