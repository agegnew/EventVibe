"use client"

import { motion } from "framer-motion"
import { GlassmorphicCard } from "@/components/ui-elements/glassmorphic-card"
import { AdminSidebar } from "@/components/admin-sidebar"
import { OrganicShape } from "@/components/ui-elements/organic-shape"
import { Menu } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex min-h-screen bg-mesh-gradient dark:from-gray-900 dark:to-gray-800 relative overflow-hidden animated-bg">
      {/* Background elements */}
      <div className="floating-orbs orb-1"></div>
      <div className="floating-orbs orb-2"></div>
      
      <OrganicShape
        className="absolute top-0 right-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] text-blue-200 dark:text-blue-900 opacity-30 rotate-45"
        type="blob1"
      />
      <OrganicShape
        className="absolute bottom-0 left-0 w-[350px] md:w-[500px] h-[350px] md:h-[500px] text-purple-200 dark:text-purple-900 opacity-30 -rotate-45"
        type="blob2"
      />

      {/* Admin Sidebar - Hidden on mobile */}
      <div className="hidden md:block w-64 bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border-r border-blue-100/50 dark:border-blue-900/30"></div>

      {/* Main Content Loading State */}
      <div className="flex-1 p-6 md:p-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 md:space-y-8"
        >
          {/* Mobile Header placeholder */}
          <div className="flex items-center justify-between md:hidden mb-6">
            <div className="w-10 h-10 rounded-md bg-gray-200/70 dark:bg-gray-700/40 animate-pulse"></div>
            <div className="h-8 w-48 bg-gradient-to-r from-blue-200/70 to-blue-100/40 dark:from-blue-800/40 dark:to-blue-900/30 rounded-lg animate-pulse"></div>
          </div>
          
          {/* Header placeholder */}
          <div className="h-8 md:h-12 w-48 md:w-60 bg-gradient-to-r from-blue-200/70 to-blue-100/40 dark:from-blue-800/40 dark:to-blue-900/30 rounded-lg animate-pulse"></div>
          
          {/* Stats Cards placeholders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-4 md:mb-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <GlassmorphicCard key={index} className="p-4 md:p-6 min-h-[100px] animate-pulse">
                <div className="flex items-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-blue-200/70 dark:bg-blue-800/40 mr-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 md:h-4 w-16 md:w-20 bg-gray-200/70 dark:bg-gray-700/40 rounded"></div>
                    <div className="h-5 md:h-6 w-14 md:w-16 bg-gray-300/70 dark:bg-gray-600/40 rounded"></div>
                  </div>
                </div>
              </GlassmorphicCard>
            ))}
          </div>
          
          {/* Charts placeholders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
            {Array.from({ length: 2 }).map((_, index) => (
              <GlassmorphicCard key={index} className="p-4 md:p-6">
                <div className="h-5 md:h-6 w-32 md:w-40 bg-gray-200/70 dark:bg-gray-700/40 rounded mb-4"></div>
                <div className="h-[200px] md:h-[300px] bg-gradient-to-br from-blue-100/30 to-purple-100/20 dark:from-blue-900/20 dark:to-purple-900/10 rounded-lg animate-pulse"></div>
              </GlassmorphicCard>
            ))}
          </div>
          
          {/* Table placeholder */}
          <GlassmorphicCard className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-4">
              <div className="h-5 md:h-6 w-32 md:w-40 bg-gray-200/70 dark:bg-gray-700/40 rounded"></div>
              <div className="h-8 md:h-10 w-full sm:w-24 bg-blue-200/70 dark:bg-blue-800/40 rounded-lg"></div>
            </div>
            <div className="space-y-4 overflow-x-auto">
              <div className="h-10 w-full min-w-[600px] bg-gray-100/60 dark:bg-gray-800/30 rounded-lg"></div>
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-12 md:h-16 w-full min-w-[600px] bg-white/40 dark:bg-gray-700/20 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </GlassmorphicCard>
        </motion.div>
      </div>
    </div>
  )
}
