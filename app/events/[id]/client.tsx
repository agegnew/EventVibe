"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Calendar, Clock, MapPin, Users, DollarSign, Share2, Heart, CalendarPlus, AlertCircle, Check, X } from "lucide-react"
import { GlassmorphicCard } from "@/components/ui-elements/glassmorphic-card"
import { NeumorphicButton } from "@/components/ui-elements/neumorphic-button"
import { OrganicShape } from "@/components/ui-elements/organic-shape"
import { EventSpeakers } from "@/components/event-speakers"
import { EventSchedule } from "@/components/event-schedule"
import { EventMap } from "@/components/event-map"
import { motion } from "framer-motion"
import { Event, getEventById, registerForEvent, unregisterFromEvent, getUserById } from "@/lib/data-service"
import { useAuth } from "@/hooks/use-auth"
import { useRealtimeSync, isRealtimeSyncSupported } from "@/lib/realtime-sync"

// Create a client component that doesn't take params directly
export function EventDetail({ eventId }: { eventId: string }) {
  const { user, updateUserData } = useAuth();
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isUnregistering, setIsUnregistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [unregistrationSuccess, setUnregistrationSuccess] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [isSyncEnabled, setIsSyncEnabled] = useState(false);
  
  // Check if user is already registered
  const isUserRegistered = user && event && user.events && user.events.includes(event.id);
  
  // Check if event is full
  const isEventFull = event && event.registrations >= event.seats;

  // Check if real-time sync is supported
  useEffect(() => {
    const syncSupported = isRealtimeSyncSupported();
    console.log('[EventDetailPage] Real-time sync supported:', syncSupported);
    setIsSyncEnabled(syncSupported);
  }, []);

  // Real-time sync handlers
  const handleEventUpdated = useCallback((updatedEvent: Event) => {
    console.log('[EventDetailPage] Received event-updated', updatedEvent);
    // Check if this is our event being updated
    if (updatedEvent.id === eventId) {
      console.log('[EventDetailPage] Updating displayed event');
      setEvent(updatedEvent);
    }
  }, [eventId]);

  const handleEventDataSync = useCallback((updatedEvent: Event) => {
    // Silently update event data without showing a notification
    console.log('[EventDetailPage] Received event-data-sync', updatedEvent);
    if (updatedEvent.id === eventId) {
      console.log('[EventDetailPage] Silently updating displayed event');
      setEvent(updatedEvent);
    }
  }, [eventId]);

  const handleEventDeleted = useCallback((data: { id: string }) => {
    console.log('[EventDetailPage] Received event-deleted', data);
    // If our event was deleted, show error
    if (data.id === eventId) {
      console.log('[EventDetailPage] Event was deleted');
      setError("This event has been deleted");
      setEvent(null);
    }
  }, [eventId]);

  // Subscribe to real-time events
  useRealtimeSync('event-updated', handleEventUpdated);
  useRealtimeSync('event-data-sync', handleEventDataSync);
  useRealtimeSync('event-deleted', handleEventDeleted);

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const eventData = await getEventById(eventId);
        
        if (!eventData) {
          setError("Event not found");
          return;
        }
        
        setEvent(eventData);
      } catch (error) {
        console.error("Error fetching event:", error);
        setError("Failed to load event data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvent();
  }, [eventId]);

  // Fetch the latest user data when the component mounts to ensure accurate registration status
  useEffect(() => {
    if (user) {
      const fetchLatestUserData = async () => {
        try {
          const latestUserData = await getUserById(user.id);
          if (latestUserData && JSON.stringify(latestUserData.events) !== JSON.stringify(user.events)) {
            console.log('[EventDetail] Updating user data with latest events:', latestUserData.events);
            updateUserData({ events: latestUserData.events });
          }
        } catch (error) {
          console.error('[EventDetail] Error fetching latest user data:', error);
        }
      };
      
      fetchLatestUserData();
    }
  }, [user?.id, updateUserData]);

  // Handle registration
  const handleRegister = async () => {
    if (!user || !event) return;
    
    try {
      setIsRegistering(true);
      setRegistrationError(null);
      
      // Call the register API - now returns an object instead of throwing errors
      const result = await registerForEvent(user.id, event.id);
      
      if (result.success) {
        // Show success message
        setRegistrationSuccess(true);
        
        // Update the local user data with the new events list
        if (result.user && result.user.events) {
          updateUserData({ events: result.user.events });
        } else {
          // If the API didn't return updated user events, add this event ID manually
          updateUserData({ 
            events: [...(user.events || []), event.id] 
          });
        }
        
        // Refresh the event data to show updated registration count
        const updatedEvent = await getEventById(eventId);
        if (updatedEvent) {
          setEvent(updatedEvent);
        }
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setRegistrationSuccess(false);
        }, 3000);
      } else {
        // Handle registration errors without console errors
        const errorMessage = result.error || "Failed to register for event";
        
        if (errorMessage.includes('already registered')) {
          setRegistrationError("You're already registered for this event.");
          
          // Make sure local user data is updated to reflect they're already registered
          if (!user.events?.includes(event.id)) {
            updateUserData({ 
              events: [...(user.events || []), event.id] 
            });
          }
        } else if (errorMessage.includes('No seats available')) {
          setRegistrationError("No seats available for this event.");
        } else if (errorMessage.includes('User not found')) {
          setRegistrationError("Your user account could not be found. Please try logging in again.");
        } else if (errorMessage.includes('Event not found')) {
          setRegistrationError("This event is no longer available.");
        } else {
          setRegistrationError(errorMessage);
        }
        
        // Hide error message after 5 seconds
        setTimeout(() => {
          setRegistrationError(null);
        }, 5000);
      }
    } catch (error: any) {
      // This will only catch unexpected errors, not registration issues
      console.error("Unexpected error during registration:", error);
      setRegistrationError("An unexpected error occurred. Please try again later.");
      
      // Hide error message after 5 seconds
      setTimeout(() => {
        setRegistrationError(null);
      }, 5000);
    } finally {
      setIsRegistering(false);
    }
  };

  // Handle unregistration
  const handleUnregister = async () => {
    if (!user || !event) return;
    
    try {
      setIsUnregistering(true);
      setRegistrationError(null);
      
      // Call the unregister API
      const result = await unregisterFromEvent(user.id, event.id);
      
      if (result.success) {
        // Show success message
        setUnregistrationSuccess(true);
        setRegistrationSuccess(false);
        
        // Update the local user data with the new events list
        if (result.user && result.user.events) {
          updateUserData({ events: result.user.events });
        } else {
          // If the API didn't return updated user events, remove this event ID manually
          updateUserData({
            events: (user.events || []).filter(id => id !== event.id)
          });
        }
        
        // Refresh the event data to show updated registration count
        const updatedEvent = await getEventById(eventId);
        if (updatedEvent) {
          setEvent(updatedEvent);
        }
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setUnregistrationSuccess(false);
        }, 3000);
      } else {
        // Handle unregistration errors without console errors
        const errorMessage = result.error || "Failed to unregister from event";
        setRegistrationError(errorMessage);
        
        // Hide error message after 5 seconds
        setTimeout(() => {
          setRegistrationError(null);
        }, 5000);
      }
    } catch (error: any) {
      // This will only catch unexpected errors
      console.error("Unexpected error during unregistration:", error);
      setRegistrationError("An unexpected error occurred. Please try again later.");
      
      // Hide error message after 5 seconds
      setTimeout(() => {
        setRegistrationError(null);
      }, 5000);
    } finally {
      setIsUnregistering(false);
    }
  };

  // Add this useEffect to handle real-time updates to user registration status
  useEffect(() => {
    // Update isUserRegistered whenever user or event changes 
    if (user && event) {
      console.log('[EventDetail] Checking registration status:', 
        user.events && user.events.includes(event.id) ? 'Registered' : 'Not Registered');
    }
  }, [user, event]);

  // Add a useEffect to monitor and log registration status changes for debugging
  useEffect(() => {
    if (user && event) {
      const isRegistered = user.events && user.events.includes(event.id);
      console.log(`[EventDetail] Registration status check for event ${event.id}:`, 
        isRegistered ? 'REGISTERED' : 'NOT REGISTERED', 
        '(User events:', user.events, ')');
    }
  }, [user?.events, event?.id]);

  // Defer non-critical animations until after page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Function to determine if the event appears to be a skeleton/mock event
  const isEventMock = useCallback((event: Event | null) => {
    if (!event) return false;
    
    // Check for obvious mock event markers
    return (
      event.title === 'Event' && 
      event.description === 'Event description' && 
      event.location === 'Location'
    );
  }, []);

  // Enhanced display handling
  const getDisplayValue = useCallback((value: string | number | boolean, defaultValue: string = 'Not specified') => {
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    
    // Check if the value is one of the mock default values
    const mockValues = ['Event', 'Event description', 'Location', 'Category'];
    if (typeof value === 'string' && mockValues.includes(value)) {
      return defaultValue;
    }
    
    return value;
  }, []);

  // Format date for display
  const formatEventDate = useCallback((date: string | undefined) => {
    if (!date) return 'Date not specified';
    
    try {
      return new Date(date).toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  }, []);

  // Add a helper function to normalize image paths
  const getImageUrl = useCallback((imagePath: string | undefined): string => {
    if (!imagePath) return "/default-event.png";
    
    // Check if it's already an absolute URL
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Handle virtual image paths for uploaded images in production
    if (imagePath.startsWith('/uploads/')) {
      console.log(`[EventDetail] Using default-event.png for virtual image path: ${imagePath}`);
      return "/default-event.png";
    }
    
    // Use the provided path
    return imagePath;
  }, []);

  // Handle what to show when event is a mock/skeleton
  const renderEventContent = () => {
    if (!event) return null;
    
    // Check if this appears to be a mock event
    const isMock = isEventMock(event);
    
    // Format the date and time nicely
    let formattedDate = formatEventDate(event.date);
    let timeDisplay = 'All Day';
    
    if (event.date) {
      try {
        const eventDate = new Date(event.date);
        const endDate = event.endDate ? new Date(event.endDate) : null;
        
        if (endDate && eventDate.toDateString() === endDate.toDateString()) {
          timeDisplay = `${eventDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        }
      } catch (error) {
        console.error('Error formatting time:', error);
      }
    }
    
    return (
      <>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
          {getDisplayValue(event.title, isMock ? 'New Event' : 'Event Details')}
        </h1>
        
        <div className="flex flex-wrap gap-3 sm:gap-4 text-white text-sm sm:text-base mb-2">
          {isMock && (
            <div className="px-3 py-1 bg-yellow-600 text-white rounded-full flex items-center text-xs">
              <AlertCircle className="w-3 h-3 mr-1" />
              Newly Created
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{formattedDate}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{timeDisplay}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{getDisplayValue(event.location, 'Location TBA')}</span>
          </div>
          
          <div className={`px-3 py-1 text-xs ${
            event.status === 'Active' ? 'bg-green-600 text-white' : 
            event.status === 'Completed' ? 'bg-gray-600 text-white' :
            event.status === 'Cancelled' ? 'bg-red-600 text-white' :
            'bg-blue-600 text-white'
          } rounded-full`}>
            {event.status}
          </div>
        </div>
      </>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh-gradient dark:from-gray-900 dark:to-gray-800 pt-28 pb-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-mesh-gradient dark:from-gray-900 dark:to-gray-800 pt-28 pb-20 flex items-center justify-center">
        <GlassmorphicCard className="p-8 max-w-md text-center" borderGlow={true}>
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
          <p className="mb-6">{error || "The event you're looking for doesn't exist or has been removed."}</p>
          <NeumorphicButton asChild>
            <Link href="/events">Browse Events</Link>
          </NeumorphicButton>
        </GlassmorphicCard>
      </div>
    );
  }

  // Prepare schedule data from the event description (simple version for now)
  const sampleSchedule = [
    {
      day: "Event Day",
      date: new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      events: [
        { time: "All Day", title: event.title }
      ],
    }
  ];

  return (
    <main className="min-h-screen bg-mesh-gradient dark:from-gray-900 dark:to-gray-800 animated-bg">
      {isLoaded && (
        <>
          <div className="floating-orbs orb-1"></div>
          <div className="floating-orbs orb-2"></div>
          <div className="floating-orbs orb-3"></div>
        </>
      )}
      
      {loading && (
        <div className="container mx-auto px-4 pt-40 pb-20 flex justify-center">
          <div className="animate-pulse w-full max-w-4xl">
            <div className="h-[400px] bg-gray-200 dark:bg-gray-800 rounded-xl mb-8"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg w-3/4 mb-6"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/2 mb-2"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/3 mb-8"></div>
            <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-lg mb-6"></div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="container mx-auto px-4 pt-40 pb-20 flex justify-center">
          <GlassmorphicCard className="p-8 text-center max-w-md">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <NeumorphicButton asChild>
              <Link href="/events">Back to Events</Link>
            </NeumorphicButton>
          </GlassmorphicCard>
        </div>
      )}
      
      {!loading && !error && event && (
        <>
          {/* Event Header with Background Image */}
          <div className="relative">
            <div className="absolute inset-0 z-0">
              <Image 
                src={getImageUrl(event.image)} 
                alt={event.title || "Event"} 
                fill 
                className="object-cover" 
                priority 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent"></div>
            </div>
            
            <div className="container mx-auto px-4 relative z-10">
              <div className="pt-44 pb-8 sm:pt-48 md:pt-56 lg:pt-64 md:pb-10 relative z-10">
                <div className="text-center">
                  <div className="flex items-center space-x-2 justify-center mb-4">
                    <Link href="/events" className="text-white/80 hover:text-white transition-colors duration-200 flex items-center text-sm sm:text-base">
                      <X className="mr-1 h-4 w-4" />
                      Back to Events
                    </Link>
                    {isUserRegistered && (
                      <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs flex items-center">
                        <Check className="mr-1 h-3 w-3" />
                        Registered
                      </span>
                    )}
                  </div>
                  {renderEventContent()}
                </div>
              </div>
            </div>
          </div>
          
          {/* Event Details Cards */}
          <section className="py-10 md:py-20 relative">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Event Description */}
              <GlassmorphicCard className="p-6 md:col-span-2 flex flex-col">
                <h2 className="text-2xl font-bold mb-4">About This Event</h2>
                <div className="flex-1">
                  <p className="text-gray-700 dark:text-gray-300 mb-6 whitespace-pre-line">
                    {getDisplayValue(event?.description || '', isEventMock(event) ? 'Event description will be added soon.' : 'No description provided.')}
                  </p>
                </div>
                
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <span className="block text-sm text-gray-500 dark:text-gray-400">Category</span>
                      <span className="font-medium">{getDisplayValue(event?.category || '', 'Uncategorized')}</span>
                    </div>
                    <div>
                      <span className="block text-sm text-gray-500 dark:text-gray-400">Price</span>
                      <span className="font-medium">${event?.price || 0}</span>
                    </div>
                    <div>
                      <span className="block text-sm text-gray-500 dark:text-gray-400">Available Seats</span>
                      <span className="font-medium">
                        {event ? (event.seats - event.registrations) : 0} / {event?.seats || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </GlassmorphicCard>
              
              {/* Registration Card - Leave the rest of the component as is */}
              <div className="space-y-6">
                <GlassmorphicCard className="p-6" borderGlow={true}>
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">
                      {isUserRegistered ? "You're Registered" : "Register Now"}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {isUserRegistered 
                        ? "You're all set for this event!" 
                        : "Secure your spot at this event"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-700 dark:text-gray-300">Price per ticket</span>
                    <span className="text-2xl font-bold">{event?.price === 0 ? 'Free' : `$${event?.price || 0}`}</span>
                  </div>

                  {/* Registration status messages - show only one at a time with priority */}
                  {registrationError ? (
                    <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      <span>{registrationError}</span>
                    </div>
                  ) : registrationSuccess ? (
                    <div className="mb-4 p-4 bg-green-100 border border-green-300 text-green-700 rounded flex items-center">
                      <Check className="h-5 w-5 mr-2" />
                      <span>Successfully registered for this event!</span>
                    </div>
                  ) : unregistrationSuccess ? (
                    <div className="mb-4 p-4 bg-blue-100 border border-blue-300 text-blue-700 rounded flex items-center">
                      <Check className="h-5 w-5 mr-2" />
                      <span>Successfully unregistered from this event!</span>
                    </div>
                  ) : isUserRegistered && !unregistrationSuccess ? (
                    <div className="mb-4 p-4 bg-pink-100 border border-pink-300 text-pink-700 rounded flex items-center">
                      <Check className="h-5 w-5 mr-2" />
                      <span>You're already registered for this event.</span>
                    </div>
                  ) : null}

                  {!user ? (
                    <NeumorphicButton className="w-full mb-4" size="lg" asChild>
                      <Link href={`/login?redirect=/events/${eventId}`}>Login to Register</Link>
                    </NeumorphicButton>
                  ) : isUserRegistered ? (
                    <NeumorphicButton 
                      className="w-full mb-4 bg-red-500 hover:bg-red-600 text-white" 
                      size="lg"
                      onClick={handleUnregister}
                      disabled={isUnregistering}
                    >
                      {isUnregistering ? (
                        "Unregistering..."
                      ) : (
                        <>
                          <X className="w-5 h-5 mr-2" />
                          Unregister
                        </>
                      )}
                    </NeumorphicButton>
                  ) : isEventFull ? (
                    <NeumorphicButton className="w-full mb-4 bg-red-500 text-white" size="lg" disabled>
                      Event Full
                    </NeumorphicButton>
                  ) : (
                    <NeumorphicButton 
                      className="w-full mb-4" 
                      size="lg"
                      onClick={handleRegister}
                      disabled={isRegistering}
                    >
                      {isRegistering ? "Registering..." : "Register Now"}
                    </NeumorphicButton>
                  )}

                  <div className="flex gap-2">
                    <NeumorphicButton variant="outline" className="flex-1">
                      <Heart className="w-4 h-4 mr-2" />
                      Save
                    </NeumorphicButton>
                    <NeumorphicButton variant="outline" className="flex-1">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </NeumorphicButton>
                  </div>
                </GlassmorphicCard>

                <GlassmorphicCard className="p-6" borderGlow={true}>
                  <h3 className="text-xl font-bold mb-4">Event Details</h3>
                  <ul className="space-y-4">
                    <li className="flex">
                      <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Date and Time</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {event?.date ? `${new Date(event.date).toLocaleDateString()} at ${new Date(event.date).toLocaleTimeString()}` : "Date and time TBA"}
                        </p>
                      </div>
                    </li>
                    <li className="flex">
                      <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Location</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{event?.location || 'Location TBA'}</p>
                      </div>
                    </li>
                    <li className="flex">
                      <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Capacity</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {event?.registrations || 0} registered out of {event?.seats || 0} seats
                        </p>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${event && event.seats ? Math.min(100, (event.registrations / event.seats) * 100) : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </GlassmorphicCard>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
} 