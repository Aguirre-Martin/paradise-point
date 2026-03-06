// Configuración general del sitio
// Actualizar estos valores con la información real

export const SITE_CONFIG = {
  // Información de contacto
  whatsapp: '543413557436',  // Número de WhatsApp (sin +, sin espacios)
  
  // Información de la propiedad
  title: 'Punto Paraíso',
  location: 'Granadero Baigorria',
  description: [
    'Ideal para tus encuentros', 
    'Todas las comodidades',
    'A tres cuadras del río'
  ],
  
  // Capacidad
  maxCapacity: '15 personas',
  
  // Horarios
  checkIn: '10:00 hs',
  checkOut: '20:00 hs',
  
  // Imágenes
  heroImage: '/images/hamaca-fondo.jpg',
  galleryImages: [
    '/images/detalles.jpg',
    '/images/pile-casa.jpg',
    '/images/luces.jpg',
  ],
  galleryImagesNight: [
    '/images/corona.jpeg',
    '/images/panoramica.jpeg',
    '/images/cascada.jpeg',  
  ],  // 3 fotos de noche: agregar rutas en public/images/ y aquí

  // Imágenes por comodidad/ambiente. Una sola fuente para Comodidades (usa la primera) y Galería (usa todas).
  // Para agregar: subir a public/images/ y agregar la ruta al array. Array vacío = no se muestra.
  amenitiesImages: {
    exterior: [
      '/images/pile-casa.jpg',
      '/images/luces.jpg',
      '/images/arcos.jpeg',
      '/images/camino.jpeg',
      '/images/parque-mantel.jpg',
      '/images/brochets-luces.jpg',
      '/images/brochets-luces2.jpg',
      '/images/hojas.jpg',
      '/images/corona.jpeg',
    ],
    cocina: [
      '/images/cocina2.jpeg',
    ],

    comedor: [
      '/images/cocina.jpeg',
      '/images/comedor.jpeg',
    ],
    habitacion: [
      '/images/comodidades/habitacion-principal.jpg',
      '/images/living-comodin.jpeg',
      '/images/comodidades/living-comodin.jpeg',
    ],
    living: [      
    ],
    bano: [
      '/images/comodidades/banio.jpeg',
    ],
    piscina: [
      '/images/pile.jpg',
      '/images/pile-casa.jpg',
      '/images/tobogan.jpeg',
    ],
    parrillero: [],
    fogonero: ['/images/fogonero.jpeg'],
  },

  // Nombre y descripción por clave (Galería y Comodidades)
  amenityMeta: {
    exterior: { nombre: 'Exterior', descripcion: 'Espacios al aire libre y jardín' },
    cocina: { nombre: 'Cocina', descripcion: 'Cocina completamente equipada' },
    habitacion: { nombre: 'Habitaciones', descripcion: 'Dormitorios cómodos y espaciosos' },
    living: { nombre: 'Living', descripcion: 'Espacios de relax y entretenimiento' },
    bano: { nombre: 'Baños', descripcion: 'Baños completos y modernos' },
    piscina: { nombre: 'Piscina', descripcion: 'Pileta y playadito' },
    parrillero: { nombre: 'Parrilla', descripcion: 'Área de asado y reuniones' },
    fogonero: { nombre: 'Fogonero a la estaca', descripcion: 'Contamos con cruz para cocinar a la estaca' },
  },
}

// Función helper para generar link de WhatsApp
export function getWhatsAppLink(message = '') {
  const encodedMessage = encodeURIComponent(message || 'Hola, me interesa conocer más sobre la casa de alquiler')
  return `https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodedMessage}`
}

