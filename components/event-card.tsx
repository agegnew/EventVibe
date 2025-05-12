import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin, DollarSign } from "lucide-react"
import { GlassmorphicCard } from "@/components/ui-elements/glassmorphic-card"
import { NeumorphicButton } from "@/components/ui-elements/neumorphic-button"
import { useCallback } from "react"

interface EventCardProps {
  event: {
    id: string
    title: string
    date: string
    location: string
    image: string
    description: string
    price: number
    category: string
  }
}

export function EventCard({ event }: EventCardProps) {
  // Helper function to normalize image paths
  const getImageUrl = useCallback((imagePath: string | undefined): string => {
    if (!imagePath) return "/default-event.png";
    
    // Check if it's already an absolute URL
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Handle virtual image paths for uploaded images in production
    if (imagePath.startsWith('/uploads/')) {
      console.log(`[EventCard] Using default-event.png for virtual image path: ${imagePath}`);
      return "/default-event.png";
    }
    
    // Use the provided path
    return imagePath;
  }, []);

  return (
    <GlassmorphicCard className="overflow-hidden h-full flex flex-col group" borderGlow={true}>
      <div className="relative h-48 overflow-hidden">
        <Image 
          src={getImageUrl(event.image)} 
          alt={event.title} 
          fill 
          className="object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full shadow-lg backdrop-blur-sm bg-opacity-85">
            {event.category}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div className="p-6 flex-1 flex flex-col relative z-10">
        <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{event.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-1">{event.description}</p>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-blue-500" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-blue-500" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-2 text-blue-500" />
            <span className="font-semibold">${event.price}</span>
          </div>
        </div>
        <div className="transform translate-y-0 opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <NeumorphicButton asChild className="w-full">
            <Link href={`/events/${event.id}`} className="group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-blue-400">
              View Details
            </Link>
          </NeumorphicButton>
        </div>
      </div>
    </GlassmorphicCard>
  )
}
