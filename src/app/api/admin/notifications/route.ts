import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { queryAll, queryOne } from '@/lib/db/postgres'

// Força rota dinâmica
export const dynamic = 'force-dynamic'

// GET - Buscar notificações (logs recentes)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'dev') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const lastSeen = searchParams.get('last_seen') // ISO timestamp

    let whereClause = ''
    const params: any[] = []

    if (lastSeen) {
      whereClause = 'WHERE al.created_at > $1'
      params.push(lastSeen)
    } else {
      // Se não tem lastSeen, pega das últimas 24 horas
      const yesterday = new Date()
      yesterday.setHours(yesterday.getHours() - 24)
      whereClause = 'WHERE al.created_at > $1'
      params.push(yesterday.toISOString())
    }

    // Buscar logs recentes
    const data = await queryAll(
      `SELECT
        al.*,
        jsonb_build_object(
          'id', au.id,
          'name', au.name,
          'email', au.email
        ) as admin_users
      FROM audit_logs al
      LEFT JOIN admin_users au ON al.user_id = au.id
      ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT 10`,
      params
    )

    // Contar total de novos (não lidos)
    const countResult = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM audit_logs al ${whereClause}`,
      params
    )
    const unreadCount = parseInt(countResult?.count || '0')

    return NextResponse.json({
      notifications: data,
      unreadCount,
    })
  } catch (error) {
    console.error('Erro no GET /api/admin/notifications:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
