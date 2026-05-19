import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const body = await request.json()

  const { scheduledAt } = body as { scheduledAt: string }

  if (!scheduledAt) {
    return NextResponse.json({ error: 'scheduledAt is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('campaigns')
    .update({ status: 'scheduled', scheduled_at: scheduledAt } as never)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, scheduledAt })
}
