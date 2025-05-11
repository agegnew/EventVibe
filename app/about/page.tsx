"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { BookOpen, Code, Github, Linkedin, MessageSquare, Calendar, User } from "lucide-react"
import { OrganicShape } from "@/components/ui-elements/organic-shape"
import { GlassmorphicCard } from "@/components/ui-elements/glassmorphic-card"
import { NeumorphicButton } from "@/components/ui-elements/neumorphic-button"
import { useEffect, useState } from "react"

export default function AboutPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  // Simple animation loading after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <main className="min-h-screen bg-mesh-gradient dark:from-gray-900 dark:to-gray-800 overflow-hidden animated-bg pt-20">
      {/* Floating shapes for background effect */}
      {isLoaded && (
        <>
          <OrganicShape
            className="absolute -top-40 right-40 w-[500px] h-[500px] text-blue-200 dark:text-blue-900 opacity-30 rotate-45"
            type="blob1"
          />
          <OrganicShape
            className="absolute bottom-0 left-0 w-[600px] h-[600px] text-cyan-200 dark:text-cyan-900 opacity-20 -rotate-12"
            type="blob2"
          />
        </>
      )}
    
      {/* About Hero Section */}
      <section className="relative py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="relative inline-block px-4 py-1 mb-4 rounded-full bg-blue-100 dark:bg-blue-900/40 backdrop-blur-sm">
                <span className="relative z-10 text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  About EventVibe
                </span>
              </span>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                Our Story
              </h1>
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
                Experience a new way to discover, share, and manage events with our innovative platform built for seamless event management.
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <GlassmorphicCard className="p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full -ml-20 -mb-20"></div>
                
                <h2 className="text-2xl font-bold mb-4 relative z-10">About the Project</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4 relative z-10">
                  EventVibe is a comprehensive event management platform designed to streamline the entire event process. 
                  From creating and discovering events to registration and real-time updates, our application offers a 
                  seamless experience for both event organizers and attendees.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3 relative z-10">Key Features</h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 relative z-10">
                  <li className="flex items-start">
                    <Calendar className="mr-2 h-5 w-5 text-blue-500 mt-0.5" />
                    <span>Real-time event updates and notifications</span>
                  </li>
                  <li className="flex items-start">
                    <User className="mr-2 h-5 w-5 text-blue-500 mt-0.5" />
                    <span>User-friendly registration and management</span>
                  </li>
                  <li className="flex items-start">
                    <MessageSquare className="mr-2 h-5 w-5 text-blue-500 mt-0.5" />
                    <span>Interactive user interface with responsive design</span>
                  </li>
                  <li className="flex items-start">
                    <Code className="mr-2 h-5 w-5 text-blue-500 mt-0.5" />
                    <span>Built with Next.js, React, and modern web technologies</span>
                  </li>
                </ul>
              </GlassmorphicCard>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <GlassmorphicCard className="p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-40 h-40 bg-cyan-500/10 rounded-full -ml-20 -mt-20"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full -mr-20 -mb-20"></div>
                
                <div className="flex justify-center mb-6">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 p-1">
                    <div className="bg-white dark:bg-gray-900 rounded-full w-full h-full flex items-center justify-center text-4xl font-bold text-blue-600">
                      AM
                    </div>
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold mb-4 text-center relative z-10">Agegnew Mersha</h2>
                <p className="text-center text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 relative z-10">
                  Full Stack Developer | 42 Student
                </p>
                
                <p className="text-gray-700 dark:text-gray-300 mb-6 relative z-10">
                  I'm a passionate full-stack developer with a focus on creating intuitive and innovative web applications.
                  As a student at 42, I've honed my skills through rigorous peer-to-peer learning and hands-on projects,
                  developing strong problem-solving abilities and a deep understanding of software architecture.
                </p>
                
                <div className="flex justify-center space-x-4 relative z-10">
                  <Link href="https://github.com/" target="_blank" rel="noopener noreferrer" 
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                    <Github className="h-5 w-5" />
                  </Link>
                  <Link href="https://linkedin.com/" target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                    <Linkedin className="h-5 w-5" />
                  </Link>
                  <Link href="https://42.fr/" target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                    <BookOpen className="h-5 w-5" />
                  </Link>
                </div>
              </GlassmorphicCard>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Technologies Section */}
      <section className="relative py-16 md:py-24">
        <div className="container mx-auto px-4">
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
                  Tech Stack
                </span>
              </span>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                Built with Modern Technologies
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                EventVibe is crafted using cutting-edge technologies for optimal performance and user experience
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              { name: "Next.js", description: "React framework for production" },
              { name: "React", description: "UI component library" },
              { name: "TypeScript", description: "Type-safe JavaScript" },
              { name: "Tailwind CSS", description: "Utility-first CSS framework" },
              { name: "Framer Motion", description: "Animation library" },
              { name: "IndexedDB", description: "Client-side storage" },
              { name: "BroadcastChannel API", description: "Cross-tab communication" },
              { name: "Service Workers", description: "Offline capabilities" }
            ].map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <GlassmorphicCard className="p-6 h-full flex flex-col items-center justify-center text-center hover:scale-105 transition-all duration-300">
                  <h3 className="font-bold text-lg mb-2">{tech.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{tech.description}</p>
                </GlassmorphicCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Conclusion Section */}
      <section className="relative py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Ready to Experience EventVibe?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Join our platform today and discover a new way to connect with events that match your interests.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <NeumorphicButton asChild>
                <Link href="/events">Explore Events</Link>
              </NeumorphicButton>
              <NeumorphicButton asChild variant="secondary">
                <Link href="/contact">Contact Us</Link>
              </NeumorphicButton>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
} 