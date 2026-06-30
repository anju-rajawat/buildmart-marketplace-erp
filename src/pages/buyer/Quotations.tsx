import { FileText } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useCurrentUser } from '@/store/selectors'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge, Card, EmptyState } from '@/components/ui'
import { quotationTone } from '@/components/shared/status'
import { humanize } from '@/lib/utils'

export default function Quotations() {
  const user = useCurrentUser()
  const quotations = useStore((s) =>
    s.quotations.filter((q) => q.buyerId === user?.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  )
  const sellerProfiles = useStore((s) => s.sellerProfiles)

  if (quotations.length === 0) {
    return (
      <EmptyState
        icon={<FileText size={48} />}
        title="No quotation requests"
        description="Request a bulk quote from any product page to negotiate the best price."
      />
    )
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">My quotations (RFQ)</h1>
      <p className="mb-6 text-sm text-slate-500">Bulk price requests sent to sellers.</p>
      <div className="space-y-4">
        {quotations.map((q) => {
          const seller = sellerProfiles.find((s) => s.id === q.sellerProfileId)
          return (
            <Card key={q.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <div>
                  <p className="font-semibold">{q.code}</p>
                  <p className="text-xs text-slate-400">
                    To {seller?.businessName} · {formatDate(q.createdAt)}
                  </p>
                </div>
                <Badge tone={quotationTone[q.status]}>{humanize(q.status)}</Badge>
              </div>
              <div className="py-3">
                {q.items.map((it) => (
                  <p key={it.productId} className="text-sm">
                    <span className="font-medium">{it.quantity} {it.unit}</span> — {it.name}
                  </p>
                ))}
                {q.note && <p className="mt-2 text-sm text-slate-500">“{q.note}”</p>}
              </div>
              {q.quotedPrice && (
                <div className="rounded-xl bg-brand-50 px-4 py-2 text-sm dark:bg-brand-500/10">
                  Seller quoted:{' '}
                  <span className="font-bold text-brand-700 dark:text-brand-300">
                    {formatCurrency(q.quotedPrice)}
                  </span>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
