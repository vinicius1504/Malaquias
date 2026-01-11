import { NextResponse } from 'next/server'
import { queryAll } from '@/lib/db/postgres'

export const dynamic = 'force-dynamic'

// GET - Listar segmentos ativos (público)
export async function GET() {
  try {
    const data = await queryAll(
      'SELECT * FROM segments WHERE is_active = true ORDER BY display_order ASC'
    )

    return NextResponse.json({ segments: data })
  } catch (error) {
    console.error('Erro no GET /api/segments:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
