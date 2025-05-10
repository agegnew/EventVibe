"use client"

import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Text, Float, PresentationControls, Html } from "@react-three/drei"
import { motion } from "framer-motion"
import * as THREE from "three"

// Define types for event data
interface CalendarEvent {
  id: string
  title: string
  day: number
  color: "blue" | "purple" | "green" | "orange" | "cyan"
  time: string
  location: string
}

// Sample event data with dates that correspond to current month
const generateCalendarEvents = (): CalendarEvent[] => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  
  // Generate random event days within current month
  const eventDays = Array.from({ length: 5 }, () => 
    Math.floor(Math.random() * daysInMonth) + 1
  )
  
  return [
    { 
      id: "1", 
      title: "Tech Conference 2025", 
      day: eventDays[0], 
      color: "blue",
      time: "10:00 AM", 
      location: "San Francisco, CA",
    },
    { 
      id: "2", 
      title: "Design Summit", 
      day: eventDays[1], 
      color: "purple",
      time: "2:00 PM", 
      location: "New York, NY",
    },
    { 
      id: "3", 
      title: "Marketing Expo", 
      day: eventDays[2],
      color: "green",
      time: "9:00 AM", 
      location: "Chicago, IL",
    },
    { 
      id: "4", 
      title: "AI Workshop", 
      day: eventDays[3],
      color: "orange",
      time: "11:30 AM", 
      location: "Austin, TX",
    },
    { 
      id: "5", 
      title: "Web Dev Conference", 
      day: eventDays[4],
      color: "cyan",
      time: "1:00 PM", 
      location: "Seattle, WA",
    },
  ]
}

function CalendarCube() {
  const groupRef = useRef<THREE.Group>(null)
  const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null)
  const [hoverDay, setHoverDay] = useState<number | null>(null)
  const [events] = useState<CalendarEvent[]>(generateCalendarEvents())
  const [animateHighlight, setAnimateHighlight] = useState(false)
  const { size } = useThree()
  
  // Gentle rotation
  useFrame((state) => {
    if (groupRef.current && !activeEvent) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1
    }
  })

  // Get current month and year
  const date = new Date()
  const month = date.toLocaleString("default", { month: "long" })
  const year = date.getFullYear()

  // Generate days for the current month
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Current day
  const currentDay = date.getDate()
  
  // Color palette
  const colorMap = {
    blue: "#3b82f6",
    purple: "#8b5cf6",
    green: "#10b981",
    orange: "#f97316",
    cyan: "#06b6d4",
  }
  
  // Handle day click
  const handleDayClick = (day: number) => {
    const eventsForDay = events.filter(event => event.day === day)
    
    if (activeEvent && activeEvent.day === day) {
      // If clicking the same day, deactivate
      setActiveEvent(null)
    } else if (eventsForDay.length > 0) {
      // If clicking a day with events, activate it
      setActiveEvent(eventsForDay[0])
      setAnimateHighlight(true)
      setTimeout(() => setAnimateHighlight(false), 500)
    }
  }

  return (
    <group ref={groupRef}>
      {/* Frosted glass base for calendar */}
      <mesh position={[0, 0, -0.15]} receiveShadow castShadow>
        <boxGeometry args={[7.5, 6, 0.1]} />
        <meshPhysicalMaterial
          transmission={0.92}
          roughness={0.2}
          metalness={0.1}
          thickness={0.5}
          color="#ffffff"
        />
      </mesh>

      {/* Calendar header with glowing title */}
      <group position={[0, 2.4, 0]}>
        <Text
          position={[0, 0, 0.1]}
          fontSize={0.6}
          color="#3b82f6"
          anchorX="center"
          anchorY="middle"
          letterSpacing={-0.05}
          glyphGeometryDetail={32}
        >
          {`${month} ${year}`}
        </Text>
        
        {/* Glow effect */}
        <mesh position={[0, 0, 0]} scale={[4, 0.8, 0.1]}>
          <planeGeometry />
          <meshBasicMaterial 
            color="#3b82f680" 
            transparent
            opacity={0.15}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* Calendar Grid */}
      <group position={[0, 0, 0]}>
        {/* Days of week header */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
          <Text
            key={day}
            position={[(i - 3) * 0.85, 1.6, 0]}
            fontSize={0.3}
            color="#64748b"
            anchorX="center"
            anchorY="middle"
          >
            {day}
          </Text>
        ))}

        {/* Calendar days */}
        {days.map((day) => {
          // Calculate position in grid (7 columns)
          const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
          const adjustedDay = day + firstDayOfMonth - 1
          const row = Math.floor(adjustedDay / 7)
          const col = adjustedDay % 7

          const isCurrentDay = day === currentDay
          const isActiveDay = activeEvent && activeEvent.day === day
          const isHoverDay = day === hoverDay
          
          // Find events for this day
          const dayEvents = events.filter(event => event.day === day)
          const hasEvents = dayEvents.length > 0
          const eventColor = hasEvents ? colorMap[dayEvents[0].color] : "#8b5cf6"

          return (
            <group key={day} position={[(col - 3) * 0.85, 1 - row * 0.85, 0]}>
              {/* Background circle for days */}
              <mesh 
                position={[0, 0, -0.05]}
                onClick={() => handleDayClick(day)}
                onPointerOver={() => setHoverDay(day)}
                onPointerOut={() => setHoverDay(null)}
              >
                <circleGeometry args={[0.35, 32]} />
                <meshStandardMaterial 
                  color={
                    isActiveDay ? eventColor : 
                    isCurrentDay ? "#3b82f6" : 
                    hasEvents ? `${eventColor}40` : 
                    isHoverDay ? "#e2e8f080" : 
                    "transparent"
                  } 
                  transparent={!isCurrentDay && !isActiveDay}
                  opacity={hasEvents && !isCurrentDay && !isActiveDay ? 0.5 : 1}
                  metalness={0.2}
                  roughness={0.8}
                />
              </mesh>

              {/* Day number */}
              <Text
                position={[0, 0, 0]}
                fontSize={0.24}
                color={isCurrentDay || isActiveDay ? "#ffffff" : "#334155"}
                anchorX="center"
                anchorY="middle"
              >
                {day}
              </Text>

              {/* Event indicator dot */}
              {hasEvents && !isCurrentDay && !isActiveDay && (
                <mesh position={[0, -0.2, 0]}>
                  <circleGeometry args={[0.05, 16]} />
                  <meshStandardMaterial color={eventColor} />
                </mesh>
              )}
              
              {/* Highlight ring for active events - animate on click */}
              {isActiveDay && animateHighlight && (
                <mesh position={[0, 0, -0.1]} scale={[1, 1, 1]}>
                  <ringGeometry args={[0.36, 0.42, 32]} />
                  <meshBasicMaterial color={eventColor} transparent opacity={0.6} />
                </mesh>
              )}
            </group>
          )
        })}

        {/* Event details popup for active event */}
        {activeEvent && (
          <Html
            position={[0, -2, 0.5]}
            center
            className="calendar-event-popup"
            style={{
              width: '230px',
              height: 'auto',
              padding: '15px',
              backgroundColor: 'rgba(30, 41, 59, 0.85)',
              backdropFilter: 'blur(8px)',
              borderRadius: '12px',
              border: `2px solid ${colorMap[activeEvent.color]}`,
              boxShadow: `0 0 15px ${colorMap[activeEvent.color]}40`,
              color: 'white',
              fontFamily: 'sans-serif',
              pointerEvents: 'none',
              transform: 'scale(0.6)',
              transformOrigin: 'center'
            }}
          >
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '8px', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{activeEvent.title}</h3>
            </div>
            <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div>
                <span style={{ opacity: 0.7, marginRight: '6px' }}>Date:</span>
                <span>{`${month} ${activeEvent.day}, ${year}`}</span>
              </div>
              <div>
                <span style={{ opacity: 0.7, marginRight: '6px' }}>Time:</span>
                <span>{activeEvent.time}</span>
              </div>
              <div>
                <span style={{ opacity: 0.7, marginRight: '6px' }}>Location:</span>
                <span>{activeEvent.location}</span>
              </div>
            </div>
          </Html>
        )}
      </group>

      {/* Month events list */}
      {!activeEvent && (
        <group position={[0, -2.2, 0]}>
          <Text
            position={[0, 0.5, 0]}
            fontSize={0.28}
            color="#64748b"
            anchorX="center"
            anchorY="middle"
          >
            Upcoming Events
          </Text>
          
          {events.length > 0 && !activeEvent ? (
            events.slice(0, 3).map((event, i) => (
              <group 
                key={event.id} 
                position={[0, 0.1 - i * 0.3, 0]}
                onClick={() => handleDayClick(event.day)}
                onPointerOver={() => setHoverDay(event.day)}
                onPointerOut={() => setHoverDay(null)}
              >
                <mesh position={[-2, 0, 0]}>
                  <circleGeometry args={[0.1, 16]} />
                  <meshStandardMaterial color={colorMap[event.color]} />
                </mesh>
                <Text
                  position={[0, 0, 0]}
                  fontSize={0.2}
                  color="#334155"
                  maxWidth={3.5}
                  anchorX="center"
                  anchorY="middle"
                >
                  {`${month} ${event.day} - ${event.title}`}
                </Text>
              </group>
            ))
          ) : (
            <Text
              position={[0, 0.1, 0]}
              fontSize={0.2}
              color="#64748b"
              anchorX="center"
              anchorY="middle"
            >
              {activeEvent ? "Select event from calendar" : "No events scheduled"}
            </Text>
          )}
        </group>
      )}
    </group>
  )
}

export function Calendar3D() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  // Fallback calendar if 3D rendering fails
  if (hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
        <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">{new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}</h3>
        <div className="grid grid-cols-7 gap-1 w-full max-w-md">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center font-medium text-gray-600 dark:text-gray-400 py-2">
              {day.substring(0, 1)}
            </div>
          ))}
          {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay() }, (_, i) => (
            <div key={`empty-${i}`} className="aspect-square"></div>
          ))}
          {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() }, (_, i) => {
            const day = i + 1;
            const isToday = day === new Date().getDate();
            const hasEvent = [5, 10, 15, 20, 25].includes(day); // Sample event days
            
            return (
              <div 
                key={day}
                className={`aspect-square flex items-center justify-center rounded-full text-sm relative
                  ${isToday ? 'bg-blue-500 text-white' : hasEvent ? 'hover:bg-blue-100 dark:hover:bg-blue-800/30 cursor-pointer' : ''}`}
              >
                {day}
                {hasEvent && !isToday && (
                  <div className="absolute bottom-1 w-1 h-1 bg-blue-500 rounded-full"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0 }}
      transition={{ duration: 0.8 }}
    >
      <Canvas 
        shadows 
        camera={{ position: [0, 0, 6], fov: 45 }}
        onCreated={() => {}}
        onError={() => setHasError(true)}
      >
        <color attach="background" args={['transparent']} />
        <ambientLight intensity={0.4} />
        <spotLight position={[10, 10, 5]} angle={0.15} penumbra={1} intensity={0.8} castShadow />
        <pointLight position={[-10, -10, -5]} intensity={0.4} />
        
        <PresentationControls
          global
          cursor={true}
          rotation={[0.13, 0.1, 0]}
          polar={[-0.4, 0.4]}
          azimuth={[-0.5, 0.75]}
        >
          <Float rotationIntensity={0.2} floatIntensity={0.5} speed={1.5}>
            <CalendarCube />
          </Float>
        </PresentationControls>
      </Canvas>
    </motion.div>
  )
}
