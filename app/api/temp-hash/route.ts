import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function GET() {
  const hash = await bcrypt.hash('genericStreamerX', 10)
  return NextResponse.json({ hash })
}