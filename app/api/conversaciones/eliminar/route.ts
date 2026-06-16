import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const conversacionId = searchParams.get('conversacionId')

    if (!conversacionId) {
      return NextResponse.json({ error: 'conversacionId requerido' }, { status: 400 })
    }

    await sql`DELETE FROM conversaciones WHERE id = ${conversacionId}`

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error al eliminar conversación:', error)
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  }
}