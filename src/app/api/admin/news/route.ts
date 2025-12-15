import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

// GET - Listar notícias
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const supabase = await getSupabase()
    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status')
    const categoryId = searchParams.get('category_id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    let query = supabase
      .from('news')
      .select(`
        *,
        news_translations!inner(*),
        news_categories(id, slug, name_pt, name_en, name_es, color)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Erro ao buscar notícias:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      news: data,
      total: count,
      page,
      totalPages: Math.ceil((count || 0) / limit),
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

    const supabase = await getSupabase()

    // Criar a notícia
    const { data: news, error: newsError } = await supabase
      .from('news')
      .insert({
        slug,
        category_id,
        status: status || 'draft',
        image_url,
        author_id: session.user.id,
        published_at: status === 'published' ? published_at || new Date().toISOString() : null,
      })
      .select()
      .single()

    if (newsError) {
      console.error('Erro ao criar notícia:', newsError)
      return NextResponse.json({ error: newsError.message }, { status: 500 })
    }

    // Criar traduções para todos os idiomas
    const locales = ['pt', 'en', 'es'] as const
    const translationsToInsert = locales
      .filter(locale => translations?.[locale]?.title || locale === 'pt')
      .map(locale => ({
        news_id: news.id,
        locale,
        title: translations?.[locale]?.title || ptTranslation.title,
        excerpt: translations?.[locale]?.excerpt || ptTranslation.excerpt || '',
        content: translations?.[locale]?.content || ptTranslation.content || '',
      }))

    const { error: translationError } = await supabase
      .from('news_translations')
      .insert(translationsToInsert)

    if (translationError) {
      // Rollback - deletar a notícia
      await supabase.from('news').delete().eq('id', news.id)
      console.error('Erro ao criar tradução:', translationError)
      return NextResponse.json({ error: translationError.message }, { status: 500 })
    }

    // Log de auditoria
    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      action: 'create',
      entity: 'news',
      entity_id: news.id,
      new_value: { title: ptTranslation.title, slug, status },
    })

    return NextResponse.json({ news, message: 'Notícia criada com sucesso' })
  } catch (error) {
    console.error('Erro no POST /api/admin/news:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
