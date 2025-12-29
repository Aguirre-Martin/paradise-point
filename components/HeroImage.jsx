'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function HeroImage({ src, alt }) {
  const [imageError, setImageError] = useState(false)

  if (imageError) {
    return (
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-teal-600/90" />
    )
  }

  return (
    <Image 
      src={src} 
      alt={alt}
      fill
      className="object-cover"
      priority
      onError={() => setImageError(true)}
    />
  )
}








