"use client"

import { useEffect, useState } from 'react'

export default function ServiceWorkerRegister() {
  const [isOnline, setIsOnline] = useState(true)
  const [isRegistered, setIsRegistered] = useState(false)
  const [registrationError, setRegistrationError] = useState<string | null>(null)

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine)

    // Update online status when it changes
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Register service worker if supported
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope)
          setIsRegistered(true)
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
          setRegistrationError(error.message)
        })
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Only render UI in development mode to show status
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex items-center p-2 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className={`w-3 h-3 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="text-xs font-medium">
          {isOnline ? 'Online' : 'Offline'}
          {isRegistered && ' (PWA Ready)'}
        </span>
      </div>
    </div>
  )
} 