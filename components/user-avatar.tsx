"use client"

import Image from "next/image"
import { useState } from "react"

interface UserAvatarProps {
  src?: string | null
  alt: string
  size?: number
  className?: string
}

export function UserAvatar({ src, alt, size = 40, className = "" }: UserAvatarProps) {
  const [error, setError] = useState(false)
  
  // Process the image source
  const getImageSrc = () => {
    // Use default if there's no src or an error occurred
    if (!src || error) {
      return "/default.png"
    }
    
    // If the path starts with /data/, use the API route
    if (src.startsWith("/data/")) {
      return `/api/images${src}`
    }
    
    // Otherwise, use the src as is
    return src
  }
  
  const imageSrc = getImageSrc()
  
  return (
    <div 
      className={`overflow-hidden rounded-full ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <Image
        src={imageSrc}
        alt={alt}
        width={size}
        height={size}
        className="object-cover h-full w-full"
        onError={() => setError(true)}
      />
    </div>
  )
} 