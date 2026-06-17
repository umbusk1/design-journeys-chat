import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const leccionId = searchParams.get('leccionId')

    if (!leccionId) {
      // Sin filtro: devolver conteo por lección (para saber cuáles tienen recursos)
      const conteos = await sql`
        SELECT leccion_id, COUNT(*) as total
        FROM recursos
        GROUP BY leccion_id
      `
      return NextResponse.json({ conteos })
    }

    const recursos = await sql`
      SELECT id, leccion_id, tipo, titulo, url, orden
      FROM recursos
      WHERE leccion_id = ${leccionId}
      ORDER BY tipo, orden, created_at
    `
    return NextResponse.json({ recursos })
  } catch (error) {
    console.error('Error al obtener recursos:', error)
    return NextResponse.json({ error: 'Error al obtener recursos' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { leccionId, tipo, titulo, url, orden } = await req.json()

    if (!leccionId || !tipo || !titulo || !url) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO recursos (leccion_id, tipo, titulo, url, orden)
      VALUES (${leccionId}, ${tipo}, ${titulo}, ${url}, ${orden || 0})
      RETURNING id
    `
    return NextResponse.json({ id: result[0].id, ok: true })
  } catch (error) {
    console.error('Error al crear recurso:', error)
    return NextResponse.json({ error: 'Error al crear recurso' }, { status: 500 })
  }
}