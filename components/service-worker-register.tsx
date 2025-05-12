"use client"

import { useEffect, useState } from 'react'

// Define message type for service worker broadcast
interface SWMessage {
  type: string;
  data: any;
}

// Extend Window interface to include our custom method
declare global {
  interface Window {
    broadcastViaServiceWorker?: (message: SWMessage) => boolean;
    serviceWorkerReady?: boolean;
  }
}

export function ServiceWorkerRegister() {
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope:', registration.scope)
          setIsRegistered(true);
          
          // Watch for updates
          registration.onupdatefound = () => {
            const installingWorker = registration.installing
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    console.log('New content is available; please refresh.')
                  } else {
                    console.log('Content is cached for offline use.')
                  }
                }
              }
            }
          }
          
          // Add message listener for realtime sync
          navigator.serviceWorker.addEventListener('message', (event) => {
            console.log('[ServiceWorkerRegister] Message from SW:', event.data)
            
            // If the message is a sync payload, dispatch it to relevant components
            if (event.data && event.data.type) {
              try {
                // Create a custom event to notify components
                const customEvent = new CustomEvent('realtime-sync', { 
                  detail: event.data 
                });
                window.dispatchEvent(customEvent);
                
                // Also try to create a typed event for more direct listening
                if (event.data.payload && event.data.payload.type) {
                  const typedEvent = new CustomEvent(`eventvibe-${event.data.payload.type}`, {
                    detail: event.data.payload.data
                  });
                  window.dispatchEvent(typedEvent);
                }
              } catch (error) {
                console.error('[ServiceWorkerRegister] Error dispatching event:', error);
              }
            }
          })
        })
        .catch(error => {
          console.error('ServiceWorker registration failed:', error)
        })
      
      // Force update on new worker
      let refreshing = false
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true
          window.location.reload()
        }
      })
    }
    
    // Set up realtime communication between tabs via service worker
    const setupRealtimeRelayViaSW = () => {
      if (navigator.serviceWorker.controller) {
        // Mark service worker as ready for other components
        window.serviceWorkerReady = true;
        
        // This function can be used to broadcast messages to other tabs via SW
        window.broadcastViaServiceWorker = (message: SWMessage) => {
          if (navigator.serviceWorker.controller) {
            try {
              navigator.serviceWorker.controller.postMessage({
                type: 'BROADCAST',
                payload: message
              });
              return true;
            } catch (error) {
              console.error('[ServiceWorkerRegister] Error broadcasting via SW:', error);
              return false;
            }
          }
          return false;
        };
        
        // Send a ping to test if it's working
        setTimeout(() => {
          console.log('[ServiceWorkerRegister] Testing service worker broadcast...');
          window.broadcastViaServiceWorker?.({
            type: 'ping',
            data: { source: 'ServiceWorkerRegister', time: Date.now() }
          });
        }, 2000);
      }
    };
    
    // Set up when the service worker is ready
    if (navigator.serviceWorker.controller) {
      setupRealtimeRelayViaSW();
    } else {
      navigator.serviceWorker.addEventListener('controllerchange', setupRealtimeRelayViaSW);
    }
    
    return () => {
      // Clean up
      if (navigator.serviceWorker) {
        navigator.serviceWorker.removeEventListener('controllerchange', () => {});
      }
    }
  }, []);
  
  // Hidden component, used only for side effects
  return null;
} 