import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

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

// PUT update reservation
export async function PUT(request, { params }) {
  try {
    if (!prisma) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
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

    // Get old reservation to clear old dates
    const oldReservation = await prisma.reservation.findUnique({
      where: { id }
    })

    if (!oldReservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }

    // Clear old dates (set to disponible if no other reservation overlaps)
    const oldDates = []
    const oldStart = new Date(oldReservation.checkIn)
    const oldEnd = new Date(oldReservation.checkOut)
    
    for (let d = new Date(oldStart); d < oldEnd; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      oldDates.push(dateStr)
    }

    for (const date of oldDates) {
      // Check if there's another reservation on this date
      const otherReservations = await prisma.reservation.count({
        where: {
          id: { not: id },
          checkIn: { lte: new Date(date) },
          checkOut: { gt: new Date(date) },
          status: { not: 'cancelado' }
        }
      })

      if (otherReservations === 0) {
        await prisma.day.updateMany({
          where: { date },
          data: { status: 'disponible' }
        })
      }
    }

    // Update reservation
    const reservation = await prisma.reservation.update({
      where: { id },
      data: {
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        clientName,
        clientEmail,
        clientPhone,
        totalAmount: parseInt(totalAmount),
        paidAmount: parseInt(paidAmount),
        status,
        notes: notes || ''
      }
    })

    // Update calendar with new dates
    if (status !== 'cancelado') {
      const newDates = []
      const start = new Date(checkIn)
      const end = new Date(checkOut)
      
      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0]
        newDates.push(dateStr)
      }

      for (const date of newDates) {
        await prisma.day.upsert({
          where: { date },
          update: { status: 'reservado' },
          create: { date, status: 'reservado' }
        })
      }
    }

    // Update client
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

    return NextResponse.json({ reservation })

  } catch (error) {
    console.error('Error updating reservation:', error)
    return NextResponse.json(
      { error: 'Error updating reservation' },
      { status: 500 }
    )
  }
}

// DELETE reservation
export async function DELETE(request, { params }) {
  try {
    if (!prisma) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const reservation = await prisma.reservation.findUnique({
      where: { id }
    })

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }

    // Clear calendar dates
    const dates = []
    const start = new Date(reservation.checkIn)
    const end = new Date(reservation.checkOut)
    
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      dates.push(dateStr)
    }

    for (const date of dates) {
      // Check if there's another reservation on this date
      const otherReservations = await prisma.reservation.count({
        where: {
          id: { not: id },
          checkIn: { lte: new Date(date) },
          checkOut: { gt: new Date(date) },
          status: { not: 'cancelado' }
        }
      })

      if (otherReservations === 0) {
        await prisma.day.updateMany({
          where: { date },
          data: { status: 'disponible' }
        })
      }
    }

    // Delete reservation
    await prisma.reservation.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting reservation:', error)
    return NextResponse.json(
      { error: 'Error deleting reservation' },
      { status: 500 }
    )
  }
}

