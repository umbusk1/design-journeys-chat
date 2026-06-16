'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'

interface Mensaje {
  rol: 'user' | 'assistant'
  contenido: string
}

interface Usuario {
  id: number
  nombre: string
  email: string
}

export default function ChatPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [input, setInput] = useState('')
  const [cargando, setCargando] = useState(false)
  const [conversacionId, setConversacionId] = useState<number | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const u = localStorage.getItem('usuario')
    if (!u) { router.push('/login'); return }
    const usuarioParsed = JSON.parse(u)
    setUsuario(usuarioParsed)
    iniciarConversacion(usuarioParsed.id)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  async function iniciarConversacion(usuarioId: number) {
    try {
      const res = await fetch('/api/conversaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId, titulo: 'Sesión de estudio' }),
      })
      const data = await res.json()
      setConversacionId(data.id)
    } catch (err) {
      console.error('Error al iniciar conversación:', err)
    }
  }

  async function enviarTexto(texto: string) {
    if (!texto.trim() || !conversacionId || cargando) return
    const nuevoMensaje: Mensaje = { rol: 'user', contenido: texto }
    setMensajes(prev => [...prev, nuevoMensaje])
    setInput('')
    setCargando(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: texto, conversacionId, usuarioId: usuario?.id }),
      })
      const data = await res.json()
      if (data.respuesta) {
        setMensajes(prev => [...prev, { rol: 'assistant', contenido: data.respuesta }])
      }
    } catch (err) {
      console.error('Error:', err)
      setMensajes(prev => [...prev, { rol: 'assistant', contenido: 'Hubo un error. Intenta de nuevo.' }])
    } finally {
      setCargando(false)
    }
  }

  async function enviarMensaje() {
    if (!input.trim() || !conversacionId || cargando) return
    const nuevoMensaje: Mensaje = { rol: 'user', contenido: input }
    setMensajes(prev => [...prev, nuevoMensaje])
    setInput('')
    setCargando(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: input, conversacionId, usuarioId: usuario?.id }),
      })
      const data = await res.json()
      if (data.respuesta) {
        setMensajes(prev => [...prev, { rol: 'assistant', contenido: data.respuesta }])
      }
    } catch (err) {
      console.error('Error:', err)
      setMensajes(prev => [...prev, { rol: 'assistant', contenido: 'Hubo un error. Intenta de nuevo.' }])
    } finally {
      setCargando(false)
    }
  }

  function cerrarSesion() {
    localStorage.removeItem('usuario')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col">

      {/* Header */}
      <header className="border-b border-white/10 px-6 py-3 flex items-center justify-between sticky top-0 bg-slate-900/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌿</span>
          <div>
            <h1 className="text-white font-semibold text-sm tracking-wide">Design Journeys</h1>
            <p className="text-slate-400 text-xs">Compañero de estudio · Systemic Design</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-300 text-sm">{usuario?.nombre}</span>
          <button onClick={cerrarSesion} className="text-slate-500 hover:text-slate-300 text-xs transition">
            Salir
          </button>
        </div>
      </header>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-8 max-w-3xl mx-auto w-full">

        {/* Bienvenida */}
        {mensajes.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-5">🌿</div>
            <h2 className="text-white text-2xl font-semibold mb-2">
              Hola, {usuario?.nombre?.split(' ')[0]}
            </h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed mb-8">
              Soy tu compañero de estudio en Systemic Design. Pregúntame sobre los 7 estadios del Design Journeys, sus herramientas, o cómo aplicarlas a casos reales.
            </p>
            <div className="grid grid-cols-1 gap-2 max-w-sm mx-auto">
              {[
                '¿Qué es el Influence Map y cuándo usarlo?',
                'Explícame los Three Horizons',
                '¿Cómo se conectan los 7 estadios entre sí?',
                '¿Cuál es la diferencia entre Story Loop y Causal Loop?',
              ].map(s => (
                <button
                  key={s}
                  onClick={() => enviarTexto(s)}
                  className="text-left text-sm bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 rounded-xl px-4 py-3 text-slate-300 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Lista de mensajes */}
        <div className="space-y-6">
          {mensajes.map((msg, i) => (
            <div key={i} className={`flex ${msg.rol === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.rol === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-sm mr-3 mt-1 flex-shrink-0">
                  🌿
                </div>
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
                    prose-ul:my-2 prose-ul:space-y-1
                    prose-ol:my-2 prose-ol:space-y-1
                    prose-li:text-slate-200 prose-li:marker:text-emerald-400
                    prose-code:text-emerald-300 prose-code:bg-white/10 prose-code:px-1 prose-code:rounded
                    prose-blockquote:border-l-emerald-500 prose-blockquote:text-slate-400
                    prose-hr:border-white/10">
                    <ReactMarkdown>{msg.contenido}</ReactMarkdown>
                  </div>
                ) : (
                  msg.contenido
                )}
              </div>
            </div>
          ))}

          {/* Indicador de escritura */}
          {cargando && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-sm mr-3 flex-shrink-0">
                🌿
              </div>
              <div className="bg-white/8 border border-white/10 rounded-2xl rounded-bl-sm px-5 py-4">
                <div className="flex gap-1.5 items-center">
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
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && enviarMensaje()}
            placeholder="Pregunta sobre Systemic Design..."
            disabled={cargando}
            className="flex-1 bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition text-sm"
          />
          <button
            onClick={enviarMensaje}
            disabled={cargando || !input.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl px-5 py-3 transition font-medium text-sm"
          >
            Enviar
          </button>
        </div>
        <p className="text-center text-slate-600 text-xs mt-2">Design Journeys Study Companion · Acceso privado</p>
      </div>
    </div>
  )
}