'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

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
    if (!u) {
      router.push('/login')
      return
    }
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
        body: JSON.stringify({
          mensaje: input,
          conversacionId,
          usuarioId: usuario?.id,
        }),
      })

      const data = await res.json()

      if (data.respuesta) {
        setMensajes(prev => [
          ...prev,
          { rol: 'assistant', contenido: data.respuesta },
        ])
      }
    } catch (err) {
      console.error('Error:', err)
      setMensajes(prev => [
        ...prev,
        { rol: 'assistant', contenido: 'Hubo un error al procesar tu pregunta. Intenta de nuevo.' },
      ])
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
      <header className="border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌿</span>
          <div>
            <h1 className="text-white font-semibold text-sm">Design Journeys</h1>
            <p className="text-slate-400 text-xs">Compañero de estudio</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-300 text-sm">{usuario?.nombre}</span>
          <button
            onClick={cerrarSesion}
            className="text-slate-400 hover:text-white text-xs transition"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-3xl mx-auto w-full">
        
        {/* Mensaje de bienvenida */}
        {mensajes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🌿</div>
            <h2 className="text-white text-xl font-semibold mb-2">
              Hola, {usuario?.nombre?.split(' ')[0]}
            </h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Soy tu compañero de estudio en Systemic Design. Puedes preguntarme sobre los 7 estadios del Design Journeys, sus herramientas, o cómo aplicarlas a casos reales.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-2 max-w-sm mx-auto">
              {[
                '¿Qué es el Influence Map y cuándo usarlo?',
                'Explícame los Three Horizons',
                '¿Cómo se conectan los 7 estadios entre sí?',
                '¿Cuál es la diferencia entre Story Loop y Causal Loop?',
              ].map(sugerencia => (
                <button
                  key={sugerencia}
                  onClick={() => { setInput(sugerencia); }}
                  className="text-left text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-slate-300 transition"
                >
                  {sugerencia}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Lista de mensajes */}
        {mensajes.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.rol === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.rol === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-sm'
                  : 'bg-white/10 text-slate-100 rounded-bl-sm'
              }`}
            >
              {msg.contenido}
            </div>
          </div>
        ))}

        {/* Indicador de escritura */}
        {cargando && (
          <div className="flex justify-start">
            <div className="bg-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 px-4 py-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && enviarMensaje()}
            placeholder="Pregunta sobre Systemic Design..."
            disabled={cargando}
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition text-sm"
          />
          <button
            onClick={enviarMensaje}
            disabled={cargando || !input.trim()}
            className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-600 text-white rounded-xl px-5 py-3 transition font-medium text-sm"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  )
}