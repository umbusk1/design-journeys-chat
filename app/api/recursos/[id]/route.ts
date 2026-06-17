import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await sql`DELETE FROM recursos WHERE id = ${id}`
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error al eliminar recurso:', error)
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  }
}