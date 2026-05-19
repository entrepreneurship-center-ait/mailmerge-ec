import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SyncGoogleToken } from '@/components/SyncGoogleToken'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const navItems = [
    { href: '/dashboard/campaigns', label: 'Campaigns', icon: (
      <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
      </svg>
    )},
  ]

  return (
    <div className="flex min-h-screen bg-[#0c0c0d]">
      {/* Sidebar */}
      <aside className="sticky top-0 flex h-screen w-64 flex-col border-r border-[#2a2a2e] bg-[#0c0c0d]/80 backdrop-blur-xl">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-6 border-b border-[#2a2a2e]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0a040]/10 border border-[#f0a040]/20">
            <svg className="h-4 w-4 text-[#f0a040]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </div>
          <span className="font-serif text-lg text-[#f5f5f7]">MailMerge</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#8e8e93] transition-all hover:bg-[#1e1e20] hover:text-[#f5f5f7]"
            >
              {item.icon}
              {item.label}
            </a>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-[#2a2a2e] p-4">
          <div className="mb-3 truncate text-xs text-[#636366] font-mono">
            {user.email}
          </div>
          <form action="/api/auth/sign-out" method="POST">
            <button
              type="submit"
              className="w-full rounded-lg px-3 py-2 text-xs font-medium text-[#8e8e93] transition-all hover:bg-[#1e1e20] hover:text-[#f5f5f7]"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        <SyncGoogleToken />
        {children}
      </main>
    </div>
  )
}
