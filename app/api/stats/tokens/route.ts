import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// Precios claude-sonnet-4-6 por millón de tokens (USD)
const PRECIO_INPUT = 3.0
const PRECIO_OUTPUT = 15.0

export async function GET(req: NextRequest) {
  try {
    // Totales por usuario
    const porUsuario = await sql`
      SELECT 
        u.id,
        u.nombre,
        COALESCE(SUM(m.tokens_input), 0) as total_input,
        COALESCE(SUM(m.tokens_output), 0) as total_output,
        COUNT(CASE WHEN m.rol = 'assistant' THEN 1 END) as total_respuestas
      FROM usuarios u
      LEFT JOIN conversaciones c ON c.usuario_id = u.id
      LEFT JOIN mensajes m ON m.conversacion_id = c.id AND m.rol = 'assistant'
      GROUP BY u.id, u.nombre
      ORDER BY u.id
    `

    const usuarios = (porUsuario as Array<{
      id: number; nombre: string;
      total_input: number; total_output: number; total_respuestas: number
    }>).map((u) => {
      const input = Number(u.total_input)
      const output = Number(u.total_output)
      const costoUSD = (input * PRECIO_INPUT + output * PRECIO_OUTPUT) / 1_000_000
      return {
        id: u.id,
        nombre: u.nombre,
        tokensInput: input,
        tokensOutput: output,
        tokensTotal: input + output,
        costoUSD: costoUSD,
        totalRespuestas: Number(u.total_respuestas),
      }
    })

    const totales = {
      tokensInput: usuarios.reduce((s: number, u: { tokensInput: number }) => s + u.tokensInput, 0),
      tokensOutput: usuarios.reduce((s: number, u: { tokensOutput: number }) => s + u.tokensOutput, 0),
      tokensTotal: usuarios.reduce((s: number, u: { tokensTotal: number }) => s + u.tokensTotal, 0),
      costoUSD: usuarios.reduce((s: number, u: { costoUSD: number }) => s + u.costoUSD, 0),
    }

    return NextResponse.json({ usuarios, totales })
  } catch (error) {
    console.error('Error en stats:', error)
    return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 })
  }
}