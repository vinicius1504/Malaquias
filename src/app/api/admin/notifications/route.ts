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

// GET - Buscar notificações (logs recentes)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'dev') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const lastSeen = searchParams.get('last_seen') // ISO timestamp

    const supabase = await getSupabase()

    // Buscar logs das últimas 24 horas ou desde o último visto
    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        admin_users:user_id (
          id,
          name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (lastSeen) {
      query = query.gt('created_at', lastSeen)
    } else {
      // Se não tem lastSeen, pega das últimas 24 horas
      const yesterday = new Date()
      yesterday.setHours(yesterday.getHours() - 24)
      query = query.gt('created_at', yesterday.toISOString())
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Erro ao buscar notificações:', error)
      return NextResponse.json({ error: 'Erro ao buscar notificações' }, { status: 500 })
    }

    // Contar total de novos (não lidos)
    let countQuery = supabase
      .from('audit_logs')
      .select('id', { count: 'exact', head: true })

    if (lastSeen) {
      countQuery = countQuery.gt('created_at', lastSeen)
    } else {
      const yesterday = new Date()
      yesterday.setHours(yesterday.getHours() - 24)
      countQuery = countQuery.gt('created_at', yesterday.toISOString())
    }

    const { count: unreadCount } = await countQuery

    return NextResponse.json({
      notifications: data,
      unreadCount: unreadCount || 0,
    })
  } catch (error) {
    console.error('Erro no GET /api/admin/notifications:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
