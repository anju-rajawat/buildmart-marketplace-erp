import { useMemo, useState } from 'react'
import { FileText, Check, X, Printer } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useCurrentUser } from '@/store/selectors'
import { formatCurrency, formatDate, humanize } from '@/lib/utils'
import { printQuotation } from '@/lib/print'
import { Badge, Button, Card, EmptyState, Input } from '@/components/ui'
import { Modal } from '@/components/ui/Modal'
import { quotationTone } from '@/components/shared/status'
import { toast } from '@/components/ui/toast'

export default function ErpQuotations() {
  const user = useCurrentUser()
  const isAdmin = useStore((s) => s.activeRole === 'admin')
  const all = useStore((s) => s.quotations)
  const users = useStore((s) => s.users)
  const sellerProfiles = useStore((s) => s.sellerProfiles)
  const setStatus = useStore((s) => s.setQuotationStatus)

  const quotations = useMemo(
    () =>
      (isAdmin ? all : all.filter((q) => q.sellerProfileId === user?.sellerProfileId)).sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      ),
    [isAdmin, all, user?.sellerProfileId],
  )

  const [quoteFor, setQuoteFor] = useState<string | null>(null)
  const [price, setPrice] = useState(0)
  const buyerName = (id: string) => users.find((u) => u.id === id)?.name ?? 'Unknown'
  const sellerName = (id: string) => sellerProfiles.find((s) => s.id === id)?.businessName ?? 'BuildMart Seller'

  if (quotations.length === 0) {
    return <EmptyState icon={<FileText size={44} />} title="No quotation requests yet" />
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Quotations (RFQ)</h1>
        <p className="text-sm text-slate-500">Respond to bulk price requests</p>
      </div>

      <div className="space-y-4">
        {quotations.map((q) => (
          <Card key={q.id} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <p className="font-semibold">{q.code}</p>
                <p className="text-xs text-slate-400">From {buyerName(q.buyerId)} · {formatDate(q.createdAt)}</p>
              </div>
              <Badge tone={quotationTone[q.status]}>{humanize(q.status)}</Badge>
            </div>
            <div className="py-3">
              {q.items.map((it) => (
                <p key={it.productId} className="text-sm">
                  <span className="font-medium">{it.quantity} {it.unit}</span> — {it.name}
                </p>
              ))}
              {q.note && <p className="mt-2 text-sm italic text-slate-500">“{q.note}”</p>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {q.quotedPrice && (
                <span className="rounded-lg bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                  Quoted: {formatCurrency(q.quotedPrice)}
                </span>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => printQuotation(q, buyerName(q.buyerId), sellerName(q.sellerProfileId))}
              >
                <Printer size={14} /> Print / PDF
              </Button>
              {q.status === 'open' && (
                <>
                  <Button size="sm" onClick={() => { setQuoteFor(q.id); setPrice(0) }}>
                    Send quote
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setStatus(q.id, 'rejected'); toast.info('Quotation rejected') }}>
                    <X size={14} /> Decline
                  </Button>
                </>
              )}
              {q.status === 'quoted' && (
                <Button size="sm" variant="outline" onClick={() => { setStatus(q.id, 'accepted'); toast.success('Marked as accepted') }}>
                  <Check size={14} /> Mark accepted
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Modal open={!!quoteFor} onClose={() => setQuoteFor(null)} title="Send quotation">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Quoted price (₹)</label>
            <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="Total quoted price" />
          </div>
          <Button
            className="w-full"
            disabled={price <= 0}
            onClick={() => {
              if (quoteFor) {
                setStatus(quoteFor, 'quoted', price)
                toast.success('Quote sent to customer')
              }
              setQuoteFor(null)
            }}
          >
            Send quote
          </Button>
        </div>
      </Modal>
    </div>
  )
}
