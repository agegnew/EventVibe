"use client"

import { Suspense, useCallback, useEffect } from "react"
import { Filter, Search, Download, Calendar } from "lucide-react"
import { GlassmorphicCard } from "@/components/ui-elements/glassmorphic-card"
import { NeumorphicButton } from "@/components/ui-elements/neumorphic-button"
import { NeumorphicInput } from "@/components/ui-elements/neumorphic-input"
import { NeumorphicSelect } from "@/components/ui-elements/neumorphic-select"
import { OrganicShape } from "@/components/ui-elements/organic-shape"
import { EventCard } from "@/components/event-card"
import { EventsLoading } from "@/components/events-loading"
import { motion } from "framer-motion"
import { useState } from "react"
import { Event, getAllEvents, exportEvents } from "@/lib/data-service"
import { useRouter, useSearchParams } from "next/navigation"
import { useRealtimeSync, isRealtimeSyncSupported } from "@/lib/realtime-sync"

// Categories for filter
const categories = [
  { value: "all", label: "All Categories" },
  { value: "technology", label: "Technology" },
  { value: "business", label: "Business" },
  { value: "design", label: "Design" },
  { value: "marketing", label: "Marketing" },
  { value: "music", label: "Music" },
  { value: "food", label: "Food" },
  { value: "sports", label: "Sports" },
  { value: "arts", label: "Arts" },
]

// Price ranges for filter
const priceRanges = [
  { value: "all", label: "All Prices" },
  { value: "0-100", label: "Under $100" },
  { value: "100-200", label: "$100-$200" },
  { value: "200-300", label: "$200-$300" },
  { value: "300+", label: "Over $300" },
]

// Status filter options
const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "upcoming", label: "Upcoming" },
]

// Export events in selected format
const handleExportEvents = (format: 'csv' | 'ical', category: string, status: string) => {
  exportEvents(format, { 
    category, 
    status 
  });
};

function EventsContent() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isSyncEnabled, setIsSyncEnabled] = useState(false);

  const ITEMS_PER_PAGE = 9;

  // Parse price range string into min and max values
  const parsePriceRange = (range: string) => {
    if (range === "all") return { min: 0, max: Infinity };
    if (range === "300+") return { min: 300, max: Infinity };

    const [min, max] = range.split("-").map(Number);
    return { min, max };
  };

  // Real-time sync handlers
  const handleEventCreated = useCallback((data: Event | { isBulkImport: boolean, events: Event[] }) => {
    console.log('[EventsPage] Received event-created', data);
    // Check if this is a bulk import
    if (data && 'isBulkImport' in data && data.isBulkImport && Array.isArray(data.events)) {
      // Handle bulk import
      setEvents(prevEvents => {
        // Create a map of existing event IDs for quick lookup
        const existingEventIds = new Set(prevEvents.map(event => event.id));
        
        // Filter out events that already exist
        const newEvents = data.events.filter(event => !existingEventIds.has(event.id));
        
        // If no new events, return unchanged
        if (newEvents.length === 0) return prevEvents;
        
        // Add all new events
        return [...prevEvents, ...newEvents];
      });
    } else {
      // Handle single event creation
      const newEvent = data as Event;
      setEvents(prevEvents => {
        // Check if the event already exists (avoid duplicates)
        const exists = prevEvents.some(event => event.id === newEvent.id);
        if (exists) return prevEvents;
        
        // Add the new event
        return [...prevEvents, newEvent];
      });
    }
  }, []);

  const handleEventUpdated = useCallback((updatedEvent: Event) => {
    console.log('[EventsPage] Received event-updated', updatedEvent);
    setEvents(prevEvents => {
      return prevEvents.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      );
    });
  }, []);

  const handleEventDeleted = useCallback((data: { id: string }) => {
    console.log('[EventsPage] Received event-deleted', data);
    setEvents(prevEvents => {
      return prevEvents.filter(event => event.id !== data.id);
    });
  }, []);

  // Check if real-time sync is supported
  useEffect(() => {
    const syncSupported = isRealtimeSyncSupported();
    console.log('[EventsPage] Real-time sync supported:', syncSupported);
    setIsSyncEnabled(syncSupported);
  }, []);

  // Subscribe to real-time events
  useRealtimeSync('event-created', handleEventCreated);
  useRealtimeSync('event-updated', handleEventUpdated);
  useRealtimeSync('event-deleted', handleEventDeleted);

  // Filter events based on current filter criteria
  const filterEvents = useCallback(() => {
    if (!events.length) return [];

    let filtered = [...events];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        event => 
          event.title.toLowerCase().includes(query) || 
          event.description.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        event => event.category.toLowerCase() === selectedCategory
      );
    }

    // Price filter
    if (selectedPrice !== "all") {
      const { min, max } = parsePriceRange(selectedPrice);
      filtered = filtered.filter(
        event => event.price >= min && event.price <= max
      );
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        event => event.status.toLowerCase() === selectedStatus
      );
    }

    return filtered;
  }, [events, searchQuery, selectedCategory, selectedPrice, selectedStatus]);

  // Update URL with current filters for shareable links
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedPrice !== 'all') params.set('price', selectedPrice);
    if (selectedStatus !== 'all') params.set('status', selectedStatus);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    const newUrl = params.toString() 
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    
    router.push(newUrl, { scroll: false });
  }, [searchQuery, selectedCategory, selectedPrice, selectedStatus, currentPage, router]);

  // Apply filters
  const applyFilters = () => {
    setFilteredEvents(filterEvents());
    setCurrentPage(1);
    updateUrlParams();
  };

  // Fetch events and apply initial filters from URL
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const allEvents = await getAllEvents();
        setEvents(allEvents);
        
        // Get initial filter values from URL
        const initialSearchQuery = searchParams.get('search') || '';
        const initialCategory = searchParams.get('category') || 'all';
        const initialPrice = searchParams.get('price') || 'all';
        const initialStatus = searchParams.get('status') || 'all';
        const initialPage = parseInt(searchParams.get('page') || '1');
        
        // Set filter states from URL params
        setSearchQuery(initialSearchQuery);
        setSelectedCategory(initialCategory);
        setSelectedPrice(initialPrice);
        setSelectedStatus(initialStatus);
        setCurrentPage(initialPage);
        
        // Apply initial filters
        setFilteredEvents(allEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
    
    // Defer non-critical animations until after page load
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [searchParams]);

  // Apply filters when events change or filters update
  useEffect(() => {
    if (!isLoading) {
      const filtered = filterEvents();
      setFilteredEvents(filtered);
    }
  }, [events, filterEvents, isLoading]);

  // Paginate events
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Calculate total pages
  const totalPages = Math.max(
    1,
    Math.ceil(filteredEvents.length / ITEMS_PER_PAGE)
  );

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    let pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are 5 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first and last page
      pages.push(1);
      
      // Determine middle pages to show
      let middleStart = Math.max(2, currentPage - 1);
      let middleEnd = Math.min(totalPages - 1, currentPage + 1);
      
      // Add ellipsis if needed before middle pages
      if (middleStart > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = middleStart; i <= middleEnd; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed after middle pages
      if (middleEnd < totalPages - 1) {
        pages.push('...');
      }
      
      // Add last page if not already included
      if (middleEnd < totalPages) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

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
        <motion.div
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 mb-4 title-3d"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Discover Events
            {isSyncEnabled && (
              <span className="text-xs ml-2 align-top bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Live
              </span>
            )}
          </motion.h1>
          <motion.p 
            className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Find and register for the most exciting events happening around you
          </motion.p>
        </motion.div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <GlassmorphicCard className="mb-12 p-6" borderGlow={true}>
            <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Events</label>
                <NeumorphicInput 
                  placeholder="Search by event name, description or location" 
                  icon={<Search className="h-4 w-4" />} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                />
              </div>
              <div className="w-full md:w-48">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <NeumorphicSelect 
                  options={categories} 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                />
              </div>
              <div className="w-full md:w-48">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price Range</label>
                <NeumorphicSelect 
                  options={priceRanges} 
                  value={selectedPrice}
                  onChange={(e) => setSelectedPrice(e.target.value)}
                />
              </div>
              <div className="w-full md:w-40">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <NeumorphicSelect 
                  options={statusOptions} 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                />
              </div>
              <div className="w-full md:w-auto">
                <NeumorphicButton onClick={applyFilters}>Apply Filters</NeumorphicButton>
              </div>
            </div>

            <div className="flex gap-2 justify-end border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 self-center mr-auto">Export Events:</label>
              <NeumorphicButton 
                variant="outline" 
                className="flex items-center justify-center" 
                onClick={() => handleExportEvents('csv', selectedCategory, selectedStatus)}
              >
                <Download className="w-4 h-4 mr-2" />
                <span>CSV</span>
              </NeumorphicButton>
              <NeumorphicButton 
                variant="outline" 
                className="flex items-center justify-center" 
                onClick={() => handleExportEvents('ical', selectedCategory, selectedStatus)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                <span>Calendar</span>
              </NeumorphicButton>
            </div>
          </GlassmorphicCard>
        </motion.div>

        {/* Events Grid */}
        <Suspense fallback={<EventsLoading />}>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i} 
                  className="h-96 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : paginatedEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <EventCard event={{
                    id: event.id,
                    title: event.title,
                    date: new Date(event.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric'
                    }),
                    location: event.location,
                    image: event.image,
                    description: event.description,
                    price: event.price,
                    category: event.category
                  }} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-xl font-semibold mb-2">No events found</h3>
              <p className="text-gray-600 dark:text-gray-400">Try adjusting your search filters</p>
            </div>
          )}
        </Suspense>

        {/* Pagination */}
        {!isLoading && filteredEvents.length > 0 && (
          <motion.div 
            className="mt-12 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <nav className="flex items-center gap-2">
              <NeumorphicButton 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  if (currentPage > 1) {
                    const newPage = currentPage - 1;
                    setCurrentPage(newPage);
                    setTimeout(() => updateUrlParams(), 0);
                  }
                }}
                disabled={currentPage === 1}
              >
                Previous
              </NeumorphicButton>
              {getPageNumbers().map((page, index) => (
                typeof page === 'number' ? (
                  <NeumorphicButton 
                    key={index} 
                    variant={page === currentPage ? "default" : "outline"} 
                    size="sm" 
                    className="w-10 h-10"
                    onClick={() => {
                      setCurrentPage(page);
                      setTimeout(() => updateUrlParams(), 0);
                    }}
                  >
                    {page}
                  </NeumorphicButton>
                ) : (
                  <span key={index} className="px-1">...</span>
                )
              ))}
              <NeumorphicButton 
                variant="outline" 
                size="sm"
                onClick={() => {
                  if (currentPage < totalPages) {
                    const newPage = currentPage + 1;
                    setCurrentPage(newPage);
                    setTimeout(() => updateUrlParams(), 0);
                  }
                }}
                disabled={currentPage === totalPages}
              >
                Next
              </NeumorphicButton>
            </nav>
          </motion.div>
        )}
      </div>
    </main>
  )
}

// Wrap the page component in a Suspense boundary
export default function EventsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EventsContent />
    </Suspense>
  );
}
