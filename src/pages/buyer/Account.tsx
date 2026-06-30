import { useNavigate } from 'react-router-dom'
import { LogOut, MapPin, Mail, Phone, Store, ShieldCheck, RefreshCw } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useCurrentUser } from '@/store/selectors'
import { humanize } from '@/lib/utils'
import { Badge, Button, Card } from '@/components/ui'
import { toast } from '@/components/ui/toast'

export default function Account() {
  const navigate = useNavigate()
  const user = useCurrentUser()
  const logout = useStore((s) => s.logout)
  const resetData = useStore((s) => s.resetData)
  const setActiveRole = useStore((s) => s.setActiveRole)

  if (!user) return null

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">My account</h1>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <img src={user.avatar} alt={user.name} className="h-16 w-16 rounded-full object-cover" />
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold">{user.name}</h2>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {user.roles.map((r) => (
                <Badge key={r} tone={r === 'admin' ? 'purple' : r === 'seller' ? 'blue' : 'amber'}>
                  {humanize(r)}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm"><Mail size={15} className="text-slate-400" /> {user.email}</div>
          <div className="flex items-center gap-2 text-sm"><Phone size={15} className="text-slate-400" /> +{user.phone}</div>
        </dl>

        {user.roles.includes('seller') && (
          <Button
            variant="outline"
            className="mt-5"
            onClick={() => {
              setActiveRole('seller')
              navigate('/erp')
            }}
          >
            <Store size={16} /> Go to Seller Console
          </Button>
        )}
        {user.roles.includes('admin') && (
          <Button
            variant="outline"
            className="mt-5 sm:ml-2"
            onClick={() => {
              setActiveRole('admin')
              navigate('/erp')
            }}
          >
            <ShieldCheck size={16} /> Go to Admin ERP
          </Button>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
          <MapPin size={18} className="text-brand-500" /> Saved addresses
        </h2>
        {user.addresses.length === 0 ? (
          <p className="text-sm text-slate-500">No saved addresses.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {user.addresses.map((a) => (
              <div key={a.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  {a.label}
                  {a.isDefault && <Badge tone="green">Default</Badge>}
                </p>
                <p className="text-sm text-slate-500">
                  {a.line1}, {a.city}, {a.state} – {a.pincode}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-3 p-6">
        <div>
          <p className="font-semibold">Demo data</p>
          <p className="text-sm text-slate-500">Reset all products, orders & chats to the seed state.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              resetData()
              toast.success('Demo data reset')
            }}
          >
            <RefreshCw size={16} /> Reset data
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              logout()
              navigate('/login')
            }}
          >
            <LogOut size={16} /> Sign out
          </Button>
        </div>
      </Card>
    </div>
  )
}
