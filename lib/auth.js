import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

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

export async function verifyAdmin() {
  const user = await verifyUser()
  if (!user || user.role !== 'admin') return null
  return user
}
