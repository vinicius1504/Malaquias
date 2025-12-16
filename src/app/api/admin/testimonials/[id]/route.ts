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

// GET - Buscar um depoimento específico
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
      .from('testimonials')
      .select(`
        *,
        testimonial_translations(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro ao buscar depoimento:', error)
      return NextResponse.json({ error: 'Depoimento não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ testimonial: data })
  } catch (error) {
    console.error('Erro no GET /api/admin/testimonials/[id]:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// PUT - Atualizar depoimento
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
    const { name, avatar_url, is_active, display_order, translations } = body

    const supabase = await getSupabase()

    // Atualizar dados base
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (name !== undefined) updateData.name = name
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url || null
    if (is_active !== undefined) updateData.is_active = is_active
    if (display_order !== undefined) updateData.display_order = display_order

    const { error: testimonialError } = await supabase
      .from('testimonials')
      .update(updateData)
      .eq('id', id)

    if (testimonialError) {
      console.error('Erro ao atualizar depoimento:', testimonialError)
      return NextResponse.json({ error: 'Erro ao atualizar depoimento' }, { status: 500 })
    }

    // Atualizar traduções se fornecidas
    if (translations) {
      const locales = ['pt', 'en', 'es'] as const

      for (const locale of locales) {
        if (translations[locale]) {
          const { role, company, content } = translations[locale]

          // Verificar se já existe tradução para este locale
          const { data: existing } = await supabase
            .from('testimonial_translations')
            .select('id')
            .eq('testimonial_id', id)
            .eq('locale', locale)
            .single()

          if (existing) {
            // Atualizar
            await supabase
              .from('testimonial_translations')
              .update({ role, company: company || null, content })
              .eq('id', existing.id)
          } else {
            // Inserir
            await supabase
              .from('testimonial_translations')
              .insert({
                testimonial_id: id,
                locale,
                role,
                company: company || null,
                content,
              })
          }
        }
      }
    }

    // Buscar depoimento atualizado
    const { data: fullTestimonial } = await supabase
      .from('testimonials')
      .select(`*, testimonial_translations(*)`)
      .eq('id', id)
      .single()

    return NextResponse.json({ testimonial: fullTestimonial })
  } catch (error) {
    console.error('Erro no PUT /api/admin/testimonials/[id]:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// DELETE - Remover depoimento
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
    const supabase = await getSupabase()

    // Deletar traduções primeiro (mesmo com ON DELETE CASCADE, é mais seguro)
    await supabase
      .from('testimonial_translations')
      .delete()
      .eq('testimonial_id', id)

    // Deletar depoimento
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao deletar depoimento:', error)
      return NextResponse.json({ error: 'Erro ao deletar depoimento' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro no DELETE /api/admin/testimonials/[id]:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
