import Image from 'next/image'
import Link from 'next/link'
import { SITE_CONFIG, getWhatsAppLink } from '@/lib/config'
import { PRICES } from '@/lib/pricing'
import HeroImage from '@/components/HeroImage'

export default async function Home() {

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] min-h-[400px] max-h-[600px] mb-12">
        <div className="absolute inset-0 z-0">
          <HeroImage src={SITE_CONFIG.heroImage} alt={SITE_CONFIG.title} />
          {/* Overlay oscuro para mejor legibilidad del texto */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/40" />
        </div>
        <div className="relative z-10 h-full flex items-center justify-center text-center px-4 pt-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              {SITE_CONFIG.location}
            </h1>
            <div className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto space-y-2">
              {SITE_CONFIG.description.map((line, index) => (
                <p key={index} className="drop-shadow-md">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        {/* Galería de Imágenes */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Conocé Nuestra Casa
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SITE_CONFIG.galleryImages.length > 0 ? (
              SITE_CONFIG.galleryImages.map((img, i) => (
                <Link key={i} href="/galeria" className="relative h-64 rounded-xl overflow-hidden shadow-lg group">
                  <Image 
                    src={img} 
                    alt={`Imagen ${i + 1} de la casa`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </Link>
              ))
            ) : (
              [1, 2, 3].map((i) => (
                <div 
                  key={i}
                  className="relative h-64 rounded-xl overflow-hidden shadow-lg bg-gradient-to-br from-blue-200 to-teal-200 flex items-center justify-center"
                >
                  <span className="text-gray-500 text-sm">Agregar imagen {i}</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Comodidades, Precios y Reglas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Link href="/comodidades" className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer group">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Comodidades</h3>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-center gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <span>Cocina completamente equipada</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <span>Cinco plazas para dormir</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <span>Wi-Fi de alta velocidad</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <span>Estacionamiento privado</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <span>Parque y Pileta 10x4</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <span>Parrilla</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <span>Todos los servicios</span>
              </li>
            </ul>
            <div className="mt-4 text-blue-600 font-medium group-hover:text-blue-800">
              Ver más →
            </div>
          </Link>

          <Link href="/precios" className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer group">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors">Precios</h3>
            </div>
            <div className="space-y-4">
              <div className="border-l-4 border-orange-500 pl-4 py-2">
                <div className="text-sm text-gray-600 mb-1">Sábado y Domingo</div>
                <div className="text-2xl font-bold text-gray-900">${PRICES.weekend.toLocaleString('es-AR')} ARS</div>
              </div>
              <div className="border-l-4 border-teal-500 pl-4 py-2">
                <div className="text-sm text-gray-600 mb-1">Martes a Viernes</div>
                <div className="text-2xl font-bold text-gray-900">${PRICES.tuesdayToFriday.toLocaleString('es-AR')} ARS</div>
              </div>
              <div className="border-l-4 border-purple-500 pl-4 py-2">
                <div className="text-sm text-gray-600 mb-1">Martes a Domingo</div>
                <div className="text-2xl font-bold text-gray-900">${PRICES.tuesdayToSunday.toLocaleString('es-AR')} ARS</div>
              </div>
            </div>
            <div className="mt-4 text-teal-600 font-medium group-hover:text-teal-800">
              Ver precios especiales →
            </div>
          </Link>

          <Link href="/reglas" className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer group">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">Reglas e Información</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-blue-500 mt-1">•</span>
                <span className="text-gray-700">Capacidad máxima: {SITE_CONFIG.maxCapacity}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-500 mt-1">•</span>
                <span className="text-gray-700">Check-in: {SITE_CONFIG.checkIn}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-500 mt-1">•</span>
                <span className="text-gray-700">Check-out: {SITE_CONFIG.checkOut}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-500 mt-1">•</span>
                <span className="text-gray-700">Música permitida hasta las 0:00 hs</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-500 mt-1">•</span>
                <span className="text-gray-700">Prohibido fumar dentro de la casa</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-500 mt-1">•</span>
                <span className="text-gray-700">Mascotas permitidas (con aviso previo)</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-500 mt-1">•</span>
                <span className="text-gray-700">Mantener la higiene y el orden</span>
              </div>
            </div>
            <div className="mt-4 text-purple-600 font-medium group-hover:text-purple-800">
              Ver reglas completas →
            </div>
          </Link>
        </div>

        {/* CTA Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Link
            href="/calendario"
            className="bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all transform hover:scale-105 text-center"
          >
            <div className="flex flex-col items-center gap-4">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-2xl font-bold">Ver Calendario</h3>
              <p className="text-blue-100">Consultá disponibilidad y calculá el precio</p>
            </div>
          </Link>

          <Link
            href="/galeria"
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all transform hover:scale-105 text-center"
          >
            <div className="flex flex-col items-center gap-4">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-2xl font-bold">Galería de Imágenes</h3>
              <p className="text-purple-100">Conocé todos los ambientes</p>
            </div>
          </Link>

          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all transform hover:scale-105 text-center"
          >
            <div className="flex flex-col items-center gap-4">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <h3 className="text-2xl font-bold">Contactar por WhatsApp</h3>
              <p className="text-green-100">Escribinos para más información</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
