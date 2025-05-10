"use client"

import { Suspense } from "react"
import { Filter } from "lucide-react"
import { GlassmorphicCard } from "@/components/ui-elements/glassmorphic-card"
import { NeumorphicButton } from "@/components/ui-elements/neumorphic-button"
import { NeumorphicInput } from "@/components/ui-elements/neumorphic-input"
import { NeumorphicSelect } from "@/components/ui-elements/neumorphic-select"
import { OrganicShape } from "@/components/ui-elements/organic-shape"
import { EventCard } from "@/components/event-card"
import { EventsLoading } from "@/components/events-loading"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

// Sample events data
const events = [
  {
    id: "1",
    title: "Tech Conference 2025",
    date: "May 15-17, 2025",
    location: "San Francisco, CA",
    image: "/placeholder.svg?height=400&width=600",
    description:
      "Join the biggest tech conference of the year featuring keynotes from industry leaders and hands-on workshops.",
    price: 299,
    category: "Technology",
    attendees: 1200,
  },
  {
    id: "2",
    title: "Design Summit",
    date: "June 10-12, 2025",
    location: "New York, NY",
    image: "/placeholder.svg?height=400&width=600",
    description:
      "A three-day summit for designers to share ideas, learn new skills, and network with industry professionals.",
    price: 249,
    category: "Design",
    attendees: 800,
  },
  {
    id: "3",
    title: "Marketing Expo",
    date: "July 5-7, 2025",
    location: "Chicago, IL",
    image: "/placeholder.svg?height=400&width=600",
    description: "Discover the latest marketing trends and strategies from top marketing experts.",
    price: 199,
    category: "Marketing",
    attendees: 950,
  },
  {
    id: "4",
    title: "Music Festival",
    date: "August 20-22, 2025",
    location: "Austin, TX",
    image: "/placeholder.svg?height=400&width=600",
    description: "Three days of live music performances from top artists across multiple genres.",
    price: 349,
    category: "Music",
    attendees: 5000,
  },
  {
    id: "5",
    title: "Food & Wine Expo",
    date: "September 8-10, 2025",
    location: "Portland, OR",
    image: "/placeholder.svg?height=400&width=600",
    description: "Sample delicious food and wine from top chefs and wineries from around the world.",
    price: 179,
    category: "Food",
    attendees: 1500,
  },
  {
    id: "6",
    title: "Sports Convention",
    date: "October 15-17, 2025",
    location: "Miami, FL",
    image: "/placeholder.svg?height=400&width=600",
    description: "Meet your favorite athletes and discover the latest sports equipment and technology.",
    price: 149,
    category: "Sports",
    attendees: 2200,
  },
]

// Categories for filter
const categories = [
  { value: "all", label: "All Categories" },
  { value: "technology", label: "Technology" },
  { value: "design", label: "Design" },
  { value: "marketing", label: "Marketing" },
  { value: "music", label: "Music" },
  { value: "food", label: "Food" },
  { value: "sports", label: "Sports" },
]

// Price ranges for filter
const priceRanges = [
  { value: "all", label: "All Prices" },
  { value: "0-100", label: "Under $100" },
  { value: "100-200", label: "100-$200" },
  { value: "200-300", label: "200-$300" },
  { value: "300+", label: "Over $300" },
]

export default function EventsPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  // Defer non-critical animations until after page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-mesh-gradient dark:from-gray-900 dark:to-gray-800 pt-28 sm:pt-32 md:pt-36 pb-20 relative overflow-hidden animated-bg">
      {/* Floating orbs for background effect */}
      {isLoaded && (
        <>
          <div className="floating-orbs orb-1"></div>
          <div className="floating-orbs orb-2"></div>
          <div className="floating-orbs orb-3"></div>
        </>
      )}
      
      {isLoaded && (
        <>
          <OrganicShape
            className="absolute top-32 sm:top-20 right-0 w-[400px] sm:w-[500px] md:w-[600px] h-[400px] sm:h-[500px] md:h-[600px] text-blue-200 dark:text-blue-900 opacity-30 rotate-45"
            type="blob1"
          />
          <OrganicShape
            className="absolute bottom-0 left-0 w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] text-purple-200 dark:text-purple-900 opacity-30 -rotate-12"
            type="blob2"
          />
        </>
      )}

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 mb-4 title-3d"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Discover Events
          </motion.h1>
          <motion.p 
            className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Find and register for the most exciting events happening around you
          </motion.p>
        </motion.div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <GlassmorphicCard className="mb-12 p-6" borderGlow={true}>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Events</label>
                <NeumorphicInput placeholder="Search by event name or location" icon={<Filter className="h-4 w-4" />} />
              </div>
              <div className="w-full md:w-48">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <NeumorphicSelect options={categories} />
              </div>
              <div className="w-full md:w-48">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price Range</label>
                <NeumorphicSelect options={priceRanges} />
              </div>
              <div className="w-full md:w-auto">
                <NeumorphicButton>Apply Filters</NeumorphicButton>
              </div>
            </div>
          </GlassmorphicCard>
        </motion.div>

        {/* Events Grid */}
        <Suspense fallback={<EventsLoading />}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <EventCard event={event} />
              </motion.div>
            ))}
          </div>
        </Suspense>

        {/* Pagination */}
        <motion.div 
          className="mt-12 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <nav className="flex items-center gap-2">
            <NeumorphicButton variant="outline" size="sm">
              Previous
            </NeumorphicButton>
            {[1, 2, 3, 4, 5].map((page) => (
              <NeumorphicButton key={page} variant={page === 1 ? "default" : "outline"} size="sm" className="w-10 h-10">
                {page}
              </NeumorphicButton>
            ))}
            <NeumorphicButton variant="outline" size="sm">
              Next
            </NeumorphicButton>
          </nav>
        </motion.div>
      </div>
    </main>
  )
}
