import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { password } = body

    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      return NextResponse.json(
        { error: 'Contraseña de administrador no configurada' },
        { status: 500 }
      )
    }

    if (password === adminPassword) {
      return NextResponse.json({ authenticated: true })
    } else {
      return NextResponse.json({ authenticated: false })
    }
  } catch (error) {
    console.error('Admin check error:', error)
    return NextResponse.json(
      { error: 'Error de autenticación' },
      { status: 500 }
    )
  }
}








