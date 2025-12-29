import Link from 'next/link'
import { PRICES } from '@/lib/pricing'

export default function PreciosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">
            Precios
          </h1>
          <p className="text-gray-600 text-center mb-12">
            Tarifas según temporada y tipo de estadía
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Primera fila */}
            <section className="border-l-4 border-teal-500 pl-6 py-4 bg-teal-50 rounded-r-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Días de Semana</h2>
              <p className="text-gray-600 mb-4">Martes a Viernes (4 días)</p>
              <div className="text-3xl font-bold text-teal-600">${PRICES.tuesdayToFriday.toLocaleString('es-AR')} ARS</div>
            </section>

            <section className="border-l-4 border-orange-500 pl-6 py-4 bg-orange-50 rounded-r-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Fin de Semana</h2>
              <p className="text-gray-600 mb-4">Sábado y Domingo (2 días)</p>
              <div className="text-3xl font-bold text-orange-600">${PRICES.weekend.toLocaleString('es-AR')} ARS</div>
            </section>

            {/* Segunda fila */}
            <section className="border-l-4 border-blue-500 pl-6 py-4 bg-blue-50 rounded-r-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Fin de Semana XL</h2>
              <p className="text-gray-600 mb-4">Viernes, Sábado y Domingo (3 días)</p>
              <div className="text-3xl font-bold text-blue-600">${PRICES.fridayToSunday.toLocaleString('es-AR')} ARS</div>
            </section>

            <section className="border-l-4 border-purple-500 pl-6 py-4 bg-purple-50 rounded-r-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Semana Completa</h2>
              <p className="text-gray-600 mb-4">Martes a Domingo (6 días)</p>
              <div className="text-3xl font-bold text-purple-600">${PRICES.tuesdayToSunday.toLocaleString('es-AR')} ARS</div>
            </section>
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Precios Especiales
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <section className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Navidad</h3>
                  <p className="text-sm text-gray-600 mb-4">24 y 25 de diciembre</p>
                  <div className="text-2xl font-bold text-red-600">${PRICES.navidad.toLocaleString('es-AR')} ARS</div>
                </div>
              </section>

              <section className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200">
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Fin de Año</h3>
                  <p className="text-sm text-gray-600 mb-4">31 de diciembre y 1 de enero</p>
                  <div className="text-2xl font-bold text-yellow-600">${PRICES.finAnio.toLocaleString('es-AR')} ARS</div>
                </div>
              </section>

              <section className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Carnaval</h3>
                  <p className="text-sm text-gray-600 mb-4">Fechas de carnaval</p>
                  <div className="text-2xl font-bold text-purple-600">${PRICES.carnaval.toLocaleString('es-AR')} ARS</div>
                </div>
              </section>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/calendario"
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-bold rounded-xl hover:from-blue-600 hover:to-teal-600 transition-all text-xl shadow-2xl transform hover:scale-105"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Consultar Disponibilidad
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


