import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Força rota dinâmica
export const dynamic = 'force-dynamic'

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

// GET - Listar parceiros/clientes
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'partner' | 'client' | null (todos)

    const supabase = await getSupabase()

    let query = supabase
      .from('partners')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar parceiros:', error)
      return NextResponse.json({ error: 'Erro ao buscar parceiros' }, { status: 500 })
    }

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

    const supabase = await getSupabase()

    const { data: newPartner, error } = await supabase
      .from('partners')
      .insert({
        name,
        type,
        logo_url: logo_url || null,
        is_active: is_active ?? true,
        display_order: display_order ?? 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar parceiro:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log de auditoria
    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      action: 'create',
      entity: 'partners',
      entity_id: newPartner.id,
      new_value: { name, type },
    })

    return NextResponse.json({ partner: newPartner, message: 'Parceiro criado com sucesso' })
  } catch (error) {
    console.error('Erro no POST /api/admin/partners:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
