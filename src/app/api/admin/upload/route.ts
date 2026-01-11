import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { uploadFile } from '@/lib/storage/minio'

// Força rota dinâmica
export const dynamic = 'force-dynamic'

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

    // Validar tamanho (máx 25MB para todos os arquivos)
    const maxSize = 25 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo: 25MB' },
        { status: 400 }
      )
    }

    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 8)
    const fileName = `${timestamp}-${randomId}.${fileExt}`

    // Verificar pasta de destino
    const folder = formData.get('folder') as string || 'news'
    const allowedFolders = ['news', 'partners', 'testimonials', 'segments', 'segments/videos', 'gallery', 'gallery/images', 'gallery/videos']
    const finalFolder = allowedFolders.includes(folder) ? folder : 'news'
    const filePath = `${finalFolder}/${fileName}`

    // Converter File para Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload para MinIO
    const { url, path } = await uploadFile(filePath, buffer, file.type)

    return NextResponse.json({
      url,
      path,
      message: 'Upload realizado com sucesso',
    })
  } catch (error) {
    console.error('Erro no POST /api/admin/upload:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
