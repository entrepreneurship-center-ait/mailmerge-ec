import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('status, sent_at')
    .eq('id', id)
    .single()

  const { data: participants } = await supabase
    .from('participants')
    .select('status')
    .eq('campaign_id', id)

  const total = (participants as any[])?.length || 0
  const sent = (participants as any[])?.filter((p: any) => p.status === 'sent').length || 0
  const failed = (participants as any[])?.filter((p: any) => p.status === 'failed').length || 0
  const pending = (participants as any[])?.filter((p: any) => p.status === 'pending').length || 0

  return NextResponse.json({
    status: (campaign as any)?.status || 'draft',
    total,
    sent,
    failed,
    pending,
    percentage: total > 0 ? Math.round((sent / total) * 100) : 0,
  })
}
