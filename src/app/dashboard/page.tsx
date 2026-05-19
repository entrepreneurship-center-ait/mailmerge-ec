export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Campaigns</h1>
      <p className="mt-2 text-sm text-slate-600">
        Create and manage your email campaigns.
      </p>
      <div className="mt-8 rounded-xl border border-dashed border-slate-300 p-12 text-center">
        <p className="text-sm text-slate-500">No campaigns yet. Create your first one to get started.</p>
      </div>
    </div>
  )
}
