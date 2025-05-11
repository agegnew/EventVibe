"use client"

import { useState, useRef, useEffect } from 'react'
import { Bell, X, Check, RefreshCcw, ChevronDown, AlertCircle, Calendar, Info } from 'lucide-react'
import { useNotifications, Notification } from '@/hooks/use-notifications'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { createPortal } from 'react-dom'
import Link from 'next/link'

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotification, 
    clearAllNotifications,
    fetchNotifications
  } = useNotifications()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const bellRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Set mounted state for client-side only code
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
    
    if (notification.link) {
      setIsOpen(false)
      router.push(notification.link)
    }
  }

  // Refresh notifications
  const handleRefresh = async () => {
    setIsLoading(true)
    await fetchNotifications()
    setIsLoading(false)
  }

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) && 
        bellRef.current && 
        !bellRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Listen for escape key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  // View all notifications link
  const viewAllNotifications = () => {
    router.push('/notifications')
  }

  // Apply !important styles via JavaScript
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const style = dropdownRef.current.style;
      style.setProperty('z-index', '9999999', 'important');
      style.setProperty('display', 'block', 'important');
      style.setProperty('visibility', 'visible', 'important');
      style.setProperty('opacity', '1', 'important');
      style.setProperty('pointer-events', 'auto', 'important');
    }
  }, [isOpen]);

  // Position the dropdown
  const updateDropdownPosition = () => {
    if (isOpen && bellRef.current && dropdownRef.current) {
      const rect = bellRef.current.getBoundingClientRect();
      dropdownRef.current.style.top = `${rect.bottom + 10}px`;
      dropdownRef.current.style.right = `${window.innerWidth - rect.right}px`;
    }
  };

  // Set the dropdown position on open
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      window.addEventListener('resize', updateDropdownPosition);
      window.addEventListener('scroll', updateDropdownPosition);
    }
    
    return () => {
      window.removeEventListener('resize', updateDropdownPosition);
      window.removeEventListener('scroll', updateDropdownPosition);
    };
  }, [isOpen]);

  // Dropdown content
  const renderDropdownContent = () => (
    <div 
      ref={dropdownRef}
      className="notification-dropdown bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-xl"
      style={{
        position: 'fixed',
        right: '16px',
        top: '80px',
        width: '320px',
        maxWidth: 'calc(100vw - 24px)',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}
    >
      <div className="bg-blue-500 text-white p-3 flex justify-between items-center rounded-t-lg sticky top-0">
        <h2 className="text-base font-semibold">
          Notifications 
          {notifications.length > 0 && <span className="ml-2 text-sm">({notifications.length})</span>}
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className="p-1 hover:bg-blue-600 rounded"
            aria-label="Refresh"
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-blue-600 rounded"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="overflow-y-auto p-0 m-0" style={{ 
        maxHeight: `calc(80vh - 100px)`
      }}>
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No notifications</p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => {
              // Get notification type indicator elements
              const getNotificationTypeElements = (type: string) => {
                switch(type) {
                  case 'success':
                    return {
                      icon: <Check className="h-4 w-4 text-green-500" />,
                      bgColor: notification.read ? '' : 'bg-green-50 dark:bg-green-900/20',
                      borderLeft: 'border-l-4 border-green-500'
                    };
                  case 'warning':
                    return {
                      icon: <AlertCircle className="h-4 w-4 text-amber-500" />,
                      bgColor: notification.read ? '' : 'bg-amber-50 dark:bg-amber-900/20',
                      borderLeft: 'border-l-4 border-amber-500'
                    };
                  case 'error':
                    return {
                      icon: <AlertCircle className="h-4 w-4 text-red-500" />,
                      bgColor: notification.read ? '' : 'bg-red-50 dark:bg-red-900/20',
                      borderLeft: 'border-l-4 border-red-500'
                    };
                  case 'event':
                    return {
                      icon: <Calendar className="h-4 w-4 text-purple-500" />,
                      bgColor: notification.read ? '' : 'bg-purple-50 dark:bg-purple-900/20',
                      borderLeft: 'border-l-4 border-purple-500'
                    };
                  case 'info':
                  default:
                    return {
                      icon: <Info className="h-4 w-4 text-blue-500" />,
                      bgColor: notification.read ? '' : 'bg-blue-50 dark:bg-blue-900/20',
                      borderLeft: 'border-l-4 border-blue-500'
                    };
                }
              };
              
              const typeElements = getNotificationTypeElements(notification.type);
              
              return (
                <div 
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-3 border-b cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${notification.read ? 'bg-white dark:bg-gray-800' : typeElements.bgColor} ${typeElements.borderLeft}`}
                >
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      {typeElements.icon}
                      <div className="font-medium text-sm">{notification.title}</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearNotification(notification.id);
                      }}
                      className="text-gray-500 hover:text-red-500 text-sm"
                    >
                      &times;
                    </button>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 mt-1 ml-6">
                    {notification.message}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 ml-6">
                    {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="p-2 bg-gray-100 dark:bg-gray-700 flex justify-between items-center rounded-b-lg sticky bottom-0">
        <div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center text-blue-600 text-xs hover:underline"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all as read
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="text-red-500 text-xs hover:underline"
            >
              Clear all
            </button>
          )}
          
          <button
            onClick={viewAllNotifications}
            className="text-blue-600 text-xs flex items-center hover:underline"
          >
            See all <ChevronDown className="h-3 w-3 ml-1" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="relative">
      {/* Bell icon with badge */}
      <button
        ref={bellRef}
        onClick={toggleDropdown}
        className={`p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 relative transition-all duration-200 ${isOpen ? 'bg-gray-100 dark:bg-gray-800 ring-2 ring-blue-500 dark:ring-blue-400' : ''}`}
        aria-label="Notifications"
      >
        <Bell className={`h-5 w-5 ${isOpen ? 'text-blue-500 dark:text-blue-400' : ''}`} />
        
        {/* Notification badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 min-w-[18px] h-[18px]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Render the dropdown using a portal to avoid z-index context issues */}
      {isOpen && isMounted && createPortal(
        renderDropdownContent(),
        document.body
      )}
    </div>
  )
} 