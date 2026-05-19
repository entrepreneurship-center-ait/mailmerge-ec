'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Campaign {
  id: string
  name: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent'
  created_at: string
}

const statusConfig: Record<Campaign['status'], { label: string; dot: string; bg: string }> = {
  draft: { label: 'Draft', dot: 'bg-[#636366]', bg: 'bg-[#636366]/10 text-[#8e8e93]' },
  scheduled: { label: 'Scheduled', dot: 'bg-[#f0a040]', bg: 'bg-[#f0a040]/10 text-[#f0a040]' },
  sending: { label: 'Sending', dot: 'bg-[#5ac8fa]', bg: 'bg-[#5ac8fa]/10 text-[#5ac8fa]' },
  sent: { label: 'Sent', dot: 'bg-[#34c759]', bg: 'bg-[#34c759]/10 text-[#34c759]' },
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchCampaigns()
  }, [])

  async function fetchCampaigns() {
    const res = await fetch('/api/campaigns')
    const data = await res.json()
    setCampaigns(data)
    setLoading(false)
  }

  async function createCampaign() {
    if (!newName.trim()) return
    setCreating(true)
    const res = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    })
    if (res.ok) {
      setNewName('')
      fetchCampaigns()
    }
    setCreating(false)
  }

  async function updateCampaign(id: string) {
    if (!editName.trim()) return
    await fetch(`/api/campaigns/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim() }),
    })
    setEditingId(null)
    fetchCampaigns()
  }

  async function deleteCampaign(id: string) {
    if (!confirm('Delete this campaign? This cannot be undone.')) return
    await fetch(`/api/campaigns/${id}`, { method: 'DELETE' })
    fetchCampaigns()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#2a2a2e] border-t-[#f0a040]" />
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-[#f5f5f7]">Campaigns</h1>
        <p className="mt-1.5 text-sm text-[#8e8e93]">Create and manage your email campaigns.</p>
      </div>

      {/* Create */}
      <div className="mb-8 flex gap-3">
        <input
          type="text"
          placeholder="Campaign name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && createCampaign()}
          className="flex-1 rounded-xl border border-[#2a2a2e] bg-[#161618] px-4 py-2.5 text-sm text-[#f5f5f7] placeholder:text-[#3a3a3e] focus:border-[#f0a040]/40 focus:outline-none focus:ring-1 focus:ring-[#f0a040]/20 transition-all"
        />
        <button
          onClick={createCampaign}
          disabled={creating || !newName.trim()}
          className="rounded-xl bg-[#f0a040] px-5 py-2.5 text-sm font-medium text-[#0c0c0d] transition-all hover:bg-[#e89030] disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]"
        >
          {creating ? 'Creating...' : 'Create'}
        </button>
      </div>

      {/* List */}
      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#2a2a2e] py-20">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0a040]/5 border border-[#f0a040]/10">
            <svg className="h-7 w-7 text-[#f0a040]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </div>
          <p className="mt-4 text-sm font-medium text-[#8e8e93]">No campaigns yet</p>
          <p className="mt-1 text-sm text-[#636366]">Create your first campaign to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {campaigns.map((c, i) => (
            <div
              key={c.id}
              className="group flex items-center justify-between rounded-xl border border-[#2a2a2e] bg-[#161618] px-5 py-4 transition-all hover:border-[#3a3a3e] hover:bg-[#1e1e20]"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={`h-2 w-2 rounded-full ${statusConfig[c.status].dot}`} />
                <div className="min-w-0">
                  {editingId === c.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && updateCampaign(c.id)}
                      className="rounded-lg border border-[#3a3a3e] bg-[#1e1e20] px-3 py-1 text-sm text-[#f5f5f7] focus:border-[#f0a040]/40 focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={() => router.push(`/dashboard/campaigns/${c.id}`)}
                      className="text-sm font-medium text-[#f5f5f7] hover:text-[#f0a040] transition-colors truncate block"
                    >
                      {c.name}
                    </button>
                  )}
                  <p className="mt-0.5 text-xs text-[#636366]">
                    {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 ml-4">
                <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ${statusConfig[c.status].bg}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${statusConfig[c.status].dot}`} />
                  {statusConfig[c.status].label}
                </span>
                {editingId === c.id ? (
                  <button onClick={() => updateCampaign(c.id)} className="text-xs font-medium text-[#34c759] hover:text-[#2db84e] transition-colors">
                    Save
                  </button>
                ) : (
                  <button onClick={() => { setEditingId(c.id); setEditName(c.name) }} className="text-xs font-medium text-[#8e8e93] hover:text-[#f5f5f7] transition-colors">
                    Edit
                  </button>
                )}
                <button onClick={() => deleteCampaign(c.id)} className="text-xs font-medium text-[#636366] hover:text-[#ff453a] transition-colors">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
