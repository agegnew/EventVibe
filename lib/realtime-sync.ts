// Broadcast Channel for real-time sync across tabs
type EventType = 'event-created' | 'event-updated' | 'event-deleted' | 'event-data-sync' | 'user-updated' | 'user-registered' | 'user-unregistered' | 'ping';

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
  private syncMethod: 'broadcastchannel' | 'localstorage' | 'none' = 'none';

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
    this.processMessage(event.data);
  }
  
  private processMessage(message: SyncMessage) {
    if (!message || !message.type) {
      return;
    }
    
    // Don't process ping messages
    if (message.type === 'ping') {
      this.logDebug(`Received ping from ${message.data?.source || 'unknown'}`);
      return;
    }

    this.logDebug(`Processing message type: ${message.type}`, message);
    
    // Find listeners for this event type
    const listeners = this.eventListeners.get(message.type);
    if (listeners && listeners.size > 0) {
      this.logDebug(`Notifying ${listeners.size} listeners for ${message.type}`);
      // Call each listener with the message data
      listeners.forEach(callback => {
        try {
          callback(message.data);
        } catch (error) {
          console.error(`[RealtimeSync] Error in event listener for ${message.type}:`, error);
        }
      });
    } else {
      this.logDebug(`No listeners for ${message.type}`);
    }
  }

  public broadcast(type: EventType, data: any): void {
    if (typeof window === 'undefined') {
      this.logDebug('Cannot broadcast - not in browser environment');
      return;
    }
    
    this.logDebug(`Broadcasting message type: ${type}`, data);
    
    const message: SyncMessage = {
      type,
      data,
      timestamp: Date.now(),
      source: this.instanceId
    };
    
    // IMPORTANT: Always process locally first to ensure the current tab always gets updated
    this.notifyLocalListeners(type, data);
    
    // Then try multiple strategies to broadcast to other tabs/windows
    this.broadcastToOtherClients(message);
    
    // Use localStorage as a guaranteed method for older browsers
    try {
      const storageKey = 'eventvibe-sync-' + Date.now();
      localStorage.setItem(storageKey, JSON.stringify(message));
      
      // Need to remove after a short delay
      setTimeout(() => {
        localStorage.removeItem(storageKey);
      }, 500);
    } catch (e) {
      this.logDebug('Failed to use localStorage fallback:', e);
    }
    
    // Use service worker if available (this provides cross-browser communication)
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        navigator.serviceWorker.controller.postMessage({
          type: 'BROADCAST',
          payload: message
        });
        this.logDebug('Broadcast via ServiceWorker');
      } catch (e) {
        this.logDebug('Failed to use ServiceWorker for broadcast:', e);
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
    }
  }
  
  private broadcastToOtherClients(message: SyncMessage): void {
    try {
      if (this.syncMethod === 'broadcastchannel' && this.channel) {
        this.channel.postMessage(message);
        this.logDebug('Broadcast via BroadcastChannel');
      } 
      else if (this.syncMethod === 'localstorage') {
        // Clear existing value first
        localStorage.removeItem(this.localStorageKey);
        // Set new value to trigger storage event in other tabs
        localStorage.setItem(this.localStorageKey, JSON.stringify(message));
        this.logDebug('Broadcast via localStorage');
        
        // Need to remove the item after a delay to allow other tabs to read it
        setTimeout(() => {
          localStorage.removeItem(this.localStorageKey);
        }, 500);
      }
      else {
        this.logDebug('No broadcast method available');
      }
    } catch (error) {
      console.error('[RealtimeSync] Error broadcasting message:', error);
      
      // If the preferred method fails, try the fallback
      if (this.syncMethod === 'broadcastchannel') {
        this.logDebug('BroadcastChannel failed, trying localStorage fallback');
        this.channel = null;
        this.syncMethod = 'localstorage';
        
        try {
          localStorage.setItem(this.localStorageKey, JSON.stringify(message));
          setTimeout(() => localStorage.removeItem(this.localStorageKey), 500);
        } catch (err) {
          console.error('[RealtimeSync] Fallback broadcast also failed:', err);
        }
      }
    }
  }

  public subscribe(type: EventType, callback: (data: any) => void): () => void {
    this.logDebug(`Subscribing to ${type}`);
    
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, new Set());
    }
    
    const listeners = this.eventListeners.get(type)!;
    listeners.add(callback);
    
    return () => {
      this.logDebug(`Unsubscribing from ${type}`);
      if (this.eventListeners.has(type)) {
        this.eventListeners.get(type)!.delete(callback);
      }
    };
  }

  public isSyncSupported(): boolean {
    return this.isSupported;
  }
  
  public getSyncMethod(): string {
    return this.syncMethod;
  }
  
  public reset(): void {
    this.logDebug('Resetting RealtimeSync');
    
    // Clean up existing connections
    if (this.channel) {
      try {
        this.channel.close();
      } catch (e) {
        // Ignore errors during close
      }
      this.channel = null;
    }
    
    if (this.syncMethod === 'localstorage' && typeof window !== 'undefined') {
      window.removeEventListener('storage', this.handleStorageEvent);
    }
    
    this.isSupported = false;
    this.syncMethod = 'none';
    
    // Retry setup
    this.setupSync();
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

// Export a singleton instance
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