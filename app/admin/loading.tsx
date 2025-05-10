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
        className="absolute bottom-0 left-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] text-purple-200 dark:text-purple-900 opacity-30 -rotate-45"
        type="blob2"
      />

      {/* Static Sidebar */}
      <div className="hidden md:block md:w-64 lg:w-72 p-6 shrink-0 z-10">
        <div className="h-full">
          <GlassmorphicCard 
            className="w-full h-full p-6 border border-blue-100/50 dark:border-blue-800/30"
            borderGlow={true}
          >
            <div className="h-full flex flex-col">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-500 animate-pulse"></div>
                <div className="h-7 w-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-md animate-pulse"></div>
              </div>
              
              <div className="space-y-2 flex-1">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="flex items-center p-3 rounded-lg">
                    <div className="w-5 h-5 rounded-md bg-gray-300 dark:bg-gray-700 mr-3 animate-pulse"></div>
                    <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
              
              <div className="pt-6 mt-auto">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-3 w-16 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-3 w-24 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </GlassmorphicCard>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-8 overflow-auto z-10 w-full">
        {/* Mobile Header */}
        <div className="flex items-center justify-between md:hidden mb-6">
          <button className="p-2 rounded-md bg-white/30 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300">
            <Menu className="h-6 w-6" />
          </button>
          <div className="h-7 w-40 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-md animate-pulse"></div>
        </div>

        {/* Shimmer Content */}
        <div className="mb-6 md:mb-8">
          <div className="h-8 w-64 md:w-80 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-md animate-pulse mb-6 md:mb-8"></div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {[1, 2, 3, 4].map((item) => (
              <GlassmorphicCard key={item} className="p-6 border border-blue-100/50 dark:border-blue-800/30" borderGlow={true}>
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-4">
                    <div className="w-5 h-5 bg-blue-500 rounded animate-pulse"></div>
                  </div>
                  <div>
                    <div className="h-3 w-20 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                    <div className="h-5 w-16 bg-gray-400 dark:bg-gray-600 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="h-3 w-12 bg-green-300 dark:bg-green-700 rounded animate-pulse"></div>
                </div>
              </GlassmorphicCard>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {[1, 2].map((item) => (
              <GlassmorphicCard key={item} className="p-6 border border-blue-100/50 dark:border-blue-800/30 h-[350px]" borderGlow={true}>
                <div className="flex justify-between items-center mb-4">
                  <div className="h-6 w-40 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-md animate-pulse"></div>
                  <div className="flex gap-2">
                    <div className="h-8 w-20 bg-gray-300 dark:bg-gray-700 rounded-md animate-pulse"></div>
                    <div className="h-8 w-20 bg-gray-300 dark:bg-gray-700 rounded-md animate-pulse"></div>
                  </div>
                </div>
                <div className="h-[250px] bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
              </GlassmorphicCard>
            ))}
          </div>
        </div>
      </div>
      
      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }
        
        .animated-bg {
          background-size: 400% 400%;
          animation: gradient 15s ease infinite;
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
        
        @keyframes float {
          0% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(2%, 3%) rotate(5deg); }
          66% { transform: translate(-2%, -3%) rotate(-5deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  )
}
