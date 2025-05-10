import type React from "react"
import { cn } from "@/lib/utils"

interface GlassmorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  animateHover?: boolean
  borderGlow?: boolean
}

export function GlassmorphicCard({ 
  children, 
  className, 
  animateHover = true, 
  borderGlow = false, 
  ...props 
}: GlassmorphicCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden bg-white/70 dark:bg-gray-800/50 backdrop-blur-md border border-blue-100/50 dark:border-blue-900/30 shadow-lg",
        animateHover && "glassmorphic-card-animation",
        borderGlow && "gradient-border",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
