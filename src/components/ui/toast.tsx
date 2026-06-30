import { create } from 'zustand'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, XCircle } from 'lucide-react'
import { uid } from '@/lib/utils'

type ToastTone = 'success' | 'error' | 'info'
interface Toast {
  id: string
  message: string
  tone: ToastTone
}

interface ToastState {
  toasts: Toast[]
  push: (message: string, tone?: ToastTone) => void
  dismiss: (id: string) => void
}

const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (message, tone = 'success') => {
    const id = uid('toast')
    set((s) => ({ toasts: [...s.toasts, { id, message, tone }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3000)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

/** Imperative helper usable anywhere. */
export const toast = {
  success: (m: string) => useToastStore.getState().push(m, 'success'),
  error: (m: string) => useToastStore.getState().push(m, 'error'),
  info: (m: string) => useToastStore.getState().push(m, 'info'),
}

const icons = {
  success: <CheckCircle2 size={18} className="text-emerald-500" />,
  error: <XCircle size={18} className="text-red-500" />,
  info: <Info size={18} className="text-blue-500" />,
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => dismiss(t.id)}
            className="pointer-events-auto flex w-full max-w-sm cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-lg dark:border-slate-700 dark:bg-slate-800"
          >
            {icons[t.tone]}
            <span className="font-medium">{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
