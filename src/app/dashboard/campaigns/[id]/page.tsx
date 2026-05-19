'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Campaign {
  id: string
  name: string
  template_html: string | null
  template_text: string | null
  status: 'draft' | 'scheduled' | 'sending' | 'sent'
  scheduled_at: string | null
  sent_at: string | null
  created_at: string
}

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    params.then(({ id }) => fetchCampaign(id))
  }, [params])

  async function fetchCampaign(id: string) {
    const res = await fetch(`/api/campaigns/${id}`)
    if (res.ok) {
      const data = await res.json()
      setCampaign(data)
    }
    setLoading(false)
  }

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
          <p className="mt-2 text-lg font-semibold text-slate-900">0</p>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-slate-300 p-12 text-center">
        <p className="text-sm text-slate-500">Campaign detail features coming in next slices: data import, email editor, and sending.</p>
      </div>
    </div>
  )
}
