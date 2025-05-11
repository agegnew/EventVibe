"use client"

import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { useNotifications } from '@/hooks/use-notifications'

export function NotificationPopup() {
  const [showNotification, setShowNotification] = useState(false)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [progress, setProgress] = useState(100)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const { notifications, clearAllUnread } = useNotifications()
  
  // Display time in milliseconds
  const displayTime = 5000
  const updateInterval = 50
  
  // Show notification when a new unread one arrives
  useEffect(() => {
    const unreadNotifications = notifications.filter(n => !n.read)
    
    if (unreadNotifications.length > 0 && !showNotification) {
      const latestNotification = unreadNotifications[0]
      setTitle(latestNotification.title)
      setMessage(latestNotification.message)
      setShowNotification(true)
      setProgress(100)
      
      // Start progress bar
      let timeLeft = displayTime
      progressIntervalRef.current = setInterval(() => {
        timeLeft -= updateInterval
        const newProgress = (timeLeft / displayTime) * 100
        setProgress(Math.max(0, newProgress))
        
        if (timeLeft <= 0) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current)
            progressIntervalRef.current = null
          }
        }
      }, updateInterval)
      
      // Auto-dismiss after displayTime
      timeoutRef.current = setTimeout(() => {
        setShowNotification(false)
        clearAllUnread() // Mark all as read when dismissed
      }, displayTime)
      
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
          progressIntervalRef.current = null
        }
      }
    }
  }, [notifications, showNotification, clearAllUnread, displayTime])

  // Handle close button click
  const handleClose = () => {
    setShowNotification(false)
    clearAllUnread()
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }

  if (!showNotification) return null
  
  return (
    <div 
      style={{
        position: 'fixed',
        top: '96px',
        right: '16px',
        zIndex: 10000,
        maxWidth: '320px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }}
      className="bg-white dark:bg-gray-800 rounded-md p-4 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex justify-between">
        <h3 className="font-medium text-gray-900 dark:text-gray-100">{title}</h3>
        <button 
          onClick={handleClose}
          className="bg-gray-200 dark:bg-gray-700 rounded-full h-6 w-6 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400"
        >
          <X size={16} />
        </button>
      </div>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{message}</p>
      
      {/* Progress bar */}
      <div className="mt-3 h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 rounded-full transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
} 