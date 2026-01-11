import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { queryAll, insert } from '@/lib/db/postgres'

// Força rota dinâmica
export const dynamic = 'force-dynamic'

// GET - Listar parceiros/clientes
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'partner' | 'client' | null (todos)

    let query = 'SELECT * FROM partners'
    const params: any[] = []

    if (type) {
      query += ' WHERE type = $1'
      params.push(type)
    }

    query += ' ORDER BY display_order ASC, created_at DESC'

    const data = await queryAll(query, params)

    return NextResponse.json({ partners: data })
  } catch (error) {
    console.error('Erro no GET /api/admin/partners:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// POST - Criar parceiro/cliente
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, logo_url, is_active, display_order } = body

    if (!name || !type) {
      return NextResponse.json({ error: 'Nome e tipo são obrigatórios' }, { status: 400 })
    }

    if (!['partner', 'client'].includes(type)) {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
    }

    const newPartner = await insert('partners', {
      name,
      type,
      logo_url: logo_url || null,
      is_active: is_active ?? true,
      display_order: display_order ?? 0,
    })

    // Log de auditoria
    await insert('audit_logs', {
      user_id: session.user.id,
      action: 'create',
      entity: 'partners',
      entity_id: newPartner.id,
      new_value: JSON.stringify({ name, type }),
    })

    return NextResponse.json({ partner: newPartner, message: 'Parceiro criado com sucesso' })
  } catch (error) {
    console.error('Erro no POST /api/admin/partners:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
