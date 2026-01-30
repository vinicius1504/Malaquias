import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { queryOne, upsert } from '@/lib/db/postgres'
import fs from 'fs/promises'
import path from 'path'

// Força rota dinâmica
export const dynamic = 'force-dynamic'

const VALID_LOCALES = ['pt', 'en', 'es']
const VALID_NAMESPACES = ['common', 'home', 'services', 'faq', 'contact', 'about', 'news', 'segments']
const LOCALES_DIR = path.join(process.cwd(), 'src', 'locales')

// Fallback: lê do JSON estático no filesystem
async function getStaticFile(locale: string, file: string): Promise<Record<string, unknown> | null> {
  try {
    const filePath = path.join(LOCALES_DIR, locale, `${file}.json`)
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content)
  } catch {
    return null
  }
}

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

      // Tenta buscar do banco
      const row = await queryOne<{ content: Record<string, unknown> }>(
        'SELECT content FROM ui_translations WHERE locale = $1 AND namespace = $2',
        [locale, file]
      )

      if (row) {
        return NextResponse.json({ content: row.content, locale, file })
      }

      // Fallback: lê do JSON estático
      const staticContent = await getStaticFile(locale, file)
      if (staticContent) {
        return NextResponse.json({ content: staticContent, locale, file })
      }

      return NextResponse.json({ error: 'Tradução não encontrada' }, { status: 404 })
    }

    // Lista todos os namespaces válidos para cada locale (sempre todos)
    const translations = VALID_LOCALES.map(loc => ({
      locale: loc,
      files: [...VALID_NAMESPACES]
    }))

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
