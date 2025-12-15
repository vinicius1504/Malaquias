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
    const supabase = await getSupabase()

    const { data, error } = await supabase
      .from('news')
      .select(`
        *,
        news_translations(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro ao buscar notícia:', error)
      return NextResponse.json({ error: 'Notícia não encontrada' }, { status: 404 })
    }

    return NextResponse.json({ news: data })
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

    const supabase = await getSupabase()

    // Buscar notícia atual para log
    const { data: oldNews } = await supabase
      .from('news')
      .select('*, news_translations(*)')
      .eq('id', id)
      .single()

    // Suporte ao formato antigo (title, excerpt, content direto no body)
    const ptTranslation = translations?.pt || {
      title: body.title || '',
      excerpt: body.excerpt || '',
      content: body.content || '',
    }

    // Atualizar notícia
    const { error: newsError } = await supabase
      .from('news')
      .update({
        slug,
        category_id: category_id || null,
        status,
        image_url,
        image_banner,
        published_at: status === 'published' && !oldNews?.published_at
          ? published_at || new Date().toISOString()
          : oldNews?.published_at,
      })
      .eq('id', id)

    if (newsError) {
      console.error('Erro ao atualizar notícia:', newsError)
      return NextResponse.json({ error: newsError.message }, { status: 500 })
    }

    // Atualizar traduções para todos os idiomas
    const locales = ['pt', 'en', 'es'] as const

    for (const locale of locales) {
      const translation = locale === 'pt' ? ptTranslation : translations?.[locale]

      // Só atualiza se tiver conteúdo
      if (translation?.title) {
        const { error: translationError } = await supabase
          .from('news_translations')
          .upsert({
            news_id: id,
            locale,
            title: translation.title,
            excerpt: translation.excerpt || '',
            content: translation.content || '',
          }, {
            onConflict: 'news_id,locale',
          })

        if (translationError) {
          console.error(`Erro ao atualizar tradução ${locale}:`, translationError)
          return NextResponse.json({ error: translationError.message }, { status: 500 })
        }
      }
    }

    // Log de auditoria
    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      action: 'update',
      entity: 'news',
      entity_id: id,
      old_value: { title: oldNews?.news_translations?.[0]?.title, status: oldNews?.status },
      new_value: { title: ptTranslation.title, status },
    })

    return NextResponse.json({ message: 'Notícia atualizada com sucesso' })
  } catch (error) {
    console.error('Erro no PUT /api/admin/news/[id]:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// DELETE - Excluir notícia
export async function DELETE(
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const supabase = await getSupabase()

    // Buscar notícia para log
    const { data: news } = await supabase
      .from('news')
      .select('*, news_translations(*)')
      .eq('id', id)
      .single()

    // Deletar notícia (cascade deleta traduções)
    const { error } = await supabase.from('news').delete().eq('id', id)

    if (error) {
      console.error('Erro ao deletar notícia:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log de auditoria
    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      action: 'delete',
      entity: 'news',
      entity_id: id,
      old_value: { title: news?.news_translations?.[0]?.title, slug: news?.slug },
    })

    return NextResponse.json({ message: 'Notícia excluída com sucesso' })
  } catch (error) {
    console.error('Erro no DELETE /api/admin/news/[id]:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
