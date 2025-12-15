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

// GET - Listar categorias
export async function GET() {
  try {
    const supabase = await getSupabase()

    const { data: categories, error } = await supabase
      .from('news_categories')
      .select('*')
      .order('name_pt', { ascending: true })

    if (error) {
      console.error('Erro ao buscar categorias:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Erro no GET /api/admin/categories:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// POST - Criar categoria
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name_pt, name_en, name_es, slug, color } = body

    if (!name_pt || !slug) {
      return NextResponse.json(
        { error: 'Nome e slug são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar slug (apenas letras minúsculas, números e hífens)
    const slugRegex = /^[a-z0-9-]+$/
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        { error: 'Slug deve conter apenas letras minúsculas, números e hífens' },
        { status: 400 }
      )
    }

    const supabase = await getSupabase()

    // Verificar se slug já existe
    const { data: existing } = await supabase
      .from('news_categories')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Já existe uma categoria com este slug' },
        { status: 400 }
      )
    }

    const { data: category, error } = await supabase
      .from('news_categories')
      .insert({
        slug,
        name_pt,
        name_en: name_en || null,
        name_es: name_es || null,
        color: color || '#C9983A',
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar categoria:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ category, message: 'Categoria criada com sucesso' })
  } catch (error) {
    console.error('Erro no POST /api/admin/categories:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
