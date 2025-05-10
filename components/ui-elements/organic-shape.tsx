import type React from "react"
import { cn } from "@/lib/utils"

interface OrganicShapeProps extends React.SVGAttributes<SVGElement> {
  type: "blob1" | "blob2" | "blob3"
  className?: string
}

export function OrganicShape({ type, className, ...props }: OrganicShapeProps) {
  const shapes = {
    blob1: (
      <path d="M165.9,54.3c47.3-32.9,124.6-31.3,165.9,7.8c41.3,39.1,46.7,115.7,15.6,168.5c-31.1,52.8-98.6,81.8-162.1,73.4 C122,295.6,62.5,250,31.6,189.6C0.7,129.2-1.6,54.1,46.1,21.1C93.8-11.9,118.6,87.2,165.9,54.3z" />
    ),
    blob2: (
      <path d="M50.8,69.1C73.1,43.3,113.9,32.8,150.8,52.3c36.9,19.5,69.8,69.1,57.6,113.4c-12.2,44.3-69.5,83.4-126,83.5 c-56.5,0.1-112.2-39-126.7-91.1C-58.8,106,28.5,94.9,50.8,69.1z" />
    ),
    blob3: (
      <path d="M134.6,33.8c44.7,7.8,92.5,42.5,93.9,82.4c1.4,39.9-43.7,85-98.2,106.2c-54.5,21.2-118.4,18.6-151.6-15.3 C-54.5,171.2-57,106,5.2,61.5C67.4,17,89.9,26,134.6,33.8z" />
    ),
  }

  return (
    <svg viewBox="0 0 350 350" xmlns="http://www.w3.org/2000/svg" className={cn("fill-current", className)} {...props}>
      {shapes[type]}
    </svg>
  )
}
