'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function signInWithGoogle() {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            scope: 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
          },
        },
      })
      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0c0c0d]">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(240,160,64,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(240,160,64,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      {/* Radial glow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(240,160,64,0.06),transparent_70%)]" />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0a040]/10 border border-[#f0a040]/20">
              <svg className="h-6 w-6 text-[#f0a040]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </div>
          </div>
          <h1 className="mt-6 font-serif text-5xl text-[#f5f5f7] tracking-tight">
            MailMerge
          </h1>
          <p className="mt-3 text-sm text-[#8e8e93] leading-relaxed">
            Personalized email campaigns, simplified.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#2a2a2e] bg-[#161618] p-8 backdrop-blur-sm">
          <h2 className="text-base font-medium text-[#f5f5f7]">
            Sign in to continue
          </h2>
          <p className="mt-1 text-sm text-[#636366]">
            Use your Google Workspace account.
          </p>

          {error && (
            <div className="mt-4 rounded-lg border border-[#ff453a]/20 bg-[#ff453a]/5 px-4 py-3 text-sm text-[#ff453a]">
              {error}
            </div>
          )}

          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-[#2a2a2e] bg-[#1e1e20] px-4 py-3.5 text-sm font-medium text-[#f5f5f7] transition-all hover:border-[#f0a040]/30 hover:bg-[#252528] disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {loading ? 'Redirecting...' : 'Continue with Google'}
          </button>
        </div>

        <p className="mt-8 text-center text-xs text-[#3a3a3e]">
          &copy; {new Date().getFullYear()} MailMerge
        </p>
      </div>
    </div>
  )
}
