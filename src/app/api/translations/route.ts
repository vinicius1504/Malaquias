import { NextRequest, NextResponse } from 'next/server'
import { queryAll } from '@/lib/db/postgres'
import fs from 'fs/promises'
import path from 'path'

// Rota pública para servir traduções em runtime (lê do banco de dados)
export const dynamic = 'force-dynamic'

const VALID_LOCALES = ['pt', 'en', 'es']
const VALID_FILES = ['common', 'home', 'services', 'faq', 'contact', 'about', 'news', 'segments']
const LOCALES_DIR = path.join(process.cwd(), 'src', 'locales')

// Fallback: lê dos JSONs no filesystem caso o banco esteja indisponível
async function getStaticFallback(locale: string): Promise<Record<string, unknown>> {
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

  return result
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale')

    if (!locale || !VALID_LOCALES.includes(locale)) {
      return NextResponse.json({ error: 'Locale inválido' }, { status: 400 })
    }

    try {
      // Busca do banco de dados
      const rows = await queryAll<{ namespace: string; content: Record<string, unknown> }>(
        'SELECT namespace, content FROM ui_translations WHERE locale = $1',
        [locale]
      )

      if (rows.length > 0) {
        const result: Record<string, unknown> = {}
        for (const row of rows) {
          result[row.namespace] = row.content
        }

        return NextResponse.json(result, {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          },
        })
      }
    } catch (dbError) {
      console.warn('Banco indisponível para traduções, usando fallback estático:', dbError)
    }

    // Fallback: lê dos JSONs estáticos no filesystem
    const fallbackResult = await getStaticFallback(locale)

    return NextResponse.json(fallbackResult, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    console.error('Erro no GET /api/translations:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
