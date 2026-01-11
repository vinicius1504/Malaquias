import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { queryOne, queryAll } from '@/lib/db/postgres'

// Força rota dinâmica
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar contagem de notícias
    const totalNewsResult = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM news'
    )
    const totalNews = parseInt(totalNewsResult?.count || '0')

    const publishedNewsResult = await queryOne<{ count: string }>(
      "SELECT COUNT(*) as count FROM news WHERE status = 'published'"
    )
    const publishedNews = parseInt(publishedNewsResult?.count || '0')

    // Buscar contagem de depoimentos
    const totalTestimonialsResult = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM testimonials'
    )
    const totalTestimonials = parseInt(totalTestimonialsResult?.count || '0')

    const activeTestimonialsResult = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM testimonials WHERE is_active = true'
    )
    const activeTestimonials = parseInt(activeTestimonialsResult?.count || '0')

    // Buscar contagem de parceiros/clientes
    const totalPartnersResult = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM partners'
    )
    const totalPartners = parseInt(totalPartnersResult?.count || '0')

    const activePartnersResult = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM partners WHERE is_active = true'
    )
    const activePartners = parseInt(activePartnersResult?.count || '0')

    // Buscar últimas notícias criadas/atualizadas
    const recentNews = await queryAll(
      `SELECT
        n.id,
        n.slug,
        n.status,
        n.created_at,
        n.updated_at,
        nt.title
      FROM news n
      LEFT JOIN news_translations nt ON n.id = nt.news_id AND nt.locale = 'pt'
      ORDER BY n.updated_at DESC
      LIMIT 5`
    )

    return NextResponse.json({
      stats: {
        news: {
          total: totalNews,
          published: publishedNews,
        },
        testimonials: {
          total: totalTestimonials,
          active: activeTestimonials,
        },
        partners: {
          total: totalPartners,
          active: activePartners,
        },
      },
      recentNews: recentNews.map(n => ({
        id: n.id,
        slug: n.slug,
        title: n.title || 'Sem título',
        is_published: n.status === 'published',
        updated_at: n.updated_at,
      })),
    })
  } catch (error) {
    console.error('Erro no GET /api/admin/stats:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
