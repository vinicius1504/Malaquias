import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

async function getSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

// GET - Listar segmentos ativos (público)
export async function GET() {
  try {
    const supabase = await getSupabase()

    const { data, error } = await supabase
      .from('segments')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Erro ao buscar segmentos:', error)
      return NextResponse.json({ error: 'Erro ao buscar segmentos' }, { status: 500 })
    }

    return NextResponse.json({ segments: data })
  } catch (error) {
    console.error('Erro no GET /api/segments:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
