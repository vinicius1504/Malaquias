import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
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

// GET - Listar todos os depoimentos (admin)
export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const supabase = await getSupabase()

    const { data, error } = await supabase
      .from('testimonials')
      .select(`
        *,
        testimonial_translations(*)
      `)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar depoimentos:', error)
      return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 })
    }

    return NextResponse.json({ testimonials: data })
  } catch (error) {
    console.error('Erro no GET /api/admin/testimonials:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// POST - Criar novo depoimento
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, avatar_url, is_active, display_order, translations } = body

    // Suportar formato antigo (role, company, content direto) e novo (translations)
    const ptTranslation = translations?.pt || {
      role: body.role || '',
      company: body.company || null,
      content: body.content || '',
    }

    if (!name || !ptTranslation.role || !ptTranslation.content) {
      return NextResponse.json(
        { error: 'Nome, cargo e depoimento são obrigatórios' },
        { status: 400 }
      )
    }

    const supabase = await getSupabase()

    // Criar o depoimento base
    const { data: testimonial, error: testimonialError } = await supabase
      .from('testimonials')
      .insert({
        name,
        avatar_url: avatar_url || null,
        is_active: is_active ?? true,
        display_order: display_order ?? 0,
      })
      .select()
      .single()

    if (testimonialError) {
      console.error('Erro ao criar depoimento:', testimonialError)
      return NextResponse.json({ error: 'Erro ao criar depoimento' }, { status: 500 })
    }

    // Criar traduções para todos os idiomas fornecidos
    const locales = ['pt', 'en', 'es'] as const
    const translationsToInsert = locales
      .filter(locale => translations?.[locale]?.content || locale === 'pt')
      .map(locale => ({
        testimonial_id: testimonial.id,
        locale,
        role: translations?.[locale]?.role || ptTranslation.role,
        company: translations?.[locale]?.company || ptTranslation.company || null,
        content: translations?.[locale]?.content || ptTranslation.content,
      }))

    const { error: translationError } = await supabase
      .from('testimonial_translations')
      .insert(translationsToInsert)

    if (translationError) {
      // Rollback - deletar o depoimento
      await supabase.from('testimonials').delete().eq('id', testimonial.id)
      console.error('Erro ao criar tradução:', translationError)
      return NextResponse.json({ error: translationError.message }, { status: 500 })
    }

    // Buscar depoimento completo com traduções
    const { data: fullTestimonial } = await supabase
      .from('testimonials')
      .select(`*, testimonial_translations(*)`)
      .eq('id', testimonial.id)
      .single()

    return NextResponse.json({ testimonial: fullTestimonial }, { status: 201 })
  } catch (error) {
    console.error('Erro no POST /api/admin/testimonials:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
