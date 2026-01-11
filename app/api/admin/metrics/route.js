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

    // Get current month start and end dates
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    // Format dates as YYYY-MM-DD for Day model
    const formatDate = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    const startDateStr = formatDate(startOfMonth)
    const endDateStr = formatDate(endOfMonth)

    // Get all days in current month from Day model
    const daysInMonth = await prisma.day.findMany({
      where: {
        date: {
          gte: startDateStr,
          lte: endDateStr
        }
      }
    })

    // Calculate occupation
    const totalDays = daysInMonth.length
    const reservedDays = daysInMonth.filter(d => d.status === 'reserved').length
    const ocupacionMes = totalDays > 0 ? Math.round((reservedDays / totalDays) * 100) : 0

    // Count available days
    const diasDisponibles = daysInMonth.filter(d => d.status === 'available').length

    // Get reservations for current month
    const reservationsThisMonth = await prisma.reservation.findMany({
      where: {
        checkIn: {
          gte: startOfMonth,
          lte: endOfMonth
        },
        status: {
          not: 'cancelado'
        }
      }
    })

    // Calculate total income
    const ingresosMes = reservationsThisMonth.reduce((sum, r) => sum + r.paidAmount, 0)
    const totalReservasMes = reservationsThisMonth.length

    // Get upcoming reservations (next 30 days)
    const next30Days = new Date()
    next30Days.setDate(next30Days.getDate() + 30)

    const proximasReservas = await prisma.reservation.findMany({
      where: {
        checkIn: {
          gte: now,
          lte: next30Days
        },
        status: {
          not: 'cancelado'
        }
      },
      orderBy: {
        checkIn: 'asc'
      },
      take: 5
    })

    return NextResponse.json({
      ocupacionMes,
      ingresosMes,
      diasDisponibles,
      totalReservasMes,
      proximasReservas
    })

  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json(
      { error: 'Error loading metrics' },
      { status: 500 }
    )
  }
}

