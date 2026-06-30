import { useEffect, useMemo, useRef, useState } from 'react'
import { Send, MessageSquare, ArrowLeft, Phone, ExternalLink } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useCurrentUser } from '@/store/selectors'
import { whatsapp } from '@/lib/whatsapp'
import { cn, timeAgo } from '@/lib/utils'
import { Badge, Button, EmptyState } from '@/components/ui'
import { toast } from '@/components/ui/toast'

/**
 * Unified chat: in-app + WhatsApp threads in one place.
 * WhatsApp threads send through the (mock) WhatsAppProvider and expose a real wa.me deep link.
 */
export default function Chat() {
  const user = useCurrentUser()
  const threads = useStore((s) => s.chatThreads)
  const messages = useStore((s) => s.chatMessages)
  const users = useStore((s) => s.users)
  const sendMessage = useStore((s) => s.sendMessage)
  const markThreadRead = useStore((s) => s.markThreadRead)

  const myThreads = useMemo(
    () =>
      threads
        .filter((t) => t.participantIds.includes(user?.id ?? ''))
        .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt)),
    [threads, user?.id],
  )

  const [activeId, setActiveId] = useState<string | null>(myThreads[0]?.id ?? null)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  const active = myThreads.find((t) => t.id === activeId)
  const thread = active
  const threadMessages = messages
    .filter((m) => m.threadId === activeId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  const other = thread
    ? users.find((u) => thread.participantIds.includes(u.id) && u.id !== user?.id)
    : undefined

  useEffect(() => {
    if (activeId && user) markThreadRead(activeId, user.id)
  }, [activeId, threadMessages.length, user, markThreadRead])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [threadMessages.length, activeId])

  async function handleSend() {
    if (!draft.trim() || !activeId || !user) return
    const body = draft.trim()
    setDraft('')
    sendMessage(activeId, user.id, body)
    // If WhatsApp channel, push through provider
    if (thread?.channel === 'whatsapp' && thread.whatsappPhone) {
      setSending(true)
      try {
        await whatsapp.send({ to: thread.whatsappPhone, body })
      } finally {
        setSending(false)
      }
    }
  }

  if (myThreads.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare size={48} />}
        title="No conversations yet"
        description="Start a chat from any product page — in-app or via WhatsApp."
      />
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-4 text-2xl font-bold">Messages</h1>
      <div className="card grid h-[70vh] grid-cols-1 overflow-hidden md:grid-cols-[300px_1fr]">
        {/* Thread list */}
        <aside
          className={cn(
            'flex flex-col border-r border-slate-200 dark:border-slate-800',
            activeId ? 'hidden md:flex' : 'flex',
          )}
        >
          <div className="border-b border-slate-100 p-3 text-sm font-semibold dark:border-slate-800">
            Conversations
          </div>
          <div className="flex-1 overflow-y-auto">
            {myThreads.map((t) => {
              const o = users.find((u) => t.participantIds.includes(u.id) && u.id !== user?.id)
              const last = messages
                .filter((m) => m.threadId === t.id)
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
              const unread = messages.filter(
                (m) => m.threadId === t.id && m.senderId !== user?.id && !m.read,
              ).length
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveId(t.id)}
                  className={cn(
                    'flex w-full items-center gap-3 border-b border-slate-50 p-3 text-left transition-colors hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-800/50',
                    activeId === t.id && 'bg-brand-50 dark:bg-brand-500/10',
                  )}
                >
                  <img src={o?.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{o?.name}</p>
                      {t.channel === 'whatsapp' && <Badge tone="green">WA</Badge>}
                    </div>
                    <p className="truncate text-xs text-slate-400">{last?.body ?? t.subject}</p>
                  </div>
                  {unread > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
                      {unread}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </aside>

        {/* Conversation */}
        <section className={cn('flex flex-col', !activeId && 'hidden md:flex')}>
          {thread && (
            <>
              <div className="flex items-center gap-3 border-b border-slate-100 p-3 dark:border-slate-800">
                <button className="md:hidden" onClick={() => setActiveId(null)} aria-label="Back">
                  <ArrowLeft size={18} />
                </button>
                <img src={other?.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{other?.name}</p>
                  <p className="truncate text-xs text-slate-400">{thread.subject}</p>
                </div>
                {thread.channel === 'whatsapp' && thread.whatsappPhone && (
                  <a
                    href={whatsapp.deepLink(thread.whatsappPhone, '')}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => toast.info('Opening WhatsApp…')}
                    className="flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-300"
                  >
                    <Phone size={14} /> WhatsApp <ExternalLink size={12} />
                  </a>
                )}
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto bg-slate-50/50 p-4 dark:bg-slate-950/30">
                {threadMessages.map((m) => {
                  const mine = m.senderId === user?.id
                  return (
                    <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                      <div
                        className={cn(
                          'max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm',
                          mine
                            ? 'rounded-br-sm bg-brand-500 text-white'
                            : 'rounded-bl-sm bg-white dark:bg-slate-800',
                        )}
                      >
                        <p>{m.body}</p>
                        <p className={cn('mt-0.5 text-[10px]', mine ? 'text-white/70' : 'text-slate-400')}>
                          {m.channel === 'whatsapp' ? 'WhatsApp · ' : ''}
                          {timeAgo(m.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={endRef} />
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="flex items-center gap-2 border-t border-slate-100 p-3 dark:border-slate-800"
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={thread.channel === 'whatsapp' ? 'Message via WhatsApp…' : 'Type a message…'}
                  className="focus-ring h-10 flex-1 rounded-xl border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
                <Button type="submit" size="icon" disabled={sending}>
                  <Send size={16} />
                </Button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
