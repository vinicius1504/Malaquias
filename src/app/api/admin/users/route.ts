import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

async function getSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore
          }
        },
      },
    }
  )
}

// GET - Listar usuários
export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'dev') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const supabase = await getSupabase()

    const { data, error } = await supabase
      .from('admin_users')
      .select('id, email, name, role, is_active, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar usuários:', error)
      return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 })
    }

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
    const { name, email, password, role, sendEmail } = body

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    const supabase = await getSupabase()

    // Verificar se email já existe
    const { data: existing } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 })
    }

    // Hash da senha
    const password_hash = await bcrypt.hash(password, 12)

    // Criar usuário
    const { data: newUser, error } = await supabase
      .from('admin_users')
      .insert({
        name,
        email,
        password_hash,
        role,
        is_active: true,
      })
      .select('id, email, name, role, is_active, created_at')
      .single()

    if (error) {
      console.error('Erro ao criar usuário:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log de auditoria
    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      action: 'create',
      entity: 'admin_users',
      entity_id: newUser.id,
      new_value: { name, email, role },
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
      user: newUser,
      message: sendEmail
        ? 'Usuário criado e credenciais enviadas por email'
        : 'Usuário criado com sucesso'
    })
  } catch (error) {
    console.error('Erro no POST /api/admin/users:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
