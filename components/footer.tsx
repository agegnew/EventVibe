"use client"

import Link from "next/link"
import { Calendar, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"
import { GlassmorphicCard } from "@/components/ui-elements/glassmorphic-card"
import { NeumorphicButton } from "@/components/ui-elements/neumorphic-button"
import { NeumorphicInput } from "@/components/ui-elements/neumorphic-input"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"

export function Footer() {
  const pathname = usePathname()

  // Don't show footer on admin pages
  if (pathname.startsWith("/admin")) {
    return null
  }

  const socialIcons = [
    { icon: Facebook, href: "#" },
    { icon: Twitter, href: "#" },
    { icon: Instagram, href: "#" },
    { icon: Linkedin, href: "#" },
  ]

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Events", href: "/events" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "About Us", href: "#" },
    { name: "Contact", href: "#" },
  ]

  const legalLinks = [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Cookie Policy", href: "#" },
  ]

  const contactInfo = [
    { icon: MapPin, content: "123 Event Street, San Francisco, CA 94103" },
    { icon: Phone, content: "+1 (555) 123-4567" },
    { icon: Mail, content: "info@eventvibe.com" },
  ]

  return (
    <footer className="bg-mesh-gradient pt-20 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="floating-orbs orb-1 opacity-10"></div>
      <div className="floating-orbs orb-3 opacity-10"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <GlassmorphicCard className="p-8 mb-8" borderGlow={true}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center mb-4 group">
                  <div className="relative w-10 h-10 flex items-center justify-center mr-2 bg-blue-600/10 dark:bg-blue-400/10 rounded-full overflow-hidden transition-transform group-hover:scale-110">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110" />
                  </div>
                  <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                    EventVibe
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Discover, register, and attend the most exciting events around the world with our immersive platform.
                </p>
                <div className="flex space-x-3">
                  {socialIcons.map((social, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Link
                        href={social.href}
                        className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        aria-label={`Follow on ${social.icon.name}`}
                      >
                        <social.icon className="h-4 w-4" />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4 text-gradient">Quick Links</h3>
                <ul className="space-y-2">
                  {quickLinks.map((link, index) => (
                    <li key={index}>
                      <Link
                        href={link.href}
                        className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 cursor-highlight inline-block"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4 text-gradient">Contact Us</h3>
                <ul className="space-y-3">
                  {contactInfo.map((item, index) => (
                    <li key={index} className="flex items-start group">
                      <div className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 group-hover:scale-110 transition-transform">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <span className="text-gray-600 dark:text-gray-400">{item.content}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4 text-gradient">Subscribe</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Subscribe to our newsletter to get updates on events and offers.
                </p>
                <form className="space-y-2">
                  <NeumorphicInput 
                    placeholder="Enter your email" 
                    icon={<Mail className="h-4 w-4" />} 
                    className="modern-input"
                  />
                  <NeumorphicButton className="w-full group">
                    <span className="group-hover:text-gradient transition-all">Subscribe</span>
                  </NeumorphicButton>
                </form>
              </div>
            </div>
          </GlassmorphicCard>
        </motion.div>

        <div className="py-6 text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} EventVibe. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            {legalLinks.map((link, index) => (
              <Link 
                key={index} 
                href={link.href} 
                className="hover:text-blue-600 dark:hover:text-blue-400 cursor-highlight"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
