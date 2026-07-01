import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { sql } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Si contiene @, buscar por email; si no, buscar por username (ej: dj-user)
    const esEmail = email.includes('@')

    const usuarios = esEmail
      ? await sql`
          SELECT id, nombre, email, password_hash, rol
          FROM usuarios
          WHERE email = ${email.toLowerCase()}
        `
      : await sql`
          SELECT id, nombre, email, password_hash, rol
          FROM usuarios
          WHERE username = ${email.toLowerCase()}
        `

    if (usuarios.length === 0) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      )
    }

    const usuario = usuarios[0]

    const passwordValida = await bcrypt.compare(password, usuario.password_hash)

    if (!passwordValida) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,       // ← nuevo campo
      },
    })
  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}