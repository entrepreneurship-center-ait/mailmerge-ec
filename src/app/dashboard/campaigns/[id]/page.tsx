'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import EmailEditor from '@/components/EmailEditor'

interface Campaign {
  id: string
  name: string
  template_html: string | null
  status: 'draft' | 'scheduled' | 'sending' | 'sent'
  scheduled_at: string | null
  created_at: string
}

interface Participant {
  id: string
  email: string
  name: string
  status: string
  custom_fields: Record<string, unknown>
}

type Tab = 'participants' | 'editor' | 'send'

const statusConfig: Record<Campaign['status'], { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'text-[#8e8e93]' },
  scheduled: { label: 'Scheduled', color: 'text-[#f0a040]' },
  sending: { label: 'Sending', color: 'text-[#5ac8fa]' },
  sent: { label: 'Sent', color: 'text-[#34c759]' },
}

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('participants')
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{ total: number; imported: number } | null>(null)
  const [savingTemplate, setSavingTemplate] = useState(false)
  const [templateContent, setTemplateContent] = useState('')
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [sendProgress, setSendProgress] = useState<{ status: string; sent: number; total: number; percentage: number } | null>(null)
  const [polling, setPolling] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalParticipants, setTotalParticipants] = useState(0)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduling, setScheduling] = useState(false)
  const limit = 25
  const router = useRouter()

  useEffect(() => {
    params.then(({ id }) => {
      fetchCampaign(id)
      fetchParticipants(id)
    })
  }, [params, page, search, statusFilter])

  async function fetchCampaign(id: string) {
    const res = await fetch(`/api/campaigns/${id}`)
    if (res.ok) {
      const data = await res.json()
      setCampaign(data)
      setTemplateContent(data.template_html || '')
    }
  }

  async function fetchParticipants(id: string) {
    const p = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (search) p.set('search', search)
    if (statusFilter !== 'all') p.set('status', statusFilter)

    const res = await fetch(`/api/campaigns/${id}/participants?${p}`)
    if (res.ok) {
      const data = await res.json()
      setParticipants(data.participants)
      setTotalParticipants(data.total)
    }
    setLoading(false)
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !campaign) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('columnMapping', JSON.stringify({ email: 'email', name: 'name' }))

    const res = await fetch(`/api/campaigns/${campaign.id}/participants`, { method: 'POST', body: formData })
    if (res.ok) {
      const result = await res.json()
      setUploadResult(result)
      fetchParticipants(campaign.id)
    }
    setUploading(false)
  }

  async function saveTemplate() {
    if (!campaign) return
    setSavingTemplate(true)
    const res = await fetch(`/api/campaigns/${campaign.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template_html: templateContent }),
    })
    if (res.ok) {
      setSaveMessage('Template saved')
      setTimeout(() => setSaveMessage(null), 3000)
    }
    setSavingTemplate(false)
  }

  async function startSending() {
    if (!campaign || !confirm('Send emails to all pending participants?')) return
    setSending(true)
    setPolling(true)

    const res = await fetch(`/api/campaigns/${campaign.id}/send`, { method: 'POST' })
    const result = await res.json()
    if (res.ok) {
      setSendProgress({ status: 'sent', sent: result.sent, total: result.total, percentage: 100 })
      fetchParticipants(campaign.id)
      fetchCampaign(campaign.id)
    }
    setSending(false)
    setPolling(false)
  }

  async function scheduleCampaign() {
    if (!campaign || !scheduleDate) return
    setScheduling(true)
    const res = await fetch(`/api/campaigns/${campaign.id}/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduledAt: scheduleDate }),
    })
    if (res.ok) {
      fetchCampaign(campaign.id)
      setScheduleDate('')
    }
    setScheduling(false)
  }

  useEffect(() => {
    if (!polling || !campaign) return
    const interval = setInterval(async () => {
      const res = await fetch(`/api/campaigns/${campaign.id}/progress`)
      if (res.ok) {
        const data = await res.json()
        setSendProgress(data)
        if (data.status === 'sent' || data.status === 'draft') {
          setPolling(false)
          fetchParticipants(campaign.id)
          fetchCampaign(campaign.id)
        }
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [polling, campaign])

  const allPlaceholders = ['name', 'email', ...new Set(participants.flatMap(p => Object.keys(p.custom_fields || {})))]

  if (loading) {
    return <div className="flex items-center justify-center py-24"><div className="h-5 w-5 animate-spin rounded-full border-2 border-[#2a2a2e] border-t-[#f0a040]" /></div>
  }

  if (!campaign) {
    return <div className="text-center py-24 text-[#636366]">Campaign not found.</div>
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'participants', label: 'Participants', icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    )},
    { id: 'editor', label: 'Template', icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
      </svg>
    )},
    { id: 'send', label: 'Send', icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
      </svg>
    )},
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => router.push('/dashboard/campaigns')} className="mb-4 flex items-center gap-1.5 text-sm text-[#636366] hover:text-[#f5f5f7] transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          Back
        </button>
        <div className="flex items-center gap-4">
          <h1 className="font-serif text-3xl text-[#f5f5f7]">{campaign.name}</h1>
          <span className={`text-sm font-medium ${statusConfig[campaign.status].color}`}>
            {statusConfig[campaign.status].label}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Participants', value: totalParticipants.toString() },
          { label: 'Created', value: new Date(campaign.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
          { label: 'Status', value: statusConfig[campaign.status].label },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-[#2a2a2e] bg-[#161618] px-5 py-4">
            <p className="text-xs text-[#636366]">{stat.label}</p>
            <p className="mt-1 text-lg font-semibold text-[#f5f5f7]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-[#2a2a2e] bg-[#161618] p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-[#1e1e20] text-[#f5f5f7]'
                : 'text-[#636366] hover:text-[#8e8e93]'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'participants' && (
        <div>
          {/* Upload */}
          <div className="mb-6 rounded-xl border border-[#2a2a2e] bg-[#161618] p-6">
            <h3 className="text-sm font-medium text-[#f5f5f7]">Import Participants</h3>
            <p className="mt-1 text-xs text-[#636366]">Upload a CSV or Excel file with email, name columns.</p>
            <div className="mt-4">
              <label className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-[#2a2a2e] p-8 transition-all hover:border-[#f0a040]/30 hover:bg-[#f0a040]/5">
                <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" />
                <div className="text-center">
                  <svg className="mx-auto h-8 w-8 text-[#3a3a3e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                  <p className="mt-2 text-sm text-[#636366]">{uploading ? 'Uploading...' : 'Drop file or click to upload'}</p>
                </div>
              </label>
            </div>
            {uploadResult && (
              <div className="mt-3 rounded-lg bg-[#34c759]/10 px-4 py-2.5 text-sm text-[#34c759]">
                Imported {uploadResult.imported} of {uploadResult.total} rows.
              </div>
            )}
          </div>

          {/* Table */}
          {participants.length > 0 && (
            <div className="rounded-xl border border-[#2a2a2e] bg-[#161618] overflow-hidden">
              <div className="flex items-center gap-3 border-b border-[#2a2a2e] px-5 py-3">
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  className="flex-1 rounded-lg border border-[#2a2a2e] bg-[#1e1e20] px-3 py-1.5 text-xs text-[#f5f5f7] placeholder:text-[#3a3a3e] focus:border-[#f0a040]/40 focus:outline-none"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
                  className="rounded-lg border border-[#2a2a2e] bg-[#1e1e20] px-3 py-1.5 text-xs text-[#f5f5f7] focus:border-[#f0a040]/40 focus:outline-none"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="sent">Sent</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-[#2a2a2e]">
                    <th className="px-5 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-[#636366]">Email</th>
                    <th className="px-5 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-[#636366]">Name</th>
                    <th className="px-5 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-[#636366]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2e]">
                  {participants.map((p) => (
                    <tr key={p.id} className="hover:bg-[#1e1e20] transition-colors">
                      <td className="px-5 py-2.5 text-sm text-[#f5f5f7] font-mono text-xs">{p.email}</td>
                      <td className="px-5 py-2.5 text-sm text-[#8e8e93]">{p.name}</td>
                      <td className="px-5 py-2.5">
                        <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-medium ${
                          p.status === 'sent' ? 'bg-[#34c759]/10 text-[#34c759]' :
                          p.status === 'failed' ? 'bg-[#ff453a]/10 text-[#ff453a]' :
                          'bg-[#636366]/10 text-[#8e8e93]'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalParticipants > limit && (
                <div className="flex items-center justify-between border-t border-[#2a2a2e] px-5 py-3">
                  <span className="text-xs text-[#636366]">
                    {(page - 1) * limit + 1}–{Math.min(page * limit, totalParticipants)} of {totalParticipants}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border border-[#2a2a2e] px-3 py-1 text-xs text-[#8e8e93] disabled:opacity-30 hover:bg-[#1e1e20] transition-colors">
                      Prev
                    </button>
                    <button onClick={() => setPage(p => p + 1)} disabled={page * limit >= totalParticipants} className="rounded-lg border border-[#2a2a2e] px-3 py-1 text-xs text-[#8e8e93] disabled:opacity-30 hover:bg-[#1e1e20] transition-colors">
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'editor' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {saveMessage && <span className="text-xs text-[#34c759]">{saveMessage}</span>}
            </div>
            <button
              onClick={saveTemplate}
              disabled={savingTemplate}
              className="rounded-xl bg-[#f0a040] px-4 py-2 text-sm font-medium text-[#0c0c0d] transition-all hover:bg-[#e89030] disabled:opacity-40 active:scale-[0.98]"
            >
              {savingTemplate ? 'Saving...' : 'Save Template'}
            </button>
          </div>
          <EmailEditor
            content={templateContent}
            onChange={setTemplateContent}
            placeholders={allPlaceholders as string[]}
          />
        </div>
      )}

      {activeTab === 'send' && (
        <div className="space-y-6">
          {/* Send Now */}
          <div className="rounded-xl border border-[#2a2a2e] bg-[#161618] p-6">
            <h3 className="text-sm font-medium text-[#f5f5f7]">Send Now</h3>
            <p className="mt-1 text-xs text-[#636366]">Send to all pending participants immediately.</p>
            <button
              onClick={startSending}
              disabled={sending || campaign.status === 'sending' || participants.length === 0}
              className="mt-4 rounded-xl bg-[#34c759] px-5 py-2.5 text-sm font-medium text-[#0c0c0d] transition-all hover:bg-[#2db84e] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {sending ? 'Sending...' : campaign.status === 'sending' ? 'In Progress...' : 'Send Campaign'}
            </button>
          </div>

          {/* Schedule */}
          {campaign.status === 'draft' && (
            <div className="rounded-xl border border-[#2a2a2e] bg-[#161618] p-6">
              <h3 className="text-sm font-medium text-[#f5f5f7]">Schedule Send</h3>
              <p className="mt-1 text-xs text-[#636366]">Automatically send at a future time.</p>
              <div className="mt-4 flex gap-3">
                <input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="rounded-xl border border-[#2a2a2e] bg-[#1e1e20] px-4 py-2.5 text-sm text-[#f5f5f7] focus:border-[#f0a040]/40 focus:outline-none"
                />
                <button
                  onClick={scheduleCampaign}
                  disabled={scheduling || !scheduleDate}
                  className="rounded-xl bg-[#f0a040] px-5 py-2.5 text-sm font-medium text-[#0c0c0d] transition-all hover:bg-[#e89030] disabled:opacity-40 active:scale-[0.98]"
                >
                  {scheduling ? 'Scheduling...' : 'Schedule'}
                </button>
              </div>
              {campaign.scheduled_at && (
                <div className="mt-3 rounded-lg bg-[#f0a040]/10 px-4 py-2.5 text-sm text-[#f0a040]">
                  Scheduled: {new Date(campaign.scheduled_at).toLocaleString()}
                </div>
              )}
            </div>
          )}

          {/* Progress */}
          {sendProgress && sendProgress.total > 0 && (
            <div className="rounded-xl border border-[#2a2a2e] bg-[#161618] p-6">
              <h3 className="text-sm font-medium text-[#f5f5f7]">Progress</h3>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-[#8e8e93] mb-2">
                  <span>{sendProgress.sent} / {sendProgress.total} sent</span>
                  <span>{sendProgress.percentage}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#2a2a2e]">
                  <div
                    className="h-1.5 rounded-full bg-[#34c759] transition-all duration-500"
                    style={{ width: `${sendProgress.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
