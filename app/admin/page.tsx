'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const MAPA_CURSO = [
  { num: 1, nombre: 'Introducción', lecciones: ['Para de solucionar problemas', 'Wicked Problems', 'Diseño sistémico'] },
  { num: 2, nombre: 'Encuadre', lecciones: ['El Antropoceno', 'VUCA y BANI', 'Entendiendo el Iceberg'] },
  { num: 3, nombre: 'Escucha', lecciones: ['Hacer investigación', 'Análisis Causal Sistémico', 'Visualizar Sistemas'] },
  { num: 4, nombre: 'Comprensión', lecciones: ['Dinámica de sistemas', 'Puntos o nodos clave', 'El Modelo DIKW'] },
  { num: 5, nombre: 'Visión', lecciones: ['Modelar Valor', 'Escaneo de horizontes', 'Trabajo con paradojas'] },
  { num: 6, nombre: 'Posibilidades', lecciones: ['Mapa de síntesis avanzado', 'Intervenciones', 'Límites del sistema'] },
  { num: 7, nombre: 'Planificación', lecciones: ['Teoría del cambio', 'Requerir variedad', 'Innovación sistémica'] },
  { num: 8, nombre: 'Transición', lecciones: ['Teoría de la transición', 'Ciclos adaptativos de resiliencia', 'Gobernanza sistémica'] },
]

function leccionId(capNum: number, lecIdx: number) {
  return `cap${capNum}_lec${lecIdx}`
}

interface Recurso {
  id: number
  leccion_id: string
  tipo: string
  titulo: string
  url: string
}

const TIPOS = [
{ value: 'lamina', label: 'Lámina Grupo 1', icon: '📋' },
{ value: 'grafico', label: 'Gráfico', icon: '🖼️' },
{ value: 'pdf', label: 'PDF', icon: '📄' },
{ value: 'youtube', label: 'YouTube', icon: '▶️' },
]

export default function AdminPage() {
  const [usuario, setUsuario] = useState<{ id: number; nombre: string } | null>(null)
  const [recursos, setRecursos] = useState<Recurso[]>([])
  const [leccionActiva, setLeccionActiva] = useState<string | null>(null)
  const [form, setForm] = useState({ tipo: 'grafico', titulo: '', url: '' })
  const [guardando, setGuardando] = useState(false)
  const [conteos, setConteos] = useState<Record<string, number>>({})
  const router = useRouter()

  useEffect(() => {
    const u = localStorage.getItem('usuario')
    if (!u) { router.push('/login'); return }
    const parsed = JSON.parse(u)
    if (parsed.id !== 1) { router.push('/'); return }
    setUsuario(parsed)
    cargarConteos()
  }, [])

  async function cargarConteos() {
    const r = await fetch('/api/recursos')
    const d = await r.json()
    const mapa: Record<string, number> = {}
    for (const c of (d.conteos || [])) {
      mapa[c.leccion_id] = Number(c.total)
    }
    setConteos(mapa)
  }

  async function abrirLeccion(lid: string) {
    setLeccionActiva(lid)
    setForm({ tipo: 'grafico', titulo: '', url: '' })
    const r = await fetch(`/api/recursos?leccionId=${lid}`)
    const d = await r.json()
    setRecursos(d.recursos || [])
  }

  async function guardar() {
    if (!form.titulo.trim() || !form.url.trim() || !leccionActiva) return
    setGuardando(true)
    await fetch('/api/recursos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leccionId: leccionActiva, ...form }),
    })
    setForm({ tipo: 'grafico', titulo: '', url: '' })
    await abrirLeccion(leccionActiva)
    await cargarConteos()
    setGuardando(false)
  }

  async function eliminar(id: number) {
    if (!confirm('¿Eliminar este recurso?')) return
    await fetch(`/api/recursos/${id}`, { method: 'DELETE' })
    if (leccionActiva) await abrirLeccion(leccionActiva)
    await cargarConteos()
  }

  if (!usuario) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-3 flex items-center justify-between bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-xl">🌿</span>
          <div>
            <h1 className="text-white font-semibold text-sm">Design Journeys — Admin</h1>
            <p className="text-slate-400 text-xs">Gestión de recursos por lección</p>
          </div>
        </div>
        <button onClick={() => router.push('/')}
          className="text-slate-400 hover:text-white text-xs border border-white/10 rounded-lg px-3 py-1.5 transition">
          ← Volver al chat
        </button>
      </header>

      <div className="flex h-[calc(100vh-53px)]">

        {/* Panel izquierdo — lista de capítulos y lecciones */}
        <aside className="w-72 border-r border-white/10 overflow-y-auto flex-shrink-0 bg-slate-900/40">
          <div className="p-3 space-y-2">
            {MAPA_CURSO.map(cap => (
              <div key={cap.num}>
                <p className="text-emerald-400 text-xs font-mono font-bold px-2 py-1.5 uppercase tracking-wider">
                  {String(cap.num).padStart(2, '0')} {cap.nombre}
                </p>
                {cap.lecciones.map((lec, i) => {
                  const lid = leccionId(cap.num, i)
                  const total = conteos[lid] || 0
                  return (
                    <button key={i} onClick={() => abrirLeccion(lid)}
                      className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg text-xs transition mb-0.5 ${
                        leccionActiva === lid
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                      }`}>
                      <span>{lec}</span>
                      {total > 0 && (
                        <span className="bg-emerald-500/20 text-emerald-400 text-xs rounded-full px-1.5 py-0.5 font-mono">
                          {total}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </aside>

        {/* Panel derecho — editor de recursos */}
        <main className="flex-1 overflow-y-auto p-6">
          {!leccionActiva ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-500 text-sm">Selecciona una lección para gestionar sus recursos</p>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-6">

              {/* Formulario para agregar */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h2 className="text-white text-sm font-semibold mb-4">Agregar recurso</h2>
                <div className="space-y-3">
                  {/* Tipo */}
                  <div className="flex gap-2">
                    {TIPOS.map(t => (
                      <button key={t.value} onClick={() => setForm(f => ({ ...f, tipo: t.value }))}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium transition border ${
                          form.tipo === t.value
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                            : 'border-white/10 text-slate-400 hover:bg-white/5'
                        }`}>
                        {t.icon} {t.label}
                      </button>
                    ))}
                  </div>
                  {/* Título */}
                  <input
                    value={form.titulo}
                    onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                    placeholder="Título del recurso"
                    className="w-full bg-slate-700 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                  {/* URL */}
                  <input
                    value={form.url}
                    onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                    placeholder={
                      form.tipo === 'grafico' ? 'URL de Google Drive (vista previa)' :
                      form.tipo === 'pdf' ? 'URL del PDF' :
                      'URL de YouTube'
                    }
                    className="w-full bg-slate-700 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                  <button onClick={guardar} disabled={guardando || !form.titulo || !form.url}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl py-2.5 text-sm font-medium transition">
                    {guardando ? 'Guardando...' : 'Guardar recurso'}
                  </button>
                </div>
              </div>

              {/* Lista de recursos existentes */}
              {recursos.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider">Recursos cargados</h3>
                  {['grafico', 'pdf', 'youtube'].map(tipo => {
                    const items = recursos.filter(r => r.tipo === tipo)
                    if (items.length === 0) return null
                    const t = TIPOS.find(t => t.value === tipo)!
                    return (
                      <div key={tipo} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        <div className="px-4 py-2 border-b border-white/10">
                          <p className="text-slate-300 text-xs font-medium">{t.icon} {t.label}s</p>
                        </div>
                        {items.map(r => (
                          <div key={r.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-white/5 group">
                            <div className="flex-1 min-w-0 mr-3">
                              <p className="text-slate-200 text-xs font-medium truncate">{r.titulo}</p>
                              <a href={r.url} target="_blank" rel="noopener noreferrer"
                                className="text-slate-500 text-xs hover:text-emerald-400 truncate block transition">
                                {r.url}
                              </a>
                            </div>
                            <button onClick={() => eliminar(r.id)}
                              className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition flex-shrink-0">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              )}

              {recursos.length === 0 && (
                <p className="text-center text-slate-600 text-sm py-8">Esta lección aún no tiene recursos</p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}