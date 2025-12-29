import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('user_session')

    return NextResponse.json({ message: 'Sesión cerrada exitosamente' })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Error logging out' },
      { status: 500 }
    )
  }
}







