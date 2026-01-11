import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/auth'
import { unlink } from 'fs/promises'
import { join } from 'path'

// PUT update payment
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
      amount,
      concept,
      method,
      recipient,
      proofFileName,
      paymentDate,
      notes
    } = body

    // Validate method if provided
    if (method) {
      const validMethods = ['EFECTIVO', 'TRANSFERENCIA']
      if (!validMethods.includes(method)) {
        return NextResponse.json(
          { error: 'Invalid payment method' },
          { status: 400 }
        )
      }
    }

    // Get old payment to get reservationId
    const oldPayment = await prisma.payment.findUnique({
      where: { id }
    })

    if (!oldPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Update payment
    const payment = await prisma.payment.update({
      where: { id },
      data: {
        amount: amount ? parseInt(amount) : undefined,
        concept: concept || undefined,
        method: method || undefined,
        recipient: recipient || undefined,
        proofFileName: proofFileName !== undefined ? proofFileName : undefined,
        paymentDate: paymentDate ? new Date(paymentDate) : undefined,
        notes: notes !== undefined ? notes : undefined
      }
    })

    // Recalculate reservation paidAmount
    const payments = await prisma.payment.findMany({
      where: { reservationId: oldPayment.reservationId }
    })
    
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
    
    await prisma.reservation.update({
      where: { id: oldPayment.reservationId },
      data: { paidAmount: totalPaid }
    })

    return NextResponse.json({ payment })

  } catch (error) {
    console.error('Error updating payment:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    )
  }
}

// DELETE payment
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

    const payment = await prisma.payment.findUnique({
      where: { id }
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    const reservationId = payment.reservationId

    // Delete proof file if exists
    if (payment.proofFileName) {
      try {
        const filePath = join(process.cwd(), 'public', 'uploads', 'comprobantes', reservationId, payment.proofFileName)
        await unlink(filePath)
      } catch (error) {
        console.warn('Could not delete proof file:', error)
      }
    }

    // Delete payment
    await prisma.payment.delete({
      where: { id }
    })

    // Recalculate reservation paidAmount
    const payments = await prisma.payment.findMany({
      where: { reservationId }
    })
    
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
    
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { paidAmount: totalPaid }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting payment:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete payment' },
      { status: 500 }
    )
  }
}

