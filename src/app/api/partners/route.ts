import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Usa service_role para bypass do RLS em API de servidor
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Buscar parceiros/clientes ativos (API pública)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'partner' | 'client' | null (todos)

    let query = supabase
      .from('partners')
      .select('id, name, logo_url, type')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (type && ['partner', 'client'].includes(type)) {
      query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar parceiros:', error)
      return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 })
    }

    return NextResponse.json({ partners: data })
  } catch (error) {
    console.error('Erro no GET /api/partners:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
