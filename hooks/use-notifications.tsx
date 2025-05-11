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
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notifications }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save notifications');
    }
  } catch (error) {
    console.error('Error saving notifications to server:', error);
  }
};

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
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    
    // Also save to server if available
    saveNotificationsToServer(notifications);
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
      addNotification({
        title: 'Event Updated',
        message: `"${data.title}" has been updated.`,
        type: 'info',
        link: `/events/${data.id}`
      });
    };
    
    // Subscribe to real-time events
    realtimeSync.subscribe('event-created', handleEventCreated);
    realtimeSync.subscribe('event-updated', handleEventUpdated);
    
    // Clean up subscriptions
    return () => {
      realtimeSync.unsubscribe('event-created', handleEventCreated);
      realtimeSync.unsubscribe('event-updated', handleEventUpdated);
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