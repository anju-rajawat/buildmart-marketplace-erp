import { useNavigate } from 'react-router-dom'
import { Settings as SettingsIcon, Moon, Sun, RefreshCw, LogOut, Building2, ShieldCheck } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useCurrentUser } from '@/store/selectors'
import { useTheme } from '@/hooks/useTheme'
import { humanize } from '@/lib/utils'
import { Badge, Button, Card, Input } from '@/components/ui'
import { toast } from '@/components/ui/toast'

export default function ErpSettings() {
  const navigate = useNavigate()
  const user = useCurrentUser()
  const { theme, toggle } = useTheme()
  const resetData = useStore((s) => s.resetData)
  const logout = useStore((s) => s.logout)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold"><SettingsIcon size={22} /> Settings</h1>
        <p className="text-sm text-slate-500">Store configuration & preferences</p>
      </div>

      {/* Store info */}
      <Card className="p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Building2 size={18} className="text-brand-500" /> Store details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Store name"><Input defaultValue="BuildMart" /></Field>
          <Field label="GSTIN"><Input defaultValue="06AABCB0000A1Z5" /></Field>
          <Field label="Support email"><Input defaultValue="support@buildmart.in" /></Field>
          <Field label="Support phone"><Input defaultValue="+91 90095 54739" /></Field>
        </div>
        <Button className="mt-4" onClick={() => toast.success('Store details saved')}>Save changes</Button>
      </Card>

      {/* Account */}
      <Card className="p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><ShieldCheck size={18} className="text-brand-500" /> Account</h2>
        <div className="flex items-center gap-4">
          <img src={user?.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
          <div>
            <p className="font-semibold">{user?.name}</p>
            <p className="text-sm text-slate-400">{user?.email}</p>
          </div>
          <div className="ml-auto flex gap-1">
            {user?.roles.map((r) => <Badge key={r} tone={r === 'admin' ? 'purple' : 'blue'}>{humanize(r)}</Badge>)}
          </div>
        </div>
      </Card>

      {/* Appearance */}
      <Card className="flex items-center justify-between p-6">
        <div>
          <h2 className="text-lg font-bold">Appearance</h2>
          <p className="text-sm text-slate-500">Toggle light / dark theme</p>
        </div>
        <Button variant="outline" onClick={toggle}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />} {theme === 'dark' ? 'Light' : 'Dark'} mode
        </Button>
      </Card>

      {/* Danger zone */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-bold">Data & session</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => { resetData(); toast.success('Demo data reset') }}>
            <RefreshCw size={16} /> Reset demo data
          </Button>
          <Button variant="danger" onClick={() => { logout(); navigate('/login') }}>
            <LogOut size={16} /> Sign out
          </Button>
        </div>
        <p className="mt-3 text-xs text-slate-400">Reset restores all products, orders & inventory to the original seed.</p>
      </Card>
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
