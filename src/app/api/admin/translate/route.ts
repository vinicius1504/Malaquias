import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Força rota dinâmica
export const dynamic = 'force-dynamic'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

interface TranslateRequest {
  title: string
  excerpt: string
  content: string
  sourceLocale: 'pt' | 'en' | 'es'
  targetLocale: 'pt' | 'en' | 'es'
}

const LANGUAGE_NAMES: Record<string, string> = {
  pt: 'Portuguese (Brazil)',
  en: 'English',
  es: 'Spanish',
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY não configurada' },
        { status: 500 }
      )
    }

    const body: TranslateRequest = await request.json()
    const { title, excerpt, content, sourceLocale, targetLocale } = body

    if (!title && !excerpt && !content) {
      return NextResponse.json(
        { error: 'Nenhum texto para traduzir' },
        { status: 400 }
      )
    }

    const sourceLang = LANGUAGE_NAMES[sourceLocale]
    const targetLang = LANGUAGE_NAMES[targetLocale]

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })

    const prompt = `You are a professional translator. Translate the following news article from ${sourceLang} to ${targetLang}.

IMPORTANT RULES:
1. Maintain the same tone and style
2. Keep HTML tags intact (do not translate tag names or attributes)
3. Preserve formatting and structure
4. Use natural, fluent ${targetLang}
5. Keep proper nouns and brand names unchanged
6. Return ONLY a valid JSON object, no markdown code blocks

Input JSON:
{
  "title": ${JSON.stringify(title || '')},
  "excerpt": ${JSON.stringify(excerpt || '')},
  "content": ${JSON.stringify(content || '')}
}

Return a JSON object with the same structure containing the translated texts:
{"title": "...", "excerpt": "...", "content": "..."}`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // Parse JSON response - remove markdown code blocks if present
    let cleanedText = text.trim()
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.slice(7)
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.slice(3)
    }
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.slice(0, -3)
    }
    cleanedText = cleanedText.trim()

    let translated
    try {
      translated = JSON.parse(cleanedText)
    } catch {
      console.error('Erro ao parsear resposta do Gemini:', cleanedText)
      return NextResponse.json(
        { error: 'Erro ao processar tradução. Tente novamente.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      title: translated.title || '',
      excerpt: translated.excerpt || '',
      content: translated.content || '',
    })
  } catch (error) {
    console.error('Erro no POST /api/admin/translate:', error)
    return NextResponse.json(
      { error: 'Erro ao traduzir. Verifique a API key do Gemini.' },
      { status: 500 }
    )
  }
}
