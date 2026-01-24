import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { queryOne, query, insert, remove } from '@/lib/db/postgres'
import bcrypt from 'bcryptjs'

// Força rota dinâmica
export const dynamic = 'force-dynamic'

// GET - Buscar usuário por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'dev') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    const data = await queryOne(
      'SELECT id, email, name, role, permissions, is_active, created_at, updated_at FROM admin_users WHERE id = $1',
      [id]
    )

    if (!data) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ user: data })
  } catch (error) {
    console.error('Erro no GET /api/admin/users/[id]:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// PUT - Atualizar usuário
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'dev') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, email, password, role, permissions, is_active } = body

    // Buscar usuário atual para log
    const oldUser = await queryOne(
      'SELECT name, email, role, permissions, is_active FROM admin_users WHERE id = $1',
      [id]
    )

    if (!oldUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Preparar dados para atualização
    const updateFields: string[] = ['updated_at = NOW()']
    const updateValues: any[] = []
    let paramIndex = 1

    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`)
      updateValues.push(name)
    }
    if (email !== undefined) {
      updateFields.push(`email = $${paramIndex++}`)
      updateValues.push(email)
    }
    if (role !== undefined) {
      updateFields.push(`role = $${paramIndex++}`)
      updateValues.push(role)
    }
    if (is_active !== undefined) {
      updateFields.push(`is_active = $${paramIndex++}`)
      updateValues.push(is_active)
    }
    if (permissions !== undefined) {
      updateFields.push(`permissions = $${paramIndex++}`)
      updateValues.push(JSON.stringify(permissions))
    }
    if (password) {
      updateFields.push(`password_hash = $${paramIndex++}`)
      updateValues.push(await bcrypt.hash(password, 12))
    }

    updateValues.push(id)

    await query(
      `UPDATE admin_users SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`,
      updateValues
    )

    // Log de auditoria
    await insert('audit_logs', {
      user_id: session.user.id,
      action: 'update',
      entity: 'admin_users',
      entity_id: id,
      old_value: JSON.stringify(oldUser),
      new_value: JSON.stringify({ name, email, role, permissions, is_active }),
    })

    return NextResponse.json({ message: 'Usuário atualizado com sucesso' })
  } catch (error) {
    console.error('Erro no PUT /api/admin/users/[id]:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// DELETE - Excluir usuário
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'dev') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    // Não permitir excluir a si mesmo
    if (id === session.user.id) {
      return NextResponse.json({ error: 'Não é possível excluir seu próprio usuário' }, { status: 400 })
    }

    // Buscar usuário para log
    const user = await queryOne(
      'SELECT name, email, role FROM admin_users WHERE id = $1',
      [id]
    )

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    await remove('admin_users', 'id = $1', [id])

    // Log de auditoria
    await insert('audit_logs', {
      user_id: session.user.id,
      action: 'delete',
      entity: 'admin_users',
      entity_id: id,
      old_value: JSON.stringify(user),
    })

    return NextResponse.json({ message: 'Usuário excluído com sucesso' })
  } catch (error) {
    console.error('Erro no DELETE /api/admin/users/[id]:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
