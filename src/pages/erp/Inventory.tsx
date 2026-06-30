import { useMemo, useState } from 'react'
import { Boxes, AlertTriangle, Check, Pencil } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useCurrentUser } from '@/store/selectors'
import { Badge, Button, Card, Input, Stat } from '@/components/ui'
import { ProductImage } from '@/components/ui/ProductImage'
import { toast } from '@/components/ui/toast'

export default function ErpInventory() {
  const user = useCurrentUser()
  const isAdmin = useStore((s) => s.activeRole === 'admin')
  const products = useStore((s) => s.products)
  const inventory = useStore((s) => s.inventory)
  const warehouses = useStore((s) => s.warehouses)
  const setStock = useStore((s) => s.setStock)

  const rows = useMemo(() => {
    const scoped = isAdmin ? products : products.filter((p) => p.sellerProfileId === user?.sellerProfileId)
    return scoped.map((p) => {
      const inv = inventory.find((i) => i.productId === p.id)
      const wh = warehouses.find((w) => w.id === inv?.warehouseId)
      return { product: p, inv, warehouse: wh }
    })
  }, [isAdmin, products, inventory, warehouses, user?.sellerProfileId])

  const lowCount = rows.filter((r) => (r.inv ? r.inv.quantity <= r.inv.reorderLevel : false)).length
  const totalUnits = rows.reduce((s, r) => s + (r.inv?.quantity ?? 0), 0)

  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState(0)

  function commit(productId: string) {
    setStock(productId, Math.max(0, draft))
    setEditing(null)
    toast.success('Stock updated')
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Inventory</h1>
        <p className="text-sm text-slate-500">Stock levels & reorder alerts</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="SKUs" value={String(rows.length)} icon={<Boxes size={18} />} />
        <Stat label="Total units" value={totalUnits.toLocaleString('en-IN')} icon={<Boxes size={18} />} tone="green" />
        <Stat label="Below reorder" value={String(lowCount)} icon={<AlertTriangle size={18} />} tone="red" />
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
            <tr>
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Warehouse</th>
              <th className="px-4 py-3 font-semibold">Reorder level</th>
              <th className="px-4 py-3 font-semibold">In stock</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map(({ product, inv, warehouse }) => {
              const qty = inv?.quantity ?? product.stock
              const low = inv ? qty <= inv.reorderLevel : qty <= 15
              return (
                <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ProductImage src={product.images[0]} alt="" className="h-9 w-9 rounded-lg" />
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{warehouse?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{inv?.reorderLevel ?? 15}</td>
                  <td className="px-4 py-3">
                    {editing === product.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          autoFocus
                          value={draft}
                          onChange={(e) => setDraft(Number(e.target.value))}
                          className="h-8 w-24"
                        />
                        <Button size="icon" className="h-8 w-8" onClick={() => commit(product.id)}>
                          <Check size={14} />
                        </Button>
                      </div>
                    ) : (
                      <span className="font-semibold">{qty.toLocaleString('en-IN')}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {low ? <Badge tone="red">Reorder</Badge> : <Badge tone="green">Healthy</Badge>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditing(product.id)
                        setDraft(qty)
                      }}
                      aria-label="Edit stock"
                    >
                      <Pencil size={15} />
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
