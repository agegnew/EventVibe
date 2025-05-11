"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Sun, Moon, Calendar, User, LogOut } from "lucide-react"
import { useTheme } from "next-themes"
import { NeumorphicButton } from "@/components/ui-elements/neumorphic-button"
import { GlassmorphicCard } from "@/components/ui-elements/glassmorphic-card"
import { useAuth } from "@/hooks/use-auth"
import { NotificationBell } from "@/components/notification-bell"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const { isLoggedIn, isAdmin, user, logout } = useAuth()

  // Check if the current path is admin
  const isAdminPage = pathname.startsWith("/admin")

  const handleScrollRef = useRef(() => {
    setIsScrolled(window.scrollY > 10)
  })

  useEffect(() => {
    // Only add scroll event listener if not on admin page
    if (!isAdminPage) {
      const handleScroll = () => {
        handleScrollRef.current()
      }

      window.addEventListener("scroll", handleScroll)
      return () => window.removeEventListener("scroll", handleScroll)
    }
  }, [isAdminPage])

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Events", href: "/events" },
    ...(isLoggedIn ? [{ name: "Dashboard", href: "/dashboard" }] : []),
    { name: "About", href: "#" },
    { name: "Contact", href: "#" },
  ]

  const handleLogout = () => {
    // Close mobile menu first if open
    setIsMobileMenuOpen(false);
    
    // Add a small delay for better UX
    setTimeout(() => {
      // Call the logout function directly
      logout();
      // No need for any redirect as the logout function now handles this
    }, 100);
  };

  const headerVariants = {
    scrolled: {
      height: 70,
      backdropFilter: "blur(10px)",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
    },
    top: {
      height: 90,
      backdropFilter: "blur(0px)",
      boxShadow: "none",
    }
  };

  // Don't show header on admin pages
  if (isAdminPage) {
    return null
  }

  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8"
      initial="top"
      animate={isScrolled ? "scrolled" : "top"}
      variants={headerVariants}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto mt-6">
        <GlassmorphicCard 
          className={`w-full px-4 py-2 flex items-center transition-all duration-300 
            ${isScrolled ? 'bg-white/80 dark:bg-gray-900/80' : 'bg-white/40 dark:bg-gray-900/40'}`}
          borderGlow={true}
        >
          <div className="container mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center group">
              <div className="relative w-10 h-10 flex items-center justify-center mr-2 bg-blue-600/10 dark:bg-blue-400/10 rounded-full overflow-hidden transition-transform group-hover:scale-110">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110" />
                <div className="absolute inset-0 bg-blue-600/5 dark:bg-blue-400/5 rounded-full transform scale-0 group-hover:scale-100 transition-transform"></div>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 cursor-highlight">
                EventVibe
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all relative cursor-highlight ${
                    pathname === item.href
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  }`}
                >
                  {item.name}
                  {pathname === item.href && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Toggle theme"
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1 }}
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </motion.button>

              {isLoggedIn && <div className="relative"><NotificationBell /></div>}

              <div className="hidden md:flex items-center gap-2">
                {isLoggedIn ? (
                  <>
                    {isAdmin && (
                      <NeumorphicButton asChild variant="outline" className="hover-float">
                        <Link href="/admin">Admin</Link>
                      </NeumorphicButton>
                    )}
                    <NeumorphicButton asChild variant="outline" className="hover-float group">
                      <Link href="/dashboard" className="flex items-center">
                        {user?.avatar && (
                          <img 
                            src={user.avatar} 
                            alt={user?.name || "User"} 
                            className="h-6 w-6 rounded-full mr-2 object-cover border border-gray-200 dark:border-gray-700"
                          />
                        )}
                        {!user?.avatar && <User className="h-4 w-4 mr-1" />}
                        <span>{user?.name || user?.email || "User"}</span>
                      </Link>
                    </NeumorphicButton>
                    <NeumorphicButton onClick={handleLogout} className="hover-float">
                      <LogOut className="h-4 w-4 mr-1" />
                      Logout
                    </NeumorphicButton>
                  </>
                ) : (
                  <>
                    <NeumorphicButton asChild variant="outline" className="hover-float">
                      <Link href="/login">Sign In</Link>
                    </NeumorphicButton>
                    <NeumorphicButton asChild className="hover-float">
                      <Link href="/signup">Sign Up</Link>
                    </NeumorphicButton>
                  </>
                )}
              </div>

              <motion.button
                className="md:hidden p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1 }}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </motion.button>
            </div>
          </div>
        </GlassmorphicCard>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden dropdown-animation"
          >
            <div className="max-w-7xl mx-auto mt-2">
              <GlassmorphicCard className="mx-4 p-4" borderGlow={true}>
                <nav className="flex flex-col space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        pathname === item.href
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    {isLoggedIn ? (
                      <>
                        {isAdmin && (
                          <NeumorphicButton asChild variant="outline">
                            <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>Admin</Link>
                          </NeumorphicButton>
                        )}
                        <NeumorphicButton asChild variant="outline">
                          <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                            {user?.avatar && (
                              <img 
                                src={user.avatar} 
                                alt={user?.name || "User"} 
                                className="h-6 w-6 rounded-full mr-2 object-cover border border-gray-200 dark:border-gray-700"
                              />
                            )}
                            {!user?.avatar && <User className="h-4 w-4 mr-1" />}
                            <span>{user?.name || user?.email || "User"}</span>
                          </Link>
                        </NeumorphicButton>
                        <NeumorphicButton onClick={handleLogout}>
                          <LogOut className="h-4 w-4 mr-1" />
                          Logout
                        </NeumorphicButton>
                      </>
                    ) : (
                      <>
                        <NeumorphicButton asChild variant="outline">
                          <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                        </NeumorphicButton>
                        <NeumorphicButton asChild>
                          <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
                        </NeumorphicButton>
                      </>
                    )}
                  </div>
                </nav>
              </GlassmorphicCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
