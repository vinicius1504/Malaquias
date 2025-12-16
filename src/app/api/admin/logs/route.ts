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

// GET - Listar logs
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'dev') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const action = searchParams.get('action')
    const entity = searchParams.get('entity')
    const userId = searchParams.get('user_id')

    const supabase = await getSupabase()

    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        admin_users:user_id (
          id,
          name,
          email
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    if (action) {
      query = query.eq('action', action)
    }
    if (entity) {
      query = query.eq('entity', entity)
    }
    if (userId) {
      query = query.eq('user_id', userId)
    }

    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Erro ao buscar logs:', error)
      return NextResponse.json({ error: 'Erro ao buscar logs' }, { status: 500 })
    }

    return NextResponse.json({
      logs: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Erro no GET /api/admin/logs:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
