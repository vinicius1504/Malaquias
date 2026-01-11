import { NextRequest, NextResponse } from 'next/server'
import { queryOne, queryAll } from '@/lib/db/postgres'

// Força rota dinâmica (não pode ser estática por usar request.url)
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'pt'
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const slug = searchParams.get('slug')
    const offset = (page - 1) * limit

    // Se slug foi passado, buscar uma notícia específica
    if (slug) {
      const news = await queryOne(
        `SELECT
          n.*,
          nt.title,
          nt.excerpt,
          nt.content
        FROM news n
        INNER JOIN news_translations nt ON n.id = nt.news_id
        WHERE n.slug = $1 AND n.status = 'published' AND nt.locale = $2`,
        [slug, locale]
      )

      if (!news) {
        return NextResponse.json({ error: 'Notícia não encontrada' }, { status: 404 })
      }

      return NextResponse.json({
        news: {
          id: news.id,
          slug: news.slug,
          category: news.category,
          image_url: news.image_url,
          image_banner: news.image_banner,
          published_at: news.published_at,
          title: news.title || '',
          excerpt: news.excerpt || '',
          content: news.content || '',
        },
      })
    }

    // Listar notícias publicadas
    let whereClause = "n.status = 'published' AND nt.locale = $1"
    const params: any[] = [locale]
    let paramIndex = 2

    if (category && category !== 'all') {
      whereClause += ` AND n.category = $${paramIndex++}`
      params.push(category)
    }

    if (search && search.trim()) {
      whereClause += ` AND (nt.title ILIKE $${paramIndex} OR nt.excerpt ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    // Buscar notícias
    const newsQuery = `
      SELECT
        n.id,
        n.slug,
        n.category,
        n.image_url,
        n.published_at,
        nt.title,
        nt.excerpt
      FROM news n
      INNER JOIN news_translations nt ON n.id = nt.news_id
      WHERE ${whereClause}
      ORDER BY n.published_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `
    params.push(limit, offset)

    const newsList = await queryAll(newsQuery, params)

    // Contar total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM news n
      INNER JOIN news_translations nt ON n.id = nt.news_id
      WHERE ${whereClause}
    `
    const countResult = await queryOne<{ total: string }>(countQuery, params.slice(0, -2))
    const total = parseInt(countResult?.total || '0')

    const formattedNews = newsList.map((news) => ({
      id: news.id,
      slug: news.slug,
      category: news.category,
      image_url: news.image_url,
      published_at: news.published_at,
      title: news.title || '',
      excerpt: news.excerpt || '',
    }))

    return NextResponse.json({
      news: formattedNews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Erro no GET /api/news:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
