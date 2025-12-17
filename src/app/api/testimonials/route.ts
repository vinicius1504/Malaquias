import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Força rota dinâmica e desabilita cache
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

// Usa service_role para bypass do RLS em API de servidor
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Buscar depoimentos ativos (API pública)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'pt'

    const { data, error } = await supabase
      .from('testimonials')
      .select(`
        id,
        name,
        avatar_url,
        testimonial_translations!inner(
          locale,
          role,
          company,
          content
        )
      `)
      .eq('is_active', true)
      .eq('testimonial_translations.locale', locale)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Erro ao buscar depoimentos:', error)
      return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 })
    }

    // Formatar resposta para simplificar o uso no frontend
    const testimonials = data?.map(item => {
      const translation = Array.isArray(item.testimonial_translations)
        ? item.testimonial_translations[0]
        : item.testimonial_translations

      return {
        id: item.id,
        name: item.name,
        avatar_url: item.avatar_url,
        role: translation?.role || '',
        company: translation?.company || null,
        content: translation?.content || '',
      }
    }) || []

    const response = NextResponse.json({ testimonials })

    // Headers para prevenir cache
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    return response
  } catch (error) {
    console.error('Erro no GET /api/testimonials:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
