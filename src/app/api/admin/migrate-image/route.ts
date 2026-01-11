import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { uploadFile, getPublicUrl } from '@/lib/storage/minio'
import path from 'path'
import fs from 'fs/promises'

// Força rota dinâmica
export const dynamic = 'force-dynamic'

// POST - Migrar imagem local para MinIO Storage
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { localPath, folder = 'partners' } = await request.json()

    if (!localPath) {
      return NextResponse.json({ error: 'Caminho da imagem não informado' }, { status: 400 })
    }

    // Valida se o caminho é de uma imagem local (começa com /images/)
    if (!localPath.startsWith('/images/')) {
      return NextResponse.json({ error: 'Caminho inválido. Use apenas imagens locais.' }, { status: 400 })
    }

    // Caminho absoluto do arquivo na pasta public
    const publicPath = path.join(process.cwd(), 'public', localPath)

    // Verifica se o arquivo existe
    try {
      await fs.access(publicPath)
    } catch {
      return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 })
    }

    // Lê o arquivo
    const fileBuffer = await fs.readFile(publicPath)

    // Determina o tipo MIME baseado na extensão
    const ext = path.extname(localPath).toLowerCase()
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
    }
    const contentType = mimeTypes[ext] || 'image/png'

    // Gera nome único para o arquivo
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 8)
    const fileName = `${timestamp}-${randomId}${ext}`
    const filePath = `${folder}/${fileName}`

    // Upload para MinIO Storage
    await uploadFile(filePath, fileBuffer, contentType)

    // Gera URL pública
    const publicUrl = getPublicUrl(filePath)

    return NextResponse.json({
      url: publicUrl,
      originalPath: localPath,
      newPath: filePath,
      message: 'Imagem migrada com sucesso',
    })
  } catch (error) {
    console.error('Erro no POST /api/admin/migrate-image:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
