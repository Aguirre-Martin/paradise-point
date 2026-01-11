import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const VALID_STATUSES = ['available', 'inquiry', 'reserved']

export async function GET() {
  if (!prisma) {
    return NextResponse.json({})
  }
  
  try {
    const days = await prisma.day.findMany({
      orderBy: { date: 'asc' }
    })

    const calendarData = {}
    days.forEach(day => {
      calendarData[day.date] = {
        status: day.status,
        note: day.note || ''
      }
    })

    return NextResponse.json(calendarData)
  } catch (error) {
    console.error('Error fetching calendar:', error)
    return NextResponse.json(
      { error: 'Error fetching calendar' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  if (!prisma) {
    return NextResponse.json(
      { error: 'Database not configured. Set DATABASE_URL in environment variables.' },
      { status: 503 }
    )
  }
  
  try {
    const body = await request.json()
    const { date, status, note } = body

    if (!date || typeof date !== 'string') {
      return NextResponse.json(
        { error: 'Invalid date' },
        { status: 400 }
      )
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: available, inquiry, or reserved' },
        { status: 400 }
      )
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Date must be in YYYY-MM-DD format' },
        { status: 400 }
      )
    }

    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date' },
        { status: 400 }
      )
    }

    await prisma.day.upsert({
      where: { date },
      update: {
        status,
        note: note || null
      },
      create: {
        date,
        status,
        note: note || null
      }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error saving calendar:', error)
    
    if (error.name === 'PrismaClientValidationError') {
      return NextResponse.json(
        { error: 'Invalid calendar data provided' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to save calendar. Please try again.' },
      { status: 500 }
    )
  }
}

