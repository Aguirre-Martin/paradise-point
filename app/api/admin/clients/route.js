import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/auth'

export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        instagram: true,
        notes: true,
        createdAt: true,
        _count: {
          select: { reservations: true }
        }
      }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Error loading users' }, { status: 500 })
  }
}
