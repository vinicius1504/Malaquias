import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query, queryOne, queryAll, insert, count } from '@/lib/db/postgres'

// Força rota dinâmica
export const dynamic = 'force-dynamic'

// GET - Listar notícias
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status')
    const categoryId = searchParams.get('category_id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    let whereClause = '1=1'
    const params: any[] = []
    let paramIndex = 1

    if (status) {
      whereClause += ` AND n.status = $${paramIndex++}`
      params.push(status)
    }

    if (categoryId) {
      whereClause += ` AND n.category_id = $${paramIndex++}`
      params.push(categoryId)
    }

    // Buscar notícias com traduções e categorias
    const newsQuery = `
      SELECT
        n.*,
        json_agg(DISTINCT jsonb_build_object(
          'id', nt.id,
          'news_id', nt.news_id,
          'locale', nt.locale,
          'title', nt.title,
          'excerpt', nt.excerpt,
          'content', nt.content
        )) as news_translations,
        jsonb_build_object(
          'id', nc.id,
          'slug', nc.slug,
          'name_pt', nc.name_pt,
          'name_en', nc.name_en,
          'name_es', nc.name_es,
          'color', nc.color
        ) as news_categories
      FROM news n
      LEFT JOIN news_translations nt ON n.id = nt.news_id
      LEFT JOIN news_categories nc ON n.category_id = nc.id
      WHERE ${whereClause}
      GROUP BY n.id, nc.id
      ORDER BY n.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `

    params.push(limit, offset)

    const data = await queryAll(newsQuery, params)

    // Contar total
    const countQuery = `SELECT COUNT(*) as total FROM news n WHERE ${whereClause}`
    const countResult = await queryOne<{ total: string }>(countQuery, params.slice(0, -2))
    const total = parseInt(countResult?.total || '0')

    return NextResponse.json({
      news: data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Erro no GET /api/admin/news:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// POST - Criar notícia
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { translations, slug, category_id, status, image_url, published_at } = body

    // Support both old format (title, excerpt, content) and new format (translations)
    const ptTranslation = translations?.pt || {
      title: body.title || '',
      excerpt: body.excerpt || '',
      content: body.content || '',
    }

    if (!ptTranslation.title || !slug) {
      return NextResponse.json(
        { error: 'Título e slug são obrigatórios' },
        { status: 400 }
      )
    }

    if (!category_id) {
      return NextResponse.json(
        { error: 'Categoria é obrigatória' },
        { status: 400 }
      )
    }

    // Criar a notícia
    const news = await insert('news', {
      slug,
      category_id,
      status: status || 'draft',
      image_url,
      author_id: session.user.id,
      published_at: status === 'published' ? published_at || new Date().toISOString() : null,
    })

    // Criar traduções para todos os idiomas
    const locales = ['pt', 'en', 'es'] as const

    for (const locale of locales) {
      const translation = locale === 'pt' ? ptTranslation : translations?.[locale]
      if (translation?.title || locale === 'pt') {
        await insert('news_translations', {
          news_id: news.id,
          locale,
          title: translation?.title || ptTranslation.title,
          excerpt: translation?.excerpt || ptTranslation.excerpt || '',
          content: translation?.content || ptTranslation.content || '',
        })
      }
    }

    // Log de auditoria
    await insert('audit_logs', {
      user_id: session.user.id,
      action: 'create',
      entity: 'news',
      entity_id: news.id,
      new_value: JSON.stringify({ title: ptTranslation.title, slug, status }),
    })

    return NextResponse.json({ news, message: 'Notícia criada com sucesso' })
  } catch (error) {
    console.error('Erro no POST /api/admin/news:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
