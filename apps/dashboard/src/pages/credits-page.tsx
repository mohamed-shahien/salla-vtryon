import { Panel } from '@/components/ui/panel'

export function CreditsPage() {
  return (
    <Panel
      eyebrow="Credits"
      title="Credit shell only"
      description="The credit model is locked in docs, but no ledger or balance logic is implemented during Phase 0."
    >
      <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm leading-7 text-slate-300">
        Later phases will enforce atomic deductions, refunds on AI failure, and
        subscription-driven resets. The dashboard keeps this page reserved so its
        route structure is stable from the start.
      </div>
    </Panel>
  )
}
