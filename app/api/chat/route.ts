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

    // Llamar a Claude
    const respuesta = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: (historial as Array<{ rol: string; contenido: string }>).map(m => ({
        role: m.rol as 'user' | 'assistant',
        content: m.contenido,
      })),
    })

    const textoRespuesta =
      respuesta.content[0].type === 'text' ? respuesta.content[0].text : ''

    // Guardar respuesta del asistente
    await sql`
      INSERT INTO mensajes (conversacion_id, rol, contenido)
      VALUES (${conversacionId}, 'assistant', ${textoRespuesta})
    `

    return NextResponse.json({ respuesta: textoRespuesta })
  } catch (error) {
    console.error('Error en chat:', error)
    return NextResponse.json(
      { error: 'Error al procesar el mensaje' },
      { status: 500 }
    )
  }
}