"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Calendar, Clock, MapPin, Users, DollarSign, Share2, Heart, CalendarPlus, AlertCircle, Check } from "lucide-react"
import { GlassmorphicCard } from "@/components/ui-elements/glassmorphic-card"
import { NeumorphicButton } from "@/components/ui-elements/neumorphic-button"
import { OrganicShape } from "@/components/ui-elements/organic-shape"
import { EventSpeakers } from "@/components/event-speakers"
import { EventSchedule } from "@/components/event-schedule"
import { EventMap } from "@/components/event-map"
import { motion } from "framer-motion"
import { Event, getEventById, registerForEvent } from "@/lib/data-service"
import { useAuth } from "@/hooks/use-auth"
import { useRealtimeSync, isRealtimeSyncSupported } from "@/lib/realtime-sync"

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
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
    if (updatedEvent.id === params.id) {
      console.log('[EventDetailPage] Updating displayed event');
      setEvent(updatedEvent);
    }
  }, [params.id]);

  const handleEventDeleted = useCallback((data: { id: string }) => {
    console.log('[EventDetailPage] Received event-deleted', data);
    // If our event was deleted, show error
    if (data.id === params.id) {
      console.log('[EventDetailPage] Event was deleted');
      setError("This event has been deleted");
      setEvent(null);
    }
  }, [params.id]);

  // Subscribe to real-time events
  useRealtimeSync('event-updated', handleEventUpdated);
  useRealtimeSync('event-deleted', handleEventDeleted);

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const eventData = await getEventById(params.id);
        
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
  }, [params.id]);

  // Handle registration
  const handleRegister = async () => {
    if (!user || !event) return;
    
    try {
      setIsRegistering(true);
      setRegistrationError(null);
      
      // Call the register API
      await registerForEvent(user.id, event.id);
      
      // Show success message
      setRegistrationSuccess(true);
      
      // Refresh the event data to show updated registration count
      const updatedEvent = await getEventById(params.id);
      if (updatedEvent) {
        setEvent(updatedEvent);
      }
    } catch (error: any) {
      console.error("Error registering for event:", error);
      setRegistrationError(error.message || "Failed to register for event");
    } finally {
      setIsRegistering(false);
    }
  };

  // Defer non-critical animations until after page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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
    <main className="min-h-screen bg-mesh-gradient dark:from-gray-900 dark:to-gray-800 pt-28 sm:pt-32 md:pt-36 pb-20 relative overflow-hidden animated-bg">
      {/* Floating orbs for background effect */}
      {isLoaded && (
        <>
          <div className="floating-orbs orb-1"></div>
          <div className="floating-orbs orb-2"></div>
          <div className="floating-orbs orb-3"></div>
        </>
      )}

      {isLoaded && (
        <>
          <OrganicShape
            className="absolute top-32 sm:top-20 right-0 w-[400px] sm:w-[500px] md:w-[600px] h-[400px] sm:h-[500px] md:h-[600px] text-blue-200 dark:text-blue-900 opacity-30 rotate-45"
            type="blob1"
          />
          <OrganicShape
            className="absolute bottom-0 left-0 w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] text-purple-200 dark:text-purple-900 opacity-30 -rotate-12"
            type="blob2"
          />
        </>
      )}

      <div className="container mx-auto px-4 relative z-10">
        {/* Event Header */}
        <motion.div
          className="mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Link
            href="/events"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-4 sm:mb-6"
          >
            ← Back to Events
          </Link>

          <div className="relative rounded-xl overflow-hidden h-[250px] sm:h-[300px] md:h-[400px] mb-6 sm:mb-8">
            <Image src={event.image || "/placeholder.svg"} alt={event.title} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
              <div className="p-4 sm:p-6 md:p-8 w-full">
                <div className="flex items-center gap-2">
                  <div className="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded-full mb-2 sm:mb-4">
                    {event.category}
                  </div>
                  {isSyncEnabled && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mb-2 sm:mb-4">
                      Live Updates
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">{event.title}</h1>
                <div className="flex flex-wrap gap-3 sm:gap-4 text-white text-sm sm:text-base">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{event.endDate ? `${new Date(event.date).toLocaleTimeString()} - ${new Date(event.endDate).toLocaleTimeString()}` : 'All Day'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <GlassmorphicCard className="p-6 md:p-8" borderGlow={true}>
                <h2 className="text-2xl font-bold mb-4">About This Event</h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{event.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                    <Users className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                    <div className="text-sm text-gray-600 dark:text-gray-400">Attendees</div>
                    <div className="font-bold">{event.registrations}/{event.seats}</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                    <DollarSign className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                    <div className="text-sm text-gray-600 dark:text-gray-400">Price</div>
                    <div className="font-bold">{event.price === 0 ? 'Free' : `$${event.price}`}</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                    <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                    <div className="text-sm text-gray-600 dark:text-gray-400">Date</div>
                    <div className="font-bold">{new Date(event.date).toLocaleDateString()}</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                    <MapPin className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                    <div className="text-sm text-gray-600 dark:text-gray-400">Location</div>
                    <div className="font-bold">{event.location.split(',')[0]}</div>
                  </div>
                </div>
              </GlassmorphicCard>
            </motion.div>

            {/* Event Schedule */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <EventSchedule schedule={sampleSchedule} />
            </motion.div>

            {/* Event Location */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <GlassmorphicCard className="p-6 md:p-8" borderGlow={true}>
                <h2 className="text-2xl font-bold mb-4">Location</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">{event.location}</p>
                <div className="h-[300px] rounded-lg overflow-hidden">
                  <EventMap location={event.location} />
                </div>
              </GlassmorphicCard>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <GlassmorphicCard className="p-6" borderGlow={true}>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">Register Now</h3>
                  <p className="text-gray-600 dark:text-gray-400">Secure your spot at this event</p>
                </div>

                <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-700 dark:text-gray-300">Price per ticket</span>
                  <span className="text-2xl font-bold">{event.price === 0 ? 'Free' : `$${event.price}`}</span>
                </div>

                {/* Registration status/error messages */}
                {registrationSuccess && (
                  <div className="mb-4 p-4 bg-green-100 border border-green-300 text-green-700 rounded flex items-center">
                    <Check className="h-5 w-5 mr-2" />
                    <span>Successfully registered for this event!</span>
                  </div>
                )}

                {registrationError && (
                  <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <span>{registrationError}</span>
                  </div>
                )}

                {!user ? (
                  <NeumorphicButton className="w-full mb-4" size="lg" asChild>
                    <Link href={`/login?redirect=/events/${params.id}`}>Login to Register</Link>
                  </NeumorphicButton>
                ) : isUserRegistered ? (
                  <NeumorphicButton className="w-full mb-4 bg-green-500 hover:bg-green-600 text-white" size="lg" disabled>
                    <Check className="w-5 h-5 mr-2" />
                    Already Registered
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <GlassmorphicCard className="p-6" borderGlow={true}>
                <h3 className="text-xl font-bold mb-4">Event Details</h3>
                <ul className="space-y-4">
                  <li className="flex">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Date and Time</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString()}
                      </p>
                    </div>
                  </li>
                  <li className="flex">
                    <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Location</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{event.location}</p>
                    </div>
                  </li>
                  <li className="flex">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Capacity</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {event.registrations} registered out of {event.seats} seats
                      </p>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${Math.min(100, (event.registrations / event.seats) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </li>
                </ul>
              </GlassmorphicCard>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  )
}
