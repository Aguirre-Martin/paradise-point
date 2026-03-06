'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SITE_CONFIG } from '@/lib/config'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState(null)
  const pathname = usePathname()

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

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

  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isOpen])

  const navItems = [
    { href: '/comodidades', label: 'Comodidades' },
    { href: '/precios', label: 'Precios' },
    { href: '/calendario', label: 'Calendario' },
    { href: '/galeria', label: 'Galería' },
    { href: '/reglas', label: 'Reglas' },
  ]

  const isActive = (href) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname?.startsWith(href)
  }

  const isHome = pathname === '/'

  return (
    <nav className={`sticky top-0 z-50 transition-all ${
      isHome 
        ? 'absolute top-0 left-0 right-0 bg-black/30 backdrop-blur-md' 
        : 'bg-black/90 backdrop-blur-md shadow-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Título */}
          <Link href="/" className="flex items-center space-x-2">
            <svg className="w-6 h-6" fill="#EA4335" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span className="text-xl font-bold text-white">{SITE_CONFIG.title}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const getIcon = (href) => {
                switch(href) {
                  case '/comodidades':
                    return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                  case '/precios':
                    return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  case '/calendario':
                    return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  case '/galeria':
                    return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  case '/reglas':
                    return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  default:
                    return null
                }
              }
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2
                    ${isActive(item.href)
                      ? 'bg-white/20 text-white backdrop-blur-sm' 
                      : 'text-white/90 hover:bg-white/20 hover:text-white'
                    }
                  `}
                >
                  {getIcon(item.href)}
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Desktop auth */}
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

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-white hover:bg-white/20"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-white/30 bg-black/50 backdrop-blur-md">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  block px-4 py-3 rounded-lg text-base font-medium transition-colors
                  ${isActive(item.href)
                    ? 'bg-white/20 text-white' 
                    : 'text-white/90 hover:bg-white/20 hover:text-white'
                  }
                `}
              >
                {item.label}
              </Link>
            ))}
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
          </div>
        </div>
      )}
    </nav>
  )
}
