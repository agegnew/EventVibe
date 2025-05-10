"use client"

import { useState } from "react"
import Link from "next/link"
import { Home, Calendar, Users, BarChart2, Settings, LogOut, Menu, X } from "lucide-react"
import { GlassmorphicCard } from "@/components/ui-elements/glassmorphic-card"

interface AdminSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  isMobileOpen?: boolean
  setIsMobileOpen?: (open: boolean) => void
}

export function AdminSidebar({ 
  activeTab, 
  setActiveTab, 
  isMobileOpen, 
  setIsMobileOpen 
}: AdminSidebarProps) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "events", label: "Events", icon: Calendar },
    { id: "users", label: "Users", icon: Users },
    { id: "analytics", label: "Analytics", icon: BarChart2 },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const handleNavClick = (id: string) => {
    setActiveTab(id)
    if (setIsMobileOpen) {
      setIsMobileOpen(false)
    }
  }

  return (
    <>
      {/* Mobile overlay when sidebar is open */}
      {isMobileOpen && setIsMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      <div 
        className={`${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:sticky top-0 left-0 z-50 h-screen w-64 transition-transform duration-300 ease-in-out`}
      >
        <div className="w-64 h-full overflow-y-auto bg-gradient-to-b from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4 flex flex-col">
          <GlassmorphicCard className="p-4 mb-4 relative">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400 mr-2" />
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
                  EventVibe
                </span>
              </div>
              {setIsMobileOpen && (
                <button 
                  className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => setIsMobileOpen(false)}
                >
                  <X size={20} />
                </button>
              )}
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === item.id
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </button>
              ))}
            </nav>
          </GlassmorphicCard>

          <GlassmorphicCard className="p-4 mt-auto">
            <Link
              href="/"
              className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Exit Admin
            </Link>
          </GlassmorphicCard>
        </div>
      </div>
    </>
  )
}
