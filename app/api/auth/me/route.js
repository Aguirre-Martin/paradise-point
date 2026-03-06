import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyUser } from '@/lib/auth'

export async function GET() {
  if (!prisma) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  try {
    const decoded = await verifyUser()
    if (!decoded) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        createdAt: true,
        lastLogin: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error verifying user:', error)
    return NextResponse.json({ error: 'Error verifying authentication' }, { status: 500 })
  }
}
