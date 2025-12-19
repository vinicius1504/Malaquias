import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

// GET - Listar todos os segmentos (admin)
export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const supabase = await getSupabase()

    const { data, error } = await supabase
      .from('segments')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar segmentos:', error)
      return NextResponse.json({ error: 'Erro ao buscar segmentos' }, { status: 500 })
    }

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

    const supabase = await getSupabase()

    const { data: newSegment, error } = await supabase
      .from('segments')
      .insert({
        title,
        lp_slug: lp_slug || null,
        image_url: image_url || null,
        video_url: video_url || null,
        is_active: is_active ?? true,
        display_order: display_order ?? 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar segmento:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log de auditoria
    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      action: 'create',
      entity: 'segments',
      entity_id: newSegment.id,
      new_value: { title },
    })

    return NextResponse.json({ segment: newSegment, message: 'Segmento criado com sucesso' })
  } catch (error) {
    console.error('Erro no POST /api/admin/segments:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
