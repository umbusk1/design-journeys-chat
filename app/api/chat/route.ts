import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { sql } from '@/lib/db'
import { SYSTEM_PROMPT } from '@/lib/system-prompt'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { mensaje, conversacionId, usuarioId, esPrimerMensaje } = await req.json()

    if (!mensaje || !conversacionId || !usuarioId) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    // Guardar mensaje del usuario
    await sql`
      INSERT INTO mensajes (conversacion_id, rol, contenido)
      VALUES (${conversacionId}, 'user', ${mensaje})
    `

    // Si es el primer mensaje, actualizar el título de la conversación
    if (esPrimerMensaje) {
      const titulo = mensaje.length > 60 ? mensaje.substring(0, 60) + '…' : mensaje
      await sql`
        UPDATE conversaciones SET titulo = ${titulo} WHERE id = ${conversacionId}
      `
    }

    // Obtener historial de la conversación
    const historial = await sql`
      SELECT rol, contenido FROM mensajes
      WHERE conversacion_id = ${conversacionId}
      ORDER BY created_at ASC
    `

    // Llamar a Claude con más tokens y guía de formato
    const respuesta = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: SYSTEM_PROMPT + `\n\nINSTRUCCIÓN DE FORMATO: Cuando necesites mostrar una tabla comparativa, usa HTML directamente con este formato exacto:
<table style="width:100%;border-collapse:collapse;font-size:0.85em;margin:1em 0">
<thead><tr style="background:rgba(16,185,129,0.15)">
<th style="padding:8px 12px;text-align:left;border-bottom:1px solid rgba(255,255,255,0.1);color:#6ee7b7">Columna A</th>
<th style="padding:8px 12px;text-align:left;border-bottom:1px solid rgba(255,255,255,0.1);color:#6ee7b7">Columna B</th>
</tr></thead>
<tbody>
<tr><td style="padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.05);color:#cbd5e1">Valor 1A</td><td style="padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.05);color:#cbd5e1">Valor 1B</td></tr>
</tbody></table>
Adapta los colores y contenido según el tema. NUNCA uses sintaxis Markdown de tabla (pipes |). Siempre HTML para tablas.`,
      messages: (historial as Array<{ rol: string; contenido: string }>).map(m => ({
        role: m.rol as 'user' | 'assistant',
        content: m.contenido,
      })),
    })

    const textoRespuesta =
      respuesta.content[0].type === 'text' ? respuesta.content[0].text : ''

    // Tokens usados en esta llamada
    const tokensInput = respuesta.usage.input_tokens
    const tokensOutput = respuesta.usage.output_tokens
    const tokensTotal = tokensInput + tokensOutput

    // Guardar respuesta del asistente con tokens
    await sql`
      INSERT INTO mensajes (conversacion_id, rol, contenido, tokens_input, tokens_output)
      VALUES (${conversacionId}, 'assistant', ${textoRespuesta}, ${tokensInput}, ${tokensOutput})
    `

    return NextResponse.json({
      respuesta: textoRespuesta,
      tokens: { input: tokensInput, output: tokensOutput, total: tokensTotal }
    })
  } catch (error) {
    console.error('Error en chat:', error)
    return NextResponse.json(
      { error: 'Error al procesar el mensaje' },
      { status: 500 }
    )
  }
}