'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    setCargando(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesión')
        setCargando(false)
        return
      }

      localStorage.setItem('usuario', JSON.stringify(data.usuario))
      router.push('/')
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 w-full max-w-md">
        
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌿</div>
          <h1 className="text-2xl font-bold text-white">Design Journeys</h1>
          <p className="text-slate-300 text-sm mt-1">Compañero de estudio en Systemic Design</p>
        </div>

        {/* Formulario */}
        <div className="space-y-4">
          <div>
            <label className="text-slate-300 text-sm block mb-1">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="tu@email.com"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition"
            />
          </div>

          <div>
            <label className="text-slate-300 text-sm block mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition"
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-lg px-4 py-2.5 text-red-300 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={cargando}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-700 text-white font-medium rounded-lg py-2.5 transition"
          >
            {cargando ? 'Entrando...' : 'Entrar'}
          </button>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          Acceso privado — Design Journeys Study Companion
        </p>
      </div>
    </div>
  )
}