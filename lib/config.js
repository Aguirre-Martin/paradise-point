// Configuración general del sitio
// Actualizar estos valores con la información real

export const SITE_CONFIG = {
  // Información de contacto
  whatsapp: '543413557436',  // Número de WhatsApp (sin +, sin espacios)
  
  // Información de la propiedad
  title: 'Punto Paraíso',
  location: 'Granadero Baigorria',
  description: [
    'Casa de relax y veraneo', 
    'Ideal para familias', 
    'Todas las comodidades',
    'A tres cuadras del río'
  ],
  
  // Capacidad
  maxCapacity: '15 personas',
  
  // Horarios
  checkIn: '10:00 hs',
  checkOut: '20:00 hs',
  
  // Imágenes
  heroImage: '/images/hamaca-fondo.jpg',  // Imagen principal del header
  galleryImages: [
    '/images/detalles.jpg',
    '/images/pile-casa.jpg',
    '/images/luces.jpg',
    // Agregar más imágenes aquí cuando las tengas
  ],
  
  // Comodidades - imágenes (opcional)
  amenitiesImages: {
    cocina: '/images/comodidades/habitacion-principal.jpg',
    habitacion: '/images/comodidades/comodin.jpg',
    // Agregar más cuando las tengas
  }
}

// Función helper para generar link de WhatsApp
export function getWhatsAppLink(message = '') {
  const encodedMessage = encodeURIComponent(message || 'Hola, me interesa conocer más sobre la casa de alquiler')
  return `https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodedMessage}`
}

