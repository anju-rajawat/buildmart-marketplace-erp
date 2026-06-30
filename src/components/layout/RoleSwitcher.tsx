import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ShieldCheck, Store, ShoppingBag } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { useCurrentUser } from '@/store/selectors'
import { cn, humanize } from '@/lib/utils'
import type { Role } from '@/types'

const roleIcon: Record<Role, JSX.Element> = {
  admin: <ShieldCheck size={15} />,
  seller: <Store size={15} />,
  buyer: <ShoppingBag size={15} />,
}

/** Lets a user with multiple roles switch their active context. */
export function RoleSwitcher() {
  const navigate = useNavigate()
  const user = useCurrentUser()
  const activeRole = useStore((s) => s.activeRole)
  const setActiveRole = useStore((s) => s.setActiveRole)
  const [open, setOpen] = useState(false)

  if (!user || user.roles.length < 2 || !activeRole) return null

  function pick(role: Role) {
    setActiveRole(role)
    setOpen(false)
    if (role === 'buyer') navigate('/')
    else navigate('/erp')
  }

  return (
    <div className="relative hidden sm:block">
      <button
        onClick={() => setOpen((o) => !o)}
        className="focus-ring flex items-center gap-1.5 rounded-xl border border-slate-300 px-2.5 py-2 text-xs font-medium dark:border-slate-700"
      >
        {roleIcon[activeRole]}
        <span className="hidden lg:inline">{humanize(activeRole)}</span>
        <ChevronDown size={14} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="absolute right-0 z-40 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900"
            >
              <p className="px-3 py-1.5 text-[11px] font-semibold uppercase text-slate-400">
                Switch role
              </p>
              {user.roles.map((role) => (
                <button
                  key={role}
                  onClick={() => pick(role)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm',
                    role === activeRole
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800',
                  )}
                >
                  {roleIcon[role]}
                  {humanize(role)}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
