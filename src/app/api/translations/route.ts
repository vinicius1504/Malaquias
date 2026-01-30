import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

// Rota pública para servir traduções em runtime
export const dynamic = 'force-dynamic'

const LOCALES_DIR = path.join(process.cwd(), 'src', 'locales')
const VALID_LOCALES = ['pt', 'en', 'es']
const VALID_FILES = ['common', 'home', 'services', 'faq', 'contact', 'about', 'news', 'segments']

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale')

    if (!locale || !VALID_LOCALES.includes(locale)) {
      return NextResponse.json({ error: 'Locale inválido' }, { status: 400 })
    }

    const result: Record<string, unknown> = {}

    for (const file of VALID_FILES) {
      const filePath = path.join(LOCALES_DIR, locale, `${file}.json`)
      try {
        const content = await fs.readFile(filePath, 'utf-8')
        result[file] = JSON.parse(content)
      } catch {
        // Arquivo não encontrado, ignora
      }
    }

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    console.error('Erro no GET /api/translations:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
