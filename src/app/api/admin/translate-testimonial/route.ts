import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Força rota dinâmica
export const dynamic = 'force-dynamic'

const apiKey = process.env.GEMINI_API_KEY || ''
const genAI = new GoogleGenerativeAI(apiKey)

interface TranslateRequest {
  role: string
  company: string
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
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY não configurada' },
        { status: 500 }
      )
    }

    const body: TranslateRequest = await request.json()
    const { role, company, content, sourceLocale, targetLocale } = body

    if (!role && !content) {
      return NextResponse.json(
        { error: 'Nenhum texto para traduzir' },
        { status: 400 }
      )
    }

    const sourceLang = LANGUAGE_NAMES[sourceLocale]
    const targetLang = LANGUAGE_NAMES[targetLocale]

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })

    const prompt = `You are a professional translator. Translate the following testimonial data from ${sourceLang} to ${targetLang}.

IMPORTANT RULES:
1. Maintain the same tone and style - this is a customer testimonial
2. Use natural, fluent ${targetLang}
3. Keep the meaning and sentiment of the original
4. Job titles should be translated appropriately for the target language
5. Company names should generally stay the same unless they have an official localized name
6. Return ONLY a valid JSON object, no markdown code blocks

Input JSON:
{
  "role": ${JSON.stringify(role || '')},
  "company": ${JSON.stringify(company || '')},
  "content": ${JSON.stringify(content || '')}
}

Return a JSON object with the same structure containing the translated texts:
{"role": "...", "company": "...", "content": "..."}`

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
      role: translated.role || '',
      company: translated.company || '',
      content: translated.content || '',
    })
  } catch (error: unknown) {
    console.error('Erro no POST /api/admin/translate-testimonial:', error)

    // Verificar se é erro de rate limit
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('too many requests') || errorMessage.toLowerCase().includes('rate limit')) {
      return NextResponse.json(
        { error: 'Limite de requisições atingido. Aguarde alguns segundos e tente novamente.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao traduzir. Verifique a API key do Gemini.' },
      { status: 500 }
    )
  }
}
