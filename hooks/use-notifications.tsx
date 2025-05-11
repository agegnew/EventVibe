"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { realtimeSync } from '@/lib/realtime-sync';

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  link?: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'event';
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  clearAllUnread: () => void;
  fetchNotifications: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

// Storage keys
const NOTIFICATIONS_STORAGE_KEY = 'eventvibe_notifications';

// Helper function to save notifications to server
const saveNotificationsToServer = async (notifications: Notification[]): Promise<void> => {
  try {
    // First check if the notifications endpoint exists and is enabled
    if (typeof window !== 'undefined' && window.DISABLE_NOTIFICATION_SERVER_SAVE) {
      // Skip server save if explicitly disabled
      return;
    }
    
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notifications }),
    });
    
    if (!response.ok) {
      // Don't throw error, just log it - this makes server storage optional
      console.warn('Unable to save notifications to server, falling back to local storage only');
      if (typeof window !== 'undefined') {
        window.DISABLE_NOTIFICATION_SERVER_SAVE = true; // Disable future attempts in this session
      }
    }
  } catch (error) {
    console.warn('Error saving notifications to server, using local storage only:', error);
    if (typeof window !== 'undefined') {
      window.DISABLE_NOTIFICATION_SERVER_SAVE = true; // Disable future attempts in this session
    }
  }
};

// Add TypeScript declaration to window object
declare global {
  interface Window {
    DISABLE_NOTIFICATION_SERVER_SAVE?: boolean;
  }
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Calculate unread count
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  // Fetch notifications from server
  const fetchNotifications = async (): Promise<void> => {
    try {
      const response = await fetch('/api/notifications');
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      } else {
        // Fall back to localStorage if API fails
        const savedNotifications = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        if (savedNotifications) {
          setNotifications(JSON.parse(savedNotifications));
        }
      }
    } catch (error) {
      // Fall back to localStorage on error
      try {
        const savedNotifications = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        if (savedNotifications) {
          setNotifications(JSON.parse(savedNotifications));
        }
      } catch (storageError) {
        // Storage error, unable to load notifications
      }
    }
  };
  
  // Load notifications on initial load - immediately invoke the function
  useEffect(() => {
    // Immediate fetch
    fetchNotifications();
    
    // Also set up an interval to refresh notifications every minute
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 60000); // 1 minute
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Save notifications to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
      
      // Also save to server if available
      saveNotificationsToServer(notifications);
    } catch (e) {
      console.warn('Failed to save notifications to localStorage:', e);
    }
  }, [notifications]);
  
  // Listen for real-time event changes via BroadcastChannel
  useEffect(() => {
    // Handler for new events
    const handleEventCreated = (data: any) => {
      // Check if it's a bulk import
      if (data.isBulkImport && data.events) {
        addNotification({
          title: 'Multiple Events Created',
          message: `${data.events.length} new events have been imported.`,
          type: 'info',
          link: '/events'
        });
        return;
      }
      
      // Single event creation
      addNotification({
        title: 'New Event Created',
        message: `"${data.title}" has been added to events.`,
        type: 'event',
        link: `/events/${data.id}`
      });
    };
    
    // Handler for event updates
    const handleEventUpdated = (data: any) => {
      console.log('[useNotifications] Received event-updated with data:', data);
      
      if (!data || !data.id) {
        console.error('[useNotifications] Invalid event update data received:', data);
        return;
      }
      
      // Ensure we have a title even if data is incomplete
      const title = data.title || 'Event';
      
      // Create notification for the event update
      addNotification({
        title: 'Event Updated',
        message: `"${title}" has been updated.`,
        type: 'info',
        link: `/events/${data.id}`
      });
    };
    
    // Handler for user event registration
    const handleUserRegistered = (data: any) => {
      console.log('[useNotifications] Received user-registered with data:', data);
      
      // Check if we have proper event data
      if (!data) {
        console.error('[useNotifications] Invalid registration data:', data);
        return;
      }
      
      // Extract event title from either direct property or nested object
      let eventTitle = '';
      let eventId = '';
      
      if (data.event && data.event.title) {
        // Handle new format with event object
        eventTitle = data.event.title;
        eventId = data.event.id;
      } else if (data.eventTitle) {
        // Handle old format with direct properties
        eventTitle = data.eventTitle;
        eventId = data.eventId;
      } else {
        console.error('[useNotifications] Missing event title in registration data:', data);
        return;
      }
      
      addNotification({
        title: 'Registration Successful',
        message: `You've successfully registered for "${eventTitle}".`,
        type: 'success',
        link: `/events/${eventId}`
      });
    };
    
    // Handler for user event unregistration
    const handleUserUnregistered = (data: any) => {
      console.log('[useNotifications] Received user-unregistered with data:', data);
      
      // Check if we have proper event data
      if (!data) {
        console.error('[useNotifications] Invalid unregistration data:', data);
        return;
      }
      
      // Extract event title from either direct property or nested object
      let eventTitle = '';
      let eventId = '';
      
      if (data.event && data.event.title) {
        // Handle new format with event object
        eventTitle = data.event.title;
        eventId = data.event.id;
      } else if (data.eventTitle) {
        // Handle old format with direct properties
        eventTitle = data.eventTitle;
        eventId = data.eventId;
      } else {
        console.error('[useNotifications] Missing event title in unregistration data:', data);
        return;
      }
      
      addNotification({
        title: 'Unregistration Successful',
        message: `You've successfully unregistered from "${eventTitle}".`,
        type: 'info',
        link: `/events/${eventId}`
      });
    };
    
    // Subscribe to real-time events - enhanced with direct registration to ensure connection
    const unsubEventCreated = realtimeSync.subscribe('event-created', handleEventCreated);
    const unsubEventUpdated = realtimeSync.subscribe('event-updated', handleEventUpdated);
    const unsubUserRegistered = realtimeSync.subscribe('user-registered', handleUserRegistered);
    const unsubUserUnregistered = realtimeSync.subscribe('user-unregistered', handleUserUnregistered);
    
    // Clean up subscriptions
    return () => {
      unsubEventCreated();
      unsubEventUpdated();
      unsubUserRegistered();
      unsubUserUnregistered();
    };
  }, []);
  
  // Add a new notification
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
      read: false
    };
    
    setNotifications(prevNotifications => [newNotification, ...prevNotifications].slice(0, 50)); // Limit to 50 notifications
    
    // Play notification sound
    const audio = new Audio('/sounds/notification.mp3');
    audio.play().catch(() => {});
  };
  
  // Mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications(prevNotifications => {
      const updatedNotifications = prevNotifications.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      );
      
      // Save to localStorage immediately
      try {
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
        
        // Also update on server
        saveNotificationsToServer(updatedNotifications);
      } catch (error) {
        // Storage error
      }
      
      return updatedNotifications;
    });
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prevNotifications => {
      const updatedNotifications = prevNotifications.map(notification => ({ ...notification, read: true }));
      
      // Save to server
      saveNotificationsToServer(updatedNotifications);
      
      return updatedNotifications;
    });
  };
  
  // Clear a specific notification
  const clearNotification = (id: string) => {
    setNotifications(prevNotifications => {
      const updatedNotifications = prevNotifications.filter(notification => notification.id !== id);
      
      // Save to server
      saveNotificationsToServer(updatedNotifications);
      
      return updatedNotifications;
    });
  };
  
  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    
    // Save empty array to server
    saveNotificationsToServer([]);
  };
  
  // Clear all unread notifications
  const clearAllUnread = () => {
    setNotifications(prevNotifications => {
      const updatedNotifications = prevNotifications.map(notification => 
        notification.read ? notification : { ...notification, read: true }
      );
      
      // Save to localStorage immediately
      try {
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
        
        // Also update on server
        saveNotificationsToServer(updatedNotifications);
      } catch (error) {
        // Storage error
      }
      
      return updatedNotifications;
    });
  };
  
  return (
    <NotificationsContext.Provider 
      value={{ 
        notifications, 
        unreadCount,
        addNotification, 
        markAsRead, 
        markAllAsRead,
        clearNotification,
        clearAllNotifications,
        clearAllUnread,
        fetchNotifications
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
} 