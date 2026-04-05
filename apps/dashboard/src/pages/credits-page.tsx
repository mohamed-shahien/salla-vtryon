import { useEffect, useState } from 'react'

import { Panel } from '@/components/ui/panel'
import { fetchMerchantCredits, type MerchantCreditsSummary } from '@/lib/api'

function formatSignedAmount(amount: number) {
  return amount > 0 ? `+${amount}` : String(amount)
}

export function CreditsPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'failed'>('idle')
  const [summary, setSummary] = useState<MerchantCreditsSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadCredits() {
      setStatus('loading')
      setError(null)

      try {
        const response = await fetchMerchantCredits(30)

        if (!active) {
          return
        }

        setSummary(response.data)
        setStatus('ready')
      } catch (loadError) {
        if (!active) {
          return
        }

        setSummary(null)
        setStatus('failed')
        setError(loadError instanceof Error ? loadError.message : 'Failed to load credits.')
      }
    }

    void loadCredits()

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="space-y-5">
      <Panel
        eyebrow="Credits"
        title="Live credit balance and ledger"
        description="Phase 3 now exposes a real credit ledger from `credit_transactions`. Every debit, refund, reset, and future top-up should appear here."
      >
        {error ? (
          <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">
            {error}
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-slate-400">Total Credits</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {summary?.balance?.total_credits ?? '—'}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-slate-400">Used Credits</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {summary?.balance?.used_credits ?? '—'}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-slate-400">Remaining</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {summary?.balance?.remaining_credits ?? '—'}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-slate-400">Last Reset</p>
            <p className="mt-2 text-sm font-medium text-white">
              {summary?.balance?.reset_at
                ? new Date(summary.balance.reset_at).toLocaleString()
                : 'not yet'}
            </p>
          </div>
        </div>
      </Panel>

      <Panel
        eyebrow="Ledger"
        title="Recent credit transactions"
        description="This list comes directly from `credit_transactions` and is ordered by newest first."
      >
        {status === 'loading' ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
            Loading credit history...
          </div>
        ) : null}

        <div className="space-y-3">
          {summary?.transactions.length ? (
            summary.transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="rounded-3xl border border-white/10 bg-black/20 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{transaction.reason ?? transaction.type}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {new Date(transaction.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-semibold ${
                        transaction.amount > 0 ? 'text-emerald-200' : 'text-amber-100'
                      }`}
                    >
                      {formatSignedAmount(transaction.amount)}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                      {transaction.type}
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-sm text-slate-300">
                  Job: {transaction.job_id ?? 'none'}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-slate-400">
              No credit transactions have been recorded yet for this merchant.
            </div>
          )}
        </div>
      </Panel>
    </div>
  )
}
