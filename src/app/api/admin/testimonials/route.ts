import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { queryAll, queryOne, insert, remove } from '@/lib/db/postgres'

// Força rota dinâmica
export const dynamic = 'force-dynamic'

// GET - Listar todos os depoimentos (admin)
export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar depoimentos
    const testimonials = await queryAll(
      'SELECT * FROM testimonials ORDER BY display_order ASC, created_at DESC'
    )

    // Buscar traduções para cada depoimento
    const testimonialsWithTranslations = await Promise.all(
      testimonials.map(async (testimonial) => {
        const translations = await queryAll(
          'SELECT * FROM testimonial_translations WHERE testimonial_id = $1',
          [testimonial.id]
        )
        return {
          ...testimonial,
          testimonial_translations: translations,
        }
      })
    )

    return NextResponse.json({ testimonials: testimonialsWithTranslations })
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

    // Criar o depoimento base
    const testimonial = await insert('testimonials', {
      name,
      avatar_url: avatar_url || null,
      is_active: is_active ?? true,
      display_order: display_order ?? 0,
    })

    // Criar traduções para todos os idiomas fornecidos
    const locales = ['pt', 'en', 'es'] as const

    for (const locale of locales) {
      const translation = locale === 'pt' ? ptTranslation : translations?.[locale]
      if (translation?.content || locale === 'pt') {
        await insert('testimonial_translations', {
          testimonial_id: testimonial.id,
          locale,
          role: translation?.role || ptTranslation.role,
          company: translation?.company || ptTranslation.company || null,
          content: translation?.content || ptTranslation.content,
        })
      }
    }

    // Buscar depoimento completo com traduções
    const testimonialTranslations = await queryAll(
      'SELECT * FROM testimonial_translations WHERE testimonial_id = $1',
      [testimonial.id]
    )

    return NextResponse.json({
      testimonial: {
        ...testimonial,
        testimonial_translations: testimonialTranslations,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Erro no POST /api/admin/testimonials:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
