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

// GET - Buscar parceiro por ID
export async function GET(
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

    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro ao buscar parceiro:', error)
      return NextResponse.json({ error: 'Parceiro não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ partner: data })
  } catch (error) {
    console.error('Erro no GET /api/admin/partners/[id]:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// PUT - Atualizar parceiro
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
    const { name, type, logo_url, is_active, display_order } = body

    const supabase = await getSupabase()

    // Buscar parceiro atual para log
    const { data: oldPartner } = await supabase
      .from('partners')
      .select('*')
      .eq('id', id)
      .single()

    if (!oldPartner) {
      return NextResponse.json({ error: 'Parceiro não encontrado' }, { status: 404 })
    }

    // Atualizar parceiro
    const { data: updatedPartner, error } = await supabase
      .from('partners')
      .update({
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
        ...(logo_url !== undefined && { logo_url }),
        ...(is_active !== undefined && { is_active }),
        ...(display_order !== undefined && { display_order }),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar parceiro:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log de auditoria
    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      action: 'update',
      entity: 'partners',
      entity_id: id,
      old_value: { name: oldPartner.name, type: oldPartner.type },
      new_value: { name: updatedPartner.name, type: updatedPartner.type },
    })

    return NextResponse.json({ partner: updatedPartner, message: 'Parceiro atualizado com sucesso' })
  } catch (error) {
    console.error('Erro no PUT /api/admin/partners/[id]:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// DELETE - Excluir parceiro
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

    // Buscar parceiro para log
    const { data: partner } = await supabase
      .from('partners')
      .select('*')
      .eq('id', id)
      .single()

    if (!partner) {
      return NextResponse.json({ error: 'Parceiro não encontrado' }, { status: 404 })
    }

    // Deletar parceiro
    const { error } = await supabase
      .from('partners')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao deletar parceiro:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log de auditoria
    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      action: 'delete',
      entity: 'partners',
      entity_id: id,
      old_value: { name: partner.name, type: partner.type },
    })

    return NextResponse.json({ message: 'Parceiro excluído com sucesso' })
  } catch (error) {
    console.error('Erro no DELETE /api/admin/partners/[id]:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
