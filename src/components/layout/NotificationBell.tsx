import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, PackageCheck, MessageSquare, AlertTriangle, Info } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { useCurrentUser } from '@/store/selectors'
import { timeAgo } from '@/lib/utils'
import type { NotificationKind } from '@/types'

const kindIcon: Record<NotificationKind, JSX.Element> = {
  order: <PackageCheck size={16} className="text-emerald-500" />,
  chat: <MessageSquare size={16} className="text-blue-500" />,
  stock: <AlertTriangle size={16} className="text-amber-500" />,
  system: <Info size={16} className="text-slate-500" />,
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const user = useCurrentUser()
  const notifications = useStore((s) =>
    s.notifications.filter((n) => n.userId === user?.id).slice(0, 8),
  )
  const markAll = useStore((s) => s.markAllNotificationsRead)
  const markRead = useStore((s) => s.markNotificationRead)
  const unread = notifications.filter((n) => !n.read).length

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="focus-ring relative rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute right-0 z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <span className="text-sm font-semibold">Notifications</span>
                {user && unread > 0 && (
                  <button
                    onClick={() => markAll(user.id)}
                    className="text-xs font-medium text-brand-600 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 && (
                  <p className="px-4 py-8 text-center text-sm text-slate-400">No notifications</p>
                )}
                {notifications.map((n) => (
                  <Link
                    key={n.id}
                    to={n.link ?? '#'}
                    onClick={() => {
                      markRead(n.id)
                      setOpen(false)
                    }}
                    className="flex gap-3 border-b border-slate-50 px-4 py-3 transition-colors hover:bg-slate-50 dark:border-slate-800/60 dark:hover:bg-slate-800/60"
                  >
                    <div className="mt-0.5">{kindIcon[n.kind]}</div>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-sm font-medium">
                        {n.title}
                        {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />}
                      </p>
                      <p className="truncate text-xs text-slate-500">{n.body}</p>
                      <p className="mt-0.5 text-[11px] text-slate-400">{timeAgo(n.createdAt)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
