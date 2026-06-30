import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Boxes,
  Ticket,
  FileText,
  MessageSquare,
  Building2,
  Menu,
  X,
  Store,
  ArrowLeftRight,
  ClipboardList,
  Warehouse as WarehouseIcon,
  BarChart3,
  CreditCard,
  Receipt,
  Truck,
  LifeBuoy,
  FileBarChart,
  Settings as SettingsIcon,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useCurrentUser } from '@/store/selectors'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './ThemeToggle'
import { NotificationBell } from './NotificationBell'

interface NavItem {
  to: string
  label: string
  icon: typeof Package
  end?: boolean
  adminOnly?: boolean
}

const items: NavItem[] = [
  { to: '/erp', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/erp/products', label: 'Products', icon: Package },
  { to: '/erp/inventory', label: 'Inventory', icon: Boxes },
  { to: '/erp/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/erp/quotations', label: 'Quotations', icon: FileText },
  { to: '/erp/customers', label: 'Customers', icon: Users, adminOnly: true },
  { to: '/erp/vendors', label: 'Vendors', icon: Store, adminOnly: true },
  { to: '/erp/purchase-orders', label: 'Purchase Orders', icon: ClipboardList, adminOnly: true },
  { to: '/erp/warehouse', label: 'Warehouse', icon: WarehouseIcon },
  { to: '/erp/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/erp/payments', label: 'Payments', icon: CreditCard, adminOnly: true },
  { to: '/erp/invoices', label: 'Invoices', icon: Receipt },
  { to: '/erp/delivery', label: 'Delivery Tracking', icon: Truck },
  { to: '/erp/tickets', label: 'Support Tickets', icon: LifeBuoy, adminOnly: true },
  { to: '/erp/chat', label: 'Messages', icon: MessageSquare },
  { to: '/erp/coupons', label: 'Coupons', icon: Ticket, adminOnly: true },
  { to: '/erp/reports', label: 'Reports', icon: FileBarChart, adminOnly: true },
  { to: '/erp/settings', label: 'Settings', icon: SettingsIcon },
]

export function DashboardShell() {
  const user = useCurrentUser()
  const activeRole = useStore((s) => s.activeRole)
  const setActiveRole = useStore((s) => s.setActiveRole)
  const isAdmin = activeRole === 'admin'
  const [mobileOpen, setMobileOpen] = useState(false)

  const visible = items.filter((i) => !i.adminOnly || isAdmin)
  const canSwitchToBuyer = user?.roles.includes('buyer')

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link to="/erp" className="flex items-center gap-2 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white">
          <Building2 size={18} />
        </span>
        <div className="leading-tight">
          <p className="text-base font-extrabold">
            Build<span className="text-brand-500">Mart</span>
          </p>
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            {isAdmin ? 'Admin ERP' : 'Seller Console'}
          </p>
        </div>
      </Link>
      <nav className="flex-1 space-y-1 px-3">
        {visible.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/30'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                )
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
      <div className="space-y-2 p-3">
        {canSwitchToBuyer && (
          <Link
            to="/"
            onClick={() => setActiveRole('buyer')}
            className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <ArrowLeftRight size={18} />
            Switch to Marketplace
          </Link>
        )}
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/60">
          <img src={user?.avatar} alt={user?.name} className="h-8 w-8 rounded-full object-cover" />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen md:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:block">
        {sidebar}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-slate-950/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 max-w-[80%] bg-white dark:bg-slate-900">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 z-10 rounded-lg p-1"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
          <button
            className="focus-ring rounded-lg p-1.5 md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Store size={16} className="text-brand-500" />
            {isAdmin ? 'Administration' : 'My Storefront'}
          </div>
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 bg-slate-50 p-4 dark:bg-slate-950 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
