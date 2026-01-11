import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { queryOne, query, insert, remove } from '@/lib/db/postgres'

// Força rota dinâmica
export const dynamic = 'force-dynamic'

// GET - Buscar parceiro por ID
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

    const data = await queryOne('SELECT * FROM partners WHERE id = $1', [id])

    if (!data) {
      return NextResponse.json({ error: 'Parceiro não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ partner: data })
  } catch (error) {
    console.error('Erro no GET /api/admin/partners/[id]:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// PUT - Atualizar parceiro
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
    const { name, type, logo_url, is_active, display_order } = body

    // Buscar parceiro atual para log
    const oldPartner = await queryOne('SELECT * FROM partners WHERE id = $1', [id])

    if (!oldPartner) {
      return NextResponse.json({ error: 'Parceiro não encontrado' }, { status: 404 })
    }

    const updateFields: string[] = ['updated_at = NOW()']
    const updateValues: any[] = []
    let paramIndex = 1

    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`)
      updateValues.push(name)
    }
    if (type !== undefined) {
      updateFields.push(`type = $${paramIndex++}`)
      updateValues.push(type)
    }
    if (logo_url !== undefined) {
      updateFields.push(`logo_url = $${paramIndex++}`)
      updateValues.push(logo_url)
    }
    if (is_active !== undefined) {
      updateFields.push(`is_active = $${paramIndex++}`)
      updateValues.push(is_active)
    }
    if (display_order !== undefined) {
      updateFields.push(`display_order = $${paramIndex++}`)
      updateValues.push(display_order)
    }

    updateValues.push(id)

    const result = await query(
      `UPDATE partners SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      updateValues
    )

    const updatedPartner = result.rows[0]

    // Log de auditoria
    await insert('audit_logs', {
      user_id: session.user.id,
      action: 'update',
      entity: 'partners',
      entity_id: id,
      old_value: JSON.stringify({ name: oldPartner.name, type: oldPartner.type }),
      new_value: JSON.stringify({ name: updatedPartner.name, type: updatedPartner.type }),
    })

    return NextResponse.json({ partner: updatedPartner, message: 'Parceiro atualizado com sucesso' })
  } catch (error) {
    console.error('Erro no PUT /api/admin/partners/[id]:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// DELETE - Excluir parceiro
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

    // Buscar parceiro para log
    const partner = await queryOne('SELECT * FROM partners WHERE id = $1', [id])

    if (!partner) {
      return NextResponse.json({ error: 'Parceiro não encontrado' }, { status: 404 })
    }

    await remove('partners', 'id = $1', [id])

    // Log de auditoria
    await insert('audit_logs', {
      user_id: session.user.id,
      action: 'delete',
      entity: 'partners',
      entity_id: id,
      old_value: JSON.stringify({ name: partner.name, type: partner.type }),
    })

    return NextResponse.json({ message: 'Parceiro excluído com sucesso' })
  } catch (error) {
    console.error('Erro no DELETE /api/admin/partners/[id]:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
