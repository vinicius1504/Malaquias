import { NextRequest, NextResponse } from 'next/server'
import { queryAll } from '@/lib/db/postgres'

// Força rota dinâmica e desabilita cache
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

// GET - Buscar depoimentos ativos (API pública)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'pt'

    const data = await queryAll(
      `SELECT
        t.id,
        t.name,
        t.avatar_url,
        tt.locale,
        tt.role,
        tt.company,
        tt.content
      FROM testimonials t
      INNER JOIN testimonial_translations tt ON t.id = tt.testimonial_id
      WHERE t.is_active = true AND tt.locale = $1
      ORDER BY t.display_order ASC`,
      [locale]
    )

    // Formatar resposta para simplificar o uso no frontend
    const testimonials = data.map(item => ({
      id: item.id,
      name: item.name,
      avatar_url: item.avatar_url,
      role: item.role || '',
      company: item.company || null,
      content: item.content || '',
    }))

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
