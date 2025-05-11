"use client"

import { useEffect } from 'react'

// Extend Window interface to include our custom method
declare global {
  interface Window {
    broadcastViaServiceWorker?: (message: any) => void;
  }
}

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope:', registration.scope)
          
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
            
            // If the message is a sync payload, we could dispatch it to relevant components
            if (event.data && event.data.type) {
              // Create a custom event to notify components
              const customEvent = new CustomEvent('realtime-sync', { 
                detail: event.data 
              })
              window.dispatchEvent(customEvent)
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
        // This function can be used to broadcast messages to other tabs via SW
        window.broadcastViaServiceWorker = (message: any) => {
          navigator.serviceWorker.controller?.postMessage({
            type: 'BROADCAST',
            payload: message
          })
        }
      }
    }
    
    // Set up when the service worker is ready
    if (navigator.serviceWorker.controller) {
      setupRealtimeRelayViaSW()
    } else {
      navigator.serviceWorker.addEventListener('controllerchange', setupRealtimeRelayViaSW)
    }
    
    return () => {
      // Clean up
      if (navigator.serviceWorker) {
        navigator.serviceWorker.removeEventListener('controllerchange', () => {})
      }
    }
  }, [])
  
  return null
} 