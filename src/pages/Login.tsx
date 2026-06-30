import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  ShieldCheck,
  ShoppingBag,
  Eye,
  EyeOff,
  Lock,
  User as UserIcon,
  AlertCircle,
  LogIn,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { authenticate } from '@/data/auth'
import { Button } from '@/components/ui'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { cn } from '@/lib/utils'

type Mode = 'user' | 'admin'

const modeMeta: Record<Mode, { label: string; sub: string; icon: JSX.Element; hint: { id: string; pw: string } }> = {
  user: {
    label: 'User',
    sub: 'Buy & track materials',
    icon: <ShoppingBag size={16} />,
    hint: { id: 'user', pw: 'user123' },
  },
  admin: {
    label: 'Admin',
    sub: 'Sell & manage (ERP)',
    icon: <ShieldCheck size={16} />,
    hint: { id: 'admin', pw: 'admin123' },
  },
}

export default function Login() {
  const navigate = useNavigate()
  const login = useStore((s) => s.login)

  const [mode, setMode] = useState<Mode>('user')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')

  function switchMode(m: Mode) {
    setMode(m)
    setError('')
    setUsername('')
    setPassword('')
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const cred = authenticate(mode, username, password)
    if (!cred) {
      setError('Invalid ID or password for the selected panel.')
      return
    }
    login(cred.userId, cred.role)
    navigate(cred.role === 'buyer' ? '/' : '/erp')
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-brand-900/40 text-white">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      {/* decorative blueprint grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-12">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 shadow-lg shadow-brand-500/30">
            <Building2 size={28} />
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Build<span className="text-brand-400">Mart</span>
          </h1>
          <p className="mt-2 text-sm text-slate-300">Construction Materials Marketplace + ERP</p>
        </div>

        {/* Card */}
        <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          {/* Mode tabs */}
          <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-black/20 p-1">
            {(['user', 'admin'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                  mode === m
                    ? 'bg-brand-500 text-white shadow'
                    : 'text-slate-300 hover:bg-white/5',
                )}
              >
                <span className="flex items-center gap-1.5">
                  {modeMeta[m].icon}
                  {modeMeta[m].label}
                </span>
                <span className={cn('text-[11px] font-normal', mode === m ? 'text-white/80' : 'text-slate-400')}>
                  {modeMeta[m].sub}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {/* ID */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                {mode === 'admin' ? 'Admin ID' : 'User ID'}
              </label>
              <div className="relative">
                <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    setError('')
                  }}
                  placeholder={mode === 'admin' ? 'Enter admin ID' : 'Enter user ID'}
                  autoComplete="username"
                  className="h-11 w-full rounded-xl border border-white/15 bg-white/5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="h-11 w-full rounded-xl border border-white/15 bg-white/5 pl-9 pr-10 text-sm text-white placeholder:text-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-300">
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full">
              <LogIn size={18} />
              Sign in as {modeMeta[mode].label}
            </Button>
          </form>

          {/* Credential hint */}
          <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-slate-400">
            <p className="mb-1 font-semibold text-slate-300">Demo {modeMeta[mode].label} credentials</p>
            <p>
              ID: <span className="font-mono text-brand-300">{modeMeta[mode].hint.id}</span>
              {'   ·   '}
              Password: <span className="font-mono text-brand-300">{modeMeta[mode].hint.pw}</span>
            </p>
            <button
              type="button"
              onClick={() => {
                setUsername(modeMeta[mode].hint.id)
                setPassword(modeMeta[mode].hint.pw)
                setError('')
              }}
              className="mt-2 font-medium text-brand-400 hover:underline"
            >
              Autofill credentials
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Frontend-only demo · credentials stored statically · data persisted to localStorage
        </p>
      </div>
    </div>
  )
}
