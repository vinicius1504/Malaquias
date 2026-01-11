import { Pool, QueryResult, QueryResultRow } from 'pg'

// Pool de conexões PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Função para executar queries
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const client = await pool.connect()
  try {
    return await client.query<T>(text, params)
  } finally {
    client.release()
  }
}

// Função para executar uma única query e retornar o primeiro resultado
export async function queryOne<T = any>(
  text: string,
  params?: any[]
): Promise<T | null> {
  const result = await query<T>(text, params)
  return result.rows[0] || null
}

// Função para executar uma query e retornar todos os resultados
export async function queryAll<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const result = await query<T>(text, params)
  return result.rows
}

// Função para contar registros
export async function count(
  table: string,
  where?: string,
  params?: any[]
): Promise<number> {
  const whereClause = where ? `WHERE ${where}` : ''
  const result = await query(
    `SELECT COUNT(*) as count FROM ${table} ${whereClause}`,
    params
  )
  return parseInt(result.rows[0].count, 10)
}

// Função para inserir e retornar o registro inserido
export async function insert<T = any>(
  table: string,
  data: Record<string, any>
): Promise<T> {
  const keys = Object.keys(data)
  const values = Object.values(data)
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ')
  const columns = keys.join(', ')

  const result = await query<T>(
    `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`,
    values
  )
  return result.rows[0]
}

// Função para atualizar registros
export async function update<T = any>(
  table: string,
  data: Record<string, any>,
  where: string,
  whereParams: any[]
): Promise<T | null> {
  const keys = Object.keys(data)
  const values = Object.values(data)
  const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ')
  const whereParamsOffset = keys.length

  const adjustedWhereParams = whereParams.map(
    (_, i) => `$${whereParamsOffset + i + 1}`
  )
  const adjustedWhere = where.replace(/\$(\d+)/g, (_, num) => {
    return `$${parseInt(num) + whereParamsOffset}`
  })

  const result = await query<T>(
    `UPDATE ${table} SET ${setClause}, updated_at = NOW() WHERE ${adjustedWhere} RETURNING *`,
    [...values, ...whereParams]
  )
  return result.rows[0] || null
}

// Função para deletar registros
export async function remove(
  table: string,
  where: string,
  params: any[]
): Promise<boolean> {
  const result = await query(`DELETE FROM ${table} WHERE ${where}`, params)
  return (result.rowCount ?? 0) > 0
}

// Função para upsert (insert or update)
export async function upsert<T = any>(
  table: string,
  data: Record<string, any>,
  conflictColumns: string[]
): Promise<T> {
  const keys = Object.keys(data)
  const values = Object.values(data)
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ')
  const columns = keys.join(', ')
  const conflict = conflictColumns.join(', ')
  const updateSet = keys
    .filter((k) => !conflictColumns.includes(k))
    .map((key) => `${key} = EXCLUDED.${key}`)
    .join(', ')

  const result = await query<T>(
    `INSERT INTO ${table} (${columns}) VALUES (${placeholders})
     ON CONFLICT (${conflict}) DO UPDATE SET ${updateSet}
     RETURNING *`,
    values
  )
  return result.rows[0]
}

export default pool
