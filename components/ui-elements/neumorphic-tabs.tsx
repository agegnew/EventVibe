"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

interface Tab {
  id: string
  label: string
}

interface NeumorphicTabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (tabId: string) => void
  className?: string
}

export function NeumorphicTabs({ tabs, activeTab, onChange, className }: NeumorphicTabsProps) {
  return (
    <div className={cn("flex space-x-1 overflow-x-auto pb-2", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-all",
            activeTab === tab.id
              ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

interface NeumorphicTabsContentProps {
  id: string
  activeTab: string
  children: React.ReactNode
  className?: string
}

export function NeumorphicTabsContent({ id, activeTab, children, className }: NeumorphicTabsContentProps) {
  if (id !== activeTab) return null

  return <div className={cn("mt-4", className)}>{children}</div>
}
