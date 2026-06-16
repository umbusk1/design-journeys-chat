import { neon } from '@neondatabase/serverless'

function getSQL() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL no está definida en las variables de entorno')
  }
  return neon(process.env.DATABASE_URL)
}

export function sql(...args: Parameters<ReturnType<typeof neon>>) {
  return getSQL()(...args)
}

export async function initDB() {
  const db = getSQL()

  await db`
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nombre TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `

  await db`
    CREATE TABLE IF NOT EXISTS conversaciones (
      id SERIAL PRIMARY KEY,
      usuario_id INTEGER REFERENCES usuarios(id),
      titulo TEXT NOT NULL DEFAULT 'Nueva conversación',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `

  await db`
    CREATE TABLE IF NOT EXISTS mensajes (
      id SERIAL PRIMARY KEY,
      conversacion_id INTEGER REFERENCES conversaciones(id) ON DELETE CASCADE,
      rol TEXT NOT NULL CHECK (rol IN ('user', 'assistant')),
      contenido TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `
}