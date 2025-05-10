"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Calendar, Users, DollarSign, Plus, Search, Filter, MoreHorizontal, Edit, Trash2, ArrowUp, TrendingUp, Menu } from "lucide-react"
import { GlassmorphicCard } from "@/components/ui-elements/glassmorphic-card"
import { NeumorphicButton } from "@/components/ui-elements/neumorphic-button"
import { NeumorphicInput } from "@/components/ui-elements/neumorphic-input"
import { NeumorphicTabsContent } from "@/components/ui-elements/neumorphic-tabs"
import { OrganicShape } from "@/components/ui-elements/organic-shape"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminChart } from "@/components/admin-chart"
import { EventManager } from "@/components/admin/event-manager"
import { UserManager } from "@/components/admin/user-manager"
import { getAllEvents, getAllUsers } from "@/lib/data-service"

// Sample events data
const events = [
  {
    id: "1",
    title: "Tech Conference 2025",
    date: "May 15-17, 2025",
    location: "San Francisco, CA",
    registrations: 850,
    revenue: 254150,
    status: "Active",
  },
  {
    id: "2",
    title: "Design Summit",
    date: "June 10-12, 2025",
    location: "New York, NY",
    registrations: 620,
    revenue: 154380,
    status: "Active",
  },
  {
    id: "3",
    title: "Marketing Expo",
    date: "July 5-7, 2025",
    location: "Chicago, IL",
    registrations: 410,
    revenue: 81590,
    status: "Draft",
  },
  {
    id: "4",
    title: "AI Workshop",
    date: "August 20, 2025",
    location: "Austin, TX",
    registrations: 280,
    revenue: 55720,
    status: "Draft",
  },
  {
    id: "5",
    title: "Product Management Summit",
    date: "September 15-17, 2025",
    location: "Seattle, WA",
    registrations: 0,
    revenue: 0,
    status: "Upcoming",
  },
]

// Removed hardcoded sample users data as we're loading real users from data-service

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  
  // Dashboard stats state
  const [eventCount, setEventCount] = useState(0)
  const [userCount, setUserCount] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [activeEventCount, setActiveEventCount] = useState(0)

  // Load dashboard data
  useEffect(() => {
    async function loadDashboardData() {
      try {
        const events = await getAllEvents()
        const users = await getAllUsers()
        
        setEventCount(events.length)
        setUserCount(users.length)
        
        const revenue = events.reduce((sum, event) => sum + event.revenue, 0)
        setTotalRevenue(revenue)
        
        const activeEvents = events.filter(event => event.status === "Active")
        setActiveEventCount(activeEvents.length)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      }
    }
    
    loadDashboardData()
  }, [])

  // Defer animations until after page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex min-h-screen bg-mesh-gradient dark:from-gray-900 dark:to-gray-800 relative overflow-hidden animated-bg">
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
            className="absolute top-0 right-0 w-[600px] h-[600px] text-blue-200 dark:text-blue-900 opacity-30 rotate-45"
            type="blob1"
          />
          <OrganicShape
            className="absolute bottom-0 left-0 w-[500px] h-[500px] text-purple-200 dark:text-purple-900 opacity-30 -rotate-45"
            type="blob2"
          />
        </>
      )}

      {/* Admin Sidebar */}
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-8 overflow-auto relative z-10 w-full">
        {/* Mobile Header with Menu Toggle */}
        <div className="flex items-center justify-between md:hidden mb-6">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-md bg-white/30 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 title-3d">EventVibe Admin</h1>
        </div>
        
        <NeumorphicTabsContent id="dashboard" activeTab={activeTab}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 title-3d">Admin Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              {[
                {
                  title: "Total Events",
                  value: eventCount.toString(),
                  change: "+12%",
                  trend: "up",
                  icon: Calendar,
                  color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
                  borderColor: "border-blue-200 dark:border-blue-800/50",
                  glowColor: "shadow-blue-200/20 dark:shadow-blue-500/10"
                },
                {
                  title: "Total Users",
                  value: userCount.toString(),
                  change: "+28%",
                  trend: "up",
                  icon: Users,
                  color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
                  borderColor: "border-green-200 dark:border-green-800/50",
                  glowColor: "shadow-green-200/20 dark:shadow-green-500/10"
                },
                {
                  title: "Total Revenue",
                  value: `$${totalRevenue.toLocaleString()}`,
                  change: "+18%",
                  trend: "up",
                  icon: DollarSign,
                  color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
                  borderColor: "border-purple-200 dark:border-purple-800/50",
                  glowColor: "shadow-purple-200/20 dark:shadow-purple-500/10"
                },
                {
                  title: "Active Events",
                  value: activeEventCount.toString(),
                  change: "+5%",
                  trend: "up",
                  icon: Calendar,
                  color: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
                  borderColor: "border-orange-200 dark:border-orange-800/50",
                  glowColor: "shadow-orange-200/20 dark:shadow-orange-500/10"
                },
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <GlassmorphicCard className={`p-6 border ${stat.borderColor} transition-all hover:shadow-lg ${stat.glowColor}`} borderGlow={true}>
                    <div className="flex items-center mb-2">
                      <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mr-4`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                        <h3 className="text-2xl font-bold">{stat.value}</h3>
                      </div>
                    </div>
                    <div className="flex items-center justify-end space-x-1 text-xs">
                      <span className={`${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {stat.change}
                      </span>
                      {stat.trend === 'up' ? (
                        <ArrowUp className="w-3 h-3 text-green-500" />
                      ) : (
                        <ArrowUp className="w-3 h-3 text-red-500 transform rotate-180" />
                      )}
                      <span className="text-gray-500 dark:text-gray-400">this month</span>
                    </div>
                  </GlassmorphicCard>
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <GlassmorphicCard className="p-6 border border-blue-100/50 dark:border-blue-800/30" borderGlow={true}>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">Revenue Overview</h2>
                    <div className="flex gap-2">
                      <NeumorphicButton size="sm" variant="outline">Weekly</NeumorphicButton>
                      <NeumorphicButton size="sm">Monthly</NeumorphicButton>
                    </div>
                  </div>
                  <div className="h-[300px]">
                    <AdminChart type="bar" />
                  </div>
                </GlassmorphicCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <GlassmorphicCard className="p-6 border border-purple-100/50 dark:border-purple-800/30" borderGlow={true}>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-500">Event Categories</h2>
                    <NeumorphicButton size="sm" variant="outline">
                      <Filter className="w-4 h-4 mr-1" />
                      Filter
                    </NeumorphicButton>
                  </div>
                  <div className="h-[300px]">
                    <AdminChart type="pie" />
                  </div>
                </GlassmorphicCard>
              </motion.div>
            </div>
          </motion.div>
        </NeumorphicTabsContent>

        <NeumorphicTabsContent id="events" activeTab={activeTab}>
          <EventManager />
        </NeumorphicTabsContent>

        <NeumorphicTabsContent id="users" activeTab={activeTab}>
          <UserManager />
        </NeumorphicTabsContent>

        <NeumorphicTabsContent id="analytics" activeTab={activeTab}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 title-3d">Analytics</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <GlassmorphicCard className="p-6 border border-blue-100/50 dark:border-blue-800/30" borderGlow={true}>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">Revenue Trends</h2>
                    <div className="flex gap-2">
                      <NeumorphicButton size="sm" variant="outline">Q1</NeumorphicButton>
                      <NeumorphicButton size="sm" variant="outline">Q2</NeumorphicButton>
                      <NeumorphicButton size="sm">Q3</NeumorphicButton>
                    </div>
                  </div>
                  <div className="h-[300px]">
                    <AdminChart type="line" />
                  </div>
                </GlassmorphicCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <GlassmorphicCard className="p-6 border border-indigo-100/50 dark:border-indigo-800/30" borderGlow={true}>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">User Growth</h2>
                    <NeumorphicButton size="sm" variant="outline">
                      <Filter className="w-4 h-4 mr-1" />
                      Filter
                    </NeumorphicButton>
                  </div>
                  <div className="h-[300px]">
                    <AdminChart type="area" />
                  </div>
                </GlassmorphicCard>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <GlassmorphicCard className="p-6 border border-purple-100/50 dark:border-purple-800/30" borderGlow={true}>
                  <h2 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-500">Event Categories</h2>
                  <div className="h-[250px]">
                    <AdminChart type="pie" />
                  </div>
                </GlassmorphicCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <GlassmorphicCard className="p-6 border border-blue-100/50 dark:border-blue-800/30" borderGlow={true}>
                  <h2 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">Registrations by Location</h2>
                  <div className="h-[250px]">
                    <AdminChart type="bar" />
                  </div>
                </GlassmorphicCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <GlassmorphicCard className="p-6 border border-cyan-100/50 dark:border-cyan-800/30" borderGlow={true}>
                  <h2 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-500">User Demographics</h2>
                  <div className="h-[250px]">
                    <AdminChart type="donut" />
                  </div>
                </GlassmorphicCard>
              </motion.div>
            </div>
          </motion.div>
        </NeumorphicTabsContent>
      </div>
      
      {/* Add styled scrollbar CSS and responsive styles */}
      <style jsx global>{`
        .styled-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .styled-scrollbar::-webkit-scrollbar-track {
          background: rgba(226, 232, 240, 0.3);
          border-radius: 10px;
        }
        .styled-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 10px;
        }
        .styled-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
        @media (prefers-color-scheme: dark) {
          .styled-scrollbar::-webkit-scrollbar-track {
            background: rgba(30, 41, 59, 0.5);
          }
        }
        .animated-bg {
          background-size: 400% 400%;
          animation: gradient 15s ease infinite;
        }
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .title-3d {
          text-shadow: 0px 1px 1px rgba(0, 0, 0, 0.1);
        }
        .floating-orbs {
          position: absolute;
          border-radius: 50%;
          opacity: 0.2;
          filter: blur(80px);
          z-index: 0;
        }
        .orb-1 {
          width: 300px;
          height: 300px;
          top: -100px;
          right: 5%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, rgba(147, 51, 234, 0.5) 100%);
          animation: float 20s infinite ease-in-out;
        }
        .orb-2 {
          width: 250px;
          height: 250px;
          bottom: 10%;
          left: 5%;
          background: radial-gradient(circle, rgba(79, 70, 229, 0.8) 0%, rgba(16, 185, 129, 0.5) 100%);
          animation: float 15s infinite ease-in-out reverse;
        }
        .orb-3 {
          width: 200px;
          height: 200px;
          top: 40%;
          left: 25%;
          background: radial-gradient(circle, rgba(249, 115, 22, 0.6) 0%, rgba(139, 92, 246, 0.5) 100%);
          animation: float 18s infinite ease-in-out 2s;
        }
        @keyframes float {
          0% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(2%, 3%) rotate(5deg); }
          66% { transform: translate(-2%, -3%) rotate(-5deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        
        /* Responsive table styles */
        @media (max-width: 640px) {
          td, th {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }
        }
      `}</style>
    </div>
  )
}
