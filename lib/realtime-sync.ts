// Broadcast Channel for real-time sync across tabs
type EventType = 'event-created' | 'event-updated' | 'event-deleted' | 'event-data-sync' | 'user-updated' | 'user-registered' | 'user-unregistered' | 'notification-received' | 'ping';

interface SyncMessage {
  type: EventType;
  data: any;
  timestamp: number;
  source: string;
}

class RealtimeSync {
  private static instance: RealtimeSync;
  private channel: BroadcastChannel | null = null;
  private eventListeners: Map<EventType, Set<(data: any) => void>> = new Map();
  private isSupported: boolean = false; 
  private instanceId: string = Math.random().toString(36).substring(2, 9);
  private debug: boolean = true; // Enable debug logging for troubleshooting
  private localStorageKey = 'eventvibe-sync';
  private syncMethod: 'broadcastchannel' | 'localstorage' | 'serviceworker' | 'none' = 'none';

  private constructor() {
    if (typeof window === 'undefined') {
      this.logDebug('Not in browser environment');
      return;
    }
    
    this.setupSync();
  }

  private setupSync(): void {
    // First try BroadcastChannel
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.logDebug('Setting up BroadcastChannel');
        this.channel = new BroadcastChannel('eventvibe-sync');
        this.channel.onmessage = this.handleMessage.bind(this);
        this.logDebug('BroadcastChannel setup successful');
        this.isSupported = true;
        this.syncMethod = 'broadcastchannel';
        return;
      } catch (error) {
        this.logDebug('BroadcastChannel setup failed:', error);
      }
    }
    
    // Try Service Worker messaging
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        this.logDebug('Setting up Service Worker messaging');
        // This will be initialized when SW is ready via the broadcastToOtherClients method
        this.isSupported = true;
        this.syncMethod = 'serviceworker';
        this.logDebug('Service Worker messaging setup successful');
        
        // Listen for messages from the service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type) {
            this.processMessage(event.data);
          }
        });
        
        return;
      } catch (error) {
        this.logDebug('Service Worker messaging setup failed:', error);
      }
    }
    
    // Fall back to localStorage
    try {
      this.logDebug('Setting up localStorage fallback');
      window.addEventListener('storage', this.handleStorageEvent);
      
      // Test localStorage is working
      localStorage.setItem('eventvibe-sync-test', 'test');
      localStorage.removeItem('eventvibe-sync-test');
      
      this.isSupported = true;
      this.syncMethod = 'localstorage';
      this.logDebug('localStorage fallback setup successful');
    } catch (error) {
      this.logDebug('localStorage fallback setup failed:', error);
      this.isSupported = false;
      this.syncMethod = 'none';
    }
  }
  
  private handleStorageEvent = (e: StorageEvent) => {
    if (e.key === this.localStorageKey && e.newValue) {
      try {
        const message = JSON.parse(e.newValue);
        // Only process messages from other instances
        if (message.source !== this.instanceId) {
          this.processMessage(message);
        }
      } catch (error) {
        console.error('[RealtimeSync] Error processing storage event:', error);
      }
    }
  };

  private handleMessage(event: MessageEvent) {
    try {
      this.processMessage(event.data);
    } catch (error) {
      console.error('[RealtimeSync] Error handling message:', error);
      
      // In production, we want to ensure the application doesn't break due to sync errors
      const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
      if (isProduction) {
        console.log('[RealtimeSync] Production environment - suppressing sync error');
      }
    }
  }

  private processMessage(message: SyncMessage) {
    try {
      // Validate the message
      if (!message || !message.type || message.source === this.instanceId) {
        return;
      }
      
      this.logDebug(`Received message of type ${message.type} from ${message.source}`);
      
      // Respond to ping messages for testing
      if (message.type === 'ping') {
        this.logDebug(`Received ping from ${message.source}`);
        this.broadcast('ping', { 
          response: true, 
          testId: message.data.testId,
          received: Date.now() 
        });
        return;
      }
      
      // For all other messages, notify listeners
      this.notifyLocalListeners(message.type, message.data);
      
      // For debugging - handle ping responses
      if (message.type === 'ping' && message.data.response) {
        this.logDebug(`Received ping response: round trip time = ${Date.now() - message.data.testId}ms`);
      }
    } catch (error) {
      // Log error but prevent it from breaking the app
      console.error('[RealtimeSync] Error processing message:', error, message);
    }
  }

  public broadcast(type: EventType, data: any): void {
    try {
      // Don't broadcast if not supported
      if (!this.isSupported) {
        this.logDebug(`Broadcast skipped (not supported): ${type}`);
        
        // Even if broadcast isn't supported, notify local listeners
        this.notifyLocalListeners(type, data);
        return;
      }
      
      // Prepare the message
      const message: SyncMessage = {
        type,
        data,
        timestamp: Date.now(),
        source: this.instanceId
      };
      
      // Notify local listeners
      this.notifyLocalListeners(type, data);
      
      // Broadcast to other clients
      this.broadcastToOtherClients(message);
      
      // For debugging
      this.logDebug(`Broadcast: ${type}`, data);
    } catch (error) {
      console.error('[RealtimeSync] Error during broadcast:', error);
      
      // Even if the broadcast fails, notify local listeners
      try {
        this.notifyLocalListeners(type, data);
      } catch (notifyError) {
        console.error('[RealtimeSync] Error notifying local listeners:', notifyError);
      }
    }
  }

  private notifyLocalListeners(type: EventType, data: any): void {
    const listeners = this.eventListeners.get(type);
    if (listeners && listeners.size > 0) {
      this.logDebug(`Notifying ${listeners.size} local listeners for ${type}`);
      
      // Use setTimeout to make it asynchronous and avoid blocking
      setTimeout(() => {
        listeners.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error(`[RealtimeSync] Error in local listener for ${type}:`, error);
          }
        });
      }, 0);
    } else {
      this.logDebug(`No local listeners for ${type}`);
    }
  }

  private broadcastToOtherClients(message: SyncMessage): void {
    // Inject message to custom events for direct DOM listeners
    if (typeof window !== 'undefined') {
      try {
        // Create a custom event that components can listen for directly
        const event = new CustomEvent(`eventvibe-${message.type}`, { detail: message.data });
        window.dispatchEvent(event);
      } catch (eventError) {
        console.error('[RealtimeSync] Error dispatching custom event:', eventError);
      }
    }
    
    // Try all sync methods
    switch (this.syncMethod) {
      case 'broadcastchannel':
        try {
          if (this.channel) {
            this.channel.postMessage(message);
          }
        } catch (error) {
          console.error('[RealtimeSync] Error using BroadcastChannel:', error);
          // Fall back to other methods
          this.broadcastViaLocalStorage(message);
          this.broadcastViaServiceWorker(message);
        }
        break;
      
      case 'serviceworker':
        this.broadcastViaServiceWorker(message);
        break;
      
      case 'localstorage':
        this.broadcastViaLocalStorage(message);
        break;
      
      case 'none':
      default:
        this.logDebug('No sync method available for broadcasting');
        break;
    }
  }
  
  private broadcastViaLocalStorage(message: SyncMessage): void {
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(message));
      // Clear after a short delay to ensure event is triggered
      setTimeout(() => {
        localStorage.removeItem(this.localStorageKey);
      }, 100);
    } catch (error) {
      console.error('[RealtimeSync] Error broadcasting via localStorage:', error);
    }
  }
  
  private broadcastViaServiceWorker(message: SyncMessage): void {
    try {
      if (typeof window !== 'undefined' && 
          'serviceWorker' in navigator && 
          navigator.serviceWorker.controller) {
        
        // Use the broadcastViaServiceWorker function if available (set by ServiceWorkerRegister)
        if (window.broadcastViaServiceWorker) {
          window.broadcastViaServiceWorker(message);
        } else {
          // Direct postMessage if the helper isn't available
          navigator.serviceWorker.controller.postMessage({
            type: 'BROADCAST',
            payload: message
          });
        }
      }
    } catch (error) {
      console.error('[RealtimeSync] Error broadcasting via Service Worker:', error);
    }
  }

  public subscribe(type: EventType, callback: (data: any) => void): () => void {
    try {
      // Get or create the listeners set for this event type
      if (!this.eventListeners.has(type)) {
        this.eventListeners.set(type, new Set());
      }
      
      const listeners = this.eventListeners.get(type)!;
      listeners.add(callback);
      
      this.logDebug(`Subscribed to ${type}, total listeners: ${listeners.size}`);
      
      // Return unsubscribe function
      return () => {
        try {
          const listeners = this.eventListeners.get(type);
          if (listeners) {
            listeners.delete(callback);
            this.logDebug(`Unsubscribed from ${type}, remaining listeners: ${listeners.size}`);
          }
        } catch (error) {
          console.error(`[RealtimeSync] Error unsubscribing from ${type}:`, error);
        }
      };
    } catch (error) {
      console.error(`[RealtimeSync] Error subscribing to ${type}:`, error);
      // Return a no-op unsubscribe function
      return () => {};
    }
  }

  public isSyncSupported(): boolean {
    return this.isSupported;
  }

  public getSyncMethod(): string {
    return this.syncMethod;
  }

  public reset(): void {
    try {
      // Reset all listeners
      this.eventListeners.clear();
      
      // Clean up BroadcastChannel
      if (this.channel) {
        this.channel.close();
        this.channel = null;
      }
      
      // Remove localStorage listener
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', this.handleStorageEvent);
      }
      
      // Re-initialize
      this.setupSync();
      
      this.logDebug('RealtimeSync reset complete');
    } catch (error) {
      console.error('[RealtimeSync] Error during reset:', error);
    }
  }

  // Fire an immediate test message
  public testConnection(): void {
    this.logDebug('Testing connection with ping');
    this.broadcast('ping', { testId: Date.now() });
  }

  private logDebug(...args: any[]): void {
    if (this.debug) {
      console.log('[RealtimeSync]', ...args);
    }
  }

  public static getInstance(): RealtimeSync {
    if (!RealtimeSync.instance) {
      RealtimeSync.instance = new RealtimeSync();
    }
    return RealtimeSync.instance;
  }
}

// Create and export the singleton instance
export const realtimeSync = RealtimeSync.getInstance();

// Export a diagnostic function to check if real-time sync is working
export const isRealtimeSyncSupported = () => realtimeSync.isSyncSupported();

// Custom hook for React components
import { useEffect } from 'react';

export function useRealtimeSync(type: EventType, callback: (data: any) => void) {
  useEffect(() => {
    // Test connection when component mounts
    realtimeSync.testConnection();
    
    // Subscribe to event
    const unsubscribe = realtimeSync.subscribe(type, callback);
    
    // Clean up subscription when component unmounts
    return unsubscribe;
  }, [type, callback]);
}

// Direct broadcast function for easy calling from anywhere
export function broadcastEvent(type: EventType, data: any) {
  realtimeSync.broadcast(type, data);
} 