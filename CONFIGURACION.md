# 📋 Guía de Configuración

## Archivos de Configuración

### 1. `lib/config.js` - Configuración General
Actualizá estos valores con tu información real:

```javascript
export const SITE_CONFIG = {
  whatsapp: '54XXXXXXXXX',  // Tu número de WhatsApp
  maxCapacity: 'XX personas',
  checkIn: '15:00 hs',
  checkOut: '11:00 hs',
  // etc...
}
```

### 2. `lib/pricing.js` - Precios
Actualizá los precios y fechas especiales:

```javascript
export const PRICES = {
  weekday: 50000,    // Tu precio día de semana
  weekend: 70000,    // Tu precio fin de semana
  navidad: 100000,   // Tu precio Navidad
  finAnio: 120000,   // Tu precio Fin de año
  carnaval: 90000    // Tu precio Carnaval
}
```

## 📸 Cómo Agregar Imágenes

### Paso 1: Crear las carpetas
```bash
mkdir -p public/images
mkdir -p public/images/comodidades
```

### Paso 2: Subir las imágenes
Poné tus imágenes en estas carpetas:

- **Hero (imagen principal del header):**
  - `public/images/hero.jpg` (o .png, .webp)

- **Galería de la landing:**
  - `public/images/gallery-1.jpg`
  - `public/images/gallery-2.jpg`
  - `public/images/gallery-3.jpg`
  - etc...

- **Comodidades (hero, galería de comodidades):** Las rutas se configuran en `lib/config.js` → `amenitiesImages`. Subí el archivo y poné la ruta:
  - `public/images/comodidades/cocina.jpg`
  - `public/images/comodidades/habitacion.jpg`
  - `public/images/comodidades/parrillero.jpg`
  - `public/images/comodidades/fogonero.jpg`
  - etc. Las que tengan `null` en config no se muestran.

### Paso 3: Actualizar la configuración
En `lib/config.js`, actualizá el array `galleryImages`:

```javascript
galleryImages: [
  '/images/gallery-1.jpg',
  '/images/gallery-2.jpg',
  '/images/gallery-3.jpg',
  '/images/gallery-4.jpg',  // Agregar más
],
```

## 📄 Cómo Agregar Documentos PDF

### Paso 1: Crear la carpeta
```bash
mkdir -p public/documents
```

### Paso 2: Subir los PDFs
Poné tus documentos en `public/documents/`:
- `reglamento.pdf`
- `contrato.pdf`
- etc...

### Paso 3: Actualizar la página de reglas
En `app/reglas/page.jsx`, descomentá y actualizá los links:

```jsx
<a href="/documents/reglamento.pdf" target="_blank">
  Reglamento Interno (PDF)
</a>
```

## ✅ Checklist de Configuración

- [ ] Actualizar número de WhatsApp en `lib/config.js`
- [ ] Actualizar precios en `lib/pricing.js`
- [ ] Agregar fechas de carnaval en `lib/pricing.js` (SPECIAL_DATES)
- [ ] Subir imagen hero a `public/images/hero.jpg`
- [ ] Subir imágenes de galería a `public/images/`
- [ ] Actualizar array `galleryImages` en `lib/config.js`
- [ ] (Opcional) Subir imágenes de comodidades
- [ ] (Opcional) Subir documentos PDF a `public/documents/`

## 🎨 Especificaciones de Imágenes

### Hero Image
- **Tamaño:** 1920x1080px (16:9)
- **Peso:** Máximo 500 KB
- **Formato:** JPG o WebP
- **Calidad:** 80-85%

### Galería
- **Tamaño:** 1200x800px (3:2)
- **Peso:** Máximo 300 KB por imagen
- **Formato:** JPG o WebP
- **Calidad:** 80-85%

### Optimización
Usá [Squoosh.app](https://squoosh.app) para optimizar las imágenes antes de subirlas.











