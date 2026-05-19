'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function SyncGoogleToken() {
  useEffect(() => {
    const supabase = createClient()

    const syncToken = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.provider_token

      if (token && session?.user) {
        await supabase
          .from('user_settings')
          .upsert(
            {
              user_id: session.user.id,
              google_oauth_token: token,
              rate_limit_delay: 2,
            } as never,
            { onConflict: 'user_id' }
          )
      }
    }

    syncToken()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.provider_token && session?.user) {
        supabase
          .from('user_settings')
          .upsert(
            {
              user_id: session.user.id,
              google_oauth_token: session.provider_token,
              rate_limit_delay: 2,
            } as never,
            { onConflict: 'user_id' }
          )
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return null
}
