import { Panel } from '@/components/ui/panel'

export function SettingsPage() {
  return (
    <Panel
      eyebrow="Settings"
      title="Widget settings shell"
      description="This stub reserves the merchant configuration surface for widget mode, product selection, and button text in later phases."
    >
      <div className="space-y-3 text-sm text-slate-300">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          Widget enablement is not wired yet.
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          Selected-product logic is intentionally deferred beyond Phase 0.
        </div>
      </div>
    </Panel>
  )
}
