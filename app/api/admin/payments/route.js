import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/auth'

// GET all payments for a reservation
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
    const reservationId = searchParams.get('reservationId')

    if (!reservationId) {
      return NextResponse.json({ error: 'Reservation ID required' }, { status: 400 })
    }

    const payments = await prisma.payment.findMany({
      where: { reservationId },
      orderBy: { paymentDate: 'desc' }
    })

    return NextResponse.json({ payments })

  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to load payments' },
      { status: 500 }
    )
  }
}

// POST new payment
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
      reservationId,
      amount,
      concept,
      method,
      recipient,
      proofFileName,
      paymentDate,
      notes
    } = body

    // Validate required fields
    if (!reservationId || !amount || !concept || !method || !recipient) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate method
    const validMethods = ['EFECTIVO', 'TRANSFERENCIA']
    if (!validMethods.includes(method)) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      )
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        reservationId,
        amount: parseInt(amount),
        concept,
        method,
        recipient,
        proofFileName: proofFileName || null,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        notes: notes || null
      }
    })

    // Update reservation paidAmount
    const payments = await prisma.payment.findMany({
      where: { reservationId }
    })
    
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
    
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { paidAmount: totalPaid }
    })

    return NextResponse.json({ payment }, { status: 201 })

  } catch (error) {
    console.error('Error creating payment:', error)
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid reservation reference' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}

