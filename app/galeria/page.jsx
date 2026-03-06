import Image from 'next/image'
import Link from 'next/link'
import { SITE_CONFIG } from '@/lib/config'

export default function GaleriaPage() {
  const ambientes = Object.entries(SITE_CONFIG.amenitiesImages)
    .filter(([, imgs]) => Array.isArray(imgs) && imgs.length > 0)
    .map(([key, imagenes]) => {
      const meta = SITE_CONFIG.amenityMeta[key]
      return {
        nombre: meta?.nombre ?? key,
        descripcion: meta?.descripcion ?? '',
        imagenes,
      }
    })

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Galería de Fotos
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Conocé todos los ambientes de {SITE_CONFIG.title}
          </p>
        </div>

        <div className="space-y-16">
          {ambientes.map((ambiente, index) => (
            <section key={index} className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {ambiente.nombre}
                </h2>
                <p className="text-gray-600 text-lg">
                  {ambiente.descripcion}
                </p>
              </div>

              {ambiente.imagenes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ambiente.imagenes.map((img, imgIndex) => (
                    <div 
                      key={imgIndex}
                      className="relative h-64 md:h-80 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group"
                    >
                      <Image
                        src={img}
                        alt={`${ambiente.nombre} - Imagen ${imgIndex + 1}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500">Fotos próximamente</p>
                </div>
              )}
            </section>
          ))}
        </div>

      </div>
    </div>
  )
}


