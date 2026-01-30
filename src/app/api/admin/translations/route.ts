import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { queryAll, queryOne, upsert } from '@/lib/db/postgres'

// Força rota dinâmica
export const dynamic = 'force-dynamic'

const VALID_LOCALES = ['pt', 'en', 'es']
const VALID_NAMESPACES = ['common', 'home', 'services', 'faq', 'contact', 'about', 'news', 'segments']

// GET - Listar namespaces de tradução ou buscar conteúdo de um namespace
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale')
    const file = searchParams.get('file')

    // Se locale e file foram passados, retorna o conteúdo do namespace
    if (locale && file) {
      if (!VALID_LOCALES.includes(locale) || !VALID_NAMESPACES.includes(file)) {
        return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 })
      }

      const row = await queryOne<{ content: Record<string, unknown> }>(
        'SELECT content FROM ui_translations WHERE locale = $1 AND namespace = $2',
        [locale, file]
      )

      if (!row) {
        return NextResponse.json({ error: 'Tradução não encontrada' }, { status: 404 })
      }

      return NextResponse.json({
        content: row.content,
        locale,
        file
      })
    }

    // Lista todos os namespaces por locale
    const translations: { locale: string; files: string[] }[] = []

    for (const loc of VALID_LOCALES) {
      const rows = await queryAll<{ namespace: string }>(
        'SELECT namespace FROM ui_translations WHERE locale = $1 ORDER BY namespace',
        [loc]
      )

      translations.push({
        locale: loc,
        files: rows.map(r => r.namespace)
      })
    }

    return NextResponse.json({ translations })
  } catch (error) {
    console.error('Erro no GET /api/admin/translations:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// PUT - Atualizar tradução no banco de dados
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { locale, file, content } = body

    if (!locale || !file || !content) {
      return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 })
    }

    if (!VALID_LOCALES.includes(locale) || !VALID_NAMESPACES.includes(file)) {
      return NextResponse.json({ error: 'Locale ou namespace inválido' }, { status: 400 })
    }

    // Upsert: insere ou atualiza no banco
    await upsert(
      'ui_translations',
      {
        locale,
        namespace: file,
        content: JSON.stringify(content),
        updated_at: new Date().toISOString()
      },
      ['locale', 'namespace']
    )

    return NextResponse.json({ message: 'Tradução salva com sucesso' })
  } catch (error) {
    console.error('Erro no PUT /api/admin/translations:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
