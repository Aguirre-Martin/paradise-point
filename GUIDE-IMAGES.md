# Guide: Image Management for Paradise Point

## Purpose

This document is a complete reference for any AI agent assisting the user with adding, changing, or removing images from the site. Read this fully before making any changes.

---

## Architecture

- **Framework:** Next.js (App Router) with `next/image` for optimization.
- **Image storage:** Static files in `public/images/` and `public/images/comodidades/`.
- **Single source of truth:** `lib/config.js` — all image paths are defined here. No database, no CMS, no API.
- **Path convention:** Paths in config are relative to `public/`. Example: `'/images/foto.jpg'` → physical file at `public/images/foto.jpg`.

---

## How `lib/config.js` Controls Images

There are **3 image properties** inside `SITE_CONFIG`:

### 1. `heroImage` (string)

- Controls the full-width background image at the top of the homepage.
- Rendered by `components/HeroImage.jsx` using `next/image` with `fill` and `priority`.
- If the image fails to load, a gradient fallback is shown automatically.
- **Recommended specs:** 1920×1080px (16:9), JPG or WebP, max 500KB, quality 80-85%.

### 2. `galleryImages` (string array)

- Controls the "Conocé Nuestra Casa" section on the homepage (`app/page.js`).
- Rendered as a 3-column grid. Each image links to `/galeria`.
- If the array is empty, 3 gray placeholders are shown.
- Ideal count: 3 images (matches the grid).
- **Recommended specs:** 1200×800px (3:2), JPG or WebP, max 300KB, quality 80-85%.

### 3. `amenitiesImages` (object with arrays)

This is the most important one. It feeds TWO pages from ONE data source:

| Page | Route | What it shows |
|------|-------|---------------|
| Galería | `/galeria` (`app/galeria/page.jsx`) | ALL images per amenity, grouped in sections |
| Comodidades | `/comodidades` (`app/comodidades/page.jsx`) | Only the FIRST image per amenity |

**Structure:**

```javascript
amenitiesImages: {
  exterior: ['/images/foto1.jpg', '/images/foto2.jpg'],  // gallery shows both, comodidades shows foto1 only
  cocina: ['/images/cocina.jpg'],
  bano: [],  // empty = hidden from both pages
}
```

**Rules:**
- Each key is an amenity/environment (exterior, cocina, habitacion, living, bano, piscina, parrillero, fogonero).
- The value is an array of image paths.
- Empty array `[]` = that amenity is hidden from both Galería and Comodidades.
- The **first image** in the array is the one shown on the Comodidades page.
- **All images** in the array are shown on the Galería page.

### 4. `amenityMeta` (object)

Controls the display name and description for each amenity key. Used by both `/galeria` and `/comodidades`.

```javascript
amenityMeta: {
  exterior: { nombre: 'Exterior', descripcion: 'Espacios al aire libre y jardín' },
  // ...
}
```

If adding a new amenity key to `amenitiesImages`, you MUST also add the corresponding entry in `amenityMeta`.

---

## Step-by-Step: Common Tasks

### Add a new image to an existing amenity

1. Place the image file in `public/images/` (or `public/images/comodidades/` for organization).
2. Open `lib/config.js`.
3. Find the amenity key in `amenitiesImages` and add the path to its array.
4. Done. Both `/galeria` and `/comodidades` update automatically.

### Change the hero image

1. Place the new image in `public/images/`.
2. In `lib/config.js`, change the `heroImage` value to the new path.

### Change the homepage gallery images

1. Place images in `public/images/`.
2. In `lib/config.js`, update the `galleryImages` array with the new paths.

### Activate an empty amenity (e.g. parrillero, fogonero)

1. Place at least one image in `public/images/`.
2. In `lib/config.js`, change the empty array to include the path(s):
   ```javascript
   parrillero: ['/images/parrillero1.jpg'],
   ```

### Add a completely new amenity category

1. Add the key + images array to `amenitiesImages`.
2. Add the key + `{ nombre, descripcion }` to `amenityMeta`.
3. The new section automatically appears in `/galeria` and `/comodidades`.

### Remove an image

1. Remove the path from the relevant array in `lib/config.js`.
2. Optionally delete the file from `public/images/`.

### Remove an entire amenity from the site

1. Set its array to `[]` in `amenitiesImages`. It will be hidden from both pages.

---

## Which Components Render Images

| Component/Page | File | Image Source |
|---|---|---|
| Hero background | `components/HeroImage.jsx` | `SITE_CONFIG.heroImage` |
| Homepage gallery | `app/page.js` (lines 41-63) | `SITE_CONFIG.galleryImages` |
| Galería page | `app/galeria/page.jsx` | `SITE_CONFIG.amenitiesImages` (all images) |
| Comodidades gallery | `app/comodidades/page.jsx` (lines 116-134) | `SITE_CONFIG.amenitiesImages` (first image only) |

All use `next/image` with `fill` and `object-cover`. No custom image API or upload system exists.

---

## Image Specs

| Section | Size | Max Weight | Format | Aspect Ratio |
|---|---|---|---|---|
| Hero | 1920×1080px | 500KB | JPG / WebP | 16:9 |
| Gallery / Amenities | 1200×800px | 300KB | JPG / WebP | 3:2 |

Optimize before uploading using [Squoosh.app](https://squoosh.app) or [TinyPNG](https://tinypng.com). Quality 80-85%.

Do NOT use images from WhatsApp — they are heavily compressed and low quality.

---

## File Structure

```
public/images/
├── hamaca-fondo.jpg          ← hero
├── detalles.jpg              ← galleryImages + living
├── pile-casa.jpg             ← galleryImages + exterior
├── luces.jpg                 ← galleryImages + exterior
├── arcos.jpeg                ← exterior
├── camino.jpeg               ← exterior
├── parque-mantel.jpg         ← exterior
├── brochets-luces.jpg        ← exterior
├── brochets-luces2.jpg       ← exterior
├── hojas.jpg                 ← exterior
├── banner.jpeg               ← exterior
├── cocina.jpeg               ← cocina
├── cocina2.jpeg              ← cocina
├── comedor.jpeg              ← living
├── comedor1.jpeg             ← living
├── pile.jpg                  ← piscina
├── tobogan.jpeg              ← piscina
└── comodidades/
    ├── habitacion-principal.jpg  ← habitacion
    ├── banio.jpeg                ← bano
    └── living-comodin.jpeg       ← living
```

---

## Agent Instructions

When the user asks you to add images:

1. **Always read `lib/config.js` first** to see the current state of image config.
2. **List existing files** in `public/images/` to verify what's on disk.
3. **Ask the user** where the new image should appear: hero, homepage gallery, or which amenity.
4. **Place the file** in `public/images/` (or `public/images/comodidades/` if it's an amenity-specific image).
5. **Update `lib/config.js`** — add the path to the correct property/array.
6. If adding a new amenity key, **also update `amenityMeta`**.
7. **Never touch the component files** (`page.js`, `page.jsx`, `HeroImage.jsx`) — they read from config dynamically.
8. **Verify the path matches exactly** — filename, extension, and case sensitivity all matter on Linux.
