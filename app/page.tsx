'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

interface Mensaje {
  rol: 'user' | 'assistant'
  contenido: string
}

interface Usuario {
  id: number
  nombre: string
  email: string
}

interface Conversacion {
  id: number
  titulo: string
  created_at: string
  total_mensajes: number
  ultimo_mensaje: string
}

interface Stats {
  usuarios: Array<{ id: number; nombre: string; tokensTotal: number; costoUSD: number; totalRespuestas: number }>
  totales: { tokensTotal: number; costoUSD: number }
}

const MAPA_CURSO = [
  {
    num: 1, nombre: 'Introducción',
    prompt: 'Dame una introducción general al curso de Systemic Design y sus conceptos fundamentales',
    lecciones: [
      { nombre: 'Introducción al curso', prompt: 'Explícame qué es el curso de Systemic Design for Tackling Complexity y qué vamos a aprender' },
      { nombre: 'Wicked Problems', prompt: 'Explícame qué son los problemas perversos (Wicked Problems) y por qué son relevantes para el diseño sistémico' },
      { nombre: 'Diseño sistémico', prompt: 'Explícame qué es el diseño sistémico, su origen y en qué se diferencia del diseño tradicional' },
    ]
  },
  {
    num: 2, nombre: 'Framing',
    prompt: 'Dame una visión general del estadio [1] Framing — Enmarcar el sistema',
    lecciones: [
      { nombre: 'Enmarcar el sistema', prompt: 'Explícame cómo se enmarca un sistema en diseño sistémico y qué herramientas se usan en el estadio Framing' },
      { nombre: 'Actors Map', prompt: 'Explícame la herramienta Actors Map: qué es, para qué sirve y cómo se construye. Propón hacer el Ejercicio 1.' },
      { nombre: 'CLA — El iceberg', prompt: 'Explícame el Causal Layered Analysis (CLA) y sus 4 capas. Propón hacer el Ejercicio 2 con un caso real.' },
    ]
  },
  {
    num: 3, nombre: 'Listening',
    prompt: 'Dame una visión general del estadio [2] Listening — Escuchar el sistema',
    lecciones: [
      { nombre: 'Hacer investigación', prompt: 'Explícame cómo se investiga en diseño sistémico: metodologías, enfoques y el diamante de investigación' },
      { nombre: 'Stakeholders y entrevistas', prompt: 'Explícame cómo hacer Stakeholder Discovery y entrevistas contextuales en diseño sistémico' },
      { nombre: 'Actants Map', prompt: 'Explícame la herramienta Actants Map: qué diferencia a un actante de un actor y cómo se usa' },
    ]
  },
  {
    num: 4, nombre: 'Understanding',
    prompt: 'Dame una visión general del estadio [3] Understanding — Comprender el sistema',
    lecciones: [
      { nombre: 'Visualización de sistemas', prompt: 'Explícame las principales herramientas de visualización sistémica: Synthesis Maps, Systemigrams y cómo elegir cuál usar' },
      { nombre: 'Causal Loop Diagram', prompt: 'Explícame los Causal Loop Diagrams (CLD): bucles de refuerzo y balance, cómo se construyen. Propón hacer el Ejercicio 3.' },
      { nombre: 'System Archetypes', prompt: 'Explícame los arquetipos sistémicos de Senge: Shifting the Burden, Limits to Growth y otros. Cómo reconocerlos en sistemas reales.' },
      { nombre: 'Influence Map', prompt: 'Explícame el Influence Map y el Interpretive Structural Modelling (ISM): cómo encontrar leverage points' },
    ]
  },
  {
    num: 5, nombre: 'Envisioning',
    prompt: 'Dame una visión general del estadio [4] Envisioning — Visionar futuros deseados',
    lecciones: [
      { nombre: 'Three Horizons', prompt: 'Explícame el marco Three Horizons de Bill Sharpe: H1, H2 y H3, cómo coexisten y cómo se usa en diseño sistémico' },
      { nombre: 'System Value Proposition', prompt: 'Explícame la herramienta System Value Proposition: cómo definir valor sistémico en múltiples niveles' },
      { nombre: 'Synthesis Map', prompt: 'Explícame qué es un Synthesis Map (Gigamap) y cómo se construye para integrar todos los hallazgos del sistema' },
      { nombre: 'Paradoxing', prompt: 'Explícame qué es Paradoxing en diseño sistémico y cómo trabajar con tensiones y paradojas para generar innovación' },
    ]
  },
  {
    num: 6, nombre: 'Possibility Space',
    prompt: 'Dame una visión general del estadio [5] Exploring — Espacio de posibilidades',
    lecciones: [
      { nombre: 'Synthesis Mapping', prompt: 'Explícame cómo se usa el Synthesis Mapping en el estadio de exploración y cómo conecta con las intervenciones' },
      { nombre: 'Intervenciones', prompt: 'Explícame los tipos de intervenciones en diseño sistémico y cómo se identifican los puntos de palanca (leverage points)' },
      { nombre: 'Intervention Strategy', prompt: 'Explícame la herramienta Intervention Strategy y cómo definir una estrategia de intervención. Propón hacer el Ejercicio 4.' },
      { nombre: 'Límites del sistema', prompt: 'Explícame cómo se definen y trabajan los límites de un sistema en diseño sistémico' },
    ]
  },
  {
    num: 7, nombre: 'Planning',
    prompt: 'Dame una visión general del estadio [6] Planning — Planificar el cambio sistémico',
    lecciones: [
      { nombre: 'Theory of Change', prompt: 'Explícame la Theory of Change (TOSCA) en diseño sistémico: niveles, supuestos y cómo se construye' },
      { nombre: 'Process Enneagram', prompt: 'Explícame el Process Enneagram y cómo se usa para organizaciones que se auto-organizan' },
      { nombre: 'Outcome Map + Roadmap', prompt: 'Explícame el Outcome Map y el Roadmapping en diseño sistémico. Propón hacer el Ejercicio 5.' },
    ]
  },
  {
    num: 8, nombre: 'Transition',
    prompt: 'Dame una visión general del estadio [7] Fostering — Implementar la transición sistémica',
    lecciones: [
      { nombre: 'Collaboration Model', prompt: 'Explícame el Collaboration Model: cómo diseñar la colaboración entre actores para implementar el cambio sistémico' },
      { nombre: 'Panarchy', prompt: 'Explícame el concepto de Panarchy de Holling: ciclos adaptativos y resiliencia en sistemas socio-ecológicos' },
      { nombre: 'Innovación sistémica', prompt: 'Explícame cómo se fomenta la innovación sistémica y qué significa hacer una transición exitosa según el curso' },
    ]
  },
]

export default function ChatPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [input, setInput] = useState('')
  const [cargando, setCargando] = useState(false)
  const [conversacionId, setConversacionId] = useState<number | null>(null)
  const [historial, setHistorial] = useState<Conversacion[]>([])
  const [sidebarAbierto, setSidebarAbierto] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const u = localStorage.getItem('usuario')
    if (!u) { router.push('/login'); return }
    const p = JSON.parse(u)
    setUsuario(p)
    cargarHistorial(p.id)
    iniciarConversacion(p.id)
    if (p.id === 1) cargarStats()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  async function cargarHistorial(uid: number) {
    try {
      const r = await fetch(`/api/conversaciones/listar?usuarioId=${uid}`)
      const d = await r.json()
      setHistorial(d.conversaciones || [])
    } catch (e) { console.error(e) }
  }

  async function cargarStats() {
    try {
      const r = await fetch('/api/stats/tokens')
      const d = await r.json()
      setStats(d)
    } catch (e) { console.error(e) }
  }

  async function iniciarConversacion(uid: number) {
    try {
      const r = await fetch('/api/conversaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: uid, titulo: 'Nueva sesión' }),
      })
      const d = await r.json()
      setConversacionId(d.id)
      setMensajes([])
    } catch (e) { console.error(e) }
  }

  async function abrirConversacion(conv: Conversacion) {
    try {
      setConversacionId(conv.id)
      setSidebarAbierto(false)
      const r = await fetch(`/api/conversaciones/mensajes?conversacionId=${conv.id}`)
      const d = await r.json()
      setMensajes(d.mensajes.map((m: { rol: string; contenido: string }) => ({
        rol: m.rol as 'user' | 'assistant',
        contenido: m.contenido,
      })))
    } catch (e) { console.error(e) }
  }

  async function eliminarConversacion(e: React.MouseEvent, convId: number) {
    e.stopPropagation()
    if (!confirm('¿Eliminar esta conversación?')) return
    try {
      await fetch(`/api/conversaciones/eliminar?conversacionId=${convId}`, { method: 'DELETE' })
      if (conversacionId === convId) {
        setMensajes([])
        if (usuario) iniciarConversacion(usuario.id)
      }
      if (usuario) cargarHistorial(usuario.id)
    } catch (e) { console.error(e) }
  }

  async function enviarTexto(texto: string) {
    if (!texto.trim() || !conversacionId || cargando) return
    const esFirstMsg = mensajes.length === 0
    setMensajes(prev => [...prev, { rol: 'user', contenido: texto }])
    setInput('')
    setCargando(true)
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: texto, conversacionId, usuarioId: usuario?.id, esPrimerMensaje: esFirstMsg }),
      })
      const d = await r.json()
      if (d.respuesta) {
        setMensajes(prev => [...prev, { rol: 'assistant', contenido: d.respuesta }])
        if (usuario) {
          cargarHistorial(usuario.id)
          if (usuario.id === 1) cargarStats()
        }
      }
    } catch (err) {
      setMensajes(prev => [...prev, { rol: 'assistant', contenido: 'Hubo un error. Intenta de nuevo.' }])
    } finally { setCargando(false) }
  }

  function cerrarSesion() {
    localStorage.removeItem('usuario')
    router.push('/login')
  }

  function formatFecha(f: string) {
    return new Date(f).toLocaleDateString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col">

      {/* Header */}
      <header className="border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 bg-slate-900/80 backdrop-blur-sm z-10 gap-2">
        <div className="flex items-center gap-3 flex-shrink-0">
          <button onClick={() => setSidebarAbierto(!sidebarAbierto)}
            className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-white/10">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <span className="text-xl">🌿</span>
          <div>
            <h1 className="text-white font-semibold text-sm tracking-wide">Design Journeys</h1>
            <p className="text-slate-400 text-xs hidden sm:block">Compañero de estudio · Systemic Design</p>
          </div>
        </div>

        {/* Contador de tokens — solo para Moisés (id=1) */}
        {usuario?.id === 1 && stats && (
          <div className="flex items-center gap-4 flex-1 justify-center overflow-x-auto">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
              <div className="text-center">
                <p className="text-slate-500 text-xs leading-none mb-0.5">Total tokens</p>
                <p className="text-slate-300 text-xs font-mono font-semibold">{stats.totales.tokensTotal.toLocaleString()}</p>
              </div>
              <div className="w-px h-6 bg-white/10"/>
              <div className="text-center">
                <p className="text-slate-500 text-xs leading-none mb-0.5">Costo total</p>
                <p className="text-emerald-400 text-xs font-mono font-semibold">${stats.totales.costoUSD.toFixed(4)}</p>
              </div>
              <div className="w-px h-6 bg-white/10"/>
              {stats.usuarios.map(u => (
                <div key={u.id} className="text-center">
                  <p className="text-slate-500 text-xs leading-none mb-0.5">{u.nombre.split(' ')[0]}</p>
                  <p className="text-slate-400 text-xs font-mono">{u.tokensTotal.toLocaleString()} · <span className="text-emerald-500">${u.costoUSD.toFixed(4)}</span></p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 flex-shrink-0">
          <button onClick={() => usuario && iniciarConversacion(usuario.id)}
            className="text-slate-400 hover:text-emerald-400 text-xs transition border border-white/10 hover:border-emerald-500/30 rounded-lg px-3 py-1.5">
            + Nueva
          </button>
          <span className="text-slate-300 text-sm hidden sm:block">{usuario?.nombre}</span>
          <button onClick={cerrarSesion} className="text-slate-500 hover:text-slate-300 text-xs transition">Salir</button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        {sidebarAbierto && (
          <aside className="w-72 border-r border-white/10 bg-slate-900/60 flex flex-col overflow-y-auto flex-shrink-0">
            <div className="px-4 py-3 border-b border-white/10">
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Conversaciones anteriores</p>
            </div>
            {historial.length === 0
              ? <p className="text-slate-500 text-xs px-4 py-6 text-center">No hay conversaciones anteriores</p>
              : <div className="flex flex-col gap-1 p-2">
                  {historial.map(conv => (
                    <div key={conv.id}
                      onClick={() => abrirConversacion(conv)}
                      className={`group flex items-start justify-between px-3 py-2.5 rounded-lg cursor-pointer transition hover:bg-white/10 ${conversacionId === conv.id ? 'bg-white/10 border border-emerald-500/30' : ''}`}>
                      <div className="flex-1 min-w-0 mr-2">
                        <p className="text-slate-200 text-xs font-medium truncate">{conv.titulo}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{formatFecha(conv.ultimo_mensaje || conv.created_at)} · {conv.total_mensajes} msg</p>
                      </div>
                      <button
                        onClick={(e) => eliminarConversacion(e, conv.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition flex-shrink-0 mt-0.5"
                        title="Eliminar">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
            }
          </aside>
        )}

        {/* Área principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-6 w-full">

            {/* Mapa del curso */}
            {mensajes.length === 0 && (
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-6">
                  <p className="text-slate-400 text-sm">Selecciona un capítulo o lección para comenzar</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {MAPA_CURSO.map(cap => (
                    <div key={cap.num} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                      <button
                        onClick={() => enviarTexto(cap.prompt)}
                        className="w-full text-left px-3 py-3 hover:bg-emerald-500/10 border-b border-white/10 transition group">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 text-xs font-mono font-bold">{String(cap.num).padStart(2,'0')}</span>
                          <span className="text-white text-xs font-semibold group-hover:text-emerald-300 transition">{cap.nombre}</span>
                        </div>
                      </button>
                      <div className="px-2 py-2 flex flex-col gap-1">
                        {cap.lecciones.map((lec, i) => (
                          <button
                            key={i}
                            onClick={() => enviarTexto(lec.prompt)}
                            className="text-left text-xs text-slate-400 hover:text-emerald-300 hover:bg-white/5 rounded-lg px-2 py-1.5 transition leading-snug">
                            {lec.nombre}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mensajes */}
            <div className="space-y-6 max-w-3xl mx-auto mt-4">
              {mensajes.map((msg, i) => (
                <div key={i} className={`flex ${msg.rol === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.rol === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-sm mr-3 mt-1 flex-shrink-0">🌿</div>
                  )}
                  <div className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed ${
                    msg.rol === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-sm'
                      : 'bg-white/8 border border-white/10 text-slate-100 rounded-bl-sm'
                  }`}>
                    {msg.rol === 'assistant' ? (
                      <div className="prose prose-invert prose-sm max-w-none
                        prose-headings:text-emerald-300 prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2
                        prose-h2:text-base prose-h3:text-sm
                        prose-p:text-slate-200 prose-p:leading-relaxed prose-p:my-2
                        prose-strong:text-emerald-300 prose-strong:font-semibold
                        prose-ul:my-2 prose-ul:space-y-1 prose-ol:my-2 prose-ol:space-y-1
                        prose-li:text-slate-200 prose-li:marker:text-emerald-400
                        prose-code:text-emerald-300 prose-code:bg-white/10 prose-code:px-1 prose-code:rounded
                        prose-blockquote:border-l-emerald-500 prose-blockquote:text-slate-400
                        prose-hr:border-white/10">
                        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{msg.contenido}</ReactMarkdown>
                      </div>
                    ) : msg.contenido}
                  </div>
                </div>
              ))}

              {cargando && (
                <div className="flex justify-start">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-sm mr-3 flex-shrink-0">🌿</div>
                  <div className="bg-white/8 border border-white/10 rounded-2xl rounded-bl-sm px-5 py-4">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-white/10 px-4 py-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="max-w-3xl mx-auto flex gap-3">
              <input type="text" value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && enviarTexto(input)}
                placeholder="Pregunta sobre Systemic Design..."
                disabled={cargando}
                className="flex-1 bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition text-sm" />
              <button onClick={() => enviarTexto(input)}
                disabled={cargando || !input.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl px-5 py-3 transition font-medium text-sm">
                Enviar
              </button>
            </div>
            <p className="text-center text-slate-600 text-xs mt-2">Design Journeys Study Companion · Acceso privado</p>
          </div>
        </div>
      </div>
    </div>
  )
}