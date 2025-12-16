import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Força rota dinâmica (não pode ser estática por usar request.url)
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'pt'
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const slug = searchParams.get('slug')

    const supabase = await getSupabase()

    // Se slug foi passado, buscar uma notícia específica
    if (slug) {
      const { data: news, error } = await supabase
        .from('news')
        .select(`
          *,
          news_translations!inner(*)
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .eq('news_translations.locale', locale)
        .single()

      if (error || !news) {
        return NextResponse.json({ error: 'Notícia não encontrada' }, { status: 404 })
      }

      const translation = news.news_translations[0]
      return NextResponse.json({
        news: {
          id: news.id,
          slug: news.slug,
          category: news.category,
          image_url: news.image_url,
          image_banner: news.image_banner,
          published_at: news.published_at,
          title: translation?.title || '',
          excerpt: translation?.excerpt || '',
          content: translation?.content || '',
        },
      })
    }

    // Listar notícias publicadas
    let query = supabase
      .from('news')
      .select(`
        *,
        news_translations!inner(*)
      `, { count: 'exact' })
      .eq('status', 'published')
      .eq('news_translations.locale', locale)
      .order('published_at', { ascending: false })

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (search && search.trim()) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`, { referencedTable: 'news_translations' })
    }

    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: newsList, error, count } = await query

    if (error) {
      console.error('Erro ao buscar notícias:', error)
      return NextResponse.json({ error: 'Erro ao buscar notícias' }, { status: 500 })
    }

    const formattedNews = newsList?.map((news) => {
      const translation = news.news_translations[0]
      return {
        id: news.id,
        slug: news.slug,
        category: news.category,
        image_url: news.image_url,
        published_at: news.published_at,
        title: translation?.title || '',
        excerpt: translation?.excerpt || '',
      }
    }) || []

    return NextResponse.json({
      news: formattedNews,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Erro no GET /api/news:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
