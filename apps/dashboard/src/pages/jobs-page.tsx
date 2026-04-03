import { Panel } from '@/components/ui/panel'

export function JobsPage() {
  return (
    <Panel
      eyebrow="Jobs"
      title="Job history page placeholder"
      description="Phase 0 keeps the route and layout only. Realtime job tables and filters wait for the API and database phases."
    >
      <div className="grid gap-3 text-sm text-slate-300 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          Future source: `tryon_jobs`
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          Future transport: API + Supabase Realtime
        </div>
      </div>
    </Panel>
  )
}
