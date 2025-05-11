"use client"

import Link from "next/link"
import { Calendar, MapPin, Users } from "lucide-react"
import { GlassmorphicCard } from "@/components/ui-elements/glassmorphic-card"
import { NeumorphicButton } from "@/components/ui-elements/neumorphic-button"
import { OrganicShape } from "@/components/ui-elements/organic-shape"
import { FeaturedEvent } from "@/components/featured-event"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import HeroAnimation from "@/components/hero-animation"
import { Event, getAllEvents } from "@/lib/data-service"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isLoggedIn } = useAuth();

  // Simple animation loading after mount
  useEffect(() => {
    // Set a small timeout to allow the component to fully mount
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Fetch featured events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const allEvents = await getAllEvents();
        // Filter for featured events only
        const featured = allEvents
          .filter(event => event.featured && event.status !== 'Cancelled')
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 3);
        
        setFeaturedEvents(featured);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Categories displayed in a grid
  const categories = ["Technology", "Business", "Design", "Marketing", "Music", "Sports", "Food", "Arts"]

  return (
    <main className="min-h-screen bg-mesh-gradient dark:from-gray-900 dark:to-gray-800 overflow-hidden animated-bg">
      {/* Floating orbs for background effect */}
      {isLoaded && (
        <>
          <div className="floating-orbs orb-1"></div>
          <div className="floating-orbs orb-2"></div>
          <div className="floating-orbs orb-3"></div>
        </>
      )}
      
      {/* Hero Section with 3D Animation */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden pt-20 sm:pt-24 md:pt-32">
        {isLoaded && (
          <>
            <OrganicShape
              className="absolute -top-40 -left-40 w-[600px] h-[600px] text-blue-200 dark:text-blue-900 opacity-30 rotate-45"
              type="blob1"
            />
            <OrganicShape
              className="absolute -bottom-40 -right-40 w-[500px] h-[500px] text-cyan-200 dark:text-cyan-900 opacity-30 -rotate-12"
              type="blob2"
            />
          </>
        )}

        <div className="container mx-auto px-4 z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="lg:w-1/2 text-center lg:text-left">
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 mb-6 title-3d"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Experience Events Like Never Before
            </motion.h1>
            <motion.p 
              className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Discover, register, and attend the most exciting events around the world with our immersive platform.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <NeumorphicButton asChild size="lg">
                <Link href="/events">Explore Events</Link>
              </NeumorphicButton>
              <NeumorphicButton asChild variant="secondary" size="lg">
                <Link href={isLoggedIn ? "/dashboard" : "/signup"}>
                  {isLoggedIn ? "My Dashboard" : "Create Account"}
                </Link>
              </NeumorphicButton>
            </motion.div>
          </div>

          <div 
            className="lg:w-1/2 h-[300px] sm:h-[350px] md:h-[400px] mt-8 lg:mt-0 relative rounded-xl overflow-hidden shadow-lg"
          >
            <HeroAnimation />
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-20 relative">
        {isLoaded && (
          <OrganicShape
            className="absolute top-20 right-0 w-[300px] h-[300px] text-cyan-100 dark:text-cyan-900 opacity-20"
            type="blob3"
          />
        )}

        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.span 
              className="inline-block text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2 text-shimmer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Featured Events
            </motion.span>
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-4 relative z-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Upcoming Events
            </motion.h2>
            <motion.p 
              className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Discover the most anticipated events that are coming soon. Register now to secure your spot!
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              // Loading skeletons
              [...Array(3)].map((_, index) => (
                <motion.div
                  key={`skeleton-${index}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse h-[350px]"
                />
              ))
            ) : featuredEvents.length > 0 ? (
              featuredEvents.map((event, index) => (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <FeaturedEvent event={{
                    id: event.id,
                    title: event.title,
                    date: new Date(event.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric'
                    }),
                    location: event.location,
                    image: event.image,
                    attendees: event.registrations,
                    category: event.category
                  }} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">No featured events available at the moment.</p>
              </div>
            )}
          </div>

          <motion.div 
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <NeumorphicButton asChild>
              <Link href="/events">View All Events</Link>
            </NeumorphicButton>
          </motion.div>
        </div>
      </section>

      {/* Categories Section with Glassmorphic Cards */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
        {isLoaded && (
          <>
            <OrganicShape
              className="absolute bottom-0 left-0 w-[400px] h-[400px] text-blue-100 dark:text-blue-900 opacity-20 rotate-180"
              type="blob1"
            />
          </>
        )}

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <motion.span 
              className="inline-block text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2 text-shimmer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Browse by Category
            </motion.span>
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Find Your Interest
            </motion.h2>
            <motion.p 
              className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Explore events by category to discover experiences tailored to your interests
            </motion.p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.05 * index }}
              >
                <Link href={`/events?category=${category.toLowerCase()}`}>
                  <GlassmorphicCard className="p-6 h-full flex flex-col items-center justify-center text-center hover:scale-105 transition-transform duration-300" borderGlow={true}>
                    <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center ${getCategoryGradient(category)}`}>
                      {getCategoryIcon(category)}
                    </div>
                    <h3 className="font-bold">{category}</h3>
                  </GlassmorphicCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 relative">
        {isLoaded && (
          <OrganicShape
            className="absolute top-20 left-40 w-[300px] h-[300px] text-pink-100 dark:text-pink-900 opacity-20 rotate-12"
            type="blob4"
          />
        )}

        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Ready to Create Your Own Event?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">Join our platform and start hosting memorable events that bring people together</p>
            <NeumorphicButton asChild size="lg">
              <Link href={isLoggedIn ? "/dashboard/events/new" : "/signup"}>
                {isLoggedIn ? "Create an Event" : "Get Started for Free"}
              </Link>
            </NeumorphicButton>
          </motion.div>
        </div>
      </section>
    </main>
  )
}

// Helper function to get the appropriate icon for each category
const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case "technology":
      return <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm5.88 13.47l3.76-2.08a2 2 0 0 0 1-1.72V6.79a2 2 0 0 0-1-1.72L9.88 3.53a2 2 0 0 0-1.94 0L4.18 5.5a2 2 0 0 0-1 1.72v4.67a2 2 0 0 0 1 1.72l3.76 2.08a2 2 0 0 0 1.94 0z" /></svg>
    case "business":
      return <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20 6H4V5c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v1zm0 2v12c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V8h16z" /></svg>
    case "design":
      return <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8.5 4A1.5 1.5 0 0 0 7 5.5A1.5 1.5 0 0 0 8.5 7A1.5 1.5 0 0 0 10 5.5A1.5 1.5 0 0 0 8.5 4M15.5 4A1.5 1.5 0 0 0 14 5.5A1.5 1.5 0 0 0 15.5 7A1.5 1.5 0 0 0 17 5.5A1.5 1.5 0 0 0 15.5 4M8.5 17A1.5 1.5 0 0 0 7 18.5A1.5 1.5 0 0 0 8.5 20A1.5 1.5 0 0 0 10 18.5A1.5 1.5 0 0 0 8.5 17M15.5 17A1.5 1.5 0 0 0 14 18.5A1.5 1.5 0 0 0 15.5 20A1.5 1.5 0 0 0 17 18.5A1.5 1.5 0 0 0 15.5 17M12 10.5A1.5 1.5 0 0 0 10.5 12A1.5 1.5 0 0 0 12 13.5A1.5 1.5 0 0 0 13.5 12A1.5 1.5 0 0 0 12 10.5Z" /></svg>
    case "marketing":
      return <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12,8H4A2,2 0 0,0 2,10V14A2,2 0 0,0 4,16H5V20A1,1 0 0,0 6,21H8A1,1 0 0,0 9,20V16H12L17,20V4L12,8M21.5,12C21.5,13.71 20.54,15.26 19,16V8C20.53,8.75 21.5,10.3 21.5,12Z" /></svg>
    case "music":
      return <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M21,3V15.5A3.5,3.5 0 0,1 17.5,19A3.5,3.5 0 0,1 14,15.5A3.5,3.5 0 0,1 17.5,12C18.04,12 18.55,12.12 19,12.34V6.47L9,8.6V17.5A3.5,3.5 0 0,1 5.5,21A3.5,3.5 0 0,1 2,17.5A3.5,3.5 0 0,1 5.5,14C6.04,14 6.55,14.12 7,14.34V7L21,3Z" /></svg>
    case "sports":
      return <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A2,2 0 0,0 10,6A2,2 0 0,0 12,8A2,2 0 0,0 14,6A2,2 0 0,0 12,4M13.5,10H10.5C8.57,10 7,11.57 7,13.5V16H17V13.5C17,11.57 15.43,10 13.5,10Z" /></svg>
    case "food":
      return <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M15.5,21L14,8H16.23L15.1,3.46L16.84,3L18.09,8H22L20.5,21H15.5M5,11H10A3,3 0 0,1 13,14H2A3,3 0 0,1 5,11M13,18V21H2V18H13M3,15H8L9.5,16.5L11,15H12A1,1 0 0,1 13,16A1,1 0 0,1 12,17H3A1,1 0 0,1 2,16A1,1 0 0,1 3,15Z" /></svg>
    case "arts":
      return <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12,6A3,3 0 0,0 9,9A3,3 0 0,0 12,12A3,3 0 0,0 15,9A3,3 0 0,0 12,6M12,8A1,1 0 0,1 13,9A1,1 0 0,1 12,10A1,1 0 0,1 11,9A1,1 0 0,1 12,8M5.5,8C4.67,8 4,8.67 4,9.5C4,10.33 4.67,11 5.5,11C6.33,11 7,10.33 7,9.5C7,8.67 6.33,8 5.5,8M18.5,8C17.67,8 17,8.67 17,9.5C17,10.33 17.67,11 18.5,11C19.33,11 20,10.33 20,9.5C20,8.67 19.33,8 18.5,8M5.5,18C4.67,18 4,18.67 4,19.5C4,20.33 4.67,21 5.5,21C6.33,21 7,20.33 7,19.5C7,18.67 6.33,18 5.5,18M18.5,18C17.67,18 17,18.67 17,19.5C17,20.33 17.67,21 18.5,21C19.33,21 20,20.33 20,19.5C20,18.67 19.33,18 18.5,18M12,17C11.17,17 10.5,17.67 10.5,18.5C10.5,19.33 11.17,20 12,20C12.83,20 13.5,19.33 13.5,18.5C13.5,17.67 12.83,17 12,17M9.5,14C8.67,14 8,14.67 8,15.5C8,16.33 8.67,17 9.5,17C10.33,17 11,16.33 11,15.5C11,14.67 10.33,14 9.5,14M14.5,14C13.67,14 13,14.67 13,15.5C13,16.33 13.67,17 14.5,17C15.33,17 16,16.33 16,15.5C16,14.67 15.33,14 14.5,14Z" /></svg>
    default:
      return <Calendar className="w-6 h-6" />
  }
}

// Helper function to get the appropriate gradient for each category
const getCategoryGradient = (category: string) => {
  switch (category.toLowerCase()) {
    case "technology":
      return "bg-gradient-to-br from-blue-500 to-blue-700 text-white"
    case "business":
      return "bg-gradient-to-br from-amber-500 to-amber-700 text-white"
    case "design":
      return "bg-gradient-to-br from-pink-500 to-pink-700 text-white"
    case "marketing":
      return "bg-gradient-to-br from-green-500 to-green-700 text-white"
    case "music":
      return "bg-gradient-to-br from-purple-500 to-purple-700 text-white"
    case "sports":
      return "bg-gradient-to-br from-red-500 to-red-700 text-white"
    case "food":
      return "bg-gradient-to-br from-yellow-500 to-yellow-700 text-white"
    case "arts":
      return "bg-gradient-to-br from-cyan-500 to-cyan-700 text-white"
    default:
      return "bg-gradient-to-br from-gray-500 to-gray-700 text-white"
  }
}

