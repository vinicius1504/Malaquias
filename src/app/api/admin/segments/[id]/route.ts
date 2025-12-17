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

// GET - Buscar segmento específico
export async function GET(
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const supabase = await getSupabase()

    const { data, error } = await supabase
      .from('segments')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro ao buscar segmento:', error)
      return NextResponse.json({ error: 'Segmento não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ segment: data })
  } catch (error) {
    console.error('Erro no GET /api/admin/segments/[id]:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// PUT - Atualizar segmento
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, image_url, video_url, is_active, display_order } = body

    const supabase = await getSupabase()

    // Buscar dados antigos para log
    const { data: oldData } = await supabase
      .from('segments')
      .select('*')
      .eq('id', id)
      .single()

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (image_url !== undefined) updateData.image_url = image_url
    if (video_url !== undefined) updateData.video_url = video_url
    if (is_active !== undefined) updateData.is_active = is_active
    if (display_order !== undefined) updateData.display_order = display_order

    const { data: updatedSegment, error } = await supabase
      .from('segments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar segmento:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log de auditoria
    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      action: 'update',
      entity: 'segments',
      entity_id: id,
      old_value: oldData,
      new_value: updateData,
    })

    return NextResponse.json({ segment: updatedSegment, message: 'Segmento atualizado com sucesso' })
  } catch (error) {
    console.error('Erro no PUT /api/admin/segments/[id]:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// DELETE - Excluir segmento
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const supabase = await getSupabase()

    // Buscar dados antigos para log
    const { data: oldData } = await supabase
      .from('segments')
      .select('*')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('segments')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao excluir segmento:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log de auditoria
    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      action: 'delete',
      entity: 'segments',
      entity_id: id,
      old_value: oldData,
    })

    return NextResponse.json({ message: 'Segmento excluído com sucesso' })
  } catch (error) {
    console.error('Erro no DELETE /api/admin/segments/[id]:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
