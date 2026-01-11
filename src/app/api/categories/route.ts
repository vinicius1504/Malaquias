import { NextRequest, NextResponse } from 'next/server'
import { queryAll } from '@/lib/db/postgres'

// Força rota dinâmica
export const dynamic = 'force-dynamic'

// GET - Listar categorias (público)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'pt'

    const categories = await queryAll(
      'SELECT * FROM news_categories ORDER BY name_pt ASC'
    )

    // Formatar categorias com o nome no idioma correto
    const formattedCategories = categories.map(cat => {
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
    })

    return NextResponse.json({ categories: formattedCategories })
  } catch (error) {
    console.error('Erro no GET /api/categories:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
