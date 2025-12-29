import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Helper to verify admin
async function verifyAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')

  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token.value, JWT_SECRET)
    return decoded
  } catch (error) {
    return null
  }
}

// GET all reservations
export async function GET(request) {
  try {
    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'proximas'

    const now = new Date()
    
    let reservations
    if (type === 'proximas') {
      reservations = await prisma.reservation.findMany({
        where: {
          checkIn: {
            gte: now
          }
        },
        orderBy: {
          checkIn: 'asc'
        }
      })
    } else {
      reservations = await prisma.reservation.findMany({
        where: {
          checkOut: {
            lt: now
          }
        },
        orderBy: {
          checkIn: 'desc'
        }
      })
    }

    return NextResponse.json({ reservations })

  } catch (error) {
    console.error('Error fetching reservations:', error)
    return NextResponse.json(
      { error: 'Error loading reservations' },
      { status: 500 }
    )
  }
}

// POST new reservation
export async function POST(request) {
  try {
    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      checkIn,
      checkOut,
      clientName,
      clientEmail,
      clientPhone,
      totalAmount,
      paidAmount,
      status,
      notes
    } = body

    // Validate required fields
    if (!checkIn || !checkOut || !clientName || !clientEmail || !clientPhone || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        clientName,
        clientEmail,
        clientPhone,
        totalAmount: parseInt(totalAmount),
        paidAmount: parseInt(paidAmount) || 0,
        status: status || 'señado',
        notes: notes || ''
      }
    })

    // Update calendar days to "reservado"
    const dates = []
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      dates.push(dateStr)
    }

    // Update or create days as reserved
    for (const date of dates) {
      await prisma.day.upsert({
        where: { date },
        update: { status: 'reservado' },
        create: { date, status: 'reservado' }
      })
    }

    // Create or update client
    await prisma.client.upsert({
      where: { email: clientEmail },
      update: {
        name: clientName,
        phone: clientPhone
      },
      create: {
        email: clientEmail,
        name: clientName,
        phone: clientPhone
      }
    })

    return NextResponse.json({ reservation }, { status: 201 })

  } catch (error) {
    console.error('Error creating reservation:', error)
    return NextResponse.json(
      { error: 'Error creating reservation' },
      { status: 500 }
    )
  }
}

