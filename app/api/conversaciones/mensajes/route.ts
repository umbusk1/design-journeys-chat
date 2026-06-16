import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const conversacionId = searchParams.get('conversacionId')

    if (!conversacionId) {
      return NextResponse.json({ error: 'conversacionId requerido' }, { status: 400 })
    }

    const mensajes = await sql`
      SELECT rol, contenido, created_at
      FROM mensajes
      WHERE conversacion_id = ${conversacionId}
      ORDER BY created_at ASC
    `

    return NextResponse.json({ mensajes })
  } catch (error) {
    console.error('Error al cargar mensajes:', error)
    return NextResponse.json({ error: 'Error al cargar mensajes' }, { status: 500 })
  }
}