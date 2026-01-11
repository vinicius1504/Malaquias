import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { queryAll, queryOne } from '@/lib/db/postgres'

// Força rota dinâmica
export const dynamic = 'force-dynamic'

// GET - Listar logs
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'dev') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const action = searchParams.get('action')
    const entity = searchParams.get('entity')
    const userId = searchParams.get('user_id')

    let whereClause = '1=1'
    const params: any[] = []
    let paramIndex = 1

    if (action) {
      whereClause += ` AND al.action = $${paramIndex++}`
      params.push(action)
    }
    if (entity) {
      whereClause += ` AND al.entity = $${paramIndex++}`
      params.push(entity)
    }
    if (userId) {
      whereClause += ` AND al.user_id = $${paramIndex++}`
      params.push(userId)
    }

    const offset = (page - 1) * limit

    // Buscar logs com dados do usuário
    const logsQuery = `
      SELECT
        al.*,
        jsonb_build_object(
          'id', au.id,
          'name', au.name,
          'email', au.email
        ) as admin_users
      FROM audit_logs al
      LEFT JOIN admin_users au ON al.user_id = au.id
      WHERE ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `

    params.push(limit, offset)

    const data = await queryAll(logsQuery, params)

    // Contar total
    const countResult = await queryOne<{ total: string }>(
      `SELECT COUNT(*) as total FROM audit_logs al WHERE ${whereClause}`,
      params.slice(0, -2)
    )
    const total = parseInt(countResult?.total || '0')

    return NextResponse.json({
      logs: data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Erro no GET /api/admin/logs:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
