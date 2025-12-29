import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  if (!prisma) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    )
  }

  try {
    const body = await request.json()
    const { name, email, password, masterPassword } = body

    // Verify master password to create admins
    if (masterPassword !== process.env.ADMIN_MASTER_PASSWORD) {
      return NextResponse.json(
        { error: 'Not authorized to create administrators' },
        { status: 403 }
      )
    }

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email }
    })

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'This email is already registered as admin' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    })

    return NextResponse.json(
      { message: 'Admin registered successfully', admin },
      { status: 201 }
    )
  } catch (error) {
    console.error('Admin registration error:', error)
    return NextResponse.json(
      { error: 'Error registering admin' },
      { status: 500 }
    )
  }
}






