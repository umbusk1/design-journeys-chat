import { NextRequest, NextResponse } from 'next/server'
import { sql, initDB } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    await initDB()

    const { usuarioId, titulo } = await req.json()

    if (!usuarioId) {
      return NextResponse.json(
        { error: 'usuarioId es requerido' },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO conversaciones (usuario_id, titulo)
      VALUES (${usuarioId}, ${titulo || 'Nueva conversación'})
      RETURNING id
    `

    return NextResponse.json({ id: result[0].id })
  } catch (error) {
    console.error('Error al crear conversación:', error)
    return NextResponse.json(
      { error: 'Error al crear la conversación' },
      { status: 500 }
    )
  }
}