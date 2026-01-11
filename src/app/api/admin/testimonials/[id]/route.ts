import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { queryOne, queryAll, query, insert, remove } from '@/lib/db/postgres'

// Força rota dinâmica
export const dynamic = 'force-dynamic'

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

    const testimonial = await queryOne('SELECT * FROM testimonials WHERE id = $1', [id])

    if (!testimonial) {
      return NextResponse.json({ error: 'Depoimento não encontrado' }, { status: 404 })
    }

    const translations = await queryAll(
      'SELECT * FROM testimonial_translations WHERE testimonial_id = $1',
      [id]
    )

    return NextResponse.json({
      testimonial: {
        ...testimonial,
        testimonial_translations: translations,
      },
    })
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

    // Atualizar dados base
    const updateFields: string[] = ['updated_at = NOW()']
    const updateValues: any[] = []
    let paramIndex = 1

    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`)
      updateValues.push(name)
    }
    if (avatar_url !== undefined) {
      updateFields.push(`avatar_url = $${paramIndex++}`)
      updateValues.push(avatar_url || null)
    }
    if (is_active !== undefined) {
      updateFields.push(`is_active = $${paramIndex++}`)
      updateValues.push(is_active)
    }
    if (display_order !== undefined) {
      updateFields.push(`display_order = $${paramIndex++}`)
      updateValues.push(display_order)
    }

    updateValues.push(id)

    await query(
      `UPDATE testimonials SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`,
      updateValues
    )

    // Atualizar traduções se fornecidas
    if (translations) {
      const locales = ['pt', 'en', 'es'] as const

      for (const locale of locales) {
        if (translations[locale]) {
          const { role, company, content } = translations[locale]

          await query(
            `INSERT INTO testimonial_translations (testimonial_id, locale, role, company, content)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (testimonial_id, locale) DO UPDATE SET
               role = EXCLUDED.role,
               company = EXCLUDED.company,
               content = EXCLUDED.content`,
            [id, locale, role, company || null, content]
          )
        }
      }
    }

    // Buscar depoimento atualizado
    const testimonial = await queryOne('SELECT * FROM testimonials WHERE id = $1', [id])
    const testimonialTranslations = await queryAll(
      'SELECT * FROM testimonial_translations WHERE testimonial_id = $1',
      [id]
    )

    return NextResponse.json({
      testimonial: {
        ...testimonial,
        testimonial_translations: testimonialTranslations,
      },
    })
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

    // Deletar traduções primeiro
    await remove('testimonial_translations', 'testimonial_id = $1', [id])

    // Deletar depoimento
    await remove('testimonials', 'id = $1', [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro no DELETE /api/admin/testimonials/[id]:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
