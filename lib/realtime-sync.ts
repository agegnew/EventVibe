// Broadcast Channel for real-time sync across tabs
type EventType = 'event-created' | 'event-updated' | 'event-deleted' | 'event-data-sync' | 'user-updated' | 'user-registered' | 'user-unregistered' | 'ping';

interface SyncMessage {
  type: EventType;
  data: any;
  timestamp: number;
  source?: string;
}

class RealtimeSync {
  private static instance: RealtimeSync;
  private channel: BroadcastChannel | null = null;
  private eventListeners: Map<string, Set<(data: any) => void>> = new Map();
  private isSupported: boolean = typeof BroadcastChannel !== 'undefined';
  private instanceId: string = Math.random().toString(36).substring(2, 9);
  private debug: boolean = false; // Disable debug logging
  private storageListener: ((e: StorageEvent) => void) | null = null;

  private constructor() {
    // Initialize with given instance ID
    
    // Try to use BroadcastChannel API
    if (this.isSupported) {
      this.initChannel();
    } else {
      this.initLocalStorageFallback();
    }
  }

  private initChannel() {
    try {
      this.logDebug('Initializing BroadcastChannel');
      this.channel = new BroadcastChannel('eventvibe-sync');
      this.channel.onmessage = this.handleMessage.bind(this);
      
      // Set up a ping to verify communication
      this.pingChannel();
      this.isSupported = true;
    } catch (error) {
      console.error('[RealtimeSync] Failed to initialize BroadcastChannel:', error);
      this.isSupported = false;
      // Fall back to localStorage if BroadcastChannel fails
      this.initLocalStorageFallback();
    }
  }
  
  private pingChannel() {
    // Send a test ping message to verify channel is working
    setTimeout(() => {
      try {
        if (this.channel) {
          this.logDebug('Sending ping message to test channel');
          this.channel.postMessage({
            type: 'ping',
            data: { source: this.instanceId },
            timestamp: Date.now()
          });
        }
      } catch (error) {
        console.error('[RealtimeSync] Error sending ping:', error);
      }
    }, 1000);
  }
  
  private initLocalStorageFallback() {
    this.logDebug('Initializing localStorage fallback');
    // Use localStorage events as a fallback mechanism
    this.storageListener = (e: StorageEvent) => {
      if (e.key === 'eventvibe-sync' && e.newValue) {
        try {
          const message = JSON.parse(e.newValue);
          // Only process messages from other instances
          if (message.source !== this.instanceId) {
            this.handleMessage({ data: message } as MessageEvent);
          }
        } catch (error) {
          console.error('[RealtimeSync] Error parsing storage event:', error);
        }
      }
    };
    
    window.addEventListener('storage', this.storageListener);
  }

  private handleMessage(event: MessageEvent) {
    const message = event.data as SyncMessage;
    
    if (!message || !message.type) {
      return;
    }
    
    // Don't process ping messages
    if (message.type === 'ping') {
      this.logDebug(`Received ping from ${message.data?.source || 'unknown'}`);
      return;
    }

    this.logDebug(`Received message type: ${message.type}`, message.data);

    // Get listeners for this event type
    const listeners = this.eventListeners.get(message.type);
    if (listeners) {
      this.logDebug(`Notifying ${listeners.size} listeners for ${message.type}`);
      // Notify all listeners
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

  public static getInstance(): RealtimeSync {
    if (!RealtimeSync.instance) {
      RealtimeSync.instance = new RealtimeSync();
    }
    return RealtimeSync.instance;
  }

  public broadcast(type: EventType, data: any): void {
    this.logDebug(`Broadcasting message type: ${type}`, data);
    
    const message: SyncMessage = {
      type,
      data,
      timestamp: Date.now(),
      source: this.instanceId
    };

    try {
      // Try to use BroadcastChannel first
      if (this.channel) {
        this.channel.postMessage(message);
      } 
      // Fall back to localStorage if BroadcastChannel is not available
      else if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('eventvibe-sync', JSON.stringify(message));
        // To trigger storage events, we need to update the value
        setTimeout(() => {
          localStorage.removeItem('eventvibe-sync');
        }, 100);
      } else {
        console.warn('[RealtimeSync] Cannot broadcast, no communication channel available');
      }
      
      // Always trigger local listeners directly
      // This is important since cross-tab communication doesn't deliver to the same tab
      const listeners = this.eventListeners.get(type);
      if (listeners) {
        this.logDebug(`Triggering ${listeners.size} local listeners for ${type}`);
        listeners.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error(`[RealtimeSync] Error in local event listener for ${type}:`, error);
          }
        });
      }
    } catch (error) {
      console.error('[RealtimeSync] Failed to broadcast message:', error);
    }
  }

  public subscribe(type: EventType, callback: (data: any) => void): () => void {
    this.logDebug(`Subscribing to event type: ${type}`);
    
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, new Set());
    }

    const listeners = this.eventListeners.get(type)!;
    listeners.add(callback);

    // Return unsubscribe function
    return () => {
      this.logDebug(`Unsubscribing from event type: ${type}`);
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.eventListeners.delete(type);
      }
    };
  }

  public unsubscribe(type: EventType, callback: (data: any) => void): void {
    this.logDebug(`Unsubscribing from event type: ${type}`);
    
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.eventListeners.delete(type);
      }
    }
  }

  public cleanUp(): void {
    this.logDebug('Cleaning up realtimeSync');
    
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    
    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
      this.storageListener = null;
    }
    
    this.eventListeners.clear();
  }
  
  // Public method to check if real-time sync is supported
  public isSyncSupported(): boolean {
    return (this.isSupported && !!this.channel) || !!this.storageListener;
  }
  
  private logDebug(message: string, data?: any) {
    if (this.debug) {
      if (data) {
        console.log(`[RealtimeSync:${this.instanceId}] ${message}`, data);
      } else {
        console.log(`[RealtimeSync:${this.instanceId}] ${message}`);
      }
    }
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
    // Subscribe to event
    const unsubscribe = realtimeSync.subscribe(type, callback);
    
    // Clean up subscription when component unmounts
    return unsubscribe;
  }, [type, callback]);
} 