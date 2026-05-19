import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      // Get the Google provider token from the identity
      const googleIdentity = data.user.identities?.find(
        (identity) => identity.provider === 'google'
      )
      const googleToken = googleIdentity?.identity_data?.access_token as string | undefined

      if (googleToken) {
        // Store the token in user_settings
        await supabase
          .from('user_settings')
          .upsert(
            {
              user_id: data.user.id,
              google_oauth_token: googleToken,
              rate_limit_delay: 2,
            } as never,
            { onConflict: 'user_id' }
          )
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}
