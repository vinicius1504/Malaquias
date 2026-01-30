/**
 * Script para popular a tabela ui_translations com os JSONs existentes.
 *
 * Uso: node database/seed-translations.js
 *
 * Requer a variável DATABASE_URL configurada no ambiente ou em .env
 */

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

// Carrega .env se existir
try {
  const envPath = path.join(__dirname, '..', '.env')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8')
    envContent.split('\n').forEach(line => {
      const [key, ...vals] = line.split('=')
      if (key && !key.startsWith('#') && vals.length > 0) {
        process.env[key.trim()] = vals.join('=').trim()
      }
    })
  }
  const envLocalPath = path.join(__dirname, '..', '.env.local')
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, 'utf-8')
    envContent.split('\n').forEach(line => {
      const [key, ...vals] = line.split('=')
      if (key && !key.startsWith('#') && vals.length > 0) {
        process.env[key.trim()] = vals.join('=').trim()
      }
    })
  }
} catch (e) {
  // ignora
}

const LOCALES = ['pt', 'en', 'es']
const NAMESPACES = ['common', 'home', 'services', 'faq', 'contact', 'about', 'news', 'segments']

async function main() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('DATABASE_URL não configurada. Configure no .env ou como variável de ambiente.')
    process.exit(1)
  }

  const pool = new Pool({ connectionString })

  try {
    // Criar tabela se não existir
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ui_translations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        locale VARCHAR(5) NOT NULL,
        namespace VARCHAR(50) NOT NULL,
        content JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(locale, namespace)
      )
    `)
    console.log('Tabela ui_translations verificada/criada.')

    const localesDir = path.join(__dirname, '..', 'src', 'locales')
    let inserted = 0
    let updated = 0

    for (const locale of LOCALES) {
      for (const namespace of NAMESPACES) {
        const filePath = path.join(localesDir, locale, `${namespace}.json`)

        try {
          const content = fs.readFileSync(filePath, 'utf-8')
          const json = JSON.parse(content)

          const result = await pool.query(
            `INSERT INTO ui_translations (locale, namespace, content)
             VALUES ($1, $2, $3)
             ON CONFLICT (locale, namespace)
             DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()
             RETURNING (xmax = 0) AS is_insert`,
            [locale, namespace, JSON.stringify(json)]
          )

          if (result.rows[0].is_insert) {
            inserted++
            console.log(`  [INSERT] ${locale}/${namespace}`)
          } else {
            updated++
            console.log(`  [UPDATE] ${locale}/${namespace}`)
          }
        } catch (err) {
          console.error(`  [ERRO] ${locale}/${namespace}: ${err.message}`)
        }
      }
    }

    console.log(`\nConcluído! ${inserted} inseridos, ${updated} atualizados.`)
    console.log(`Total: ${inserted + updated} de ${LOCALES.length * NAMESPACES.length} traduções.`)
  } catch (err) {
    console.error('Erro:', err.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()
