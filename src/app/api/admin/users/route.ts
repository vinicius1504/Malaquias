import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { queryAll, queryOne, insert } from '@/lib/db/postgres'
import bcrypt from 'bcryptjs'

// Força rota dinâmica
export const dynamic = 'force-dynamic'

// GET - Listar usuários
export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'dev') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await queryAll(
      'SELECT id, email, name, role, permissions, is_active, created_at, updated_at FROM admin_users ORDER BY created_at DESC'
    )

    return NextResponse.json({ users: data })
  } catch (error) {
    console.error('Erro no GET /api/admin/users:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// POST - Criar usuário
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'dev') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, password, role, permissions, sendEmail } = body

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    // Verificar se email já existe
    const existing = await queryOne(
      'SELECT id FROM admin_users WHERE email = $1',
      [email]
    )

    if (existing) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 })
    }

    // Hash da senha
    const password_hash = await bcrypt.hash(password, 12)

    // Criar usuário
    const newUser = await insert('admin_users', {
      name,
      email,
      password_hash,
      role,
      permissions: JSON.stringify(permissions || []),
      is_active: true,
    })

    // Log de auditoria
    await insert('audit_logs', {
      user_id: session.user.id,
      action: 'create',
      entity: 'admin_users',
      entity_id: newUser.id,
      new_value: JSON.stringify({ name, email, role, permissions }),
    })

    // Enviar email se solicitado
    if (sendEmail) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/admin/users/send-credentials`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            name,
            password,
          }),
        })
      } catch (emailError) {
        console.error('Erro ao enviar email:', emailError)
        // Não falha a criação se o email não for enviado
      }
    }

    return NextResponse.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        permissions: newUser.permissions,
        is_active: newUser.is_active,
        created_at: newUser.created_at,
      },
      message: sendEmail
        ? 'Usuário criado e credenciais enviadas por email'
        : 'Usuário criado com sucesso'
    })
  } catch (error) {
    console.error('Erro no POST /api/admin/users:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
