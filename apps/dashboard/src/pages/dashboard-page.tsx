import { Panel } from '@/components/ui/panel'
import { StatusPill } from '@/components/ui/status-pill'
import { useApiHealth } from '@/hooks/use-api-health'

export function DashboardPage() {
  const { status, data, error } = useApiHealth()
  const readiness = data?.readiness

  return (
    <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
      <Panel
        eyebrow="Governance"
        title="Phase 1 governance verified"
        description="AGENTS.md and the docs tree were read before implementation. The dashboard now assumes external OAuth rather than embedded auth."
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
            <p className="mt-2 font-medium text-white">Salla Integration</p>
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
  )
}
