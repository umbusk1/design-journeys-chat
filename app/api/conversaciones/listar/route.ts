import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const usuarioId = searchParams.get('usuarioId')

    if (!usuarioId) {
      return NextResponse.json({ error: 'usuarioId requerido' }, { status: 400 })
    }

    // Traer conversaciones de TODOS los usuarios, indicando quién la inició
    const conversaciones = await sql`
      SELECT 
        c.id,
        c.titulo,
        c.created_at,
        c.usuario_id,
        u.nombre as autor_nombre,
        COUNT(m.id) as total_mensajes,
        MAX(m.created_at) as ultimo_mensaje
      FROM conversaciones c
      JOIN usuarios u ON u.id = c.usuario_id
      LEFT JOIN mensajes m ON m.conversacion_id = c.id
      GROUP BY c.id, c.titulo, c.created_at, c.usuario_id, u.nombre
      HAVING COUNT(m.id) > 0
      ORDER BY MAX(m.created_at) DESC NULLS LAST
      LIMIT 40
    `

    return NextResponse.json({ conversaciones })
  } catch (error) {
    console.error('Error al listar conversaciones:', error)
    return NextResponse.json({ error: 'Error al obtener conversaciones' }, { status: 500 })
  }
}