import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const LP_DIR = path.join(process.cwd(), 'src', 'data', 'lp')

// GET - Listar todas as LPs
export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const files = fs.readdirSync(LP_DIR)
    const lps = files
      .filter((file) => file.endsWith('.json'))
      .map((file) => {
        const filePath = path.join(LP_DIR, file)
        const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
        return {
          slug: file.replace('.json', ''),
          theme: content.theme,
          title: content.content?.pt?.seo?.title || content.seo?.title || file.replace('.json', ''),
          sectionsCount: content.content?.pt?.sections?.length || content.sections?.length || 0,
        }
      })

    return NextResponse.json({ lps })
  } catch (error) {
    console.error('Erro ao listar LPs:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// POST - Criar nova LP
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { slug, title, accentColor } = await request.json()

    if (!slug) {
      return NextResponse.json({ error: 'Slug é obrigatório' }, { status: 400 })
    }

    // Validar slug
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    if (!slugRegex.test(slug)) {
      return NextResponse.json({ error: 'Slug inválido' }, { status: 400 })
    }

    const filePath = path.join(LP_DIR, `${slug}.json`)

    // Verificar se já existe
    if (fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'LP já existe' }, { status: 400 })
    }

    // Criar LP com estrutura básica
    const newLP = {
      slug,
      theme: {
        mode: 'dark',
        accentColor: accentColor || '#22c55e',
      },
      content: {
        pt: {
          seo: {
            title: title || `LP ${slug}`,
            description: '',
            keywords: [],
          },
          hero: {
            title: title || `LP ${slug}`,
            description: '',
            ctaText: 'Fale Conosco',
            ctaLink: '/contato',
            backgroundType: 'image',
            backgroundImage: '',
            highlights: [],
          },
          sections: [],
        },
        en: {
          seo: { title: '', description: '', keywords: [] },
          hero: { title: '', description: '', ctaText: '', ctaLink: '', backgroundType: 'image', backgroundImage: '', highlights: [] },
          sections: [],
        },
        es: {
          seo: { title: '', description: '', keywords: [] },
          hero: { title: '', description: '', ctaText: '', ctaLink: '', backgroundType: 'image', backgroundImage: '', highlights: [] },
          sections: [],
        },
      },
    }

    fs.writeFileSync(filePath, JSON.stringify(newLP, null, 2), 'utf-8')

    return NextResponse.json({ message: 'LP criada com sucesso', slug })
  } catch (error) {
    console.error('Erro ao criar LP:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
