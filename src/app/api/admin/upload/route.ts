import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function getSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore
          }
        },
      },
    }
  )
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não permitido. Use: JPG, PNG, WebP ou GIF' },
        { status: 400 }
      )
    }

    // Validar tamanho (máx 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo: 5MB' },
        { status: 400 }
      )
    }

    const supabase = await getSupabase()

    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 8)
    const fileName = `${timestamp}-${randomId}.${fileExt}`
    const filePath = `news/${fileName}`

    // Converter File para ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Upload para Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('News-image-malaquias')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Erro no upload:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Gerar URL pública
    const { data: urlData } = supabase.storage
      .from('News-image-malaquias')
      .getPublicUrl(filePath)

    return NextResponse.json({
      url: urlData.publicUrl,
      path: filePath,
      message: 'Upload realizado com sucesso',
    })
  } catch (error) {
    console.error('Erro no POST /api/admin/upload:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
