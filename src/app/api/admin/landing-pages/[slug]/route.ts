import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const LP_DIR = path.join(process.cwd(), 'src', 'data', 'lp')

// GET - Obter LP específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { slug } = await params
    const filePath = path.join(LP_DIR, `${slug}.json`)

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'LP não encontrada' }, { status: 404 })
    }

    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

    return NextResponse.json({ lp: content })
  } catch (error) {
    console.error('Erro ao obter LP:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// PUT - Atualizar LP
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { slug } = await params
    const filePath = path.join(LP_DIR, `${slug}.json`)

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'LP não encontrada' }, { status: 404 })
    }

    const body = await request.json()

    // Salvar LP atualizada
    fs.writeFileSync(filePath, JSON.stringify(body, null, 2), 'utf-8')

    return NextResponse.json({ message: 'LP atualizada com sucesso' })
  } catch (error) {
    console.error('Erro ao atualizar LP:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// DELETE - Deletar LP
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { slug } = await params
    const filePath = path.join(LP_DIR, `${slug}.json`)

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'LP não encontrada' }, { status: 404 })
    }

    fs.unlinkSync(filePath)

    return NextResponse.json({ message: 'LP deletada com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar LP:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
