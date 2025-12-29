# 📸 Guía de Imágenes

## Estructura de Carpetas

Creá la carpeta `public/images/` y guardá las imágenes ahí:

```
public/
  images/
    hero.jpg          (imagen principal del hero)
    gallery-1.jpg     (primera foto de la galería)
    gallery-2.jpg     (segunda foto)
    gallery-3.jpg     (tercera foto)
    ...
```

## Especificaciones Técnicas

### Hero Image (`hero.jpg`)
- **Tamaño recomendado:** 1920x1080px (16:9)
- **Peso máximo:** 500 KB
- **Formato:** JPG o WebP
- **Calidad:** 80-85%
- **Qué mostrar:** Vista exterior de la casa, living principal, o mejor foto de la propiedad

### Galería (`gallery-1.jpg`, `gallery-2.jpg`, etc.)
- **Tamaño recomendado:** 1200x800px (3:2)
- **Peso máximo:** 300 KB por imagen
- **Formato:** JPG o WebP
- **Calidad:** 80-85%
- **Qué mostrar:** 
  - Cocina
  - Habitaciones
  - Baño
  - Exterior/patio
  - Parrilla/área exterior

## Cómo Optimizar Imágenes

### Opción 1: Online (Recomendado)
1. Usá [Squoosh.app](https://squoosh.app) o [TinyPNG](https://tinypng.com)
2. Subí tu imagen original
3. Ajustá calidad a 80-85%
4. Descargá la versión optimizada

### Opción 2: Photoshop/GIMP
1. Exportá como JPG
2. Calidad: 80-85%
3. Redimensioná antes de exportar

## ⚠️ Importante

- **NO uses imágenes de WhatsApp** - están muy comprimidas y pierden calidad
- Usá las **imágenes originales** o versiones de buena calidad
- Next.js optimiza automáticamente con el componente `<Image>`, pero mejor empezar con imágenes ya optimizadas

## Después de Agregar las Imágenes

1. Descomentá las líneas de `<Image>` en `app/page.js`
2. Asegurate de que las rutas coincidan con los nombres de tus archivos
3. El código ya está preparado, solo necesitás cambiar los comentarios por las imágenes reales








