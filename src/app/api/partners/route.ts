import { NextRequest, NextResponse } from 'next/server'
import { queryAll } from '@/lib/db/postgres'

// Força rota dinâmica (não pode ser estática por usar request.url)
export const dynamic = 'force-dynamic'

// GET - Buscar parceiros/clientes ativos (API pública)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'partner' | 'client' | null (todos)

    let queryStr = 'SELECT id, name, logo_url, type FROM partners WHERE is_active = true'
    const params: any[] = []

    if (type && ['partner', 'client'].includes(type)) {
      queryStr += ' AND type = $1'
      params.push(type)
    }

    queryStr += ' ORDER BY display_order ASC'

    const data = await queryAll(queryStr, params)

    return NextResponse.json({ partners: data })
  } catch (error) {
    console.error('Erro no GET /api/partners:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
