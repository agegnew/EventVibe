"use client"

import { useState } from "react"
import { GlassmorphicCard } from "@/components/ui-elements/glassmorphic-card"
import { NeumorphicButton } from "@/components/ui-elements/neumorphic-button"

interface ScheduleDay {
  day: string
  date: string
  events: {
    time: string
    title: string
  }[]
}

interface EventScheduleProps {
  schedule: ScheduleDay[]
}

export function EventSchedule({ schedule }: EventScheduleProps) {
  const [activeDay, setActiveDay] = useState(0)

  return (
    <GlassmorphicCard className="p-6 md:p-8">
      <h2 className="text-2xl font-bold mb-6">Event Schedule</h2>

      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {schedule.map((day, index) => (
          <NeumorphicButton
            key={index}
            variant={activeDay === index ? "default" : "outline"}
            onClick={() => setActiveDay(index)}
          >
            {day.day}
          </NeumorphicButton>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg">{schedule[activeDay].date}</h3>
        <div className="space-y-4">
          {schedule[activeDay].events.map((event, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row md:items-center p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
            >
              <div className="font-medium text-purple-600 dark:text-purple-400 md:w-48 mb-2 md:mb-0">{event.time}</div>
              <div className="flex-1">
                <h4 className="font-medium">{event.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassmorphicCard>
  )
}
