import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Home,
  LayoutGrid,
  ShoppingCart,
  Package,
  MessageSquare,
  Search,
  Menu,
  X,
  Building2,
  Heart,
  FileText,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useCartCount, useCurrentUser } from '@/store/selectors'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './ThemeToggle'
import { NotificationBell } from './NotificationBell'
import { RoleSwitcher } from './RoleSwitcher'

const navItems = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/catalog', label: 'Catalog', icon: LayoutGrid },
  { to: '/orders', label: 'Orders', icon: Package },
  { to: '/chat', label: 'Chat', icon: MessageSquare },
]

export function MarketplaceShell() {
  const navigate = useNavigate()
  const user = useCurrentUser()
  const cartCount = useCartCount()
  const [query, setQuery] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)

  function onSearch(e: React.FormEvent) {
    e.preventDefault()
    navigate(`/catalog?q=${encodeURIComponent(query)}`)
  }

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
          <button
            className="focus-ring rounded-lg p-1.5 md:hidden"
            onClick={() => setMobileMenu(true)}
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>

          <Link to="/" className="flex shrink-0 items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white">
              <Building2 size={18} />
            </span>
            <span className="hidden text-lg font-extrabold tracking-tight sm:block">
              Build<span className="text-brand-500">Mart</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="ml-4 hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Search */}
          <form onSubmit={onSearch} className="relative ml-auto hidden max-w-md flex-1 sm:block">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search cement, steel, tiles…"
              className="focus-ring h-10 w-full rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          </form>

          <div className="ml-auto flex items-center gap-1 sm:ml-2">
            <RoleSwitcher />
            <ThemeToggle />
            <NotificationBell />
            <Link
              to="/cart"
              className="focus-ring relative rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Cart"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to="/account" className="ml-1 hidden sm:block">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="h-8 w-8 rounded-full border border-slate-200 object-cover dark:border-slate-700"
              />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium',
                  isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500',
                )
              }
            >
              <Icon size={20} />
              {item.label}
            </NavLink>
          )
        })}
        <Link
          to="/cart"
          className="relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-slate-500"
        >
          <ShoppingCart size={20} />
          Cart
          {cartCount > 0 && (
            <span className="absolute right-5 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
              {cartCount}
            </span>
          )}
        </Link>
      </nav>

      {/* Mobile slide-in menu */}
      {mobileMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-slate-950/50" onClick={() => setMobileMenu(false)} />
          <div className="absolute left-0 top-0 h-full w-72 max-w-[80%] bg-white p-5 dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-lg font-extrabold">
                Build<span className="text-brand-500">Mart</span>
              </span>
              <button onClick={() => setMobileMenu(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {[
                ...navItems,
                { to: '/wishlist', label: 'Wishlist', icon: Heart },
                { to: '/quotations', label: 'Quotations (RFQ)', icon: FileText },
                { to: '/account', label: 'My Account', icon: Building2 },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={(item as { end?: boolean }).end}
                    onClick={() => setMobileMenu(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
                        isActive
                          ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800',
                      )
                    }
                  >
                    <Icon size={18} />
                    {item.label}
                  </NavLink>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
