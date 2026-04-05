import { Panel } from '@/components/ui/panel'
import { StatusPill } from '@/components/ui/status-pill'
import { useApiHealth } from '@/hooks/use-api-health'
import { useAuthStore } from '@/stores/auth-store'

export function DashboardPage() {
  const { status, data, error } = useApiHealth()
  const readiness = data?.readiness
  const identity = useAuthStore((state) => state.identity)
  const grantedScope = identity?.salla_profile?.context?.scope ?? null
  const scopeTokens = grantedScope?.split(/\s+/).filter(Boolean) ?? []
  const hasProductsAccess =
    scopeTokens.includes('products.read') || scopeTokens.includes('products.read_write')
  const widgetSettings =
    identity?.merchant.settings && typeof identity.merchant.settings === 'object'
      ? identity.merchant.settings
      : null

  return (
    <div className="space-y-5">
      <Panel
        eyebrow="Connected Store"
        title="Store profile from Salla and our platform"
        description="This snapshot confirms that the merchant finished Salla OAuth and the dashboard session is currently attached to a real store."
      >
        <div className="grid gap-3 text-sm text-slate-300 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-slate-400">Store Name</p>
            <p className="mt-2 font-medium text-white">
              {identity?.salla_profile?.merchant.name ?? identity?.store_name ?? 'unknown'}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-slate-400">merchant_id</p>
            <p className="mt-2 font-medium text-white">{identity?.merchant_id ?? 'unknown'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-slate-400">Owner Email</p>
            <p className="mt-2 font-medium text-white">
              {identity?.salla_profile?.email ?? 'unknown'}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-slate-400">Credits Remaining</p>
            <p className="mt-2 font-medium text-white">
              {identity?.credits?.remaining_credits ?? 'unknown'}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-sky-300/80">
                  Merchant Snapshot
                </p>
                <h4 className="mt-2 text-lg font-semibold text-white">
                  {identity?.merchant.store_name ?? identity?.store_name ?? 'Unknown Store'}
                </h4>
                <p className="mt-1 text-sm text-slate-400">
                  local uuid: {identity?.merchant.id ?? 'unknown'}
                </p>
              </div>
              {identity?.salla_profile?.merchant.avatar ? (
                <img
                  src={identity.salla_profile.merchant.avatar}
                  alt={identity.salla_profile.merchant.name}
                  className="h-16 w-16 rounded-2xl border border-white/10 object-cover"
                />
              ) : null}
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-slate-400">Plan</p>
                <p className="mt-2 font-medium text-white">{identity?.merchant.plan ?? 'unknown'}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-slate-400">Plan Status</p>
                <div className="mt-2">
                  <StatusPill
                    ok={identity?.merchant.plan_status === 'active'}
                    label={identity?.merchant.plan_status ?? 'unknown'}
                  />
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-slate-400">Store Username</p>
                <p className="mt-2 font-medium text-white">
                  {identity?.salla_profile?.merchant.username ?? 'unknown'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-slate-400">Owner Mobile</p>
                <p className="mt-2 font-medium text-white">
                  {identity?.salla_profile?.mobile ?? 'unknown'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-slate-400">Installed At</p>
                <p className="mt-2 font-medium text-white">
                  {identity?.merchant.installed_at
                    ? new Date(identity.merchant.installed_at).toLocaleString()
                    : 'unknown'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-slate-400">Session Expires</p>
                <p className="mt-2 font-medium text-white">
                  {identity?.exp ? new Date(identity.exp).toLocaleString() : 'unknown'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-sky-300/80">
              Widget Settings
            </p>
            <div className="mt-4 grid gap-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-slate-400">Enabled</p>
                <div className="mt-2">
                  <StatusPill
                    ok={Boolean(widgetSettings && widgetSettings.widget_enabled)}
                    label={widgetSettings?.widget_enabled ? 'enabled' : 'disabled'}
                  />
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-slate-400">Widget Mode</p>
                <p className="mt-2 font-medium text-white">
                  {typeof widgetSettings?.widget_mode === 'string'
                    ? widgetSettings.widget_mode
                    : 'unknown'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-slate-400">Button Text</p>
                <p className="mt-2 font-medium text-white">
                  {typeof widgetSettings?.widget_button_text === 'string'
                    ? widgetSettings.widget_button_text
                    : 'unknown'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-slate-400">Default Category</p>
                <p className="mt-2 font-medium text-white">
                  {typeof widgetSettings?.default_category === 'string'
                    ? widgetSettings.default_category
                    : 'unknown'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-slate-400">Selected Products</p>
                <p className="mt-2 font-medium text-white">
                  {Array.isArray(widgetSettings?.widget_products)
                    ? widgetSettings.widget_products.length
                    : 'unknown'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/70 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-sky-300/80">
                OAuth Scope Snapshot
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Current granted scope from Salla:
              </p>
              <p className="mt-2 font-medium text-white">
                {grantedScope ?? 'unknown'}
              </p>
            </div>
            <StatusPill
              ok={hasProductsAccess}
              label={hasProductsAccess ? 'products access granted' : 'products access missing'}
            />
          </div>

          {!hasProductsAccess ? (
            <div className="mt-4 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm leading-7 text-amber-50">
              `GET /api/products` will keep failing until the Salla app itself is granted
              `products.read` or `products.read_write`, then the merchant re-authorizes.
            </div>
          ) : null}

          <p className="text-xs uppercase tracking-[0.24em] text-sky-300/80">Raw Auth Snapshot</p>
          <pre className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-xs leading-6 text-slate-300">
            {JSON.stringify(identity, null, 2)}
          </pre>
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
      <Panel
        eyebrow="Governance"
        title="Merchant control and shopper execution are now separated"
        description="AGENTS.md and the docs tree were read before implementation. The dashboard is now steering widget settings, product eligibility, credits, and jobs, while shopper uploads belong to the storefront widget."
      >
        <div className="grid gap-3 text-sm text-slate-300 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-slate-400">Stack</p>
            <p className="mt-2 font-medium text-white">Locked</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-slate-400">Architecture</p>
            <p className="mt-2 font-medium text-white">Hybrid</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-slate-400">Current Phase</p>
            <p className="mt-2 font-medium text-white">Dashboard Controls + Storefront Widget</p>
          </div>
        </div>
      </Panel>

      <Panel
        eyebrow="Environment"
        title="Infrastructure readiness snapshot"
        description="This panel reads the backend health endpoint and shows which external integrations are configured for the external dashboard flow."
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill ok={status === 'ready'} label={status} />
            {data ? (
              <span className="text-sm text-slate-400">
                Last backend response: {new Date(data.timestamp).toLocaleString()}
              </span>
            ) : null}
          </div>

          {status === 'failed' ? (
            <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">
              {error}
            </div>
          ) : null}

          <div className="grid gap-3 text-sm text-slate-300 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <span>Salla credentials</span>
                <StatusPill ok={Boolean(readiness?.salla.configured)} label={readiness?.salla.configured ? 'ready' : 'missing'} />
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <span>Supabase project</span>
                <StatusPill ok={Boolean(readiness?.supabase.configured)} label={readiness?.supabase.configured ? 'ready' : 'missing'} />
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <span>Replicate token</span>
                <StatusPill ok={Boolean(readiness?.replicate.configured)} label={readiness?.replicate.configured ? 'ready' : 'missing'} />
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <span>Bunny storage/CDN</span>
                <StatusPill ok={Boolean(readiness?.bunny.configured)} label={readiness?.bunny.configured ? 'ready' : 'missing'} />
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 md:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <span>App secrets</span>
                <StatusPill ok={Boolean(readiness?.app.configured)} label={readiness?.app.configured ? 'ready' : 'missing'} />
              </div>
            </div>
          </div>
        </div>
      </Panel>
      </div>
    </div>
  )
}
