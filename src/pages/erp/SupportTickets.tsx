import { useState } from 'react'
import { LifeBuoy, MessageCircle } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { supportTickets as seedTickets } from '@/data/erp'
import { formatDate, humanize } from '@/lib/utils'
import { whatsapp } from '@/lib/whatsapp'
import { Badge, Button, Card, Select, Stat } from '@/components/ui'
import type { SupportTicket, TicketPriority, TicketStatus } from '@/types'

const statusTone: Record<TicketStatus, 'blue' | 'amber' | 'green' | 'gray'> = {
  open: 'blue',
  in_progress: 'amber',
  resolved: 'green',
  closed: 'gray',
}
const prioTone: Record<TicketPriority, 'red' | 'amber' | 'gray'> = {
  high: 'red',
  medium: 'amber',
  low: 'gray',
}

export default function SupportTickets() {
  const users = useStore((s) => s.users)
  const [tickets, setTickets] = useState<SupportTicket[]>(seedTickets)
  const [filter, setFilter] = useState<TicketStatus | 'all'>('all')

  const userName = (id: string) => users.find((u) => u.id === id)?.name ?? '—'
  const list = filter === 'all' ? tickets : tickets.filter((t) => t.status === filter)
  const setStatus = (id: string, status: TicketStatus) =>
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Support Tickets</h1>
        <p className="text-sm text-slate-500">{tickets.length} customer queries</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Open" value={String(tickets.filter((t) => t.status === 'open').length)} icon={<LifeBuoy size={18} />} tone="blue" />
        <Stat label="In progress" value={String(tickets.filter((t) => t.status === 'in_progress').length)} icon={<LifeBuoy size={18} />} tone="amber" />
        <Stat label="Resolved" value={String(tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length)} icon={<LifeBuoy size={18} />} tone="green" />
      </div>

      <Select value={filter} onChange={(e) => setFilter(e.target.value as TicketStatus | 'all')} className="w-44">
        <option value="all">All statuses</option>
        <option value="open">Open</option>
        <option value="in_progress">In progress</option>
        <option value="resolved">Resolved</option>
        <option value="closed">Closed</option>
      </Select>

      <div className="space-y-4">
        {list.map((t) => {
          const u = users.find((x) => x.id === t.userId)
          return (
            <Card key={t.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <div>
                  <p className="flex items-center gap-2 font-semibold">
                    {t.code}
                    <Badge tone={prioTone[t.priority]}>{humanize(t.priority)}</Badge>
                  </p>
                  <p className="text-xs text-slate-400">From {userName(t.userId)} · {formatDate(t.createdAt)}</p>
                </div>
                <Badge tone={statusTone[t.status]}>{humanize(t.status)}</Badge>
              </div>
              <p className="py-3 text-sm font-medium">{t.subject}</p>
              <p className="-mt-2 pb-3 text-sm text-slate-500">{t.body}</p>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={t.status} onChange={(e) => setStatus(t.id, e.target.value as TicketStatus)} className="h-8 w-36 text-xs">
                  <option value="open">Open</option>
                  <option value="in_progress">In progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </Select>
                {u && (
                  <Button size="sm" variant="outline" onClick={() => window.open(whatsapp.deepLink(u.phone, `Hi ${u.name}, regarding ${t.code}…`), '_blank')}>
                    <MessageCircle size={14} className="text-green-500" /> Reply on WhatsApp
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>
      <p className="text-xs text-slate-400">Demo note: ticket status changes are session-only.</p>
    </div>
  )
}
