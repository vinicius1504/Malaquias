import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { queryOne, queryAll, insert, query, remove } from '@/lib/db/postgres'

// Força rota dinâmica
export const dynamic = 'force-dynamic'

// GET - Buscar notícia por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    // Buscar notícia
    const news = await queryOne(
      'SELECT * FROM news WHERE id = $1',
      [id]
    )

    if (!news) {
      return NextResponse.json({ error: 'Notícia não encontrada' }, { status: 404 })
    }

    // Buscar traduções
    const translations = await queryAll(
      'SELECT * FROM news_translations WHERE news_id = $1',
      [id]
    )

    return NextResponse.json({
      news: {
        ...news,
        news_translations: translations,
      },
    })
  } catch (error) {
    console.error('Erro no GET /api/admin/news/[id]:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// PUT - Atualizar notícia
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { translations, slug, category_id, status, image_url, image_banner, published_at } = body

    // Buscar notícia atual para log
    const oldNews = await queryOne('SELECT * FROM news WHERE id = $1', [id])
    const oldTranslations = await queryAll(
      'SELECT * FROM news_translations WHERE news_id = $1',
      [id]
    )

    // Suporte ao formato antigo (title, excerpt, content direto no body)
    const ptTranslation = translations?.pt || {
      title: body.title || '',
      excerpt: body.excerpt || '',
      content: body.content || '',
    }

    // Atualizar notícia
    await query(
      `UPDATE news SET
        slug = $1,
        category_id = $2,
        status = $3::varchar,
        image_url = $4,
        image_banner = $5,
        published_at = CASE
          WHEN $6::varchar = 'published' AND published_at IS NULL THEN $7
          ELSE published_at
        END,
        updated_at = NOW()
      WHERE id = $8`,
      [slug, category_id || null, status, image_url, image_banner, status, published_at || new Date().toISOString(), id]
    )

    // Atualizar traduções para todos os idiomas
    const locales = ['pt', 'en', 'es'] as const

    for (const locale of locales) {
      const translation = locale === 'pt' ? ptTranslation : translations?.[locale]

      // Só atualiza se tiver conteúdo
      if (translation?.title) {
        await query(
          `INSERT INTO news_translations (news_id, locale, title, excerpt, content)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (news_id, locale) DO UPDATE SET
             title = EXCLUDED.title,
             excerpt = EXCLUDED.excerpt,
             content = EXCLUDED.content`,
          [id, locale, translation.title, translation.excerpt || '', translation.content || '']
        )
      }
    }

    // Log de auditoria
    await insert('audit_logs', {
      user_id: session.user.id,
      action: 'update',
      entity: 'news',
      entity_id: id,
      old_value: JSON.stringify({ title: oldTranslations?.[0]?.title, status: oldNews?.status }),
      new_value: JSON.stringify({ title: ptTranslation.title, status }),
    })

    return NextResponse.json({ message: 'Notícia atualizada com sucesso' })
  } catch (error) {
    console.error('Erro no PUT /api/admin/news/[id]:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// DELETE - Excluir notícia
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    // Buscar notícia para log
    const news = await queryOne('SELECT * FROM news WHERE id = $1', [id])
    const translations = await queryAll(
      'SELECT * FROM news_translations WHERE news_id = $1',
      [id]
    )

    // Deletar traduções primeiro
    await remove('news_translations', 'news_id = $1', [id])

    // Deletar notícia
    await remove('news', 'id = $1', [id])

    // Log de auditoria
    await insert('audit_logs', {
      user_id: session.user.id,
      action: 'delete',
      entity: 'news',
      entity_id: id,
      old_value: JSON.stringify({ title: translations?.[0]?.title, slug: news?.slug }),
    })

    return NextResponse.json({ message: 'Notícia excluída com sucesso' })
  } catch (error) {
    console.error('Erro no DELETE /api/admin/news/[id]:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
