"use client"

import React, { useEffect, useState, useRef } from 'react'
import { useNotifications } from '@/hooks/use-notifications'
import { Check, AlertTriangle, X, Info, Calendar, Bell } from 'lucide-react'
import Link from 'next/link'

export function NotificationPopup() {
  const { notifications, markAsRead } = useNotifications()
  const [visibleNotifications, setVisibleNotifications] = useState<any[]>([])
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const notificationCache = useRef(new Set<string>())

  // Show unread notifications immediately when they arrive
  useEffect(() => {
    // Find all unread notifications sorted by timestamp (newest first)
    const unreadNotifications = [...notifications]
      .filter(n => !n.read)
      .sort((a, b) => b.timestamp - a.timestamp);
    
    // If we have unread notifications and they're not already being shown
    if (unreadNotifications.length > 0) {
      const latestUnread = unreadNotifications[0];
      
      // Only show if this is not already visible
      if (!visibleNotifications.some(n => n.id === latestUnread.id) && 
          !notificationCache.current.has(latestUnread.id)) {
        
        console.log("[NotificationPopup] Showing new notification:", latestUnread);
        notificationCache.current.add(latestUnread.id);
        
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // Set the notification to be visible
        setVisibleNotifications([latestUnread]);
        
        // Set timeout to hide after 5 seconds
        timeoutRef.current = setTimeout(() => {
          console.log("[NotificationPopup] Auto-hiding notification:", latestUnread.id);
          markAsRead(latestUnread.id);
          setVisibleNotifications([]);
        }, 5000);
      }
    }
    
    // Clean up timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [notifications, markAsRead, visibleNotifications]);

  // Handle global event notifications (fallback for realtime sync)
  useEffect(() => {
    const handleCustomEvent = (e: any) => {
      if (e.detail && e.detail.type === 'notification') {
        console.log("[NotificationPopup] Received custom notification event:", e.detail);
        
        // If it has all required fields, show it directly
        if (e.detail.title && e.detail.message) {
          const notificationId = `direct-${Date.now()}`;
          
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          
          setVisibleNotifications([{
            id: notificationId,
            title: e.detail.title,
            message: e.detail.message,
            type: e.detail.type || 'info',
            link: e.detail.link,
            timestamp: Date.now()
          }]);
          
          timeoutRef.current = setTimeout(() => {
            setVisibleNotifications([]);
          }, 5000);
        }
      }
    };
    
    window.addEventListener('custom-notification', handleCustomEvent);
    return () => {
      window.removeEventListener('custom-notification', handleCustomEvent);
    };
  }, []);

  // Handle dismiss
  const dismissNotification = (id: string) => {
    console.log("[NotificationPopup] Manually dismissing notification:", id);
    markAsRead(id);
    setVisibleNotifications(prev => prev.filter(n => n.id !== id));
    
    // Clear timeout since we manually dismissed
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Different icons based on notification type
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'event':
        return <Calendar className="h-5 w-5 text-purple-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  };

  // Different background colors based on notification type
  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-4 border-green-500 bg-green-50 dark:bg-green-950/30'
      case 'warning':
        return 'border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30'
      case 'error':
        return 'border-l-4 border-red-500 bg-red-50 dark:bg-red-950/30'
      case 'event':
        return 'border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-950/30'
      default:
        return 'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/30'
    }
  };

  if (visibleNotifications.length === 0) return null;
  
  return (
    <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`w-full shadow-lg rounded-lg p-4 ${getBackgroundColor(notification.type)}`}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              {getIcon(notification.type)}
            </div>
            
            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {notification.title}
                </p>
                <button
                  className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => dismissNotification(notification.id)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                {notification.message}
              </p>
              {notification.link && (
                <div className="mt-2">
                  <Link
                    href={notification.link}
                    onClick={() => dismissNotification(notification.id)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    View details
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 