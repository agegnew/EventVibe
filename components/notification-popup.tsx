"use client"

import { useState, useRef, useEffect } from 'react'
import { X, Info, AlertCircle, Check, Bell, Calendar } from 'lucide-react'
import { useNotifications, Notification } from '@/hooks/use-notifications'

export function NotificationPopup() {
  const [showNotification, setShowNotification] = useState(false)
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null)
  const [progress, setProgress] = useState(100)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const { notifications, markAsRead } = useNotifications()
  
  // Display time in milliseconds
  const displayTime = 5000
  const updateInterval = 50
  
  // Get styling based on notification type
  const getNotificationStyles = (type: string) => {
    switch(type) {
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          text: 'text-green-800 dark:text-green-200',
          progress: 'bg-green-500',
          icon: <Check size={18} className="text-green-500 dark:text-green-400" />
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          border: 'border-amber-200 dark:border-amber-800',
          text: 'text-amber-800 dark:text-amber-200',
          progress: 'bg-amber-500',
          icon: <AlertCircle size={18} className="text-amber-500 dark:text-amber-400" />
        };
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-800 dark:text-red-200',
          progress: 'bg-red-500',
          icon: <AlertCircle size={18} className="text-red-500 dark:text-red-400" />
        };
      case 'event':
        return {
          bg: 'bg-purple-50 dark:bg-purple-900/20',
          border: 'border-purple-200 dark:border-purple-800',
          text: 'text-purple-800 dark:text-purple-200',
          progress: 'bg-purple-500',
          icon: <Calendar size={18} className="text-purple-500 dark:text-purple-400" />
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-800 dark:text-blue-200',
          progress: 'bg-blue-500',
          icon: <Info size={18} className="text-blue-500 dark:text-blue-400" />
        };
    }
  };
  
  // Show notification when a new unread one arrives
  useEffect(() => {
    const unreadNotifications = notifications.filter(n => !n.read)
    
    if (unreadNotifications.length > 0 && !showNotification) {
      const latestNotification = unreadNotifications[0]
      setCurrentNotification(latestNotification)
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
        if (latestNotification) {
          markAsRead(latestNotification.id)
        }
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
  }, [notifications, showNotification, markAsRead, displayTime])

  // Handle close button click
  const handleClose = () => {
    setShowNotification(false)
    if (currentNotification) {
      markAsRead(currentNotification.id)
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }

  if (!showNotification || !currentNotification) return null
  
  const styles = getNotificationStyles(currentNotification.type);
  
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
      className={`${styles.bg} rounded-md p-4 border ${styles.border} animate-fade-in`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          {styles.icon}
          <h3 className={`font-medium ${styles.text}`}>{currentNotification.title}</h3>
        </div>
        <button 
          onClick={handleClose}
          className="bg-gray-200 dark:bg-gray-700 rounded-full h-6 w-6 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400"
        >
          <X size={16} />
        </button>
      </div>
      <p className="mt-1 ml-6 text-sm text-gray-600 dark:text-gray-300">{currentNotification.message}</p>
      
      {/* Progress bar */}
      <div className="mt-3 h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${styles.progress} rounded-full transition-all duration-100 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
} 