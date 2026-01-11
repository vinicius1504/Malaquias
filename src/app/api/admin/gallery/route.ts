import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { listFiles, deleteFile } from '@/lib/storage/minio'

export const dynamic = 'force-dynamic'

// GET - Listar arquivos da galeria
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') || 'gallery'
    const type = searchParams.get('type') || 'all' // 'images', 'videos', 'all'

    // Listar arquivos do MinIO
    const files = await listFiles(folder, 100)

    // Filtrar por tipo se necessário
    const filteredFiles = files.filter(file => {
      if (type === 'all') return true
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (type === 'images') {
        return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')
      }
      if (type === 'videos') {
        return ['mp4', 'webm'].includes(ext || '')
      }
      return true
    })

    // Formatar resposta
    const filesWithUrls = filteredFiles.map(file => {
      const ext = file.name.split('.').pop()?.toLowerCase()
      const isVideo = ['mp4', 'webm'].includes(ext || '')

      return {
        name: file.name,
        url: file.url,
        size: file.size,
        type: isVideo ? 'video' : 'image',
        createdAt: file.lastModified,
      }
    })

    return NextResponse.json({ files: filesWithUrls })
  } catch (error) {
    console.error('Erro no GET /api/admin/gallery:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// DELETE - Excluir arquivo
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { path } = body

    if (!path) {
      return NextResponse.json({ error: 'Caminho do arquivo não informado' }, { status: 400 })
    }

    const success = await deleteFile(path)

    if (!success) {
      return NextResponse.json({ error: 'Erro ao excluir arquivo' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Arquivo excluído com sucesso' })
  } catch (error) {
    console.error('Erro no DELETE /api/admin/gallery:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
