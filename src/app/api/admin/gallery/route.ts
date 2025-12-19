import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

    const supabase = await getSupabase()

    // Listar arquivos do bucket
    const { data: files, error } = await supabase.storage
      .from('News-image-malaquias')
      .list(folder, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      })

    if (error) {
      console.error('Erro ao listar arquivos:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filtrar por tipo se necessário
    const filteredFiles = files?.filter(file => {
      if (type === 'all') return true
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (type === 'images') {
        return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')
      }
      if (type === 'videos') {
        return ['mp4', 'webm'].includes(ext || '')
      }
      return true
    }) || []

    // Gerar URLs públicas para cada arquivo
    const filesWithUrls = filteredFiles.map(file => {
      const { data: urlData } = supabase.storage
        .from('News-image-malaquias')
        .getPublicUrl(`${folder}/${file.name}`)

      const ext = file.name.split('.').pop()?.toLowerCase()
      const isVideo = ['mp4', 'webm'].includes(ext || '')

      return {
        name: file.name,
        url: urlData.publicUrl,
        size: file.metadata?.size || 0,
        type: isVideo ? 'video' : 'image',
        createdAt: file.created_at,
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

    const supabase = await getSupabase()

    const { error } = await supabase.storage
      .from('News-image-malaquias')
      .remove([path])

    if (error) {
      console.error('Erro ao excluir arquivo:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Arquivo excluído com sucesso' })
  } catch (error) {
    console.error('Erro no DELETE /api/admin/gallery:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
