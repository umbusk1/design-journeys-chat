import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { sql } from '@/lib/db'
import { PROMPT_BASE, CONTENIDO_LECCIONES, RESUMEN_GENERAL } from '@/lib/system-prompt'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Mapa de palabras clave por lección — detecta qué lección es relevante.
// Se usa TANTO para elegir qué recursos mostrar COMO para elegir qué
// bloque(s) de contenido de lección incluir en el system prompt.
const PALABRAS_CLAVE: Record<string, string[]> = {
  'cap1_lec0': ['solucionar problemas', 'stop solving', 'introducción', 'curso'],
  'cap1_lec1': ['wicked', 'perverso', 'problema perverso', 'rittel', 'buchanan'],
  'cap1_lec2': ['diseño sistémico', 'systemic design', 'origen', 'principios'],
  'cap2_lec0': ['enmarcar', 'framing', 'encuadre', 'el antropoceno', 'antropoceno'],
  'cap2_lec1': ['vuca', 'bani', 'contexto', 'incertidumbre'],
  'cap2_lec2': ['iceberg', 'cla', 'causal layered', 'análisis causal', 'capas'],
  'cap3_lec0': ['investigación', 'research', 'entrevista', 'contextual'],
  'cap3_lec1': ['análisis causal sistémico', 'stakeholder', 'partes interesadas'],
  'cap3_lec2': ['visualizar', 'visualización', 'síntesis visual'],
  'cap4_lec0': ['dinámica de sistemas', 'system dynamics', 'stock', 'flow'],
  'cap4_lec1': ['puntos clave', 'nodos', 'leverage', 'palanca', 'influence map', 'mapa de influencias', 'ism'],
  'cap4_lec2': ['dikw', 'datos', 'información', 'conocimiento', 'sabiduría'],
  'cap5_lec0': ['modelar valor', 'valor', 'value proposition', 'propuesta de valor'],
  'cap5_lec1': ['tres horizontes', 'three horizons', 'h1', 'h2', 'h3', 'bill sharpe', 'horizontes'],
  'cap5_lec2': ['paradoja', 'paradoxing', 'tensión', 'trabajo con paradojas'],
  'cap6_lec0': ['mapa de síntesis', 'synthesis map', 'gigamap', 'síntesis avanzado'],
  'cap6_lec1': ['intervención', 'intervenciones', 'leverage points', 'puntos de palanca'],
  'cap6_lec2': ['límites', 'boundary', 'límites del sistema'],
  'cap7_lec0': ['teoría del cambio', 'theory of change', 'tosca', 'toc'],
  'cap7_lec1': ['requisite variety', 'requerir variedad', 'variedad requerida', 'ashby'],
  'cap7_lec2': ['innovación sistémica', 'systemic innovation'],
  'cap8_lec0': ['teoría de la transición', 'transition theory', 'transición'],
  'cap8_lec1': ['ciclos adaptativos', 'panarchy', 'panarchía', 'resiliencia', 'holling'],
  'cap8_lec2': ['gobernanza', 'governance', 'ecosistema', 'colaboración', 'collaboration model'],
}

// Detecta qué lecciones son relevantes para un mensaje dado.
function detectarLeccionesRelevantes(mensaje: string): string[] {
  const mensajeLower = mensaje.toLowerCase()
  const relevantes: string[] = []
  for (const [leccionId, palabras] of Object.entries(PALABRAS_CLAVE)) {
    const esRelevante = palabras.some(p => mensajeLower.includes(p.toLowerCase()))
    if (esRelevante) relevantes.push(leccionId)
  }
  return relevantes
}

// Extrae el número de capítulo de una lista de leccion_id detectados.
// Devuelve el cap_id del primero que encuentre (ej. 'cap3'), o null.
function extraerCapId(leccionesRelevantes: string[]): string | null {
  if (leccionesRelevantes.length === 0) return null
  const match = leccionesRelevantes[0].match(/^(cap\d+)_/)
  return match ? match[1] : null
}

// Arma el system prompt dinámico: base + bloques de lección relevantes
// (o resumen general si no se detectó ninguna lección específica).
function construirSystemPrompt(leccionesRelevantes: string[]): string {
  if (leccionesRelevantes.length === 0) {
    return `${PROMPT_BASE}\n\n---\n${RESUMEN_GENERAL}`
  }
  const bloques = leccionesRelevantes
    .map(lid => CONTENIDO_LECCIONES[lid])
    .filter(Boolean)
    .join('\n\n')
  return `${PROMPT_BASE}\n\n---\n## CONTENIDO RELEVANTE PARA ESTA CONSULTA\n\n${bloques}`
}

async function buscarRecursosRelevantes(leccionesRelevantes: string[]): Promise<string> {
  try {
    if (leccionesRelevantes.length === 0) return ''

    const conRecursos = await sql`
      SELECT DISTINCT leccion_id FROM recursos
    `
    if (conRecursos.length === 0) return ''

    const leccionesConRecursos = new Set(
      (conRecursos as Array<{ leccion_id: string }>).map(r => r.leccion_id)
    )

    const leccionesConDatos = leccionesRelevantes.filter(l => leccionesConRecursos.has(l))
    if (leccionesConDatos.length === 0) return ''

    const recursos = await sql`
      SELECT leccion_id, tipo, titulo, url
      FROM recursos
      WHERE leccion_id = ANY(${leccionesConDatos})
      ORDER BY leccion_id, tipo, orden
    `

    if (recursos.length === 0) return ''

    const tipoLabels: Record<string, string> = {
      grafico: 'Gráfico/Imagen',
      pdf: 'Documento PDF',
      youtube: 'Video YouTube',
    }

    let contexto = '\n\n---\nRECURSOS DE REFERENCIA DISPONIBLES PARA ESTA CONSULTA:\n'
    contexto += 'Los siguientes materiales están disponibles para los estudiantes. Menciónalos naturalmente en tu respuesta cuando sean relevantes, incluyendo el link:\n\n'

    for (const r of recursos as Array<{ leccion_id: string; tipo: string; titulo: string; url: string }>) {
      const tipo = tipoLabels[r.tipo] || r.tipo
      contexto += `- [${tipo}] ${r.titulo}: ${r.url}\n`
    }

    contexto += '---\n'
    return contexto
  } catch (error) {
    console.error('Error al buscar recursos:', error)
    return ''
  }
}

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

    // Obtener historial
    const historial = await sql`
      SELECT rol, contenido FROM mensajes
      WHERE conversacion_id = ${conversacionId}
      ORDER BY created_at ASC
    `

    // Detectar lecciones relevantes UNA SOLA VEZ, reutilizar para
    // construir tanto el system prompt como los recursos.
    const leccionesRelevantes = detectarLeccionesRelevantes(mensaje)

    // Actualizar título y cap_id si es el primer mensaje
    if (esPrimerMensaje) {
      const titulo = mensaje.length > 60 ? mensaje.substring(0, 60) + '…' : mensaje
      const capId = extraerCapId(leccionesRelevantes)
      await sql`
        UPDATE conversaciones
        SET titulo = ${titulo}, cap_id = ${capId}
        WHERE id = ${conversacionId}
      `
    }
    const systemPromptDinamico = construirSystemPrompt(leccionesRelevantes)
    const contextoRecursos = await buscarRecursosRelevantes(leccionesRelevantes)

    // System prompt final
    const systemPromptFinal = systemPromptDinamico + contextoRecursos + `

INSTRUCCIÓN DE FORMATO: Cuando necesites mostrar una tabla comparativa, usa HTML directamente con este formato exacto:
<table style="width:100%;border-collapse:collapse;font-size:0.85em;margin:1em 0">
<thead><tr style="background:rgba(16,185,129,0.15)">
<th style="padding:8px 12px;text-align:left;border-bottom:1px solid rgba(255,255,255,0.1);color:#6ee7b7">Columna A</th>
<th style="padding:8px 12px;text-align:left;border-bottom:1px solid rgba(255,255,255,0.1);color:#6ee7b7">Columna B</th>
</tr></thead>
<tbody>
<tr><td style="padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.05);color:#cbd5e1">Valor 1A</td><td style="padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.05);color:#cbd5e1">Valor 1B</td></tr>
</tbody></table>
NUNCA uses sintaxis Markdown de tabla (pipes |). Siempre HTML para tablas.`

    // Llamar a Claude
    const respuesta = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: systemPromptFinal,
      messages: (historial as Array<{ rol: string; contenido: string }>).map(m => ({
        role: m.rol as 'user' | 'assistant',
        content: m.contenido,
      })),
    })

    const textoRespuesta =
      respuesta.content[0].type === 'text' ? respuesta.content[0].text : ''

    const tokensInput = respuesta.usage.input_tokens
    const tokensOutput = respuesta.usage.output_tokens

    // Guardar respuesta
    await sql`
      INSERT INTO mensajes (conversacion_id, rol, contenido, tokens_input, tokens_output)
      VALUES (${conversacionId}, 'assistant', ${textoRespuesta}, ${tokensInput}, ${tokensOutput})
    `

    return NextResponse.json({
      respuesta: textoRespuesta,
      tokens: { input: tokensInput, output: tokensOutput, total: tokensInput + tokensOutput }
    })
  } catch (error) {
    console.error('Error en chat:', error)
    return NextResponse.json(
      { error: 'Error al procesar el mensaje' },
      { status: 500 }
    )
  }
}