import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path'

// Força rota dinâmica
export const dynamic = 'force-dynamic'

const LOCALES_DIR = path.join(process.cwd(), 'src', 'locales')

// GET - Listar arquivos de tradução ou buscar conteúdo de um arquivo
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale')
    const file = searchParams.get('file')

    // Se locale e file foram passados, retorna o conteúdo do arquivo
    if (locale && file) {
      const filePath = path.join(LOCALES_DIR, locale, `${file}.json`)

      try {
        const content = await fs.readFile(filePath, 'utf-8')
        return NextResponse.json({
          content: JSON.parse(content),
          locale,
          file
        })
      } catch {
        return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 })
      }
    }

    // Lista todos os arquivos de tradução
    const locales = ['pt', 'en', 'es']
    const translations: { locale: string; files: string[] }[] = []

    for (const loc of locales) {
      const localeDir = path.join(LOCALES_DIR, loc)
      try {
        const files = await fs.readdir(localeDir)
        const jsonFiles = files
          .filter(f => f.endsWith('.json'))
          .map(f => f.replace('.json', ''))

        translations.push({
          locale: loc,
          files: jsonFiles
        })
      } catch {
        // Locale directory doesn't exist
        translations.push({
          locale: loc,
          files: []
        })
      }
    }

    return NextResponse.json({ translations })
  } catch (error) {
    console.error('Erro no GET /api/admin/translations:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// PUT - Atualizar arquivo de tradução
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

    const filePath = path.join(LOCALES_DIR, locale, `${file}.json`)

    // Verificar se o arquivo existe
    try {
      await fs.access(filePath)
    } catch {
      return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 })
    }

    // Salvar o conteúdo
    await fs.writeFile(filePath, JSON.stringify(content, null, 2), 'utf-8')

    return NextResponse.json({ message: 'Arquivo salvo com sucesso' })
  } catch (error) {
    console.error('Erro no PUT /api/admin/translations:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
