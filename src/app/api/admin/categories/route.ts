import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { queryAll, queryOne, insert } from '@/lib/db/postgres'

// Força rota dinâmica
export const dynamic = 'force-dynamic'

// GET - Listar categorias
export async function GET() {
  try {
    const categories = await queryAll(
      'SELECT * FROM news_categories ORDER BY name_pt ASC'
    )

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

    // Verificar se slug já existe
    const existing = await queryOne(
      'SELECT id FROM news_categories WHERE slug = $1',
      [slug]
    )

    if (existing) {
      return NextResponse.json(
        { error: 'Já existe uma categoria com este slug' },
        { status: 400 }
      )
    }

    const category = await insert('news_categories', {
      slug,
      name_pt,
      name_en: name_en || null,
      name_es: name_es || null,
      color: color || '#C9983A',
    })

    return NextResponse.json({ category, message: 'Categoria criada com sucesso' })
  } catch (error) {
    console.error('Erro no POST /api/admin/categories:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
