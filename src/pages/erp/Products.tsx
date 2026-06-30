import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Search, Package } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useCurrentUser } from '@/store/selectors'
import { formatCurrency, uid } from '@/lib/utils'
import { productImages } from '@/lib/images'
import { Badge, Button, Card, EmptyState, Input, Select } from '@/components/ui'
import { ProductImage } from '@/components/ui/ProductImage'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/toast'
import type { MaterialUnit, Product } from '@/types'

const UNITS: MaterialUnit[] = ['bag', 'ton', 'sqft', 'piece', 'litre', 'kg', 'box', 'roll']

const emptyForm = () => ({
  id: '',
  name: '',
  categoryId: 'cat_cement',
  brand: '',
  unit: 'bag' as MaterialUnit,
  price: 0,
  mrp: 0,
  stock: 0,
  shortDescription: '',
})

export default function ErpProducts() {
  const user = useCurrentUser()
  const isAdmin = useStore((s) => s.activeRole === 'admin')
  const products = useStore((s) => s.products)
  const categories = useStore((s) => s.categories)
  const sellerProfiles = useStore((s) => s.sellerProfiles)
  const upsertProduct = useStore((s) => s.upsertProduct)
  const deleteProduct = useStore((s) => s.deleteProduct)

  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm())
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null)

  const scoped = useMemo(
    () => (isAdmin ? products : products.filter((p) => p.sellerProfileId === user?.sellerProfileId)),
    [isAdmin, products, user?.sellerProfileId],
  )
  const list = scoped.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.brand.toLowerCase().includes(query.toLowerCase()),
  )

  function openCreate() {
    setForm(emptyForm())
    setOpen(true)
  }
  function openEdit(p: Product) {
    setForm({
      id: p.id,
      name: p.name,
      categoryId: p.categoryId,
      brand: p.brand,
      unit: p.unit,
      price: p.price,
      mrp: p.mrp,
      stock: p.stock,
      shortDescription: p.shortDescription,
    })
    setOpen(true)
  }

  function save() {
    if (!form.name || form.price <= 0) {
      toast.error('Enter a name and a valid price')
      return
    }
    const existing = products.find((p) => p.id === form.id)
    const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const newId = uid('p')
    const product: Product = existing
      ? { ...existing, ...form, slug }
      : {
          ...form,
          id: newId,
          slug,
          sellerProfileId: user?.sellerProfileId ?? 'sp_buildhub',
          images: productImages(newId, form.categoryId, products.length),
          description: form.shortDescription,
          specs: {},
          rating: 0,
          ratingCount: 0,
          tags: [],
          featured: false,
          createdAt: new Date().toISOString(),
        }
    upsertProduct(product)
    setOpen(false)
    toast.success(existing ? 'Product updated' : 'Product added')
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-slate-500">{list.length} items</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> Add product
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input className="pl-9" placeholder="Search products…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {list.length === 0 ? (
        <EmptyState icon={<Package size={40} />} title="No products" action={<Button onClick={openCreate}>Add your first product</Button>} />
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden overflow-hidden md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  {isAdmin && <th className="px-4 py-3 font-semibold">Seller</th>}
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {list.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProductImage src={p.images[0]} alt="" className="h-10 w-10 rounded-lg" />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{p.name}</p>
                          <p className="text-xs text-slate-400">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{categories.find((c) => c.id === p.categoryId)?.name}</td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-slate-500">
                        {sellerProfiles.find((s) => s.id === p.sellerProfileId)?.businessName ?? '—'}
                      </td>
                    )}
                    <td className="px-4 py-3 font-semibold">{formatCurrency(p.price)}</td>
                    <td className="px-4 py-3">
                      {p.stock <= 15 ? <Badge tone="red">{p.stock}</Badge> : <span>{p.stock}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)} aria-label="Edit">
                          <Pencil size={15} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setConfirmDelete(p)} aria-label="Delete">
                          <Trash2 size={15} className="text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {list.map((p) => (
              <Card key={p.id} className="flex gap-3 p-3">
                <ProductImage src={p.images[0]} alt="" className="h-16 w-16 rounded-lg" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-slate-400">{p.brand} · {categories.find((c) => c.id === p.categoryId)?.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-bold">{formatCurrency(p.price)}</span>
                    {p.stock <= 15 ? <Badge tone="red">{p.stock} left</Badge> : <span className="text-xs text-slate-400">{p.stock} in stock</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(p)} aria-label="Edit"><Pencil size={15} /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setConfirmDelete(p)} aria-label="Delete"><Trash2 size={15} className="text-red-500" /></Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Add/Edit modal */}
      <Modal open={open} onClose={() => setOpen(false)} title={form.id ? 'Edit product' : 'Add product'}>
        <div className="space-y-4">
          <Field label="Name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. ACC Gold OPC 53" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Brand">
              <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            </Field>
            <Field label="Category">
              <Select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Price (₹)">
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </Field>
            <Field label="MRP (₹)">
              <Input type="number" value={form.mrp} onChange={(e) => setForm({ ...form, mrp: Number(e.target.value) })} />
            </Field>
            <Field label="Unit">
              <Select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value as MaterialUnit })}>
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Stock">
            <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
          </Field>
          <Field label="Short description">
            <Input value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
          </Field>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={save}>Save</Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete product?">
        <p className="text-sm text-slate-500">
          Are you sure you want to delete <span className="font-semibold">{confirmDelete?.name}</span>? This cannot be undone.
        </p>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => {
              if (confirmDelete) {
                deleteProduct(confirmDelete.id)
                toast.success('Product deleted')
              }
              setConfirmDelete(null)
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {children}
    </div>
  )
}
