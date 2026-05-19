'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import EmailEditor from '@/components/EmailEditor'

interface Campaign {
  id: string
  name: string
  template_html: string | null
  status: 'draft' | 'scheduled' | 'sending' | 'sent'
  created_at: string
}

interface Participant {
  id: string
  email: string
  name: string
  status: string
  custom_fields: Record<string, unknown>
}

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{ total: number; imported: number } | null>(null)
  const [savingTemplate, setSavingTemplate] = useState(false)
  const [templateContent, setTemplateContent] = useState('')
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    params.then(({ id }) => {
      fetchCampaign(id)
      fetchParticipants(id)
    })
  }, [params])

  async function fetchCampaign(id: string) {
    const res = await fetch(`/api/campaigns/${id}`)
    if (res.ok) {
      const data = await res.json()
      setCampaign(data)
      setTemplateContent(data.template_html || '')
    }
  }

  async function fetchParticipants(id: string) {
    const res = await fetch(`/api/campaigns/${id}/participants`)
    if (res.ok) {
      const data = await res.json()
      setParticipants(data)
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

    const res = await fetch(`/api/campaigns/${campaign.id}/participants`, {
      method: 'POST',
      body: formData,
    })

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

  const allPlaceholders = ['name', 'email', ...new Set(participants.flatMap(p => Object.keys(p.custom_fields || {})))]

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" /></div>
  }

  if (!campaign) {
    return <div className="text-center py-12 text-slate-500">Campaign not found.</div>
  }

  return (
    <div>
      <button onClick={() => router.push('/dashboard/campaigns')} className="mb-4 text-sm text-slate-600 hover:text-slate-900">
        ← Back to campaigns
      </button>
      <h1 className="text-2xl font-bold text-slate-900">{campaign.name}</h1>
      <p className="mt-1 text-sm text-slate-600">Manage participants, templates, and sending.</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Status</h3>
          <p className="mt-2 text-lg font-semibold text-slate-900 capitalize">{campaign.status}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Created</h3>
          <p className="mt-2 text-lg font-semibold text-slate-900">{new Date(campaign.created_at).toLocaleDateString()}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Participants</h3>
          <p className="mt-2 text-lg font-semibold text-slate-900">{participants.length}</p>
        </div>
      </div>

      {/* Import Section */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Import Participants</h2>
        <p className="mt-1 text-sm text-slate-600">Upload a CSV or Excel file with columns: email, name (and any custom fields).</p>
        <div className="mt-4">
          <label className="flex-1 cursor-pointer rounded-lg border-2 border-dashed border-slate-300 p-6 text-center transition hover:border-blue-500 hover:bg-blue-50">
            <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" />
            <svg className="mx-auto h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            <p className="mt-2 text-sm text-slate-600">{uploading ? 'Uploading...' : 'Click to upload CSV or Excel'}</p>
          </label>
        </div>
        {uploadResult && (
          <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Imported {uploadResult.imported} of {uploadResult.total} rows.
          </div>
        )}
      </div>

      {/* Participants Table */}
      {participants.length > 0 && (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Participants</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {participants.slice(0, 50).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 text-sm text-slate-900">{p.email}</td>
                    <td className="px-6 py-3 text-sm text-slate-700">{p.name}</td>
                    <td className="px-6 py-3 text-sm">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        p.status === 'sent' ? 'bg-emerald-100 text-emerald-700' :
                        p.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {participants.length > 50 && (
              <div className="px-6 py-3 text-sm text-slate-500">Showing 50 of {participants.length} participants.</div>
            )}
          </div>
        </div>
      )}

      {/* Email Editor */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Email Template</h2>
          <div className="flex items-center gap-3">
            {saveMessage && <span className="text-sm text-emerald-600">{saveMessage}</span>}
            <button
              onClick={saveTemplate}
              disabled={savingTemplate}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
            >
              {savingTemplate ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </div>
        <EmailEditor
          content={templateContent}
          onChange={setTemplateContent}
          placeholders={allPlaceholders as string[]}
        />
      </div>
    </div>
  )
}
