import { useState } from 'react'
import { Users, Search, Ban, CheckCircle2, MessageCircle } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { whatsapp } from '@/lib/whatsapp'
import { formatCurrency, humanize } from '@/lib/utils'
import { Badge, Button, Card, Input } from '@/components/ui'
import { toast } from '@/components/ui/toast'

export default function ErpCustomers() {
  const users = useStore((s) => s.users)
  const orders = useStore((s) => s.orders)
  const toggleActive = useStore((s) => s.toggleUserActive)
  const [query, setQuery] = useState('')

  const customers = users
    .filter((u) => u.roles.includes('buyer'))
    .filter(
      (u) =>
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase()),
    )

  function stats(userId: string) {
    const us = orders.filter((o) => o.buyerId === userId && o.status !== 'cancelled')
    return { count: us.length, spent: us.reduce((s, o) => s + o.total, 0) }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-sm text-slate-500">{customers.length} buyers</p>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input className="pl-9" placeholder="Search customers…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {/* Desktop */}
      <Card className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
            <tr>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Roles</th>
              <th className="px-4 py-3 font-semibold">Orders</th>
              <th className="px-4 py-3 font-semibold">Spent</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {customers.map((u) => {
              const s = stats(u.id)
              return (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {u.roles.map((r) => (
                        <Badge key={r} tone={r === 'seller' ? 'blue' : 'amber'}>{humanize(r)}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold">{s.count}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(s.spent)}</td>
                  <td className="px-4 py-3">
                    {u.isActive ? <Badge tone="green">Active</Badge> : <Badge tone="red">Blocked</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(whatsapp.deepLink(u.phone, `Hi ${u.name}, this is BuildMart support.`), '_blank')}
                      >
                        <MessageCircle size={14} className="text-green-500" />
                      </Button>
                      <Button
                        size="sm"
                        variant={u.isActive ? 'outline' : 'primary'}
                        onClick={() => {
                          toggleActive(u.id)
                          toast.success(u.isActive ? 'Customer blocked' : 'Customer activated')
                        }}
                      >
                        {u.isActive ? <Ban size={14} /> : <CheckCircle2 size={14} />}
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>

      {/* Mobile */}
      <div className="space-y-3 md:hidden">
        {customers.map((u) => {
          const s = stats(u.id)
          return (
            <Card key={u.id} className="p-4">
              <div className="flex items-center gap-3">
                <img src={u.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{u.name}</p>
                  <p className="truncate text-xs text-slate-400">{u.email}</p>
                </div>
                {u.isActive ? <Badge tone="green">Active</Badge> : <Badge tone="red">Blocked</Badge>}
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-slate-500">{s.count} orders · {formatCurrency(s.spent)}</span>
                <Button
                  size="sm"
                  variant={u.isActive ? 'outline' : 'primary'}
                  onClick={() => toggleActive(u.id)}
                >
                  {u.isActive ? 'Block' : 'Activate'}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
