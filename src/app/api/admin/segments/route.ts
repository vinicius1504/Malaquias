import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { queryAll, insert } from '@/lib/db/postgres'

export const dynamic = 'force-dynamic'

// GET - Listar todos os segmentos (admin)
export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await queryAll(
      'SELECT * FROM segments ORDER BY display_order ASC, created_at DESC'
    )

    return NextResponse.json({ segments: data })
  } catch (error) {
    console.error('Erro no GET /api/admin/segments:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// POST - Criar segmento
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { title, lp_slug, image_url, video_url, is_active, display_order } = body

    if (!title) {
      return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 })
    }

    const newSegment = await insert('segments', {
      title,
      lp_slug: lp_slug || null,
      image_url: image_url || null,
      video_url: video_url || null,
      is_active: is_active ?? true,
      display_order: display_order ?? 0,
    })

    // Log de auditoria
    await insert('audit_logs', {
      user_id: session.user.id,
      action: 'create',
      entity: 'segments',
      entity_id: newSegment.id,
      new_value: JSON.stringify({ title }),
    })

    return NextResponse.json({ segment: newSegment, message: 'Segmento criado com sucesso' })
  } catch (error) {
    console.error('Erro no POST /api/admin/segments:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
