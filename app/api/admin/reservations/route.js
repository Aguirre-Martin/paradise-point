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
    
    if (error.name === 'PrismaClientKnownRequestError') {
      return NextResponse.json(
        { error: 'Database query error. Please try again.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to load reservations. Please try again.' },
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
      clientAddress,
      clientCuit,
      totalAmount,
      paidAmount,
      deposit,
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

    // Validate and set status
    const validStatuses = ['senado', 'pagado', 'cancelado']
    const reservationStatus = validStatuses.includes(status) ? status : 'senado'

    // Validate date range
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      )
    }
    
    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { error: 'Check-out date must be after check-in date' },
        { status: 400 }
      )
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create or update client first
      const client = await tx.client.upsert({
        where: { email: clientEmail },
        update: {
          name: clientName,
          phone: clientPhone,
          address: clientAddress || null,
          cuit: clientCuit || null
        },
        create: {
          email: clientEmail,
          name: clientName,
          phone: clientPhone,
          address: clientAddress || null,
          cuit: clientCuit || null
        }
      })

      // Create reservation
      const reservation = await tx.reservation.create({
        data: {
          checkIn: checkInDate,
          checkOut: checkOutDate,
          clientName,
          clientEmail,
          clientPhone,
          totalAmount: parseInt(totalAmount),
          paidAmount: parseInt(paidAmount) || 0,
          deposit: parseInt(deposit) || 60000,
          status: reservationStatus,
          notes: notes || '',
          clientId: client.id
        }
      })

      // Update calendar days to "reservado"
      const dates = []
      const start = new Date(checkInDate)
      const end = new Date(checkOutDate)
      
      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0]
        dates.push(dateStr)
      }

      // Update or create days as reserved
      for (const date of dates) {
        await tx.day.upsert({
          where: { date },
          update: { status: 'reserved' },
          create: { date, status: 'reserved' }
        })
      }

      return reservation
    })

    return NextResponse.json({ reservation: result }, { status: 201 })

  } catch (error) {
    console.error('Error creating reservation:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      name: error.name,
      meta: error.meta
    })
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A reservation with this information already exists' },
        { status: 409 }
      )
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid client reference' },
        { status: 400 }
      )
    }
    
    if (error.name === 'PrismaClientValidationError') {
      return NextResponse.json(
        { error: `Invalid reservation data: ${error.message}` },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: `Failed to create reservation: ${error.message}` },
      { status: 500 }
    )
  }
}

