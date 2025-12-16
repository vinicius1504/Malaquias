import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar contagem de notícias
    const { count: totalNews } = await supabase
      .from('news')
      .select('*', { count: 'exact', head: true })

    const { count: publishedNews } = await supabase
      .from('news')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true)

    // Buscar contagem de depoimentos
    const { count: totalTestimonials } = await supabase
      .from('testimonials')
      .select('*', { count: 'exact', head: true })

    const { count: activeTestimonials } = await supabase
      .from('testimonials')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // Buscar contagem de parceiros/clientes
    const { count: totalPartners } = await supabase
      .from('partners')
      .select('*', { count: 'exact', head: true })

    const { count: activePartners } = await supabase
      .from('partners')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // Buscar últimas notícias criadas/atualizadas
    const { data: recentNews } = await supabase
      .from('news')
      .select('id, slug, is_published, created_at, updated_at, news_translations!inner(title, locale)')
      .eq('news_translations.locale', 'pt')
      .order('updated_at', { ascending: false })
      .limit(5)

    return NextResponse.json({
      stats: {
        news: {
          total: totalNews || 0,
          published: publishedNews || 0,
        },
        testimonials: {
          total: totalTestimonials || 0,
          active: activeTestimonials || 0,
        },
        partners: {
          total: totalPartners || 0,
          active: activePartners || 0,
        },
      },
      recentNews: recentNews?.map(n => ({
        id: n.id,
        slug: n.slug,
        title: Array.isArray(n.news_translations)
          ? n.news_translations[0]?.title
          : (n.news_translations as { title: string })?.title || 'Sem título',
        is_published: n.is_published,
        updated_at: n.updated_at,
      })) || [],
    })
  } catch (error) {
    console.error('Erro no GET /api/admin/stats:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
