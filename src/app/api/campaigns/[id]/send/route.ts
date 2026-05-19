import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single()

  if (!(campaign as any)?.template_html) {
    return NextResponse.json({ error: 'Campaign or template not ready' }, { status: 400 })
  }

  const { data: participants } = await supabase
    .from('participants')
    .select('*')
    .eq('campaign_id', id)
    .eq('status', 'pending')

  if (!participants || participants.length === 0) {
    return NextResponse.json({ error: 'No pending participants' }, { status: 400 })
  }

  const { data: settings } = await supabase
    .from('user_settings')
    .select('google_oauth_token, rate_limit_delay')
    .single()

  if (!(settings as any)?.google_oauth_token) {
    return NextResponse.json({ error: 'Google OAuth token not configured' }, { status: 400 })
  }

  const delay = (settings as any)?.rate_limit_delay || 2

  await supabase.from('campaigns').update({ status: 'sending' } as never).eq('id', id)

  let sent = 0
  let failed = 0

  for (const participant of participants as any[]) {
    try {
      const html = renderTemplate((campaign as any).template_html, participant)
      await sendEmail((settings as any).google_oauth_token, (participant as any).email, (campaign as any).name, html)

      await supabase
        .from('participants')
        .update({ status: 'sent', sent_at: new Date().toISOString() } as never)
        .eq('id', participant.id)

      sent++
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      await supabase
        .from('participants')
        .update({ status: 'failed', error_message: errorMsg } as never)
        .eq('id', participant.id)

      failed++
    }

    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay * 1000))
    }
  }

  await supabase
    .from('campaigns')
    .update({ status: 'sent', sent_at: new Date().toISOString() } as never)
    .eq('id', id)

  return NextResponse.json({ sent, failed, total: participants.length })
}

function renderTemplate(template: string, participant: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    if (key === 'name') return String(participant.name || '')
    if (key === 'email') return String(participant.email || '')
    const custom = participant.custom_fields as Record<string, unknown> | undefined
    if (custom && key in custom) return String(custom[key] || '')
    return ''
  })
}

async function sendEmail(token: string, to: string, subject: string, html: string) {
  const oauth2Client = new google.auth.OAuth2()
  oauth2Client.setCredentials({ access_token: token })

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`
  const messageParts = [
    `To: ${to}`,
    'Content-Type: text/html; charset=utf-8',
    `Subject: ${utf8Subject}`,
    '',
    html,
  ]
  const message = messageParts.join('\n')
  const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage },
  })
}
