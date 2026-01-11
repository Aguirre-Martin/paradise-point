'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    fetch('/api/admin/me', {
      credentials: 'include'
    })
      .then(res => {
        if (res.ok) {
          // Redirect to dashboard if authenticated
          router.push('/admin/dashboard')
        } else {
          // Redirect to login if not authenticated
          router.push('/login')
        }
      })
      .catch(() => {
        router.push('/login')
      })
  }, [router])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-gray-600">Cargando...</div>
    </div>
  )
}
