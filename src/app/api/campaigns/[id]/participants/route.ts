import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import csvParser from 'csv-parser'
import { Readable } from 'stream'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const columnMappingJson = formData.get('columnMapping') as string | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const columnMapping = columnMappingJson
    ? JSON.parse(columnMappingJson) as Record<string, string>
    : { email: 'email', name: 'name' }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const fileName = file.name.toLowerCase()

  let rows: Record<string, string>[]

  if (fileName.endsWith('.csv')) {
    rows = await parseCSV(buffer)
  } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    rows = await parseExcel(buffer)
  } else {
    return NextResponse.json({ error: 'Unsupported file type. Use CSV or Excel.' }, { status: 400 })
  }

  const participants = rows.map((row) => {
    const email = (row[columnMapping.email] || '').trim().toLowerCase()
    const name = (row[columnMapping.name] || '').trim()
    const customFields: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(row)) {
      if (key !== columnMapping.email && key !== columnMapping.name && value) {
        customFields[key] = value
      }
    }
    return { campaign_id: id, email, name, custom_fields: customFields }
  }).filter((p) => p.email && p.email.includes('@'))

  if (participants.length === 0) {
    return NextResponse.json({ error: 'No valid email addresses found' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('participants')
    .insert(participants as never)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    total: rows.length,
    imported: data.length,
    participants: data,
  })
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  let query = supabase.from('participants').select('*').eq('campaign_id', id)

  if (status) {
    query = query.eq('status', status)
  }
  if (search) {
    query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`)
  }

  const { data, error } = await query.order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

function parseCSV(buffer: Buffer): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const rows: Record<string, string>[] = []
    Readable.from(buffer)
      .pipe(csvParser())
      .on('data', (row: Record<string, string>) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject)
  })
}

function parseExcel(buffer: Buffer): Promise<Record<string, string>[]> {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' })
  return Promise.resolve(rows)
}
