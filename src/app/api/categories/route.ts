import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Força rota dinâmica
export const dynamic = 'force-dynamic'

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

// GET - Listar categorias (público)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'pt'

    const supabase = await getSupabase()

    const { data: categories, error } = await supabase
      .from('news_categories')
      .select('*')
      .order('name_pt', { ascending: true })

    if (error) {
      console.error('Erro ao buscar categorias:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Formatar categorias com o nome no idioma correto
    const formattedCategories = categories?.map(cat => {
      let name = cat.name_pt
      if (locale === 'en' && cat.name_en) {
        name = cat.name_en
      } else if (locale === 'es' && cat.name_es) {
        name = cat.name_es
      }

      return {
        id: cat.id,
        slug: cat.slug,
        name,
        color: cat.color,
      }
    }) || []

    return NextResponse.json({ categories: formattedCategories })
  } catch (error) {
    console.error('Erro no GET /api/categories:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
