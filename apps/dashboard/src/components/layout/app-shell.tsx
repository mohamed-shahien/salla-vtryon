import { NavLink, Outlet } from 'react-router-dom'

import { useAppShell } from '@/hooks/use-app-shell'
import { logoutCurrentMerchant } from '@/lib/api'
import { navigationItems } from '@/lib/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'

export function AppShell() {
  const { mode, setMode } = useAppShell()
  const identity = useAuthStore((state) => state.identity)
  const setUnauthenticated = useAuthStore((state) => state.setUnauthenticated)

  return (
    <div className="min-h-screen px-4 py-6 text-slate-100 md:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl gap-4 rounded-[28px] border border-white/10 bg-slate-950/55 p-3 shadow-2xl shadow-sky-950/30 backdrop-blur md:grid-cols-[280px_1fr]">
        <aside className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5">
          <div className="space-y-3">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-300/80">Phase 6/7</p>
              <h1 className="mt-2 text-2xl font-semibold">
                Virtual Try-On for Salla
              </h1>
            </div>
            <p className="text-sm leading-7 text-slate-300">
              External React dashboard for merchant operations. Shopper uploads and
              try-on execution belong to the storefront widget, not this dashboard.
            </p>
          </div>

          <nav className="mt-8 space-y-2">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition',
                    isActive
                      ? 'border-sky-400/60 bg-sky-400/10 text-white'
                      : 'border-white/5 bg-white/5 text-slate-300 hover:border-white/15 hover:bg-white/8',
                  )
                }
              >
                <span>{item.label}</span>
                <span className="text-xs text-slate-400">{item.badge}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-emerald-300/80">
                  Dashboard Mode
                </p>
                <p className="mt-1 text-sm text-slate-100">{mode}</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setMode(mode === 'standalone-dev' ? 'external-oauth' : 'standalone-dev')
                }
                className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-slate-100 transition hover:border-white/20 hover:bg-white/15"
              >
                Toggle
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Auth Context
            </p>
            <p className="mt-2 text-white">merchant_id: {identity?.merchant_id ?? 'unknown'}</p>
            <p className="mt-1 text-white">user_id: {identity?.user_id ?? 'unknown'}</p>
            <p className="mt-1 text-white">store_name: {identity?.store_name ?? 'unknown'}</p>
            <p className="mt-1 text-white">plan: {identity?.merchant.plan ?? 'unknown'}</p>
            <p className="mt-1 text-white">
              credits_remaining: {identity?.credits?.remaining_credits ?? 'unknown'}
            </p>
            <button
              type="button"
              onClick={async () => {
                await logoutCurrentMerchant()
                setUnauthenticated()
              }}
              className="mt-4 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-slate-100 transition hover:border-white/20 hover:bg-white/15"
            >
              Logout
            </button>
          </div>
        </aside>

        <main className="rounded-[24px] border border-white/10 bg-slate-950/70 p-6">
          <header className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.28em] text-slate-400">
                Locked Stack
              </p>
              <h2 className="text-3xl font-semibold">
                Merchant control dashboard on top of a widget-first shopper flow
              </h2>
            </div>
            <div className="grid gap-2 text-sm text-slate-300 md:text-right">
              <span>Core API live: `GET /api/credits`, `GET /api/products`, `GET /api/jobs`, `GET /api/widget/settings`, `PUT /api/widget/settings`</span>
              <span>Background worker active: pending jobs are picked up asynchronously</span>
              <span>Storefront widget handles shopper image upload and result polling</span>
            </div>
          </header>

          <div className="mt-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
