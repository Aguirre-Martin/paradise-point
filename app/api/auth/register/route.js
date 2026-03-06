import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  if (!prisma) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({ where: { email } })

    if (existing && existing.password) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    let user
    if (existing && !existing.password) {
      user = await prisma.user.update({
        where: { email },
        data: { name, password: hashedPassword },
        select: { id: true, name: true, email: true, role: true, createdAt: true }
      })
    } else {
      user = await prisma.user.create({
        data: { name, email, password: hashedPassword },
        select: { id: true, name: true, email: true, role: true, createdAt: true }
      })
    }

    return NextResponse.json(
      { message: 'Registration successful', user },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Registration error' }, { status: 500 })
  }
}
