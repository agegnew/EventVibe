// Broadcast Channel for real-time sync across tabs
type EventType = 'event-created' | 'event-updated' | 'event-deleted' | 'user-updated';

interface SyncMessage {
  type: EventType;
  data: any;
  timestamp: number;
}

class RealtimeSync {
  private static instance: RealtimeSync;
  private channel: BroadcastChannel | null = null;
  private eventListeners: Map<string, Set<(data: any) => void>> = new Map();
  private isSupported: boolean = typeof BroadcastChannel !== 'undefined';

  private constructor() {
    if (this.isSupported) {
      this.initChannel();
    } else {
      console.warn('BroadcastChannel is not supported in this browser. Real-time sync will be disabled.');
    }
  }

  private initChannel() {
    try {
      this.channel = new BroadcastChannel('eventvibe-sync');
      this.channel.onmessage = this.handleMessage.bind(this);
      console.log('Real-time sync initialized');
    } catch (error) {
      console.error('Failed to initialize BroadcastChannel:', error);
      this.isSupported = false;
    }
  }

  private handleMessage(event: MessageEvent) {
    const message = event.data as SyncMessage;
    
    if (!message || !message.type) {
      return;
    }

    // Get listeners for this event type
    const listeners = this.eventListeners.get(message.type);
    if (listeners) {
      // Notify all listeners
      listeners.forEach(callback => {
        try {
          callback(message.data);
        } catch (error) {
          console.error(`Error in event listener for ${message.type}:`, error);
        }
      });
    }
  }

  public static getInstance(): RealtimeSync {
    if (!RealtimeSync.instance) {
      RealtimeSync.instance = new RealtimeSync();
    }
    return RealtimeSync.instance;
  }

  public broadcast(type: EventType, data: any): void {
    if (!this.isSupported || !this.channel) return;

    const message: SyncMessage = {
      type,
      data,
      timestamp: Date.now()
    };

    try {
      this.channel.postMessage(message);
      
      // Also trigger local listeners without waiting for the broadcast
      this.handleMessage({ data: message } as MessageEvent);
    } catch (error) {
      console.error('Failed to broadcast message:', error);
    }
  }

  public subscribe(type: EventType, callback: (data: any) => void): () => void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, new Set());
    }

    const listeners = this.eventListeners.get(type)!;
    listeners.add(callback);

    // Return unsubscribe function
    return () => {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.eventListeners.delete(type);
      }
    };
  }

  public cleanUp(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.eventListeners.clear();
  }
}

// Export a singleton instance
export const realtimeSync = RealtimeSync.getInstance();

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