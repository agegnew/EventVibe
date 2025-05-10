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

// Sample featured events data
const featuredEvents = [
  {
    id: "1",
    title: "Tech Conference 2025",
    date: "May 15-17, 2025",
    location: "San Francisco, CA",
    image: "/placeholder.svg?height=400&width=600",
    attendees: 1200,
    category: "Technology",
  },
  {
    id: "2",
    title: "Design Summit",
    date: "June 10-12, 2025",
    location: "New York, NY",
    image: "/placeholder.svg?height=400&width=600",
    attendees: 800,
    category: "Design",
  },
  {
    id: "3",
    title: "Marketing Expo",
    date: "July 5-7, 2025",
    location: "Chicago, IL",
    image: "/placeholder.svg?height=400&width=600",
    attendees: 950,
    category: "Marketing",
  },
]

// Categories displayed in a grid
const categories = ["Technology", "Business", "Design", "Marketing", "Music", "Sports", "Food", "Arts"]

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  // Simple animation loading after mount
  useEffect(() => {
    // Set a small timeout to allow the component to fully mount
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

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
                <Link href="/register">Create Event</Link>
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
            {featuredEvents.map((event, index) => (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <FeaturedEvent event={event} />
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
            <div className="absolute inset-0 bg-glass-pattern opacity-30"></div>
          </>
        )}

        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              className="mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 text-shimmer">
                Browse Categories
              </span>
            </motion.div>
            
            <motion.div
              className="relative inline-block mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold relative z-10">
                Find Your Perfect Event
                <motion.span 
                  className="absolute -z-10 bottom-1 left-0 h-3 w-full bg-blue-500/20 dark:bg-blue-500/30 rounded-sm"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
                />
              </h2>
            </motion.div>
            
            <motion.p 
              className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mt-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Discover events tailored to your interests and preferences
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              // Define appropriate icon for each category
              const getCategoryIcon = () => {
                switch(category) {
                  case "Technology": 
                    return <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>;
                  case "Business": 
                    return <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline><polyline points="7.5 19.79 7.5 14.6 3 12"></polyline><polyline points="21 12 16.5 14.6 16.5 19.79"></polyline><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;
                  case "Design": 
                    return <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="21.17" y1="8" x2="12" y2="8"></line><line x1="3.95" y1="6.06" x2="8.54" y2="14"></line><line x1="10.88" y1="21.94" x2="15.46" y2="14"></line></svg>;
                  case "Marketing": 
                    return <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
                  case "Music": 
                    return <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>;
                  case "Sports": 
                    return <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>;
                  case "Food": 
                    return <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>;
                  case "Arts": 
                    return <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>;
                  default: 
                    return null;
                }
              };

              // Get background gradient based on category
              const getCategoryGradient = () => {
                // All categories now use the same subtle blue gradient for consistency
                return "from-blue-400/5 to-blue-500/10 dark:from-blue-500/10 dark:to-blue-600/20";
              };
              
              return (
                <motion.div 
                  key={category}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.05 * index }}
                  className="group hover-float"
                  whileHover={{ scale: 1.03 }}
                >
                  <GlassmorphicCard 
                    className={`h-40 flex items-center justify-center cursor-pointer overflow-hidden bg-gradient-to-br border border-blue-300/30 dark:border-blue-500/30 ${getCategoryGradient()}`}
                    borderGlow={true}
                  >
                    <div className="absolute inset-0 opacity-20 bg-glass-pattern"></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 dark:from-white/10 to-transparent"></div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 bg-blue-400/20 dark:bg-blue-500/20"></div>
                    <Link
                      href={`/events?category=${category.toLowerCase()}`}
                      className="w-full h-full flex flex-col items-center justify-center p-4 relative z-10"
                    >
                      <motion.div 
                        className="transition-all duration-300 ease-in-out group-hover:-translate-y-1"
                      >
                        {/* Icon with consistent blue coloring */}
                        <div className="h-12 w-12 mb-3 text-blue-600 dark:text-blue-400">
                          {getCategoryIcon()}
                        </div>
                      </motion.div>
                      <motion.h3 
                        className="text-xl font-semibold text-gray-800 dark:text-white mb-1 transition-all duration-300 ease-in-out relative"
                      >
                        {category}
                        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500/50 dark:bg-blue-400/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-center" />
                      </motion.h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 text-center opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                        Explore {category.toLowerCase()} events
                      </p>
                    </Link>
                  </GlassmorphicCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 relative overflow-hidden">
        {isLoaded && (
          <OrganicShape
            className="absolute -bottom-20 right-0 w-[500px] h-[500px] text-blue-100 dark:text-blue-900 opacity-20 rotate-45"
            type="blob2"
          />
        )}

        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <GlassmorphicCard className="p-12 max-w-4xl mx-auto" borderGlow={true}>
              <div className="text-center">
                <motion.h2 
                  className="text-3xl md:text-4xl font-bold mb-6 title-3d"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Ready to Host Your Own Event?
                </motion.h2>
                <motion.p 
                  className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  Create, manage, and promote your events with our powerful platform. Reach thousands of potential
                  attendees.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <NeumorphicButton asChild size="lg">
                    <Link href="/register">Get Started</Link>
                  </NeumorphicButton>
                </motion.div>
              </div>
            </GlassmorphicCard>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-mesh-gradient dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Calendar, value: "1,000+", label: "Events Hosted" },
              { icon: Users, value: "50,000+", label: "Happy Attendees" },
              { icon: MapPin, value: "100+", label: "Locations Worldwide" },
            ].map((stat, index) => (
              <motion.div 
                key={stat.label} 
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shadow-lg">
                    <stat.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <motion.h3 
                  className="text-3xl md:text-4xl font-bold mb-2 text-gradient"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + 0.1 * index }}
                >
                  {stat.value}
                </motion.h3>
                <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

