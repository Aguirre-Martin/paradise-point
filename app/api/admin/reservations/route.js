import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/auth'

// GET all reservations
export async function GET(request) {
  try {
    if (!prisma) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

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
        },
        include: { user: true }
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
        },
        include: { user: true }
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
    if (!prisma) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

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

    // Find or create user
    const user = await prisma.user.upsert({
      where: { email: clientEmail },
      update: { name: clientName, phone: clientPhone },
      create: { email: clientEmail, name: clientName, phone: clientPhone }
    })

    // Create reservation linked to user
    const reservation = await prisma.reservation.create({
      data: {
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        userId: user.id,
        totalAmount: parseInt(totalAmount),
        paidAmount: parseInt(paidAmount) || 0,
        status: status || 'señado',
        notes: notes || ''
      },
      include: { user: true }
    })

    // Mark calendar days as reserved
    const dates = []
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      dates.push(dateStr)
    }

    for (const date of dates) {
      await prisma.day.upsert({
        where: { date },
        update: { status: 'reserved' },
        create: { date, status: 'reserved' }
      })
    }

    return NextResponse.json({ reservation }, { status: 201 })

  } catch (error) {
    console.error('Error creating reservation:', error)
    return NextResponse.json(
      { error: 'Error creating reservation' },
      { status: 500 }
    )
  }
}

