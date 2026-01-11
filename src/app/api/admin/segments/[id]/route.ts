import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { queryOne, query, insert, remove } from '@/lib/db/postgres'

export const dynamic = 'force-dynamic'

// GET - Buscar segmento específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    const data = await queryOne('SELECT * FROM segments WHERE id = $1', [id])

    if (!data) {
      return NextResponse.json({ error: 'Segmento não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ segment: data })
  } catch (error) {
    console.error('Erro no GET /api/admin/segments/[id]:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// PUT - Atualizar segmento
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, lp_slug, image_url, video_url, is_active, display_order } = body

    // Buscar dados antigos para log
    const oldData = await queryOne('SELECT * FROM segments WHERE id = $1', [id])

    const updateFields: string[] = []
    const updateValues: any[] = []
    let paramIndex = 1

    if (title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`)
      updateValues.push(title)
    }
    if (lp_slug !== undefined) {
      updateFields.push(`lp_slug = $${paramIndex++}`)
      updateValues.push(lp_slug)
    }
    if (image_url !== undefined) {
      updateFields.push(`image_url = $${paramIndex++}`)
      updateValues.push(image_url)
    }
    if (video_url !== undefined) {
      updateFields.push(`video_url = $${paramIndex++}`)
      updateValues.push(video_url)
    }
    if (is_active !== undefined) {
      updateFields.push(`is_active = $${paramIndex++}`)
      updateValues.push(is_active)
    }
    if (display_order !== undefined) {
      updateFields.push(`display_order = $${paramIndex++}`)
      updateValues.push(display_order)
    }

    updateFields.push('updated_at = NOW()')
    updateValues.push(id)

    const result = await query(
      `UPDATE segments SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      updateValues
    )

    const updatedSegment = result.rows[0]

    // Log de auditoria
    await insert('audit_logs', {
      user_id: session.user.id,
      action: 'update',
      entity: 'segments',
      entity_id: id,
      old_value: JSON.stringify(oldData),
      new_value: JSON.stringify({ title, lp_slug, image_url, video_url, is_active, display_order }),
    })

    return NextResponse.json({ segment: updatedSegment, message: 'Segmento atualizado com sucesso' })
  } catch (error) {
    console.error('Erro no PUT /api/admin/segments/[id]:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// DELETE - Excluir segmento
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    // Buscar dados antigos para log
    const oldData = await queryOne('SELECT * FROM segments WHERE id = $1', [id])

    await remove('segments', 'id = $1', [id])

    // Log de auditoria
    await insert('audit_logs', {
      user_id: session.user.id,
      action: 'delete',
      entity: 'segments',
      entity_id: id,
      old_value: JSON.stringify(oldData),
    })

    return NextResponse.json({ message: 'Segmento excluído com sucesso' })
  } catch (error) {
    console.error('Erro no DELETE /api/admin/segments/[id]:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
