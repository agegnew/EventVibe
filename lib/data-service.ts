import { v4 as uuidv4 } from 'uuid';
import { realtimeSync } from './realtime-sync';
import * as offlineDB from './offline-db';

// Add TypeScript declaration
declare global {
  interface Window {
    broadcastViaServiceWorker?: (message: { type: string; data: any }) => void;
  }
}

// Define types
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  avatar: string;
  events: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate: string;
  location: string;
  image: string;
  category: string;
  price: number;
  seats: number;
  registrations: number;
  revenue: number;
  status: 'Active' | 'Draft' | 'Upcoming' | 'Completed' | 'Cancelled';
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

// Network status
let isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

// Setup online/offline event listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { 
    isOnline = true;
    console.log('[DataService] App is online. Processing sync queue...');
    processSyncQueue();
  });
  
  window.addEventListener('offline', () => { 
    isOnline = false; 
    console.log('[DataService] App is offline. Operations will be queued.');
  });
}

// Process operations in the sync queue when back online
async function processSyncQueue() {
  try {
    if (!isOnline) return;
    
    const queue = await offlineDB.getSyncQueue();
    console.log(`[DataService] Processing ${queue.length} items in sync queue`);
    
    for (const item of queue) {
      try {
        console.log(`[DataService] Processing sync item: ${item.operation}`, item.data);
        
        switch (item.operation) {
          case 'createEvent':
            await createEventOnline(item.data.eventData, item.data.imageFile);
            break;
          case 'updateEvent':
            await updateEventOnline(item.data.id, item.data.eventData, item.data.imageFile);
            break;
          case 'deleteEvent':
            await deleteEventOnline(item.data.id);
            break;
          case 'registerEvent':
            await registerForEventOnline(item.data.userId, item.data.eventId);
            break;
          case 'unregisterEvent':
            await unregisterFromEventOnline(item.data.userId, item.data.eventId);
            break;
        }
        
        // Remove processed item from queue
        await offlineDB.removeFromSyncQueue(item.id);
      } catch (error) {
        console.error(`[DataService] Error processing sync item ${item.id}:`, error);
        // Leave failed items in the queue to retry later
      }
    }
  } catch (error) {
    console.error('[DataService] Error processing sync queue:', error);
  }
}

// Define the response types for registration/unregistration
interface EventRegistrationResponse {
  success: boolean;
  message: string;
  error?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    events: string[];
  };
  event?: {
    id: string;
    title: string;
    registrations: number;
  };
}

// Events API - Client-side functions
export const getAllEvents = async (): Promise<Event[]> => {
  try {
    if (isOnline) {
      // Online - fetch from server
      const response = await fetch('/api/events', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const events = await response.json();
      
      // Save events to IndexedDB for offline use
      await offlineDB.saveEvents(events);
      
      return events;
    } else {
      // Offline - get from IndexedDB
      console.log('[DataService] Offline mode - getting events from IndexedDB');
      return await offlineDB.getEvents();
    }
  } catch (error) {
    console.error('[DataService] Error in getAllEvents:', error);
    
    // If online fetch fails, try to get from IndexedDB
    try {
      console.log('[DataService] Fetching failed, trying IndexedDB fallback');
      return await offlineDB.getEvents();
    } catch (dbError) {
      console.error('[DataService] IndexedDB fallback failed:', dbError);
      return [];
    }
  }
};

export const getEventById = async (id: string): Promise<Event | null> => {
  try {
    if (isOnline) {
      // Online - fetch from server
      const response = await fetch(`/api/events/${id}`, { cache: 'no-store' });
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch event');
      }
      
      const event = await response.json();
      
      // Save to IndexedDB for offline use
      if (event) {
        await offlineDB.saveEvents([event]);
      }
      
      return event;
    } else {
      // Offline - get from IndexedDB
      console.log(`[DataService] Offline mode - getting event ${id} from IndexedDB`);
      return await offlineDB.getEventById(id);
    }
  } catch (error) {
    console.error(`[DataService] Error in getEventById ${id}:`, error);
    
    // If online fetch fails, try to get from IndexedDB
    try {
      console.log('[DataService] Fetching failed, trying IndexedDB fallback');
      return await offlineDB.getEventById(id);
    } catch (dbError) {
      console.error('[DataService] IndexedDB fallback failed:', dbError);
      return null;
    }
  }
};

// Online version of createEvent
async function createEventOnline(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'registrations' | 'revenue'>, imageFile?: File): Promise<Event> {
  const formData = new FormData();
  formData.append('data', JSON.stringify(eventData));
  
  if (imageFile) {
    formData.append('image', imageFile);
  }
  
  const response = await fetch('/api/events', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to create event');
  }
  
  const newEvent = await response.json();
  
  // Broadcast the event creation to other tabs
  realtimeSync.broadcast('event-created', newEvent);
  
  return newEvent;
}

export const createEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'registrations' | 'revenue'>, imageFile?: File): Promise<Event> => {
  if (isOnline) {
    return createEventOnline(eventData, imageFile);
  } else {
    // Offline - add to sync queue and create a temporary event
    console.log('[DataService] Offline mode - queueing event creation');
    
    // Create a temporary event with client-side ID
    const tempEvent: Event = {
      id: `temp-${uuidv4()}`,
      ...eventData,
      registrations: 0,
      revenue: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Save to IndexedDB for offline use
    await offlineDB.saveEvents([tempEvent]);
    
    // Queue for syncing later
    await offlineDB.addToSyncQueue('createEvent', { 
      eventData, 
      imageFile: imageFile ? { name: imageFile.name, type: imageFile.type } : undefined 
    });
    
    return tempEvent;
  }
};

// Online version of updateEvent
async function updateEventOnline(id: string, eventData: Partial<Event>, imageFile?: File): Promise<Event> {
  try {
    console.log("[DataService] Updating event", id, "with data:", eventData);
    
    // Create a JSON-only version that doesn't require FormData for deployment scenarios
    // This simplifies the request for environments where file handling might be problematic
    if (!imageFile) {
      // If no image file, use a simple JSON request instead of FormData
      console.log("[DataService] Using JSON-only update method (no image)");
      const response = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: eventData
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("[DataService] Error updating event:", errorData);
        throw new Error('Failed to update event: ' + (errorData.error || 'Unknown error'));
      }
      
      const updatedEvent = await response.json();
      
      // Ensure we have a complete event with all needed fields for notifications
      if (!updatedEvent || !updatedEvent.id) {
        console.error("[DataService] Received invalid event data:", updatedEvent);
        throw new Error('Invalid event data received from server');
      }
      
      console.log("[DataService] Event updated successfully, broadcasting:", updatedEvent);
      
      // Broadcasting code with try-catch...
      try {
        // Try multiple broadcast methods to ensure cross-browser notifications
        // First, reset the realtime sync system to ensure fresh connections
        realtimeSync.reset();
        
        // Wait a moment to ensure the reset takes effect
        setTimeout(() => {
          try {
            // Use the direct broadcast method to ensure it gets sent
            console.log("[DataService] Broadcasting event-updated event");
            realtimeSync.broadcast('event-updated', updatedEvent);
            
            // Also try to broadcast via the service worker if available
            if (typeof window !== 'undefined' && 
                'serviceWorker' in navigator && 
                navigator.serviceWorker.controller &&
                window.broadcastViaServiceWorker) {
              console.log("[DataService] Broadcasting via ServiceWorker");
              window.broadcastViaServiceWorker({
                type: 'event-updated',
                data: updatedEvent
              });
            }
            
            // Dispatch a custom event on the window for local components
            if (typeof window !== 'undefined') {
              console.log("[DataService] Dispatching custom event");
              const customEvent = new CustomEvent('event-updated', { 
                detail: updatedEvent 
              });
              window.dispatchEvent(customEvent);
              
              // Also dispatch a direct notification event as a fallback
              const notificationEvent = new CustomEvent('custom-notification', {
                detail: {
                  type: 'notification',
                  title: 'Event Updated',
                  message: `"${updatedEvent.title}" has been updated.`,
                  link: `/events/${updatedEvent.id}`
                }
              });
              window.dispatchEvent(notificationEvent);
            }
          } catch (innerError) {
            console.error("[DataService] Error in broadcasting event update:", innerError);
            // Event update still succeeded even if notifications failed
          }
        }, 100);
      } catch (notificationError) {
        console.error("[DataService] Error in notification part of update:", notificationError);
        // Event still updated successfully, just notification failed
      }
      
      return updatedEvent;
    }
    
    // Use FormData for image uploads
    const formData = new FormData();
    formData.append('data', JSON.stringify(eventData));
    
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    const response = await fetch(`/api/events/${id}`, {
      method: 'PUT',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("[DataService] Error updating event:", errorData);
      throw new Error('Failed to update event: ' + (errorData.error || 'Unknown error'));
    }
    
    const updatedEvent = await response.json();
    
    // Ensure we have a complete event with all needed fields for notifications
    if (!updatedEvent || !updatedEvent.id) {
      console.error("[DataService] Received invalid event data:", updatedEvent);
      throw new Error('Invalid event data received from server');
    }
    
    console.log("[DataService] Event updated successfully, broadcasting:", updatedEvent);
    
    // Use a try-catch around the notification and broadcasting part
    // to make sure event updates succeed even if notifications fail
    try {
      // Try multiple broadcast methods to ensure cross-browser notifications
      // First, reset the realtime sync system to ensure fresh connections
      realtimeSync.reset();
      
      // Wait a moment to ensure the reset takes effect
      setTimeout(() => {
        try {
          // Use the direct broadcast method to ensure it gets sent
          console.log("[DataService] Broadcasting event-updated event");
          realtimeSync.broadcast('event-updated', updatedEvent);
          
          // Also try to broadcast via the service worker if available
          if (typeof window !== 'undefined' && 
              'serviceWorker' in navigator && 
              navigator.serviceWorker.controller &&
              window.broadcastViaServiceWorker) {
            console.log("[DataService] Broadcasting via ServiceWorker");
            window.broadcastViaServiceWorker({
              type: 'event-updated',
              data: updatedEvent
            });
          }
          
          // Dispatch a custom event on the window for local components
          if (typeof window !== 'undefined') {
            console.log("[DataService] Dispatching custom event");
            const customEvent = new CustomEvent('event-updated', { 
              detail: updatedEvent 
            });
            window.dispatchEvent(customEvent);
            
            // Also dispatch a direct notification event as a fallback
            const notificationEvent = new CustomEvent('custom-notification', {
              detail: {
                type: 'notification',
                title: 'Event Updated',
                message: `"${updatedEvent.title}" has been updated.`,
                link: `/events/${updatedEvent.id}`
              }
            });
            window.dispatchEvent(notificationEvent);
          }
        } catch (innerError) {
          console.error("[DataService] Error in broadcasting event update:", innerError);
          // Event update still succeeded even if notifications failed
        }
      }, 100);
    } catch (notificationError) {
      console.error("[DataService] Error in notification part of update:", notificationError);
      // Event still updated successfully, just notification failed
    }
    
    return updatedEvent;
  } catch (error) {
    console.error('[DataService] Error updating event:', error);
    throw error;
  }
}

export const updateEvent = async (id: string, eventData: Partial<Event>, imageFile?: File): Promise<Event> => {
  if (isOnline) {
    return updateEventOnline(id, eventData, imageFile);
  } else {
    // Offline - add to sync queue and update locally
    console.log(`[DataService] Offline mode - queueing event update for ${id}`);
    
    // Get current event from IndexedDB
    const currentEvent = await offlineDB.getEventById(id);
    
    if (!currentEvent) {
      throw new Error(`Event ${id} not found in offline storage`);
    }
    
    // Create updated event
    const updatedEvent: Event = {
      ...currentEvent,
      ...eventData,
      updatedAt: new Date().toISOString()
    };
    
    // Save to IndexedDB
    await offlineDB.saveEvents([updatedEvent]);
    
    // Queue for syncing later
    await offlineDB.addToSyncQueue('updateEvent', { 
      id, 
      eventData, 
      imageFile: imageFile ? { name: imageFile.name, type: imageFile.type } : undefined 
    });
    
    return updatedEvent;
  }
};

// Online version of deleteEvent
async function deleteEventOnline(id: string): Promise<boolean> {
  const response = await fetch(`/api/events/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete event');
  }
  
  // Broadcast the event deletion to other tabs
  realtimeSync.broadcast('event-deleted', { id });
  
  return true;
}

export const deleteEvent = async (id: string): Promise<boolean> => {
  if (isOnline) {
    return deleteEventOnline(id);
  } else {
    // Offline - add to sync queue
    console.log(`[DataService] Offline mode - queueing event deletion for ${id}`);
    
    // Queue for syncing later
    await offlineDB.addToSyncQueue('deleteEvent', { id });
    
    return true;
  }
};

// Users API - Client-side functions
export const getAllUsers = async (): Promise<User[]> => {
  try {
    if (isOnline) {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    } else {
      // Return empty array when offline - not critical for most user flows
      console.log('[DataService] Offline mode - user data not available');
      return [];
    }
  } catch (error) {
    console.error('[DataService] Error in getAllUsers:', error);
    return [];
  }
};

export const getUserById = async (id: string): Promise<User | null> => {
  try {
    if (isOnline) {
      const response = await fetch(`/api/users/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch user');
      }
      
      const user = await response.json();
      
      // Save current user to IndexedDB for offline use
      if (user) {
        await offlineDB.saveUser(user);
      }
      
      return user;
    } else {
      // Try to get user from IndexedDB
      console.log(`[DataService] Offline mode - getting user ${id} from IndexedDB`);
      return await offlineDB.getUser(id);
    }
  } catch (error) {
    console.error(`[DataService] Error in getUserById ${id}:`, error);
    
    // If online fetch fails, try to get from IndexedDB
    try {
      return await offlineDB.getUser(id);
    } catch (dbError) {
      console.error('[DataService] IndexedDB fallback failed:', dbError);
      return null;
    }
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  // This is now handled server-side
  const users = await getAllUsers();
  return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
};

export const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>, avatarFile?: File): Promise<User> => {
  const formData = new FormData();
  formData.append('data', JSON.stringify(userData));
  
  if (avatarFile) {
    formData.append('avatar', avatarFile);
  }
  
  const response = await fetch('/api/users', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to create user');
  }
  
  return response.json();
};

export const updateUser = async (id: string, userData: Partial<User>, avatarFile?: File): Promise<User> => {
  const formData = new FormData();
  formData.append('data', JSON.stringify(userData));
  
  if (avatarFile) {
    formData.append('avatar', avatarFile);
  }
  
  const response = await fetch(`/api/users/${id}`, {
    method: 'PUT',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to update user');
  }
  
  const updatedUser = await response.json();
  
  // Broadcast user update to other tabs if it's the current user
  realtimeSync.broadcast('user-updated', updatedUser);
  
  return updatedUser;
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const response = await fetch(`/api/users/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete user');
  }
  
  return true;
};

// Authentication helpers
export const validateCredentials = async (email: string, password: string): Promise<User | null> => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    return null;
  }
  
  return response.json();
};

// Online version of registerForEvent
async function registerForEventOnline(userId: string, eventId: string): Promise<EventRegistrationResponse> {
  try {
    console.log(`[DataService] Registering user ${userId} for event ${eventId}`);
    
    const response = await fetch('/api/events/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, eventId }),
    });
    
    // Handle errors but don't throw exceptions
    if (!response.ok) {
      const errorData = await response.json();
      console.error('[DataService] Registration failed:', errorData);
      return { 
        success: false, 
        message: 'Registration failed',
        error: errorData.error || 'Failed to register for event'
      };
    }
    
    const result = await response.json();
    
    if (result.success) {
      console.log('[DataService] Registration successful:', result);
      
      // First, broadcast the user-registered event for notifications
      console.log('[DataService] Broadcasting user-registered event');
      realtimeSync.broadcast('user-registered', {
        user: result.user,
        event: result.event
      });
      
      // Next, broadcast the silent event update to update counts across all tabs
      console.log('[DataService] Broadcasting event-data-sync for updated registrations');
      realtimeSync.broadcast('event-data-sync', {
        id: eventId,
        registrations: result.event.registrations
      });
      
      // Finally, broadcast the user update
      console.log('[DataService] Broadcasting user-updated for registered user');
      realtimeSync.broadcast('user-updated', result.user);
    }
    
    return result;
  } catch (error) {
    console.error('[DataService] Error in registerForEvent:', error);
    return { 
      success: false, 
      message: 'Registration failed due to an error',
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export const registerForEvent = async (userId: string, eventId: string): Promise<EventRegistrationResponse> => {
  if (isOnline) {
    return registerForEventOnline(userId, eventId);
  } else {
    // Offline - add to sync queue
    console.log(`[DataService] Offline mode - queueing event registration for event ${eventId}`);
    
    // Queue for syncing later
    await offlineDB.addToSyncQueue('registerEvent', { userId, eventId });
    
    return { 
      success: true, 
      message: 'Registration queued for when you are back online' 
    };
  }
};

// Online version of unregisterFromEvent
async function unregisterFromEventOnline(userId: string, eventId: string): Promise<EventRegistrationResponse> {
  try {
    console.log(`[DataService] Unregistering user ${userId} from event ${eventId}`);
    
    const response = await fetch('/api/events/unregister', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, eventId }),
    });
    
    // Handle errors but don't throw exceptions
    if (!response.ok) {
      const errorData = await response.json();
      console.error('[DataService] Unregistration failed:', errorData);
      return { 
        success: false, 
        message: 'Unregistration failed',
        error: errorData.error || 'Failed to unregister from event'
      };
    }
    
    const result = await response.json();
    
    if (result.success) {
      console.log('[DataService] Unregistration successful:', result);
      
      // First, broadcast the user-unregistered event for notifications
      console.log('[DataService] Broadcasting user-unregistered event');
      realtimeSync.broadcast('user-unregistered', {
        user: result.user,
        event: result.event
      });
      
      // Next, broadcast the silent event update to update counts across all tabs
      console.log('[DataService] Broadcasting event-data-sync for updated registrations');
      realtimeSync.broadcast('event-data-sync', {
        id: eventId,
        registrations: result.event.registrations
      });
      
      // Finally, broadcast the user update
      console.log('[DataService] Broadcasting user-updated for unregistered user');
      realtimeSync.broadcast('user-updated', result.user);
    }
    
    return result;
  } catch (error) {
    console.error('[DataService] Error in unregisterFromEvent:', error);
    return { 
      success: false, 
      message: 'Unregistration failed due to an error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export const unregisterFromEvent = async (userId: string, eventId: string): Promise<EventRegistrationResponse> => {
  if (isOnline) {
    return unregisterFromEventOnline(userId, eventId);
  } else {
    // Offline - add to sync queue
    console.log(`[DataService] Offline mode - queueing event unregistration for event ${eventId}`);
    
    // Queue for syncing later
    await offlineDB.addToSyncQueue('unregisterEvent', { userId, eventId });
    
    return { 
      success: true, 
      message: 'Unregistration queued for when you are back online' 
    };
  }
};

// Bulk import events from CSV
export const importEventsFromCsv = async (csvFile: File): Promise<{ events: Event[]; message: string }> => {
  const formData = new FormData();
  formData.append('file', csvFile);
  
  const response = await fetch('/api/events/import', {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to import events');
  }
  
  const result = await response.json();
  
  // Broadcast each imported event to other tabs
  if (result.events && result.events.length > 0) {
    // For large imports, batch the events to avoid overwhelming the BroadcastChannel
    // Send a combined event with all events
    realtimeSync.broadcast('event-created', {
      isBulkImport: true,
      events: result.events
    });
    
    // Small delay to prevent race conditions
    setTimeout(() => {
      // Also broadcast individual events for backward compatibility
      result.events.forEach((event: Event) => {
        realtimeSync.broadcast('event-created', event);
      });
    }, 100);
  }
  
  return result;
};

// Export events to CSV or iCal
export const exportEvents = (format: 'csv' | 'ical', filters?: { category?: string; status?: string }) => {
  // Construct URL with filters
  const exportUrl = new URL(`${window.location.origin}/api/events/export`);
  
  // Set format (csv or ical)
  exportUrl.searchParams.set('format', format);
  
  // Add optional filters
  if (filters) {
    if (filters.category && filters.category !== 'all') {
      exportUrl.searchParams.set('category', filters.category);
    }
    
    if (filters.status && filters.status !== 'all') {
      exportUrl.searchParams.set('status', filters.status);
    }
  }
  
  // Trigger download by opening URL in new tab/window
  window.open(exportUrl.toString(), '_blank');
};