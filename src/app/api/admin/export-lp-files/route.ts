import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

// Função para ler recursivamente uma pasta
function readDirRecursive(dir: string, baseDir: string): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  if (!fs.existsSync(dir)) {
    return result
  }

  const items = fs.readdirSync(dir)

  for (const item of items) {
    const itemPath = path.join(dir, item)
    const stat = fs.statSync(itemPath)

    if (stat.isDirectory()) {
      // É uma pasta, ler recursivamente
      result[item] = readDirRecursive(itemPath, baseDir)
    } else if (item.endsWith('.json')) {
      // É um arquivo JSON
      try {
        const content = fs.readFileSync(itemPath, 'utf-8')
        result[item.replace('.json', '')] = JSON.parse(content)
      } catch {
        result[item.replace('.json', '')] = { error: 'Erro ao parsear JSON' }
      }
    }
  }

  return result
}

// Função para listar arquivos com seus caminhos relativos
function listFilesRecursive(dir: string, basePath: string = ''): Array<{ path: string; content: unknown }> {
  const files: Array<{ path: string; content: unknown }> = []

  if (!fs.existsSync(dir)) {
    return files
  }

  const items = fs.readdirSync(dir)

  for (const item of items) {
    const itemPath = path.join(dir, item)
    const relativePath = basePath ? `${basePath}/${item}` : item
    const stat = fs.statSync(itemPath)

    if (stat.isDirectory()) {
      files.push(...listFilesRecursive(itemPath, relativePath))
    } else if (item.endsWith('.json')) {
      try {
        const content = fs.readFileSync(itemPath, 'utf-8')
        files.push({
          path: relativePath,
          content: JSON.parse(content)
        })
      } catch {
        files.push({
          path: relativePath,
          content: { error: 'Erro ao parsear JSON' }
        })
      }
    }
  }

  return files
}

// GET - Exportar todas as pastas de dados do front-end
export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const srcDir = path.join(process.cwd(), 'src')

    // Ler pasta data (contém lp/)
    const dataDir = path.join(srcDir, 'data')
    const dataFiles = listFilesRecursive(dataDir)
    const dataStructure = readDirRecursive(dataDir, dataDir)

    // Ler pasta locales (contém pt/, en/, es/)
    const localesDir = path.join(srcDir, 'locales')
    const localesFiles = listFilesRecursive(localesDir)
    const localesStructure = readDirRecursive(localesDir, localesDir)

    return NextResponse.json({
      exportedAt: new Date().toISOString(),
      data: {
        structure: dataStructure,
        files: dataFiles
      },
      locales: {
        structure: localesStructure,
        files: localesFiles
      }
    })
  } catch (error) {
    console.error('Erro ao exportar arquivos:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
