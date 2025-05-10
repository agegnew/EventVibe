"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Calendar, Clock, MapPin, Ticket, Settings, Bell, LogOut, User, Grid, List, Upload } from "lucide-react"
import { GlassmorphicCard } from "@/components/ui-elements/glassmorphic-card"
import { NeumorphicButton } from "@/components/ui-elements/neumorphic-button"
import { NeumorphicTabs, NeumorphicTabsContent } from "@/components/ui-elements/neumorphic-tabs"
import { OrganicShape } from "@/components/ui-elements/organic-shape"
import { Calendar3D } from "@/components/calendar-3d"
import { SimpleCalendar } from "@/components/simple-calendar"
import { UserAvatar } from "@/components/user-avatar"
import { useAuth } from "@/hooks/use-auth"

// Sample upcoming events
const upcomingEvents = [
  {
    id: "1",
    title: "Tech Conference 2025",
    date: "May 15-17, 2025",
    time: "9:00 AM - 6:00 PM",
    location: "San Francisco, CA",
    image: "/placeholder.svg?height=400&width=600",
    ticketType: "VIP Pass",
  },
  {
    id: "2",
    title: "Design Summit",
    date: "June 10-12, 2025",
    time: "10:00 AM - 5:00 PM",
    location: "New York, NY",
    image: "/placeholder.svg?height=400&width=600",
    ticketType: "General Admission",
  },
]

// Sample past events
const pastEvents = [
  {
    id: "3",
    title: "Marketing Expo",
    date: "March 5-7, 2025",
    time: "9:00 AM - 5:00 PM",
    location: "Chicago, IL",
    image: "/placeholder.svg?height=400&width=600",
    ticketType: "General Admission",
  },
  {
    id: "4",
    title: "AI Workshop",
    date: "February 15, 2025",
    time: "10:00 AM - 4:00 PM",
    location: "Austin, TX",
    image: "/placeholder.svg?height=400&width=600",
    ticketType: "Workshop Pass",
  },
]

// Sample recommended events
const recommendedEvents = [
  {
    id: "5",
    title: "Web Development Conference",
    date: "August 20-22, 2025",
    location: "Seattle, WA",
    image: "/placeholder.svg?height=400&width=600",
    price: 249,
  },
  {
    id: "6",
    title: "UX/UI Design Masterclass",
    date: "September 15, 2025",
    location: "Portland, OR",
    image: "/placeholder.svg?height=400&width=600",
    price: 199,
  },
  {
    id: "7",
    title: "Product Management Summit",
    date: "October 10-12, 2025",
    location: "Denver, CO",
    image: "/placeholder.svg?height=400&width=600",
    price: 299,
  },
]

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("upcoming")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldUseSimpleCalendar, setShouldUseSimpleCalendar] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Defer non-critical animations until after page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Check if we should use the simple calendar instead of 3D version
  useEffect(() => {
    // Check if browser supports WebGL which is needed for three.js/R3F
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) {
        setShouldUseSimpleCalendar(true);
        return;
      }
      
      // Set a timeout to show fallback if Calendar3D takes too long to load
      const timer = setTimeout(() => {
        // If no canvas is rendered by then, use simple calendar
        if (!document.querySelector('canvas')) {
          setShouldUseSimpleCalendar(true);
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    } catch (e) {
      setShouldUseSimpleCalendar(true);
    }
  }, []);

  // Handle image selection
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !user) return;
    
    try {
      setIsUploading(true);
      setUploadError(null);
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Upload the image
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('userId', user.id);
      
      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update avatar');
      }
      
      // Update was successful, could refresh user data here if needed
      
    } catch (error: any) {
      console.error('Error updating avatar:', error);
      setUploadError(error.message || 'Failed to update avatar');
      // Revert preview
      setImagePreview(null);
    } finally {
      setIsUploading(false);
      setImageFile(null);
    }
  };

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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <GlassmorphicCard className="p-4 sm:p-6 sticky top-24" borderGlow={true}>
                <div className="flex flex-col items-center mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="mb-3 sm:mb-4 relative group">
                    <div className="relative">
                      <UserAvatar 
                        src={imagePreview || user?.avatar || "/default.png"} 
                        alt={user?.name || "User"} 
                        size={80}
                        className="bg-purple-100 dark:bg-purple-900/30"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}>
                        <Upload className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-25 rounded-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                  {uploadError && <p className="text-xs text-red-500 mb-2">{uploadError}</p>}
                  <h2 className="text-lg sm:text-xl font-bold">{user?.name || "User"}</h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{user?.email || "user@example.com"}</p>
                </div>

                <nav className="space-y-2">
                  <NeumorphicButton className="w-full justify-start text-sm sm:text-base" variant="default">
                    <Ticket className="w-4 h-4 mr-2" />
                    My Events
                  </NeumorphicButton>
                  <NeumorphicButton className="w-full justify-start text-sm sm:text-base" variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Calendar
                  </NeumorphicButton>
                  <NeumorphicButton className="w-full justify-start text-sm sm:text-base" variant="outline">
                    <Bell className="w-4 h-4 mr-2" />
                    Notifications
                  </NeumorphicButton>
                  <NeumorphicButton className="w-full justify-start text-sm sm:text-base" variant="outline">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </NeumorphicButton>
                  <NeumorphicButton className="w-full justify-start text-sm sm:text-base" variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </NeumorphicButton>
                  <NeumorphicButton className="w-full justify-start text-sm sm:text-base" variant="outline">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </NeumorphicButton>
                </nav>
              </GlassmorphicCard>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 title-3d">My Dashboard</h1>
                <div className="flex items-center gap-2">
                  <NeumorphicButton
                    size="sm"
                    variant={viewMode === "grid" ? "default" : "outline"}
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="w-4 h-4" />
                  </NeumorphicButton>
                  <NeumorphicButton
                    size="sm"
                    variant={viewMode === "list" ? "default" : "outline"}
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </NeumorphicButton>
                </div>
              </div>

              {/* Calendar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-8"
              >
                <GlassmorphicCard 
                  className="p-4 overflow-hidden" 
                  borderGlow={true}
                >
                  <h2 className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
                    Event Calendar
                  </h2>
                  <div className="h-[450px] md:h-[500px] lg:h-[420px] overflow-hidden">
                    {shouldUseSimpleCalendar ? (
                      <SimpleCalendar />
                    ) : (
                      <Calendar3D />
                    )}
                  </div>
                </GlassmorphicCard>
              </motion.div>

              {/* Events Tabs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <NeumorphicTabs
                  tabs={[
                    { id: "upcoming", label: "Upcoming Events" },
                    { id: "past", label: "Past Events" },
                    { id: "recommended", label: "Recommended" },
                  ]}
                  activeTab={activeTab}
                  onChange={setActiveTab}
                />

                <NeumorphicTabsContent id="upcoming" activeTab={activeTab}>
                  <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-4"}>
                    {upcomingEvents.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <GlassmorphicCard key={event.id} className={`overflow-hidden ${viewMode === "grid" ? "" : "flex"}`} borderGlow={true}>
                          <div className={viewMode === "grid" ? "" : "flex"}>
                            <div className={`${viewMode === "grid" ? "w-full h-48" : "w-48 h-full"} relative`}>
                              <Image
                                src={event.image || "/placeholder.svg"}
                                alt={event.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="p-6">
                              <div className="inline-block px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs rounded mb-2">
                                {event.ticketType}
                              </div>
                              <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  <span>{event.date}</span>
                                </div>
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-2" />
                                  <span>{event.time}</span>
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-2" />
                                  <span>{event.location}</span>
                                </div>
                              </div>
                              <div className="mt-4 flex gap-2">
                                <NeumorphicButton asChild size="sm">
                                  <Link href={`/events/${event.id}`}>View Details</Link>
                                </NeumorphicButton>
                                <NeumorphicButton variant="outline" size="sm">
                                  <Ticket className="w-4 h-4 mr-1" /> Ticket
                                </NeumorphicButton>
                              </div>
                            </div>
                          </div>
                        </GlassmorphicCard>
                      </motion.div>
                    ))}
                  </div>
                </NeumorphicTabsContent>

                <NeumorphicTabsContent id="past" activeTab={activeTab}>
                  <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-4"}>
                    {pastEvents.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <GlassmorphicCard key={event.id} className={`overflow-hidden ${viewMode === "grid" ? "" : "flex"}`} borderGlow={true}>
                          <div className={viewMode === "grid" ? "" : "flex"}>
                            <div className={`${viewMode === "grid" ? "w-full h-48" : "w-48 h-full"} relative`}>
                              <Image
                                src={event.image || "/placeholder.svg"}
                                alt={event.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="p-6">
                              <div className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded mb-2">
                                {event.ticketType}
                              </div>
                              <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  <span>{event.date}</span>
                                </div>
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-2" />
                                  <span>{event.time}</span>
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-2" />
                                  <span>{event.location}</span>
                                </div>
                              </div>
                              <div className="mt-4">
                                <NeumorphicButton asChild size="sm">
                                  <Link href={`/events/${event.id}`}>View Details</Link>
                                </NeumorphicButton>
                              </div>
                            </div>
                          </div>
                        </GlassmorphicCard>
                      </motion.div>
                    ))}
                  </div>
                </NeumorphicTabsContent>

                <NeumorphicTabsContent id="recommended" activeTab={activeTab}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {recommendedEvents.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <GlassmorphicCard className="overflow-hidden h-full flex flex-col" borderGlow={true}>
                          <div className="relative h-48">
                            <Image
                              src={event.image || "/placeholder.svg"}
                              alt={event.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="p-6 flex-1 flex flex-col">
                            <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 flex-1">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>{event.date}</span>
                              </div>
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2" />
                                <span>{event.location}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="font-semibold">${event.price}</span>
                              </div>
                            </div>
                            <div className="mt-4">
                              <NeumorphicButton asChild size="sm" className="w-full">
                                <Link href={`/events/${event.id}`}>View Details</Link>
                              </NeumorphicButton>
                            </div>
                          </div>
                        </GlassmorphicCard>
                      </motion.div>
                    ))}
                  </div>
                </NeumorphicTabsContent>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  )
}
