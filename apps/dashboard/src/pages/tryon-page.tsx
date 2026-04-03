import { Panel } from '@/components/ui/panel'

export function TryOnPage() {
  return (
    <Panel
      eyebrow="Try-On Flow"
      title="Wizard scaffolding reserved for later phases"
      description="This route exists only to lock navigation, page boundaries, and the future shell for the merchant-facing try-on wizard."
    >
      <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-5 text-sm leading-7 text-slate-300">
        Phase 1 and beyond will add Salla auth, product loading, upload validation,
        credits, and async job orchestration. None of that starts in this scaffold.
      </div>
    </Panel>
  )
}
