"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Calendar, Clock, MapPin, Users, DollarSign, Share2, Heart, CalendarPlus } from "lucide-react"
import { GlassmorphicCard } from "@/components/ui-elements/glassmorphic-card"
import { NeumorphicButton } from "@/components/ui-elements/neumorphic-button"
import { OrganicShape } from "@/components/ui-elements/organic-shape"
import { EventSpeakers } from "@/components/event-speakers"
import { EventSchedule } from "@/components/event-schedule"
import { EventMap } from "@/components/event-map"
import { motion } from "framer-motion"

// Sample event data
const event = {
  id: "1",
  title: "Tech Conference 2025",
  date: "May 15-17, 2025",
  time: "9:00 AM - 6:00 PM",
  location: "Moscone Center, San Francisco, CA",
  image: "/placeholder.svg?height=600&width=1200",
  description:
    "Join the biggest tech conference of the year featuring keynotes from industry leaders, hands-on workshops, networking opportunities, and the latest technology showcases. This three-day event brings together developers, designers, entrepreneurs, and tech enthusiasts from around the world.",
  price: 299,
  category: "Technology",
  attendees: 1200,
  organizer: "TechEvents Inc.",
  speakers: [
    { name: "Jane Smith", role: "CEO, TechGiant", image: "/placeholder.svg?height=200&width=200" },
    { name: "John Doe", role: "CTO, StartupX", image: "/placeholder.svg?height=200&width=200" },
    { name: "Sarah Johnson", role: "AI Researcher", image: "/placeholder.svg?height=200&width=200" },
    { name: "Michael Brown", role: "Product Designer", image: "/placeholder.svg?height=200&width=200" },
  ],
  schedule: [
    {
      day: "Day 1",
      date: "May 15",
      events: [
        { time: "9:00 AM - 10:00 AM", title: "Registration & Breakfast" },
        { time: "10:00 AM - 11:30 AM", title: "Opening Keynote: The Future of Tech" },
        { time: "11:45 AM - 12:45 PM", title: "Panel: AI in Everyday Life" },
        { time: "1:00 PM - 2:00 PM", title: "Lunch Break" },
        { time: "2:15 PM - 3:45 PM", title: "Workshop: Building with React" },
        { time: "4:00 PM - 5:30 PM", title: "Networking Session" },
      ],
    },
    {
      day: "Day 2",
      date: "May 16",
      events: [
        { time: "9:00 AM - 10:00 AM", title: "Breakfast" },
        { time: "10:00 AM - 11:30 AM", title: "Keynote: Web3 and the Future of the Internet" },
        { time: "11:45 AM - 12:45 PM", title: "Panel: Cybersecurity Challenges" },
        { time: "1:00 PM - 2:00 PM", title: "Lunch Break" },
        { time: "2:15 PM - 3:45 PM", title: "Workshop: Cloud Computing" },
        { time: "4:00 PM - 5:30 PM", title: "Startup Showcase" },
      ],
    },
    {
      day: "Day 3",
      date: "May 17",
      events: [
        { time: "9:00 AM - 10:00 AM", title: "Breakfast" },
        { time: "10:00 AM - 11:30 AM", title: "Keynote: The Next Decade in Tech" },
        { time: "11:45 AM - 12:45 PM", title: "Panel: Diversity in Tech" },
        { time: "1:00 PM - 2:00 PM", title: "Lunch Break" },
        { time: "2:15 PM - 3:45 PM", title: "Workshop: Mobile Development" },
        { time: "4:00 PM - 5:30 PM", title: "Closing Ceremony & Awards" },
      ],
    },
  ],
}

export default function EventDetailPage({ params }: { params: { id: string } }) {
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
        {/* Event Header */}
        <motion.div
          className="mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Link
            href="/events"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-4 sm:mb-6"
          >
            ← Back to Events
          </Link>

          <div className="relative rounded-xl overflow-hidden h-[250px] sm:h-[300px] md:h-[400px] mb-6 sm:mb-8">
            <Image src={event.image || "/placeholder.svg"} alt={event.title} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
              <div className="p-4 sm:p-6 md:p-8 w-full">
                <div className="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded-full mb-2 sm:mb-4">
                  {event.category}
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">{event.title}</h1>
                <div className="flex flex-wrap gap-3 sm:gap-4 text-white text-sm sm:text-base">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <GlassmorphicCard className="p-6 md:p-8" borderGlow={true}>
                <h2 className="text-2xl font-bold mb-4">About This Event</h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{event.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                    <Users className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                    <div className="text-sm text-gray-600 dark:text-gray-400">Attendees</div>
                    <div className="font-bold">{event.attendees.toLocaleString()}</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                    <DollarSign className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                    <div className="text-sm text-gray-600 dark:text-gray-400">Price</div>
                    <div className="font-bold">${event.price}</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                    <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                    <div className="text-sm text-gray-600 dark:text-gray-400">Duration</div>
                    <div className="font-bold">3 Days</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                    <Users className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                    <div className="text-sm text-gray-600 dark:text-gray-400">Organizer</div>
                    <div className="font-bold">{event.organizer}</div>
                  </div>
                </div>
              </GlassmorphicCard>
            </motion.div>

            {/* Event Speakers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <EventSpeakers speakers={event.speakers} />
            </motion.div>

            {/* Event Schedule */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <EventSchedule schedule={event.schedule} />
            </motion.div>

            {/* Event Location */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <GlassmorphicCard className="p-6 md:p-8" borderGlow={true}>
                <h2 className="text-2xl font-bold mb-4">Location</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">{event.location}</p>
                <div className="h-[300px] rounded-lg overflow-hidden">
                  <EventMap location={event.location} />
                </div>
              </GlassmorphicCard>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <GlassmorphicCard className="p-6" borderGlow={true}>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">Register Now</h3>
                  <p className="text-gray-600 dark:text-gray-400">Secure your spot at this event</p>
                </div>

                <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-700 dark:text-gray-300">Price per ticket</span>
                  <span className="text-2xl font-bold">${event.price}</span>
                </div>

                <NeumorphicButton className="w-full mb-4" size="lg">
                  <Link href={`/register?event=${params.id}`} className="w-full flex items-center justify-center">
                    Register Now
                  </Link>
                </NeumorphicButton>

                <div className="flex gap-2">
                  <NeumorphicButton variant="outline" className="flex-1">
                    <Heart className="w-4 h-4 mr-2" />
                    Save
                  </NeumorphicButton>
                  <NeumorphicButton variant="outline" className="flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </NeumorphicButton>
                </div>
              </GlassmorphicCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <GlassmorphicCard className="p-6" borderGlow={true}>
                <h3 className="text-xl font-bold mb-4">Add to Calendar</h3>
                <div className="space-y-2">
                  <NeumorphicButton variant="outline" className="w-full justify-start">
                    <CalendarPlus className="w-4 h-4 mr-2" />
                    Google Calendar
                  </NeumorphicButton>
                  <NeumorphicButton variant="outline" className="w-full justify-start">
                    <CalendarPlus className="w-4 h-4 mr-2" />
                    Apple Calendar
                  </NeumorphicButton>
                  <NeumorphicButton variant="outline" className="w-full justify-start">
                    <CalendarPlus className="w-4 h-4 mr-2" />
                    Outlook
                  </NeumorphicButton>
                </div>
              </GlassmorphicCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <GlassmorphicCard className="p-6" borderGlow={true}>
                <h3 className="text-xl font-bold mb-4">Organizer</h3>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 mr-4 flex items-center justify-center">
                    <Users className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <h4 className="font-medium">{event.organizer}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Event Organizer</p>
                  </div>
                </div>
                <NeumorphicButton variant="outline" className="w-full">
                  Contact Organizer
                </NeumorphicButton>
              </GlassmorphicCard>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  )
}
