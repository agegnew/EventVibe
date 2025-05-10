// IndexedDB utility for offline data storage

import { Event } from "./data-service";

const DB_NAME = 'eventvibe-offline-db';
const DB_VERSION = 1;
const EVENTS_STORE = 'events';
const USERS_STORE = 'users';
const SYNC_QUEUE_STORE = 'syncQueue';

/**
 * Opens a connection to the IndexedDB database
 */
export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
      reject('Error opening database');
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create events store with id as key path
      if (!db.objectStoreNames.contains(EVENTS_STORE)) {
        const eventStore = db.createObjectStore(EVENTS_STORE, { keyPath: 'id' });
        eventStore.createIndex('date', 'date', { unique: false });
        eventStore.createIndex('category', 'category', { unique: false });
      }

      // Create users store with id as key path
      if (!db.objectStoreNames.contains(USERS_STORE)) {
        const userStore = db.createObjectStore(USERS_STORE, { keyPath: 'id' });
        userStore.createIndex('email', 'email', { unique: true });
      }

      // Create sync queue store for operations that need to be synced when online
      if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
        const syncStore = db.createObjectStore(SYNC_QUEUE_STORE, { 
          keyPath: 'id',
          autoIncrement: true 
        });
        syncStore.createIndex('operation', 'operation', { unique: false });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

/**
 * Saves events to IndexedDB
 */
export async function saveEvents(events: Event[]): Promise<void> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(EVENTS_STORE, 'readwrite');
    const store = transaction.objectStore(EVENTS_STORE);

    // Add all events to the store
    for (const event of events) {
      await new Promise<void>((resolve, reject) => {
        const request = store.put(event);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }

    // Close the database when done
    db.close();
    console.log(`[OfflineDB] Saved ${events.length} events to IndexedDB`);
  } catch (error) {
    console.error('[OfflineDB] Error saving events:', error);
    throw error;
  }
}

/**
 * Retrieves all events from IndexedDB
 */
export async function getEvents(): Promise<Event[]> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(EVENTS_STORE, 'readonly');
    const store = transaction.objectStore(EVENTS_STORE);

    return new Promise<Event[]>((resolve, reject) => {
      const request = store.getAll();
      
      request.onsuccess = () => {
        db.close();
        console.log(`[OfflineDB] Retrieved ${request.result.length} events from IndexedDB`);
        resolve(request.result);
      };
      
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('[OfflineDB] Error getting events:', error);
    return [];
  }
}

/**
 * Gets a single event by ID from IndexedDB
 */
export async function getEventById(id: string): Promise<Event | null> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(EVENTS_STORE, 'readonly');
    const store = transaction.objectStore(EVENTS_STORE);

    return new Promise<Event | null>((resolve, reject) => {
      const request = store.get(id);
      
      request.onsuccess = () => {
        db.close();
        if (request.result) {
          console.log(`[OfflineDB] Retrieved event ${id} from IndexedDB`);
        } else {
          console.log(`[OfflineDB] Event ${id} not found in IndexedDB`);
        }
        resolve(request.result || null);
      };
      
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error(`[OfflineDB] Error getting event ${id}:`, error);
    return null;
  }
}

/**
 * Saves user data to IndexedDB
 */
export async function saveUser(user: any): Promise<void> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(USERS_STORE, 'readwrite');
    const store = transaction.objectStore(USERS_STORE);

    return new Promise<void>((resolve, reject) => {
      const request = store.put(user);
      
      request.onsuccess = () => {
        db.close();
        console.log(`[OfflineDB] Saved user ${user.id} to IndexedDB`);
        resolve();
      };
      
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('[OfflineDB] Error saving user:', error);
    throw error;
  }
}

/**
 * Gets user data from IndexedDB
 */
export async function getUser(id: string): Promise<any | null> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(USERS_STORE, 'readonly');
    const store = transaction.objectStore(USERS_STORE);

    return new Promise<any>((resolve, reject) => {
      const request = store.get(id);
      
      request.onsuccess = () => {
        db.close();
        if (request.result) {
          console.log(`[OfflineDB] Retrieved user ${id} from IndexedDB`);
        } else {
          console.log(`[OfflineDB] User ${id} not found in IndexedDB`);
        }
        resolve(request.result || null);
      };
      
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error(`[OfflineDB] Error getting user ${id}:`, error);
    return null;
  }
}

/**
 * Adds an operation to the sync queue to be processed when back online
 */
export async function addToSyncQueue(operation: string, data: any): Promise<void> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(SYNC_QUEUE_STORE, 'readwrite');
    const store = transaction.objectStore(SYNC_QUEUE_STORE);

    return new Promise<void>((resolve, reject) => {
      const request = store.add({
        operation,
        data,
        timestamp: Date.now()
      });
      
      request.onsuccess = () => {
        db.close();
        console.log(`[OfflineDB] Added ${operation} operation to sync queue`);
        resolve();
      };
      
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('[OfflineDB] Error adding to sync queue:', error);
    throw error;
  }
}

/**
 * Gets all pending operations from the sync queue
 */
export async function getSyncQueue(): Promise<any[]> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(SYNC_QUEUE_STORE, 'readonly');
    const store = transaction.objectStore(SYNC_QUEUE_STORE);

    return new Promise<any[]>((resolve, reject) => {
      const request = store.getAll();
      
      request.onsuccess = () => {
        db.close();
        console.log(`[OfflineDB] Retrieved ${request.result.length} operations from sync queue`);
        resolve(request.result);
      };
      
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('[OfflineDB] Error getting sync queue:', error);
    return [];
  }
}

/**
 * Removes an operation from the sync queue after it has been processed
 */
export async function removeFromSyncQueue(id: number): Promise<void> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(SYNC_QUEUE_STORE, 'readwrite');
    const store = transaction.objectStore(SYNC_QUEUE_STORE);

    return new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      
      request.onsuccess = () => {
        db.close();
        console.log(`[OfflineDB] Removed operation ${id} from sync queue`);
        resolve();
      };
      
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error(`[OfflineDB] Error removing operation ${id} from sync queue:`, error);
    throw error;
  }
}

/**
 * Clears all data from a specific store
 */
export async function clearStore(storeName: string): Promise<void> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    return new Promise<void>((resolve, reject) => {
      const request = store.clear();
      
      request.onsuccess = () => {
        db.close();
        console.log(`[OfflineDB] Cleared ${storeName} store`);
        resolve();
      };
      
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error(`[OfflineDB] Error clearing ${storeName} store:`, error);
    throw error;
  }
}

/**
 * Checks if a database exists
 */
export function checkDatabaseExists(): Promise<boolean> {
  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME);
    
    request.onsuccess = () => {
      request.result.close();
      resolve(true);
    };
    
    request.onerror = () => {
      resolve(false);
    };
  });
} 