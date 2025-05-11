"use client"

import { useState, useEffect } from 'react'
import { useNotifications, Notification } from '@/hooks/use-notifications'
import { formatDistanceToNow, format } from 'date-fns'
import { Bell, Check, Trash2, RefreshCcw, Search, Filter, ArrowUp, ArrowDown, X } from 'lucide-react'
import { GlassmorphicCard } from '@/components/ui-elements/glassmorphic-card'
import { NeumorphicButton } from '@/components/ui-elements/neumorphic-button'
import { NeumorphicInput } from '@/components/ui-elements/neumorphic-input'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function NotificationsPage() {
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
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [filterType, setFilterType] = useState<'all' | 'read' | 'unread'>('all')
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  
  // Refresh notifications
  useEffect(() => {
    handleRefresh()
  }, [])
  
  const handleRefresh = async () => {
    setIsLoading(true)
    await fetchNotifications()
    setIsLoading(false)
  }
  
  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
    
    if (notification.link) {
      router.push(notification.link)
    }
  }
  
  // Sort and filter notifications
  const filteredNotifications = notifications
    .filter(notification => {
      // Apply search term filter
      const matchesSearch = 
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
        
      // Apply read/unread filter
      const matchesReadStatus = 
        filterType === 'all' ||
        (filterType === 'read' && notification.read) ||
        (filterType === 'unread' && !notification.read)
        
      return matchesSearch && matchesReadStatus
    })
    .sort((a, b) => {
      // Sort by timestamp
      return sortOrder === 'newest' 
        ? b.timestamp - a.timestamp 
        : a.timestamp - b.timestamp
    })
    
  // Group notifications by date
  const groupedNotifications: Record<string, Notification[]> = {}
  
  filteredNotifications.forEach(notification => {
    const date = new Date(notification.timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    let dateGroup = format(date, 'MMM d, yyyy')
    
    // Check if notification is from today or yesterday
    if (date.toDateString() === today.toDateString()) {
      dateGroup = 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateGroup = 'Yesterday'
    }
    
    if (!groupedNotifications[dateGroup]) {
      groupedNotifications[dateGroup] = []
    }
    
    groupedNotifications[dateGroup].push(notification)
  })
  
  // Get notification status color
  const getStatusColor = (type: string) => {
    switch (type) {
      case 'info': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800/50'
      case 'success': return 'text-green-500 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800/50'
      case 'warning': return 'text-orange-500 bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800/50'
      case 'error': return 'text-red-500 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800/50'
      case 'event': return 'text-purple-500 bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800/50'
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700/50'
    }
  }
  
  return (
    <div className="bg-mesh-gradient dark:from-gray-900 dark:to-gray-800 min-h-screen animated-bg pb-16">
      {/* Push content down to avoid header overlap */}
      <div className="h-24"></div>
      
      <div className="container mx-auto py-8 px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex items-center"
        >
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mr-3">
            <Bell className="h-5 w-5 text-blue-500" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 title-3d">Notifications</h1>
          {unreadCount > 0 && (
            <span className="ml-3 px-2 py-1 text-xs font-bold bg-red-500 text-white rounded-full">
              {unreadCount} unread
            </span>
          )}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <GlassmorphicCard className="mb-8 p-4 md:p-6" borderGlow={true}>
            <div className="flex flex-col md:flex-row gap-3 justify-between">
              <div className="w-full md:w-1/3">
                <NeumorphicInput 
                  icon={<Search className="h-4 w-4" />}
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <NeumorphicButton
                    size="sm"
                    variant="outline"
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className="flex items-center"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filter: {filterType}
                  </NeumorphicButton>
                  
                  {showFilterMenu && (
                    <div className="absolute z-10 right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="p-2">
                        <button
                          className={`w-full text-left px-3 py-2 text-sm rounded-md ${filterType === 'all' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-500' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                          onClick={() => {
                            setFilterType('all')
                            setShowFilterMenu(false)
                          }}
                        >
                          All notifications
                        </button>
                        <button
                          className={`w-full text-left px-3 py-2 text-sm rounded-md ${filterType === 'unread' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-500' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                          onClick={() => {
                            setFilterType('unread')
                            setShowFilterMenu(false)
                          }}
                        >
                          Unread only
                        </button>
                        <button
                          className={`w-full text-left px-3 py-2 text-sm rounded-md ${filterType === 'read' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-500' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                          onClick={() => {
                            setFilterType('read')
                            setShowFilterMenu(false)
                          }}
                        >
                          Read only
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <NeumorphicButton
                  size="sm"
                  variant="outline"
                  onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                  className="flex items-center"
                >
                  {sortOrder === 'newest' ? (
                    <>
                      <ArrowDown className="w-4 h-4 mr-2" />
                      Newest first
                    </>
                  ) : (
                    <>
                      <ArrowUp className="w-4 h-4 mr-2" />
                      Oldest first
                    </>
                  )}
                </NeumorphicButton>
                
                <NeumorphicButton
                  size="sm"
                  onClick={handleRefresh}
                  className="flex items-center"
                >
                  <RefreshCcw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </NeumorphicButton>
              </div>
            </div>
          </GlassmorphicCard>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-between mb-6"
        >
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {filteredNotifications.length} {filteredNotifications.length === 1 ? 'notification' : 'notifications'}
          </div>
          
          <div className="flex space-x-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center text-blue-600 dark:text-blue-400 text-sm hover:underline"
              >
                <Check className="h-4 w-4 mr-1" />
                Mark all as read
              </button>
            )}
            
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="flex items-center text-red-500 dark:text-red-400 text-sm hover:underline"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear all
              </button>
            )}
          </div>
        </motion.div>
        
        {Object.keys(groupedNotifications).length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <GlassmorphicCard className="p-16 flex flex-col items-center justify-center">
              <Bell className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-medium text-gray-500 dark:text-gray-400 mb-2">No notifications</h3>
              <p className="text-gray-400 dark:text-gray-500 mb-6 text-center max-w-md">
                {searchTerm ? 
                  "No notifications match your search criteria" : 
                  "You're all caught up! Check back later for updates."}
              </p>
              
              {searchTerm && (
                <NeumorphicButton onClick={() => setSearchTerm('')}>
                  Clear search
                </NeumorphicButton>
              )}
            </GlassmorphicCard>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedNotifications).map(([dateGroup, notifications], dateIndex) => (
              <motion.div 
                key={dateGroup}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + (dateIndex * 0.1) }}
              >
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{dateGroup}</h2>
                <GlassmorphicCard className="overflow-hidden" borderGlow={true}>
                  {notifications.map((notification, index) => (
                    <div 
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 border-b border-gray-200 dark:border-gray-700 last:border-0 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40 ${notification.read ? '' : 'bg-blue-50/50 dark:bg-blue-900/10'}`}
                    >
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className={`inline-block px-2 py-1 text-xs rounded-full border ${getStatusColor(notification.type)} mr-2`}>
                              {notification.type}
                            </span>
                            <h3 className="font-medium">{notification.title}</h3>
                            {!notification.read && (
                              <span className="ml-2 w-2 h-2 rounded-full bg-blue-500"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{notification.message}</p>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            clearNotification(notification.id)
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Delete notification"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </GlassmorphicCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 