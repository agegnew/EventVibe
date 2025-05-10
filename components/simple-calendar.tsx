"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface SimpleCalendarProps {
  className?: string
}

export function SimpleCalendar({ className = "" }: SimpleCalendarProps) {
  const [currentDate] = useState(new Date())
  const [containerHeight, setContainerHeight] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  
  // Measure available height and check screen size
  useEffect(() => {
    const updateDimensions = () => {
      const container = document.querySelector('.calendar-container')
      if (container) {
        setContainerHeight(container.clientHeight)
        setContainerWidth(container.clientWidth)
      } else {
        // Fallback dimensions if container isn't measured yet
        setContainerHeight(400)
        setContainerWidth(600)
      }
      
      // Check if we're on a mobile-sized screen
      setIsMobile(window.innerWidth < 640)
    }
    
    // Initial measurement and immediate re-measure after render
    updateDimensions()
    const timer = setTimeout(updateDimensions, 100)
    
    window.addEventListener('resize', updateDimensions)
    return () => {
      window.removeEventListener('resize', updateDimensions)
      clearTimeout(timer)
    }
  }, [])
  
  // Get current month and year
  const month = currentDate.toLocaleString("default", { month: "long" })
  const year = currentDate.getFullYear()
  
  // Get days in month and first day of month
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  
  // Generate days for the calendar
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  
  // Current day
  const currentDay = currentDate.getDate()
  
  // Sample event days with colors and titles
  const events = [
    { day: 3, title: "Product Launch", color: "bg-purple-500" },
    { day: 9, title: "Design Summit", color: "bg-blue-500" },
    { day: 10, title: "Tech Conference 2025", color: "bg-indigo-600" },
    { day: 16, title: "Team Meeting", color: "bg-blue-500" },
    { day: 18, title: "Marketing Expo", color: "bg-orange-500" },
    { day: 25, title: "AI Workshop", color: "bg-green-500" }
  ]
  
  // Get event for a day
  const getEvent = (day: number) => events.find(event => event.day === day)
  
  // Helper function to convert color class to actual color
  const getEventColor = (colorClass?: string): string => {
    const colorMap: Record<string, string> = {
      'bg-blue-500': '#3b82f6',
      'bg-purple-500': '#8b5cf6',
      'bg-indigo-600': '#4f46e5',
      'bg-green-500': '#10b981',
      'bg-orange-500': '#f97316',
      'bg-cyan-500': '#06b6d4'
    }
    return colorMap[colorClass || ''] || '#3b82f6'
  }

  // Calculate how many events to show based on available space
  const calculateEventsToShow = () => {
    if (isMobile) {
      return 3
    } else {
      if (containerHeight < 350) return 3
      if (containerHeight < 420) return 4
      return 5
    }
  }
  
  // Calculate optimal cell size for days based on container width
  const calculateCellSize = () => {
    // For the side-by-side layout, we need to adjust cell size
    const baseWidth = isMobile ? containerWidth : Math.min(containerWidth * 0.65, 450)
    const cellWidth = Math.floor((Math.min(baseWidth, 600) - 48) / 7)
    return Math.min(cellWidth, 42)
  }

  return (
    <div className={`w-full h-full flex flex-col ${className}`}>
      <div className="calendar-container bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-slate-900/60 dark:to-blue-950/60 backdrop-blur-sm rounded-xl p-3 h-full border border-blue-100/50 dark:border-blue-800/30 shadow-lg flex flex-col overflow-hidden">
        {/* Month and year header - full width */}
        <div className="flex items-center justify-center mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 py-1.5 px-4 rounded-lg shadow-sm w-full">
          <h3 className="text-base font-bold text-white tracking-wide">{month} {year}</h3>
        </div>
        
        {/* Calendar and events - side by side on larger screens, stacked on mobile */}
        <div className={`flex-grow flex ${isMobile ? 'flex-col' : 'flex-row gap-4'} w-full`}>
          {/* Calendar section */}
          <div className={`flex flex-col ${isMobile ? 'mb-3' : 'flex-1'}`}>
            {/* Days of week header */}
            <div className="grid grid-cols-7 mb-1 gap-1">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                <div key={index} className="text-center font-medium text-blue-700 dark:text-blue-300 py-0.5 text-[11px]">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div 
              className="grid grid-cols-7 flex-grow gap-1 place-items-center"
              style={{ 
                gridTemplateRows: `repeat(${Math.ceil((firstDayOfMonth + daysInMonth) / 7)}, 1fr)`,
                minHeight: isMobile ? '180px' : '300px'
              }}
            >
              {/* Empty cells for days before the first day of month */}
              {Array.from({ length: firstDayOfMonth }, (_, i) => (
                <div key={`empty-${i}`} className="p-0.5"></div>
              ))}
              
              {/* Calendar days */}
              {days.map((day) => {
                const isToday = day === currentDay
                const event = getEvent(day)
                const hasEvent = !!event
                const cellSize = calculateCellSize()
                
                return (
                  <motion.div 
                    key={day}
                    className={`flex items-center justify-center rounded-full text-xs sm:text-[11px] relative
                      ${isToday 
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold shadow-sm ring-1 ring-blue-300 dark:ring-blue-500' 
                        : hasEvent 
                          ? 'bg-gradient-to-br from-white/80 to-blue-50/80 dark:from-slate-800/60 dark:to-slate-700/60 backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/30 cursor-pointer hover:shadow-sm transition-all' 
                          : 'hover:bg-white/50 dark:hover:bg-white/5 border border-transparent hover:border-blue-100/50 dark:hover:border-blue-800/30 transition-all'
                      }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ 
                      width: `${cellSize}px`,
                      height: `${cellSize}px`,
                    }}
                  >
                    <span>{day}</span>
                    {hasEvent && !isToday && (
                      <div 
                        className="absolute -bottom-0.5 w-[3px] h-[3px] rounded-full"
                        style={{ backgroundColor: getEventColor(event?.color) }}
                      ></div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
          
          {/* Events section - to the side on larger screens */}
          <div className={`${isMobile ? 'mt-1' : 'w-[35%] min-w-[180px] max-w-[250px]'} flex flex-col`}>
            <h4 className="text-[11px] font-bold text-blue-700 dark:text-blue-300 mb-2 px-1 border-b border-blue-200/50 dark:border-blue-800/30 pb-1">
              Upcoming Events
            </h4>
            <div className={`space-y-1.5 ${isMobile ? 'max-h-[100px]' : 'flex-grow'} overflow-y-auto pr-1 styled-scrollbar`}>
              {events
                .filter(event => event.day >= currentDay || currentDay > 20) // Show future events or all if we're near end of month
                .sort((a, b) => a.day - b.day)
                .slice(0, calculateEventsToShow())
                .map((event) => (
                  <motion.div 
                    key={event.day}
                    className="flex items-center py-1.5 px-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded border border-blue-100/50 dark:border-blue-900/30 shadow-sm"
                    whileHover={{ x: 3 }}
                  >
                    <div 
                      className="w-2.5 h-2.5 rounded-full mr-2 shadow-inner flex-shrink-0"
                      style={{ backgroundColor: getEventColor(event.color) }}
                    ></div>
                    <span className="text-[11px] font-medium text-gray-800 dark:text-gray-200 truncate">
                      {month} {event.day} - {event.title}
                    </span>
                  </motion.div>
                ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Add CSS for styled scrollbar */}
      <style jsx global>{`
        .styled-scrollbar::-webkit-scrollbar {
          width: 3px;
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
      `}</style>
    </div>
  )
} 