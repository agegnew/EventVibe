import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin, Users } from "lucide-react"
import { GlassmorphicCard } from "@/components/ui-elements/glassmorphic-card"
import { NeumorphicButton } from "@/components/ui-elements/neumorphic-button"

interface FeaturedEventProps {
  event: {
    id: string
    title: string
    date: string
    location: string
    image: string
    attendees: number
    category: string
  }
}

export function FeaturedEvent({ event }: FeaturedEventProps) {
  return (
    <GlassmorphicCard className="overflow-hidden h-full flex flex-col group" borderGlow={true}>
      <div className="relative h-48 overflow-hidden">
        <Image 
          src={event.image || "/placeholder.svg"} 
          alt={event.title} 
          fill 
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
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
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4 flex-1">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-blue-500" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-blue-500" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2 text-blue-500" />
            <span>
              <span className="font-semibold">{event.attendees.toLocaleString()}</span> attendees
            </span>
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
