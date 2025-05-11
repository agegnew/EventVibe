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
            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="relative inline-block px-4 py-1 mb-4 rounded-full bg-blue-100 dark:bg-blue-900/40 backdrop-blur-sm">
                <span className="relative z-10 text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Browse by Category
                </span>
              </span>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                Find Your Interest
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                Explore events by category to discover experiences tailored to your interests
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.05 * index }}
                className="aspect-square"
              >
                <Link 
                  href={`/events?category=${category.toLowerCase()}`}
                  className="h-full block group"
                >
                  <GlassmorphicCard 
                    className="p-6 h-full flex flex-col items-center justify-center text-center group-hover:scale-105 transition-all duration-300 shadow-xl" 
                    borderGlow={true}
                  >
                    <div className={`w-16 h-16 mb-5 flex items-center justify-center rounded-2xl ${getCategoryGradient(category)} transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      {getCategoryIcon(category)}
                    </div>
                    <h3 className="font-bold text-lg md:text-xl">{category}</h3>
                    <div className="w-10 h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mt-3 group-hover:w-16 transition-all duration-300"></div>
                  </GlassmorphicCard>
                </Link>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-full px-8 py-6 text-lg font-medium transition-all duration-300 hover:shadow-lg"
              asChild
            >
              <Link href="/events">View All Categories</Link>
            </Button>
          </motion.div>
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
      return (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="5" fill="currentColor" fillOpacity="0.15"/>
          <path d="M7 8C7 7.44772 7.44772 7 8 7H16C16.5523 7 17 7.44772 17 8V16C17 16.5523 16.5523 17 16 17H8C7.44772 17 7 16.5523 7 16V8Z" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M10 11L14 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M10 14L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M12 7V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M12 19V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M17 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M5 12H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    case "business":
      return (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="5" fill="currentColor" fillOpacity="0.15"/>
          <path d="M16 10.5V8C16 6.89543 15.1046 6 14 6H10C8.89543 6 8 6.89543 8 8V10.5" stroke="currentColor" strokeWidth="1.5"/>
          <rect x="6" y="10.5" width="12" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M12 14V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    case "design":
      return (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="5" fill="currentColor" fillOpacity="0.15"/>
          <path d="M14.5 7.5L16.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M8 16L14 10L13 9L7 15L8 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M8.5 16.5L7 16L6.5 14.5L12.5 8.5L15.5 11.5L9.5 17.5L8.5 16.5Z" fill="currentColor" fillOpacity="0.2"/>
          <circle cx="16" cy="8" r="1" fill="currentColor"/>
        </svg>
      )
    case "marketing":
      return (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="5" fill="currentColor" fillOpacity="0.15"/>
          <path d="M16 9L16 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M12 11L12 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M8 13L8 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M8 7L16 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M19 10L16 7L13 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    case "music":
      return (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="5" fill="currentColor" fillOpacity="0.15"/>
          <path d="M10 17.5C10 18.3284 9.32843 19 8.5 19C7.67157 19 7 18.3284 7 17.5C7 16.6716 7.67157 16 8.5 16C9.32843 16 10 16.6716 10 17.5Z" fill="currentColor"/>
          <path d="M17 14.5C17 15.3284 16.3284 16 15.5 16C14.6716 16 14 15.3284 14 14.5C14 13.6716 14.6716 13 15.5 13C16.3284 13 17 13.6716 17 14.5Z" fill="currentColor"/>
          <path d="M10 17.5V8.5M17 14.5V5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M10 8.5L17 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    case "sports":
      return (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="5" fill="currentColor" fillOpacity="0.15"/>
          <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M12 5C13.6569 6.33333 14.5 8.66667 14.5 12C14.5 15.3333 13.6569 17.6667 12 19" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M12 5C10.3431 6.33333 9.5 8.66667 9.5 12C9.5 15.3333 10.3431 17.6667 12 19" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M5 12H19" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      )
    case "food":
      return (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="5" fill="currentColor" fillOpacity="0.15"/>
          <path d="M6 11H18V13C18 14.1046 17.1046 15 16 15H8C6.89543 15 6 14.1046 6 13V11Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M8 7L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M12 7V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M16 7V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M7 18L17 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    case "arts":
      return (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="5" fill="currentColor" fillOpacity="0.15"/>
          <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="15" cy="9" r="2" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="9" cy="15" r="2" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="15" cy="15" r="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M9 11V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M15 11V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M11 9H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M11 15H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    default:
      return (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="5" fill="currentColor" fillOpacity="0.15"/>
          <rect x="7" y="7" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M7 10H17" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M10 7L10 17" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      )
  }
}

// Helper function to get the appropriate gradient for each category
const getCategoryGradient = (category: string) => {
  switch (category.toLowerCase()) {
    case "technology":
      return "bg-gradient-to-br from-blue-500/90 to-cyan-500/90 text-white"
    case "business":
      return "bg-gradient-to-br from-indigo-500/90 to-blue-500/90 text-white"
    case "design":
      return "bg-gradient-to-br from-purple-500/90 to-indigo-500/90 text-white"
    case "marketing":
      return "bg-gradient-to-br from-cyan-500/90 to-blue-500/90 text-white"
    case "music":
      return "bg-gradient-to-br from-violet-500/90 to-purple-500/90 text-white"
    case "sports":
      return "bg-gradient-to-br from-blue-500/90 to-indigo-500/90 text-white"
    case "food":
      return "bg-gradient-to-br from-cyan-500/90 to-teal-500/90 text-white"
    case "arts":
      return "bg-gradient-to-br from-purple-500/90 to-violet-500/90 text-white"
    default:
      return "bg-gradient-to-br from-blue-500/90 to-indigo-500/90 text-white"
  }
}

