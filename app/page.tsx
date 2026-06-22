'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

interface Mensaje { rol: 'user' | 'assistant'; contenido: string }
interface Usuario { id: number; nombre: string; email: string }
interface Conversacion {
  id: number; titulo: string; created_at: string
  total_mensajes: number; ultimo_mensaje: string
  usuario_id: number; autor_nombre: string; cap_id: string | null
}
interface Stats {
  usuarios: Array<{ id: number; nombre: string; tokensTotal: number; costoUSD: number; totalRespuestas: number }>
  totales: { tokensTotal: number; costoUSD: number }
}
interface Recurso { id: number; tipo: string; titulo: string; url: string }

const MAPA_CURSO = [
  {
    num: 1, nombre: 'Introducción',
    prompt: 'Dame una introducción general al curso de Systemic Design y sus conceptos fundamentales',
    lecciones: [
      { nombre: 'Para de solucionar problemas', prompt: 'Explícame qué es el curso de Systemic Design for Tackling Complexity y qué vamos a aprender' },
      { nombre: 'Wicked Problems', prompt: 'Explícame qué son los problemas perversos (Wicked Problems) y por qué son relevantes para el diseño sistémico' },
      { nombre: 'Diseño sistémico', prompt: 'Explícame qué es el diseño sistémico, su origen y en qué se diferencia del diseño tradicional' },
    ]
  },
  {
    num: 2, nombre: 'Encuadre',
    prompt: 'Dame una visión general del estadio [1] Framing — Enmarcar el sistema',
    lecciones: [
      { nombre: 'El Antropoceno', prompt: 'Explícame cómo se enmarca un sistema en diseño sistémico y qué herramientas se usan en el estadio Framing' },
      { nombre: 'VUCA y BANI', prompt: 'Explícame la herramienta Actors Map: qué es, para qué sirve y cómo se construye. Propón hacer el Ejercicio 1.' },
      { nombre: 'Entendiendo el Iceberg', prompt: 'Explícame el Causal Layered Analysis (CLA) y sus 4 capas. Propón hacer el Ejercicio 2 con un caso real.' },
    ]
  },
  {
    num: 3, nombre: 'Escucha',
    prompt: 'Dame una visión general del estadio [2] Listening — Escuchar el sistema',
    lecciones: [
      { nombre: 'Hacer investigación', prompt: 'Explícame cómo se investiga en diseño sistémico: metodologías, enfoques y el diamante de investigación' },
      { nombre: 'Análisis Causal Sistémico', prompt: 'Explícame cómo hacer Stakeholder Discovery y entrevistas contextuales en análisis causal sistémico' },
      { nombre: 'Visualizar Sistemas', prompt: 'Explícame la herramienta Actants Map: qué diferencia a un actante de un actor y cómo se usa' },
    ]
  },
  {
    num: 4, nombre: 'Comprensión',
    prompt: 'Dame una visión general del estadio [3] Understanding — Comprender el sistema',
    lecciones: [
      { nombre: 'Dinámica de sistemas', prompt: 'Explícame dinámica de sistemas, su relación con procesos y resultados' },
      { nombre: 'Puntos o nodos clave', prompt: 'Explícame los Causal Loop Diagrams (CLD): bucles de refuerzo y balance, cómo se construyen.' },
      { nombre: 'El Modelo DIKW', prompt: 'Explícame el modelo DIKW.' },
    ]
  },
  {
    num: 5, nombre: 'Visión',
    prompt: 'Dame una visión general del estadio [4] Envisioning — Visionar futuros deseados',
    lecciones: [
      { nombre: 'Modelar Valor', prompt: 'Explícame cómo hacer modelos basados en valores' },
      { nombre: 'Escaneo de horizontes', prompt: 'el marco Three Horizons de Bill Sharpe: H1, H2 y H3, cómo coexisten y cómo se usa en diseño sistémico' },
      { nombre: 'Trabajo con paradojas', prompt: 'Explícame qué es Paradoxing en diseño sistémico y cómo trabajar con tensiones y paradojas para generar innovación' },
    ]
  },
  {
    num: 6, nombre: 'Posibilidades',
    prompt: 'Dame una visión general del estadio [5] Exploring — Espacio de posibilidades',
    lecciones: [
      { nombre: 'Mapa de síntesis avanzado', prompt: 'Explícame cómo se usa el Synthesis Mapping en el estadio de exploración y cómo conecta con las intervenciones' },
      { nombre: 'Intervenciones', prompt: 'Explícame los tipos de intervenciones en diseño sistémico y cómo se identifican los puntos de palanca (leverage points)' },
      { nombre: 'Límites del sistema', prompt: 'Explícame cómo se definen y trabajan los límites de un sistema en diseño sistémico' },
    ]
  },
  {
    num: 7, nombre: 'Planificación',
    prompt: 'Dame una visión general del estadio [6] Planning — Planificar el cambio sistémico',
    lecciones: [
      { nombre: 'Teoría del cambio', prompt: 'Explícame la Theory of Change (TOSCA) en diseño sistémico: niveles, supuestos y cómo se construye' },
      { nombre: 'Requerir variedad', prompt: 'Explícame cómo se auto-regulan y organizan los sistemas' },
      { nombre: 'Innovación sistémica', prompt: 'Explícame cómo se fomenta la innovación sistémica y qué significa hacer una transición exitosa según el curso' },
    ]
  },
  {
    num: 8, nombre: 'Transición',
    prompt: 'Dame una visión general del estadio [7] Fostering — Implementar la transición sistémica',
    lecciones: [
      { nombre: 'Teoría de la transición', prompt: 'Explícame la teoría de la transición en diseño sistémico: niveles, supuestos y cómo se construye' },
      { nombre: 'Ciclos adaptativos de resiliencia', prompt: 'Explícame cómo diseñar la colaboración entre actores para implementar el cambio sistémico' },
      { nombre: 'Gobernanza sistémica', prompt: 'Explícame cómo funciona la ejecución de intervenciones en sistemas socio-ecológicos' },
    ]
  },
]

function leccionId(capNum: number, lecIdx: number) { return `cap${capNum}_lec${lecIdx}` }

export default function ChatPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [input, setInput] = useState('')
  const [cargando, setCargando] = useState(false)
  const [conversacionId, setConversacionId] = useState<number | null>(null)
  const [historial, setHistorial] = useState<Conversacion[]>([])
  const [sidebarAbierto, setSidebarAbierto] = useState(false)
  const [acordeonesAbiertos, setAcordeonesAbiertos] = useState<Record<string, boolean>>({})
  const toggleAcordeon = (key: string) =>
    setAcordeonesAbiertos(prev => ({ ...prev, [key]: !prev[key] }))
  const [stats, setStats] = useState<Stats | null>(null)
  const [conteoRecursos, setConteoRecursos] = useState<Record<string, number>>({})
  const [modalInfo, setModalInfo] = useState<{ leccionId: string; nombre: string } | null>(null)
  const [recursosModal, setRecursosModal] = useState<Recurso[]>([])
  const [cargandoRecursos, setCargandoRecursos] = useState(false)
  const [modalAyuda, setModalAyuda] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()

  useEffect(() => {
    const u = localStorage.getItem('usuario')
    if (!u) { router.push('/login'); return }
    const p = JSON.parse(u)
    setUsuario(p)
    cargarHistorial(p.id)
    iniciarConversacion(p.id)
    cargarConteoRecursos()
    if (p.id === 1) cargarStats()
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [mensajes])

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

  async function cargarConteoRecursos() {
    try {
      const r = await fetch('/api/recursos')
      const d = await r.json()
      const mapa: Record<string, number> = {}
      for (const c of (d.conteos || [])) mapa[c.leccion_id] = Number(c.total)
      setConteoRecursos(mapa)
    } catch (e) { console.error(e) }
  }

  async function abrirModal(lid: string, nombre: string) {
    setModalInfo({ leccionId: lid, nombre })
    setCargandoRecursos(true)
    setRecursosModal([])
    const r = await fetch(`/api/recursos?leccionId=${lid}`)
    const d = await r.json()
    setRecursosModal(d.recursos || [])
    setCargandoRecursos(false)
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
        rol: m.rol as 'user' | 'assistant', contenido: m.contenido,
      })))
    } catch (e) { console.error(e) }
  }

  async function eliminarConversacion(e: React.MouseEvent, convId: number) {
    e.stopPropagation()
    if (!confirm('¿Eliminar esta conversación?')) return
    await fetch(`/api/conversaciones/eliminar?conversacionId=${convId}`, { method: 'DELETE' })
    if (conversacionId === convId) { setMensajes([]); if (usuario) iniciarConversacion(usuario.id) }
    if (usuario) cargarHistorial(usuario.id)
  }

  async function enviarTexto(texto: string) {
    if (!texto.trim() || !conversacionId || cargando) return
    const esFirst = mensajes.length === 0
    setMensajes(prev => [...prev, { rol: 'user', contenido: texto }])
    setInput('')
    setCargando(true)
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: texto, conversacionId, usuarioId: usuario?.id, esPrimerMensaje: esFirst }),
      })
      const d = await r.json()
      if (d.respuesta) {
        setMensajes(prev => [...prev, { rol: 'assistant', contenido: d.respuesta }])
        if (usuario) { cargarHistorial(usuario.id); if (usuario.id === 1) cargarStats() }
      }
    } catch { setMensajes(prev => [...prev, { rol: 'assistant', contenido: 'Hubo un error. Intenta de nuevo.' }]) }
    finally { setCargando(false) }
  }

  function cerrarSesion() { localStorage.removeItem('usuario'); router.push('/login') }

  function formatFecha(f: string) {
    const fecha = new Date(f)
    if (Number.isNaN(fecha.getTime())) return ''
    return fecha.toLocaleDateString('es', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const tiposInfo: Record<string, { label: string; icon: string; color: string }> = {
    lamina: { label: 'Lámina Grupo 1', icon: '📋', color: 'text-amber-400' },
    grafico: { label: 'Gráficos', icon: '🖼️', color: 'text-violet-400' },
    pdf: { label: 'PDFs', icon: '📄', color: 'text-red-400' },
    youtube: { label: 'YouTube', icon: '▶️', color: 'text-red-500' },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col">

      {/* Header */}
      <header className="border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 bg-slate-900/80 backdrop-blur-sm z-20">
        <div className="flex items-center gap-3">
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
        <div className="flex items-center gap-3">
          {usuario?.id === 1 && (
            <button onClick={() => router.push('/admin')}
              className="text-slate-400 hover:text-emerald-400 text-xs transition border border-white/10 hover:border-emerald-500/30 rounded-lg px-3 py-1.5">
              ⚙️ Admin
            </button>
          )}
          <button onClick={() => usuario && iniciarConversacion(usuario.id)}
            className="text-slate-400 hover:text-emerald-400 text-xs transition border border-white/10 hover:border-emerald-500/30 rounded-lg px-3 py-1.5">
            + Nueva
          </button>
          <span className="text-slate-300 text-sm hidden sm:block">{usuario?.nombre}</span>
          <button onClick={cerrarSesion} className="text-slate-500 hover:text-slate-300 text-xs transition">Salir</button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">

        {/* Sidebar overlay */}
        {sidebarAbierto && (
          <>
            <div className="fixed inset-0 bg-black/50 z-10 lg:hidden" onClick={() => setSidebarAbierto(false)} />
            <aside className="absolute lg:relative w-72 h-full border-r border-white/10 bg-slate-900 lg:bg-slate-900/60 flex flex-col overflow-y-auto flex-shrink-0 z-20">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Conversaciones</p>
                <button onClick={() => setSidebarAbierto(false)} className="text-slate-500 hover:text-white transition lg:hidden">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              {historial.length === 0
                ? <p className="text-slate-500 text-xs px-4 py-6 text-center">No hay conversaciones anteriores</p>
                : <div className="flex flex-col p-2">
                    {(() => {
                      // Agrupar conversaciones por cap_id
                      const grupos: Record<string, Conversacion[]> = {}
                      for (const conv of historial) {
                        const key = conv.cap_id || 'sin_categoria'
                        if (!grupos[key]) grupos[key] = []
                        grupos[key].push(conv)
                      }
                      // Orden: cap1..cap8 primero, luego sin_categoria
                      const capNombres: Record<string, string> = {
                        cap1: '01 Introducción', cap2: '02 Encuadre',
                        cap3: '03 Escucha', cap4: '04 Comprensión',
                        cap5: '05 Visión', cap6: '06 Posibilidades',
                        cap7: '07 Planificación', cap8: '08 Transición',
                        sin_categoria: 'Fuera del curso',
                      }
                      const orden = ['cap1','cap2','cap3','cap4','cap5','cap6','cap7','cap8','sin_categoria']
                      return orden
                        .filter(k => grupos[k]?.length > 0)
                        .map(key => {
                          const convs = grupos[key]
                          const abierto = acordeonesAbiertos[key] ?? false
                          return (
                            <div key={key} className="mb-1">
                              {/* Cabecera del acordeón */}
                              <button
                                onClick={() => toggleAcordeon(key)}
                                className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-white/5 transition group">
                                <span className="text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
                                  {capNombres[key] || key}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <span className="bg-emerald-500/20 text-emerald-400 text-xs rounded-full px-1.5 py-0.5 font-mono">
                                    {convs.length}
                                  </span>
                                  <svg
                                    className={`text-slate-500 transition-transform duration-200 ${abierto ? 'rotate-180' : ''}`}
                                    width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <polyline points="6 9 12 15 18 9"/>
                                  </svg>
                                </div>
                              </button>
                              {/* Conversaciones del grupo */}
                              {abierto && (
                                <div className="flex flex-col gap-0.5 mt-0.5 ml-1">
                                  {convs.map((conv: Conversacion) => {
                                    const esMia = conv.usuario_id === usuario?.id
                                    const iniciales = conv.autor_nombre?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                                    return (
                                      <div key={conv.id} onClick={() => abrirConversacion(conv)}
                                        className={`group flex items-start justify-between px-3 py-2 rounded-lg cursor-pointer transition hover:bg-white/10 ${conversacionId === conv.id ? 'bg-white/10 border border-emerald-500/30' : ''}`}>
                                        <div className="flex items-start gap-2 flex-1 min-w-0 mr-2">
                                          <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${esMia ? 'bg-emerald-500/20 text-emerald-400' : 'bg-violet-500/20 text-violet-400'}`}>
                                            {iniciales}
                                          </div>
                                          <div className="min-w-0">
                                            <p className="text-slate-200 text-xs font-medium truncate">{conv.titulo}</p>
                                            <p className="text-slate-500 text-xs mt-0.5">{formatFecha(conv.created_at)} · {conv.total_mensajes} msg</p>
                                          </div>
                                        </div>
                                        {esMia && (
                                          <button onClick={(e) => eliminarConversacion(e, conv.id)}
                                            className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition flex-shrink-0 mt-0.5">
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                                            </svg>
                                          </button>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          )
                        })
                    })()}
                  </div>
              }
            </aside>
          </>
        )}

        {/* Área principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-6 w-full">

            {/* Mapa del curso */}
            {mensajes.length === 0 && (
              <div className="max-w-6xl mx-auto">

                {/* Contador tokens — solo Moisés */}
                {usuario?.id === 1 && stats && (
                  <div className="mb-5 flex flex-wrap items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-slate-500 text-xs leading-none mb-1">Total tokens</p>
                      <p className="text-slate-300 text-xs font-mono font-semibold">{stats.totales.tokensTotal.toLocaleString()}</p>
                    </div>
                    <div className="w-px h-6 bg-white/10 hidden sm:block"/>
                    <div>
                      <p className="text-slate-500 text-xs leading-none mb-1">Costo total</p>
                      <p className="text-emerald-400 text-xs font-mono font-semibold">${stats.totales.costoUSD.toFixed(4)}</p>
                    </div>
                    <div className="w-px h-6 bg-white/10 hidden sm:block"/>
                    {stats.usuarios.map(u => (
                      <div key={u.id}>
                        <p className="text-slate-500 text-xs leading-none mb-1">{u.nombre.split(' ')[0]}</p>
                        <p className="text-slate-400 text-xs font-mono">{u.tokensTotal.toLocaleString()} · <span className="text-emerald-500">${u.costoUSD.toFixed(4)}</span></p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-center mb-6">
                  <p className="text-slate-400 text-sm">Selecciona un capítulo o lección para comenzar</p>
                  <button
                    onClick={() => setModalAyuda(true)}
                    className="mt-2 text-emerald-500 hover:text-emerald-400 text-xs underline underline-offset-2 transition">
                    ¿Cómo usar esta herramienta?
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {MAPA_CURSO.map(cap => (
                    <div key={cap.num} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                      <button onClick={() => enviarTexto(cap.prompt)}
                        className="w-full text-left px-3 py-3 hover:bg-emerald-500/10 border-b border-white/10 transition group">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 text-xs font-mono font-bold">{String(cap.num).padStart(2,'0')}</span>
                          <span className="text-white text-xs font-semibold group-hover:text-emerald-300 transition">{cap.nombre}</span>
                        </div>
                      </button>
                      <div className="px-2 py-2 flex flex-col gap-1">
                        {cap.lecciones.map((lec, i) => {
                          const lid = leccionId(cap.num, i)
                          const tieneRecursos = (conteoRecursos[lid] || 0) > 0
                          return (
                            <div key={i} className="flex items-center gap-1 group/lec">
                              <button onClick={() => enviarTexto(lec.prompt)}
                                className="flex-1 text-left text-xs text-slate-400 hover:text-emerald-300 hover:bg-white/5 rounded-lg px-2 py-1.5 transition leading-snug">
                                {lec.nombre}
                              </button>
                              {tieneRecursos && (
                                <button
                                  onClick={() => abrirModal(lid, lec.nombre)}
                                  title="Ver recursos"
                                  className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-slate-500 hover:text-emerald-400 hover:bg-white/10 transition opacity-60 group-hover/lec:opacity-100">
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                                  </svg>
                                </button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input inline */}
                <div className="mt-6 flex gap-3 max-w-2xl mx-auto">
                  <input type="text" value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && enviarTexto(input)}
                    placeholder="O escribe tu pregunta aquí..."
                    disabled={cargando}
                    className="flex-1 bg-slate-700 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 transition text-sm" />
                  <button onClick={() => enviarTexto(input)} disabled={cargando || !input.trim()}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl px-5 py-3 transition font-medium text-sm">
                    Enviar
                  </button>
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
                  <div className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed ${msg.rol === 'user' ? 'bg-emerald-600 text-white rounded-br-sm' : 'bg-white/8 border border-white/10 text-slate-100 rounded-bl-sm'}`}>
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
                        <ReactMarkdown
                          rehypePlugins={[rehypeRaw]}
                          components={{
                            a: ({ ...props }) => (
                              <a {...props} target="_blank" rel="noopener noreferrer" />
                            ),
                          }}
                        >
                          {msg.contenido}
                        </ReactMarkdown>
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

          {/* Input — solo cuando hay mensajes */}
          {mensajes.length > 0 && (
            <div className="border-t border-white/10 px-4 py-4 bg-slate-900/50 backdrop-blur-sm">
              <div className="max-w-3xl mx-auto flex gap-3">
                <input type="text" value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && enviarTexto(input)}
                  placeholder="Pregunta sobre Systemic Design..."
                  disabled={cargando}
                  className="flex-1 bg-slate-700 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 transition text-sm" />
                <button onClick={() => enviarTexto(input)} disabled={cargando || !input.trim()}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl px-5 py-3 transition font-medium text-sm">
                  Enviar
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <footer className="border-t border-white/5 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-1 bg-slate-900/30">
            <p className="text-slate-500 text-xs">
              Vibe-coded by{' '}
              <a href="https://umbusk.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400 transition">UMBUSK</a>
              {' '}and Claude from Anthropic.
            </p>
            <p className="text-slate-600 text-xs">© 2026 Umbusk, LLC. Todos los derechos reservados.</p>
          </footer>
        </div>
      </div>

      {/* Modal de ayuda */}
      {modalAyuda && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setModalAyuda(false)}>
          <div className="bg-slate-800 border border-white/15 rounded-2xl w-full max-w-lg shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h3 className="text-white font-semibold text-sm">¿Cómo usar esta herramienta?</h3>
              <button onClick={() => setModalAyuda(false)} className="text-slate-400 hover:text-white transition">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="px-5 py-5">
              <p className="text-slate-200 text-sm leading-relaxed">
                Para obtener un resumen de los contenidos, puedes hacer clic en los títulos de los capítulos y de las respectivas lecciones. Para información complementaria, en cada lección puedes hacer clic en las <span className="text-emerald-400 font-semibold">ⓘ</span> encerradas en círculos. También puedes preguntar sobre diseño sistémico abajo en el chat. Al terminar de leer cada respuesta puedes continuar conversando con la IA, si crees que eso te ayudará a entender mejor cada tema del curso.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de recursos */}
      {modalInfo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setModalInfo(null)}>
          <div className="bg-slate-800 border border-white/15 rounded-2xl w-full max-w-lg shadow-2xl"
            onClick={e => e.stopPropagation()}>
            {/* Header modal */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div>
                <h3 className="text-white font-semibold text-sm">{modalInfo.nombre}</h3>
                <p className="text-slate-400 text-xs mt-0.5">Recursos de referencia</p>
              </div>
              <button onClick={() => setModalInfo(null)}
                className="text-slate-400 hover:text-white transition">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Contenido modal */}
            <div className="px-5 py-4 space-y-4 max-h-96 overflow-y-auto">
              {cargandoRecursos ? (
                <p className="text-slate-400 text-sm text-center py-4">Cargando recursos...</p>
              ) : (
                ['lamina', 'grafico', 'pdf', 'youtube'].map(tipo => {
                  const items = recursosModal.filter(r => r.tipo === tipo)
                  if (items.length === 0) return null
                  const info = tiposInfo[tipo]
                  return (
                    <div key={tipo}>
                      <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${info.color}`}>
                        {info.icon} {info.label}
                      </p>
                      <div className="space-y-1.5">
                        {items.map(r => (
                          <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-3 px-3 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition group">
                            <span className="text-base flex-shrink-0">{info.icon}</span>
                            <span className="text-slate-200 text-sm group-hover:text-white transition flex-1 truncate">{r.titulo}</span>
                            <svg className="flex-shrink-0 text-slate-500 group-hover:text-slate-300 transition" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                            </svg>
                          </a>
                        ))}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}