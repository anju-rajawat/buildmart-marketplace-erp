import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calculator as CalcIcon, Layers, BrickWall, ShoppingCart } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'
import { Button, Card, Input, Select } from '@/components/ui'
import { toast } from '@/components/ui/toast'

const FT_TO_M = 0.3048
const CEMENT_BAG_M3 = 0.0347 // volume of one 50kg bag
const DRY_FACTOR = 1.54 // wet -> dry volume
const SAND_DENSITY = 1.6 // ton / m³
const AGG_DENSITY = 1.5 // ton / m³

const MIXES: Record<string, { label: string; parts: [number, number, number] }> = {
  M15: { label: 'M15 (1:2:4) — footings, PCC', parts: [1, 2, 4] },
  M20: { label: 'M20 (1:1.5:3) — slabs, columns', parts: [1, 1.5, 3] },
  M25: { label: 'M25 (1:1:2) — heavy structural', parts: [1, 1, 2] },
}

type Tab = 'concrete' | 'brick'

export default function Calculator() {
  const navigate = useNavigate()
  const addToCart = useStore((s) => s.addToCart)
  const [tab, setTab] = useState<Tab>('concrete')

  // concrete inputs (feet)
  const [c, setC] = useState({ l: 10, w: 10, d: 0.5, mix: 'M20' })
  // brick inputs (feet)
  const [b, setB] = useState({ l: 10, h: 10, thick: '9' })

  const concrete = useMemo(() => {
    const wet = c.l * FT_TO_M * (c.w * FT_TO_M) * (c.d * FT_TO_M) // m³
    const dry = wet * DRY_FACTOR
    const [pc, ps, pa] = MIXES[c.mix].parts
    const sum = pc + ps + pa
    const cementM3 = (dry * pc) / sum
    const bags = Math.ceil(cementM3 / CEMENT_BAG_M3)
    const sandTon = +((dry * ps) / sum * SAND_DENSITY).toFixed(2)
    const aggTon = +((dry * pa) / sum * AGG_DENSITY).toFixed(2)
    return { wet: +wet.toFixed(2), cft: +(wet * 35.315).toFixed(1), bags, sandTon, aggTon }
  }, [c])

  const brick = useMemo(() => {
    const thickM = (b.thick === '9' ? 9 : 4.5) * 0.0254
    const volume = b.l * FT_TO_M * (b.h * FT_TO_M) * thickM // m³ of brickwork
    const bricks = Math.ceil(volume * 500) // ~500 std bricks per m³ incl. mortar
    const cementBags = Math.ceil(volume * 0.9) // rough mortar cement estimate
    return { bricks, cementBags, area: +(b.l * b.h).toFixed(0) }
  }, [b])

  function addMaterial(productId: string, qty: number) {
    addToCart(productId, qty)
    toast.success(`Added ${qty} to cart`)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
          <CalcIcon size={22} />
        </span>
        <div>
          <h1 className="text-2xl font-bold">Material Calculator</h1>
          <p className="text-sm text-slate-500">Estimate cement, sand, gitti & bricks for your work</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        <button
          onClick={() => setTab('concrete')}
          className={cn(
            'flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold',
            tab === 'concrete' ? 'bg-white text-brand-600 shadow dark:bg-slate-900' : 'text-slate-500',
          )}
        >
          <Layers size={16} /> Concrete
        </button>
        <button
          onClick={() => setTab('brick')}
          className={cn(
            'flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold',
            tab === 'brick' ? 'bg-white text-brand-600 shadow dark:bg-slate-900' : 'text-slate-500',
          )}
        >
          <BrickWall size={16} /> Brickwork
        </button>
      </div>

      {tab === 'concrete' ? (
        <Card className="p-5">
          <h2 className="mb-4 text-lg font-bold">Concrete (slab / footing / column)</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Length (ft)"><Input type="number" value={c.l} onChange={(e) => setC({ ...c, l: +e.target.value })} /></Field>
            <Field label="Width (ft)"><Input type="number" value={c.w} onChange={(e) => setC({ ...c, w: +e.target.value })} /></Field>
            <Field label="Depth / Thickness (ft)"><Input type="number" step="0.1" value={c.d} onChange={(e) => setC({ ...c, d: +e.target.value })} /></Field>
            <Field label="Mix grade">
              <Select value={c.mix} onChange={(e) => setC({ ...c, mix: e.target.value })}>
                {Object.entries(MIXES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </Select>
            </Field>
          </div>

          <div className="mt-5 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <p className="mb-3 text-sm text-slate-500">
              Concrete volume: <b className="text-slate-800 dark:text-slate-200">{concrete.wet} m³</b> ({concrete.cft} cft)
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <Result label="Cement" value={`${concrete.bags} bags`} onAdd={() => addMaterial('p_cement_acc_opc53', concrete.bags)} />
              <Result label="Sand (balu)" value={`${concrete.sandTon} ton`} onAdd={() => addMaterial('p_agg_river_sand', Math.max(1, Math.round(concrete.sandTon)))} />
              <Result label="Aggregate (gitti)" value={`${concrete.aggTon} ton`} onAdd={() => addMaterial('p_agg_20mm', Math.max(1, Math.round(concrete.aggTon)))} />
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-5">
          <h2 className="mb-4 text-lg font-bold">Brickwork (wall)</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Wall length (ft)"><Input type="number" value={b.l} onChange={(e) => setB({ ...b, l: +e.target.value })} /></Field>
            <Field label="Wall height (ft)"><Input type="number" value={b.h} onChange={(e) => setB({ ...b, h: +e.target.value })} /></Field>
            <Field label="Wall thickness">
              <Select value={b.thick} onChange={(e) => setB({ ...b, thick: e.target.value })}>
                <option value="4.5">4.5" (half brick)</option>
                <option value="9">9" (full brick)</option>
              </Select>
            </Field>
          </div>
          <div className="mt-5 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <p className="mb-3 text-sm text-slate-500">
              Wall area: <b className="text-slate-800 dark:text-slate-200">{brick.area} sq.ft</b>
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Result label="Bricks (eet)" value={`${brick.bricks} pcs`} onAdd={() => addMaterial('p_brick_red', brick.bricks)} />
              <Result label="Cement (mortar)" value={`${brick.cementBags} bags`} onAdd={() => addMaterial('p_cement_acc_ppc', brick.cementBags)} />
            </div>
          </div>
        </Card>
      )}

      <Button variant="outline" className="mt-5" onClick={() => navigate('/cart')}>
        <ShoppingCart size={16} /> Go to cart
      </Button>
      <p className="mt-3 text-xs text-slate-400">
        Estimates are approximate (includes ~54% dry volume & wastage). Verify with your engineer for critical work.
      </p>
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

function Result({ label, value, onAdd }: { label: string; value: string; onAdd: () => void }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-bold">{value}</p>
      <Button size="sm" className="mt-2 w-full" onClick={onAdd}>
        <ShoppingCart size={13} /> Add
      </Button>
    </div>
  )
}
