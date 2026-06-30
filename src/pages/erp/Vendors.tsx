import { useState } from 'react'
import { Store, Search, ShieldCheck, MessageCircle, Star } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { whatsapp } from '@/lib/whatsapp'
import { formatCurrency } from '@/lib/utils'
import { Badge, Button, Card, Input, Stat } from '@/components/ui'

export default function Vendors() {
  const sellers = useStore((s) => s.sellerProfiles)
  const users = useStore((s) => s.users)
  const products = useStore((s) => s.products)
  const orders = useStore((s) => s.orders)
  const [q, setQ] = useState('')

  const list = sellers.filter((v) => v.businessName.toLowerCase().includes(q.toLowerCase()))
  const stats = (id: string) => {
    const prod = products.filter((p) => p.sellerProfileId === id).length
    const rev = orders
      .flatMap((o) => o.items)
      .filter((i) => i.sellerProfileId === id)
      .reduce((s, i) => s + i.price * i.quantity, 0)
    return { prod, rev }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Vendors</h1>
        <p className="text-sm text-slate-500">{sellers.length} suppliers</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total vendors" value={String(sellers.length)} icon={<Store size={18} />} />
        <Stat label="Verified" value={String(sellers.filter((s) => s.verified).length)} icon={<ShieldCheck size={18} />} tone="green" />
        <Stat label="Avg rating" value={(sellers.reduce((s, v) => s + v.rating, 0) / sellers.length).toFixed(1)} icon={<Star size={18} />} tone="amber" />
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input className="pl-9" placeholder="Search vendors…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((v) => {
          const u = users.find((x) => x.id === v.userId)
          const s = stats(v.id)
          return (
            <Card key={v.id} className="p-5">
              <div className="flex items-center gap-3">
                <img src={v.logo} alt="" className="h-12 w-12 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 truncate font-semibold">
                    {v.businessName}
                    {v.verified && <ShieldCheck size={14} className="text-emerald-500" />}
                  </p>
                  <p className="text-xs text-slate-400">{v.city}, {v.state}</p>
                </div>
                <Badge tone="amber">⭐ {v.rating}</Badge>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div><dt className="text-xs text-slate-400">Products</dt><dd className="font-semibold">{s.prod}</dd></div>
                <div><dt className="text-xs text-slate-400">Revenue</dt><dd className="font-semibold">{formatCurrency(s.rev)}</dd></div>
                <div className="col-span-2"><dt className="text-xs text-slate-400">GSTIN</dt><dd className="font-mono text-xs">{v.gstin}</dd></div>
              </dl>
              {u && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => window.open(whatsapp.deepLink(u.phone, `Hi ${v.businessName}, regarding supply…`), '_blank')}
                >
                  <MessageCircle size={14} className="text-green-500" /> Contact on WhatsApp
                </Button>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
