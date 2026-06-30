import { useState } from 'react'
import { Ticket, Plus, Trash2, Pencil } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { formatCurrency, formatDate, uid } from '@/lib/utils'
import { Badge, Button, Card, Input, Select } from '@/components/ui'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/toast'
import type { Coupon } from '@/types'

const emptyForm = (): Omit<Coupon, 'id'> => ({
  code: '',
  type: 'percent',
  value: 10,
  minOrder: 1000,
  maxDiscount: undefined,
  active: true,
  expiresAt: '2026-12-31T23:59:59.000Z',
})

export default function ErpCoupons() {
  const coupons = useStore((s) => s.coupons)
  const upsert = useStore((s) => s.upsertCoupon)
  const remove = useStore((s) => s.deleteCoupon)

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm())

  function openCreate() {
    setForm(emptyForm())
    setEditId(null)
    setOpen(true)
  }
  function openEdit(c: Coupon) {
    setForm({ ...c })
    setEditId(c.id)
    setOpen(true)
  }
  function save() {
    if (!form.code.trim()) {
      toast.error('Enter a coupon code')
      return
    }
    upsert({ ...form, id: editId ?? uid('cp'), code: form.code.toUpperCase() })
    setOpen(false)
    toast.success(editId ? 'Coupon updated' : 'Coupon created')
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Coupons</h1>
          <p className="text-sm text-slate-500">{coupons.length} promo codes</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> New coupon
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.map((c) => (
          <Card key={c.id} className="relative overflow-hidden p-5">
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-brand-500/10" />
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                  <Ticket size={18} />
                </span>
                <div>
                  <p className="font-bold tracking-wide">{c.code}</p>
                  <p className="text-xs text-slate-400">
                    {c.type === 'percent' ? `${c.value}% off` : `${formatCurrency(c.value)} off`}
                  </p>
                </div>
              </div>
              {c.active ? <Badge tone="green">Active</Badge> : <Badge tone="gray">Inactive</Badge>}
            </div>
            <dl className="mt-4 space-y-1 text-xs text-slate-500">
              <div className="flex justify-between"><dt>Min order</dt><dd>{formatCurrency(c.minOrder)}</dd></div>
              {c.maxDiscount && (
                <div className="flex justify-between"><dt>Max discount</dt><dd>{formatCurrency(c.maxDiscount)}</dd></div>
              )}
              <div className="flex justify-between"><dt>Expires</dt><dd>{formatDate(c.expiresAt)}</dd></div>
            </dl>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(c)}>
                <Pencil size={13} /> Edit
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { remove(c.id); toast.success('Coupon deleted') }} aria-label="Delete">
                <Trash2 size={15} className="text-red-500" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'Edit coupon' : 'New coupon'}>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Code</label>
            <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. FIRST10" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Type</label>
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Coupon['type'] })}>
                <option value="percent">Percent (%)</option>
                <option value="flat">Flat (₹)</option>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Value</label>
              <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Min order (₹)</label>
              <Input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Max discount (₹)</label>
              <Input
                type="number"
                value={form.maxDiscount ?? ''}
                onChange={(e) => setForm({ ...form, maxDiscount: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Optional"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-4 w-4 accent-brand-500" />
            Active
          </label>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={save}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
