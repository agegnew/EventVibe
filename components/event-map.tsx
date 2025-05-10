"use client"

import { useEffect, useRef } from "react"

interface EventMapProps {
  location: string
}

export function EventMap({ location }: EventMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // This is a placeholder for a real map implementation
    // In a real application, you would use a library like Google Maps, Mapbox, or Leaflet
    if (mapRef.current) {
      const canvas = document.createElement("canvas")
      canvas.width = mapRef.current.clientWidth
      canvas.height = mapRef.current.clientHeight
      mapRef.current.appendChild(canvas)

      const ctx = canvas.getContext("2d")
      if (ctx) {
        // Draw a placeholder map
        ctx.fillStyle = "#f3f4f6"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Draw some roads
        ctx.strokeStyle = "#d1d5db"
        ctx.lineWidth = 4

        // Horizontal roads
        for (let i = 1; i < 5; i++) {
          ctx.beginPath()
          ctx.moveTo(0, canvas.height * (i / 5))
          ctx.lineTo(canvas.width, canvas.height * (i / 5))
          ctx.stroke()
        }

        // Vertical roads
        for (let i = 1; i < 5; i++) {
          ctx.beginPath()
          ctx.moveTo(canvas.width * (i / 5), 0)
          ctx.lineTo(canvas.width * (i / 5), canvas.height)
          ctx.stroke()
        }

        // Draw a marker for the location
        const x = canvas.width / 2
        const y = canvas.height / 2

        // Pin base
        ctx.fillStyle = "#8b5cf6"
        ctx.beginPath()
        ctx.arc(x, y, 10, 0, Math.PI * 2)
        ctx.fill()

        // Pin dot
        ctx.fillStyle = "#ffffff"
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fill()

        // Location name
        ctx.fillStyle = "#1f2937"
        ctx.font = "bold 14px Arial"
        ctx.textAlign = "center"
        ctx.fillText(location, x, y + 30)
      }

      return () => {
        if (mapRef.current && canvas.parentNode === mapRef.current) {
          mapRef.current.removeChild(canvas)
        }
      }
    }
  }, [location])

  return <div ref={mapRef} className="w-full h-full bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
}
