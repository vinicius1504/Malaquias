import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Força rota dinâmica
export const dynamic = 'force-dynamic'

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
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const allowedVideoTypes = ['video/mp4', 'video/webm']
    const isImage = allowedImageTypes.includes(file.type)
    const isVideo = allowedVideoTypes.includes(file.type)

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não permitido. Use: JPG, PNG, WebP, GIF, MP4 ou WebM' },
        { status: 400 }
      )
    }

    // Validar tamanho (máx 15MB para imagens, 50MB para vídeos)
    const maxSize = isVideo ? 50 * 1024 * 1024 : 15 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Arquivo muito grande. Máximo: ${isVideo ? '50MB' : '15MB'}` },
        { status: 400 }
      )
    }

    const supabase = await getSupabase()

    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 8)
    const fileName = `${timestamp}-${randomId}.${fileExt}`

    // Verificar pasta de destino
    const folder = formData.get('folder') as string || 'news'
    const allowedFolders = ['news', 'partners', 'testimonials', 'segments', 'segments/videos']
    const finalFolder = allowedFolders.includes(folder) ? folder : 'news'
    const filePath = `${finalFolder}/${fileName}`

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
