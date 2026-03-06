# Paradise Point — Unified User Model Plan

This is an executable plan for an AI agent. Follow each phase in order. Each step has the exact current state, target state, and files involved. Do NOT skip steps. Do NOT improvise changes beyond what's described. After each phase, verify the app builds (`npm run build`).

## Context

Paradise Point is a Next.js vacation rental site with admin panel, Prisma + PostgreSQL, deployed on Vercel. The current schema has separate `Admin` and `Client` models. This plan unifies them into a single `User` model with a `role` field, and adds public login/registration.

Key design decisions:
- `password` is **nullable** — when an admin creates a reservation for someone who hasn't registered, a User is created without a password. The user can later register and "claim" their account.
- `role` is a String defaulting to `"user"`. Admin role is assigned manually via DB.
- Cookie name changes from `admin_token` to `auth_token` — one auth system for everyone.
- Auth routes move from `/api/admin/*` to `/api/auth/*` — they're not admin-specific anymore.

---

## Phase 1: Schema change + migration reset

### Step 1.1: Update `prisma/schema.prisma`

Replace the ENTIRE file contents with:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Day {
  id     Int    @id @default(autoincrement())
  date   String @unique
  status String
  note   String?
}

model User {
  id           String        @id @default(uuid())
  email        String        @unique
  name         String
  password     String?
  role         String        @default("user")
  phone        String?
  instagram    String?
  avatar       String?
  bio          String?
  canUsePhotos Boolean       @default(false)
  newsletter   Boolean       @default(false)
  referredBy   String?
  notes        String?
  lastLogin    DateTime?
  reservations Reservation[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

model Reservation {
  id          String   @id @default(uuid())
  checkIn     DateTime
  checkOut    DateTime
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  totalAmount Int
  paidAmount  Int      @default(0)
  status      String
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Step 1.2: Delete old migration files

Delete the entire `prisma/migrations/` directory. We're starting fresh.

### Step 1.3: Reset database and create fresh migration

Run:

```bash
npx prisma migrate dev --name init
```

If prompted about data loss, confirm yes. The database has no real data.

### Step 1.4: Create seed script

Create file `prisma/seed.js`:

```javascript
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)

  await prisma.user.upsert({
    where: { email: 'admin@paradisepoint.com' },
    update: {},
    create: {
      email: 'admin@paradisepoint.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'admin'
    }
  })

  console.log('Seed completed: admin user created')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
```

Add to `package.json` (inside the top-level object, NOT inside scripts):

```json
"prisma": {
  "seed": "node prisma/seed.js"
}
```

Then run:

```bash
npx prisma db seed
```

---

## Phase 2: Auth infrastructure

### Step 2.1: Update `lib/auth.js`

Replace the ENTIRE file contents with:

```javascript
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function verifyAdmin() {
  const user = await verifyUser()
  if (!user || user.role !== 'admin') return null
  return user
}

export async function verifyUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')

  if (!token) return null

  try {
    return jwt.verify(token.value, JWT_SECRET)
  } catch {
    return null
  }
}
```

### Step 2.2: Create `app/api/auth/login/route.js`

Create the file (create `app/api/auth/` directory first):

```javascript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request) {
  if (!prisma) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    })

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    )

    const response = NextResponse.json({
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    })

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login error' }, { status: 500 })
  }
}
```

### Step 2.3: Create `app/api/auth/register/route.js`

```javascript
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
```

### Step 2.4: Create `app/api/auth/me/route.js`

```javascript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyUser } from '@/lib/auth'

export async function GET() {
  if (!prisma) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  try {
    const decoded = await verifyUser()
    if (!decoded) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        createdAt: true,
        lastLogin: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error verifying user:', error)
    return NextResponse.json({ error: 'Error verifying authentication' }, { status: 500 })
  }
}
```

### Step 2.5: Create `app/api/auth/logout/route.js`

```javascript
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ message: 'Logout successful' })
  response.cookies.delete('auth_token')
  return response
}
```

---

## Phase 3: Update admin API routes

All these routes already use `verifyAdmin()` from `@/lib/auth`. The `verifyAdmin()` function was updated in Phase 2 to read from `auth_token` cookie and check `role === 'admin'`. So auth keeps working. The changes here are only about replacing `prisma.client` with `prisma.user` and `clientId` with `userId`.

### Step 3.1: Update `app/api/admin/reservations/route.js`

**In the GET handler**, change both `include` statements:

Replace `include: { client: true }` with `include: { user: true }` (appears twice, once in the `proximas` query and once in the `historial` query).

**In the POST handler**, make these changes:

1. The destructured body variables `clientName, clientEmail, clientPhone` stay as-is (the admin form still sends these field names).

2. Replace the client upsert block:

**Current:**
```javascript
const client = await prisma.client.upsert({
  where: { email: clientEmail },
  update: { name: clientName, phone: clientPhone },
  create: { email: clientEmail, name: clientName, phone: clientPhone }
})
```

**Replace with:**
```javascript
const user = await prisma.user.upsert({
  where: { email: clientEmail },
  update: { name: clientName, phone: clientPhone },
  create: { email: clientEmail, name: clientName, phone: clientPhone }
})
```

3. In the reservation create call, replace `clientId: client.id` with `userId: user.id`, and `include: { client: true }` with `include: { user: true }`.

### Step 3.2: Update `app/api/admin/reservations/[id]/route.js`

**In the PUT handler:**

1. Replace the client upsert block (same pattern as Step 3.1):

**Current:**
```javascript
const client = await prisma.client.upsert({
  where: { email: clientEmail },
  update: { name: clientName, phone: clientPhone },
  create: { email: clientEmail, name: clientName, phone: clientPhone }
})
```

**Replace with:**
```javascript
const user = await prisma.user.upsert({
  where: { email: clientEmail },
  update: { name: clientName, phone: clientPhone },
  create: { email: clientEmail, name: clientName, phone: clientPhone }
})
```

2. In the reservation update data, replace `clientId: client.id` with `userId: user.id`.

3. Replace `include: { client: true }` with `include: { user: true }`.

**The DELETE handler** needs no changes (it doesn't reference client).

### Step 3.3: Update `app/api/admin/clients/route.js`

Replace `prisma.client.findMany` with `prisma.user.findMany`. Also change the response key from `clients` to `users`.

**Replace the entire file with:**

```javascript
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

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        instagram: true,
        notes: true,
        createdAt: true,
        _count: {
          select: { reservations: true }
        }
      }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Error loading users' }, { status: 500 })
  }
}
```

### Step 3.4: Update `app/api/admin/metrics/route.js`

Change the `proximasReservas` query: replace `include: { client: true }` with `include: { user: true }`.

---

## Phase 4: Update admin frontend

### Step 4.1: Update `components/AdminLayout.jsx`

1. Change the auth check endpoint from `/api/admin/me` to `/api/auth/me`.

2. Change the response handling: `data.admin` becomes `data.user`.

**In `checkAuth` function**, replace:
```javascript
const res = await fetch('/api/admin/me')
if (res.ok) {
  const data = await res.json()
  setAdmin(data.admin)
```

With:
```javascript
const res = await fetch('/api/auth/me')
if (res.ok) {
  const data = await res.json()
  if (data.user.role !== 'admin') {
    router.push('/admin/login')
    return
  }
  setAdmin(data.user)
```

3. Change the logout endpoint from `/api/admin/logout` to `/api/auth/logout`.

### Step 4.2: Update `app/admin/login/page.jsx`

Change the login endpoint from `/api/admin/login` to `/api/auth/login`.

**Replace line:**
```javascript
const res = await fetch('/api/admin/login', {
```

**With:**
```javascript
const res = await fetch('/api/auth/login', {
```

### Step 4.3: Update `app/admin/reservas/page.jsx`

Replace all occurrences of `reserva.client.name` with `reserva.user.name`, `reserva.client.email` with `reserva.user.email`, `reserva.client.phone` with `reserva.user.phone`. There are **6 occurrences total**: 3 in the table display (lines 261-264), 3 in the `openModal` function (lines 130-132).

### Step 4.4: Update `app/admin/dashboard/page.jsx`

Replace `reserva.client.name` with `reserva.user.name`. There is **1 occurrence** (line 155).

### Step 4.5: Update `app/admin/clientes/page.jsx`

This page now fetches users instead of clients.

1. Change the fetch URL to remain `/api/admin/clients` (the route still exists but returns `users`).

2. Change the response handling: `data.clients` becomes `data.users`.

**Replace:**
```javascript
const data = await res.json()
setClientes(data.clients || [])
```

**With:**
```javascript
const data = await res.json()
setClientes(data.users || [])
```

3. Optionally add a "Rol" column in the table showing `cliente.role`, but this is NOT required for this phase.

---

## Phase 5: Public login, register, and navbar auth

### Step 5.1: Create `app/login/page.jsx`

```jsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      })

      const data = await res.json()

      if (res.ok) {
        if (data.user.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/perfil')
        }
        router.refresh()
      } else {
        setError(data.error || 'Error al iniciar sesión')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <h2 className="mt-6 text-3xl font-bold text-white">Iniciar Sesión</h2>
          <p className="mt-2 text-sm text-gray-400">Paradise Point</p>
        </div>

        <form className="mt-8 space-y-6 bg-white rounded-lg shadow-xl p-8" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 mt-1"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>

          <p className="text-center text-sm text-gray-600">
            ¿No tenés cuenta?{' '}
            <Link href="/registro" className="text-blue-600 hover:text-blue-500 font-medium">
              Registrate
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
```

### Step 5.2: Create `app/registro/page.jsx`

```jsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export default function RegistroPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      })

      const data = await res.json()

      if (res.ok) {
        router.push('/login?registered=true')
      } else {
        setError(data.error || 'Error al registrarse')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <h2 className="mt-6 text-3xl font-bold text-white">Crear Cuenta</h2>
          <p className="mt-2 text-sm text-gray-400">Paradise Point</p>
        </div>

        <form className="mt-8 space-y-6 bg-white rounded-lg shadow-xl p-8" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 mt-1"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar Contraseña
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                placeholder="Repetí tu contraseña"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </button>

          <p className="text-center text-sm text-gray-600">
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
              Iniciá sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
```

### Step 5.3: Update `components/Navbar.jsx`

Add auth state to the Navbar. Show a "Iniciar Sesión" link when logged out, and the user's name + avatar icon when logged in.

**Add state variables** after the existing ones (after `const pathname = usePathname()`):

```javascript
const [user, setUser] = useState(null)
```

**Add a useEffect** to check auth (add after the existing useEffects):

```javascript
useEffect(() => {
  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    } catch {
      // Not logged in
    }
  }
  checkAuth()
}, [])
```

**Add auth buttons in the desktop navigation** — after the closing `</div>` of the desktop nav items (`hidden md:flex`) and before the mobile menu button, add:

```jsx
<div className="hidden md:flex items-center ml-4 border-l border-white/30 pl-4">
  {user ? (
    <Link
      href={user.role === 'admin' ? '/admin' : '/perfil'}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white/90 hover:bg-white/20 hover:text-white transition-colors"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {user.name}
    </Link>
  ) : (
    <Link
      href="/login"
      className="px-4 py-2 rounded-lg text-sm font-medium text-white/90 hover:bg-white/20 hover:text-white transition-colors"
    >
      Iniciar Sesión
    </Link>
  )}
</div>
```

**Add auth buttons in the mobile navigation** — inside the mobile menu div (inside `{isOpen && (...)}`), after the nav items map, before the closing `</div>` of the `px-2 pt-2 pb-3 space-y-1` div, add:

```jsx
<div className="border-t border-white/30 mt-2 pt-2">
  {user ? (
    <Link
      href={user.role === 'admin' ? '/admin' : '/perfil'}
      className="block px-4 py-3 rounded-lg text-base font-medium text-white/90 hover:bg-white/20 hover:text-white transition-colors"
    >
      Mi Cuenta
    </Link>
  ) : (
    <>
      <Link
        href="/login"
        className="block px-4 py-3 rounded-lg text-base font-medium text-white/90 hover:bg-white/20 hover:text-white transition-colors"
      >
        Iniciar Sesión
      </Link>
      <Link
        href="/registro"
        className="block px-4 py-3 rounded-lg text-base font-medium text-white/90 hover:bg-white/20 hover:text-white transition-colors"
      >
        Registrarse
      </Link>
    </>
  )}
</div>
```

---

## Phase 6: Cleanup

### Step 6.1: Delete old admin auth routes

Delete these files:

- `app/api/admin/login/route.js`
- `app/api/admin/register/route.js`
- `app/api/admin/me/route.js`
- `app/api/admin/logout/route.js`
- `app/api/admin/migrate-statuses/route.js`

If any of these directories become empty after deletion, delete the empty directories too.

---

## Verification checklist

After completing all phases, verify:

1. `npm run build` succeeds with no errors
2. Search the codebase:
   - No references to `prisma.admin` (the Prisma model is gone)
   - No references to `prisma.client` (replaced by `prisma.user`)
   - No references to `admin_token` cookie (replaced by `auth_token`)
   - No references to `/api/admin/login`, `/api/admin/register`, `/api/admin/me`, `/api/admin/logout` (replaced by `/api/auth/*`)
   - No imports of deleted files
3. These routes should exist:
   - `POST /api/auth/login` — public login
   - `POST /api/auth/register` — public registration
   - `GET /api/auth/me` — authenticated user info
   - `POST /api/auth/logout` — logout
   - `GET/POST /api/admin/reservations` — admin CRUD
   - `PUT/DELETE /api/admin/reservations/[id]` — admin CRUD
   - `GET /api/admin/clients` — user list (admin only)
   - `GET /api/admin/metrics` — dashboard metrics (admin only)
   - `GET /api/calendar` — public calendar
   - `POST /api/calendar` — admin only
4. These routes should NOT exist:
   - `/api/admin/login`
   - `/api/admin/register`
   - `/api/admin/me`
   - `/api/admin/logout`
   - `/api/admin/migrate-statuses`

---

## Files changed summary

| File | Action |
|------|--------|
| `prisma/schema.prisma` | Replace Admin+Client with User model |
| `prisma/migrations/` | Delete all, fresh migration |
| `prisma/seed.js` | NEW — seed admin user |
| `lib/auth.js` | Add `verifyUser()`, update `verifyAdmin()` |
| `app/api/auth/login/route.js` | NEW — public login |
| `app/api/auth/register/route.js` | NEW — public registration |
| `app/api/auth/me/route.js` | NEW — current user info |
| `app/api/auth/logout/route.js` | NEW — logout |
| `app/api/admin/reservations/route.js` | client→user |
| `app/api/admin/reservations/[id]/route.js` | client→user |
| `app/api/admin/clients/route.js` | prisma.client→prisma.user |
| `app/api/admin/metrics/route.js` | include client→user |
| `components/AdminLayout.jsx` | Use /api/auth/me, auth_token |
| `components/Navbar.jsx` | Add auth state + login/profile link |
| `app/admin/login/page.jsx` | Point to /api/auth/login |
| `app/admin/reservas/page.jsx` | client→user references |
| `app/admin/dashboard/page.jsx` | client→user references |
| `app/admin/clientes/page.jsx` | clients→users response |
| `app/login/page.jsx` | NEW — public login page |
| `app/registro/page.jsx` | NEW — public register page |
| `app/api/admin/login/route.js` | DELETE |
| `app/api/admin/register/route.js` | DELETE |
| `app/api/admin/me/route.js` | DELETE |
| `app/api/admin/logout/route.js` | DELETE |
| `app/api/admin/migrate-statuses/route.js` | DELETE |

---

## Execution order

1. Phase 1 (schema + reset) — FIRST, everything depends on this
2. Phase 2 (auth routes) — creates the new auth system
3. Phase 3 (admin API routes) — adapts backend to User model
4. Phase 4 (admin frontend) — adapts admin pages
5. Phase 5 (public pages + navbar) — adds public-facing auth
6. Phase 6 (cleanup) — removes old files

Run `npm run build` after each phase to catch errors early.
