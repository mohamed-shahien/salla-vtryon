import { useEffect, useState } from 'react'

import { Panel } from '@/components/ui/panel'
import {
  fetchMerchantJob,
  fetchMerchantJobs,
  type TryOnJob,
  type TryOnJobStatus,
} from '@/lib/api'

const STATUS_OPTIONS: Array<{ value: TryOnJobStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'canceled', label: 'Canceled' },
]

function getStatusClasses(status: TryOnJobStatus) {
  switch (status) {
    case 'completed':
      return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100'
    case 'failed':
    case 'canceled':
      return 'border-amber-300/30 bg-amber-300/10 text-amber-100'
    case 'processing':
      return 'border-sky-300/30 bg-sky-400/10 text-sky-100'
    default:
      return 'border-white/10 bg-white/5 text-slate-200'
  }
}

export function JobsPage() {
  const [statusFilter, setStatusFilter] = useState<TryOnJobStatus | 'all'>('all')
  const [jobsStatus, setJobsStatus] = useState<'idle' | 'loading' | 'ready' | 'failed'>('idle')
  const [jobs, setJobs] = useState<TryOnJob[]>([])
  const [jobsError, setJobsError] = useState<string | null>(null)
  const [selectedJob, setSelectedJob] = useState<TryOnJob | null>(null)
  const [selectedJobStatus, setSelectedJobStatus] = useState<'idle' | 'loading' | 'ready' | 'failed'>('idle')
  const [refreshTick, setRefreshTick] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRefreshTick((current) => current + 1)
    }, 5000)

    return () => {
      window.clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    let active = true

    async function loadJobs() {
      setJobsStatus('loading')
      setJobsError(null)

      try {
        const response = await fetchMerchantJobs({
          page: 1,
          limit: 20,
          status: statusFilter === 'all' ? undefined : statusFilter,
        })

        if (!active) {
          return
        }

        setJobs(response.data)
        setJobsStatus('ready')

        if (response.data.length === 0) {
          setSelectedJob(null)
          setSelectedJobStatus('idle')
          return
        }

        setSelectedJobStatus('loading')
        const detail = await fetchMerchantJob(response.data[0].id)

        if (!active) {
          return
        }

        setSelectedJob(detail.data)
        setSelectedJobStatus('ready')
      } catch (error) {
        if (!active) {
          return
        }

        setJobs([])
        setSelectedJob(null)
        setSelectedJobStatus('failed')
        setJobsStatus('failed')
        setJobsError(error instanceof Error ? error.message : 'Failed to load merchant jobs.')
      }
    }

    void loadJobs()

    return () => {
      active = false
    }
  }, [refreshTick, statusFilter])

  async function handleSelectJob(jobId: string) {
    setSelectedJobStatus('loading')

    try {
      const detail = await fetchMerchantJob(jobId)
      setSelectedJob(detail.data)
      setSelectedJobStatus('ready')
    } catch (error) {
      setSelectedJob(null)
      setSelectedJobStatus('failed')
      setJobsError(error instanceof Error ? error.message : 'Failed to load the selected job.')
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
      <Panel
        eyebrow="Jobs"
        title="Pending and historical try-on jobs"
        description="The dashboard now reads live records from `tryon_jobs` while the background worker moves jobs through processing, completion, or failure."
      >
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatusFilter(option.value)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                statusFilter === option.value
                  ? 'border-sky-300/40 bg-sky-400/15 text-sky-100'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {jobsError ? (
          <div className="mt-4 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">
            {jobsError}
          </div>
        ) : null}

        <div className="mt-5 space-y-3">
          {jobsStatus === 'loading' ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
              Loading merchant jobs...
            </div>
          ) : null}

          {jobsStatus === 'ready' && jobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-slate-400">
              No jobs match the current filter yet.
            </div>
          ) : null}

          {jobs.map((job) => (
            <button
              key={job.id}
              type="button"
              onClick={() => void handleSelectJob(job.id)}
              className={`w-full rounded-3xl border p-4 text-left transition ${
                selectedJob?.id === job.id
                  ? 'border-sky-300/40 bg-sky-400/10'
                  : 'border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/6'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{job.id}</p>
                  <p className="mt-1 text-sm text-slate-400">Product #{job.product_id ?? 'unknown'}</p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${getStatusClasses(job.status)}`}>
                  {job.status}
                </span>
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-300 md:grid-cols-2">
                <span>Category: {job.category}</span>
                <span>Created: {new Date(job.created_at).toLocaleString()}</span>
              </div>
            </button>
          ))}
        </div>
      </Panel>

      <Panel
        eyebrow="Selected Job"
        title="Job detail snapshot"
        description="Use this pane to inspect the exact job payload already stored in the database."
      >
        {selectedJobStatus === 'loading' ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
            Loading selected job...
          </div>
        ) : null}

        {selectedJob ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-slate-400">Status</p>
                <p className="mt-2 font-medium text-white">{selectedJob.status}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-slate-400">Category</p>
                <p className="mt-2 font-medium text-white">{selectedJob.category}</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70">
                <img
                  src={selectedJob.product_image_url}
                  alt="Product source"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70">
                <img
                  src={selectedJob.user_image_url}
                  alt="User upload"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </div>

            {selectedJob.result_image_url ? (
              <div className="overflow-hidden rounded-3xl border border-emerald-400/20 bg-slate-950/70">
                <img
                  src={selectedJob.result_image_url}
                  alt="Try-on result"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            ) : null}

            <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-xs leading-6 text-slate-300">
              {JSON.stringify(selectedJob, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-slate-400">
            Select any job from the left panel to inspect its stored payload.
          </div>
        )}
      </Panel>
    </div>
  )
}
