"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { Search, Filter, Edit, Trash2, Plus, Calendar, X, Upload, Check, FileUp, Download, AlertCircle, AlertTriangle } from "lucide-react"
import { GlassmorphicCard } from "@/components/ui-elements/glassmorphic-card"
import { NeumorphicButton } from "@/components/ui-elements/neumorphic-button"
import { NeumorphicInput } from "@/components/ui-elements/neumorphic-input"
import Image from "next/image"
import { Event, createEvent, updateEvent, deleteEvent, getAllEvents, importEventsFromCsv } from "@/lib/data-service"
import { useRealtimeSync, isRealtimeSyncSupported } from "@/lib/realtime-sync"

export function EventManager() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<Partial<Event> | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // CSV Import state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [importLoading, setImportLoading] = useState(false)
  const [importResult, setImportResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
    events?: Event[];
    invalidRows?: any[];
  } | null>(null)
  const csvInputRef = useRef<HTMLInputElement>(null)

  // Load events on component mount
  useEffect(() => {
    fetchEvents()
    
    // Check if real-time sync is supported
    console.log('[EventManager] Real-time sync supported:', isRealtimeSyncSupported());
  }, [])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const allEvents = await getAllEvents()
      setEvents(allEvents)
    } catch (error) {
      console.error("Error loading events:", error)
    } finally {
      setLoading(false)
    }
  }

  // Real-time sync handlers
  const handleEventCreated = useCallback((data: Event | { isBulkImport: boolean, events: Event[] }) => {
    // Check if this is a bulk import
    if (data && 'isBulkImport' in data && data.isBulkImport && Array.isArray(data.events)) {
      // Handle bulk import
      setEvents(prevEvents => {
        // Create a map of existing event IDs for quick lookup
        const existingEventIds = new Set(prevEvents.map(event => event.id))
        
        // Filter out events that already exist
        const newEvents = data.events.filter(event => !existingEventIds.has(event.id))
        
        // If no new events, return unchanged
        if (newEvents.length === 0) return prevEvents
        
        // Add all new events and sort
        return [...prevEvents, ...newEvents].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      })
    } else {
      // Handle single event creation
      const newEvent = data as Event
      setEvents(prevEvents => {
        // Check if the event already exists (avoid duplicates)
        const exists = prevEvents.some(event => event.id === newEvent.id)
        if (exists) return prevEvents
        
        // Add the new event and sort by date (newest first)
        return [...prevEvents, newEvent].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      })
    }
  }, [])

  const handleEventUpdated = useCallback((updatedEvent: Event) => {
    setEvents(prevEvents => {
      return prevEvents.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      )
    })
  }, [])

  const handleEventDeleted = useCallback((data: { id: string }) => {
    setEvents(prevEvents => {
      return prevEvents.filter(event => event.id !== data.id)
    })
  }, [])

  // Subscribe to real-time events
  useRealtimeSync('event-created', handleEventCreated)
  useRealtimeSync('event-updated', handleEventUpdated)
  useRealtimeSync('event-deleted', handleEventDeleted)

  // Filter events based on search term
  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Open modal for creating or editing an event
  const openEventModal = (event?: Event) => {
    if (event) {
      setCurrentEvent({ ...event })
    } else {
      setCurrentEvent({
        title: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
        location: "",
        category: "",
        price: 0,
        seats: 0,
        status: "Draft",
        featured: false,
      })
    }
    setImagePreview(event?.image || null)
    setIsModalOpen(true)
  }

  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false)
    setIsDeleteModalOpen(false)
    setCurrentEvent(null)
    setImageFile(null)
    setImagePreview(null)
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (currentEvent) {
      let newValue: any = value
      
      // Convert numeric fields to numbers
      if (name === "price" || name === "seats") {
        newValue = parseFloat(value) || 0
      }
      
      // Handle checkbox fields
      if (type === "checkbox") {
        newValue = (e.target as HTMLInputElement).checked
      }
      
      setCurrentEvent({
        ...currentEvent,
        [name]: newValue
      })
    }
  }

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0]
    
    if (file) {
      setImageFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Save the event (create or update)
  const saveEvent = async () => {
    if (!currentEvent) return
    
    try {
      if (currentEvent.id) {
        // Update existing event
        await updateEvent(currentEvent.id, currentEvent, imageFile || undefined)
      } else {
        // Create new event
        await createEvent(currentEvent as any, imageFile || undefined)
      }
      
      // Refresh events list
      await fetchEvents()
      closeModal()
    } catch (error) {
      console.error("Error saving event:", error)
    }
  }

  // Open delete confirmation modal
  const openDeleteModal = (event: Event) => {
    setCurrentEvent(event)
    setIsDeleteModalOpen(true)
  }

  // Delete the event
  const confirmDeleteEvent = async () => {
    if (!currentEvent?.id) return
    
    try {
      await deleteEvent(currentEvent.id)
      await fetchEvents()
      closeModal()
    } catch (error) {
      console.error("Error deleting event:", error)
    }
  }

  // Open the import modal
  const openImportModal = () => {
    setIsImportModalOpen(true)
    setImportResult(null)
    setCsvFile(null)
    if (csvInputRef.current) {
      csvInputRef.current.value = ""
    }
  }

  // Close the import modal
  const closeImportModal = () => {
    setIsImportModalOpen(false)
    setImportResult(null)
    setCsvFile(null)
  }

  // Handle CSV file selection
  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0]
    
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        alert('Please select a valid CSV file')
        setCsvFile(null)
        if (csvInputRef.current) {
          csvInputRef.current.value = ""
        }
        return
      }
      
      setCsvFile(file)
      setImportResult(null)
    }
  }

  // Handle CSV import submission
  const importCsv = async () => {
    if (!csvFile) return
    
    setImportLoading(true)
    setImportResult(null)
    
    try {
      // Use the data service function
      const result = await importEventsFromCsv(csvFile)
      
      setImportResult({
        success: true,
        message: result.message,
        events: result.events
      })
      
      // Refresh events list
      await fetchEvents()
    } catch (error) {
      console.error('Error importing CSV:', error)
      setImportResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setImportLoading(false)
    }
  }

  // Generate a CSV template for download
  const downloadCsvTemplate = () => {
    const headers = [
      'title',
      'description',
      'date',
      'endDate',
      'location',
      'category',
      'price',
      'seats',
      'status',
      'featured',
      'image'
    ]
    
    const sampleData = [
      {
        title: 'Tech Conference 2026',
        description: 'A conference about the latest technology trends',
        date: '2026-05-15',
        endDate: '2026-05-17',
        location: 'San Francisco, CA',
        category: 'Technology',
        price: 299.99,
        seats: 500,
        status: 'Upcoming',
        featured: 'true',
        image: '/placeholder.jpg'
      },
      {
        title: 'Marketing Workshop',
        description: 'Learn the latest marketing strategies',
        date: '2026-06-10',
        endDate: '2026-06-10',
        location: 'New York, NY',
        category: 'Marketing',
        price: 149.99,
        seats: 100,
        status: 'Draft',
        featured: 'false',
        image: ''
      }
    ]
    
    // Create CSV content
    const headerRow = headers.join(',')
    const dataRows = sampleData.map(item => 
      headers.map(header => {
        const value = item[header as keyof typeof item]
        // Escape commas and quotes in string values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
    
    const csvContent = [headerRow, ...dataRows].join('\n')
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'event_import_template.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 title-3d">Manage Events</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <NeumorphicButton className="w-full sm:w-auto" onClick={openImportModal}>
            <FileUp className="w-4 h-4 mr-2" />
            <span>Import CSV</span>
          </NeumorphicButton>
          <NeumorphicButton className="w-full sm:w-auto" onClick={() => openEventModal()}>
            <Plus className="w-4 h-4 mr-2" />
            <span>Create Event</span>
          </NeumorphicButton>
        </div>
      </div>

      <GlassmorphicCard className="p-4 md:p-6 border border-blue-100/50 dark:border-blue-800/30" borderGlow={true}>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <NeumorphicInput 
              placeholder="Search events..." 
              icon={<Search className="h-4 w-4" />} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <NeumorphicButton variant="outline" className="w-full justify-between">
              <span>Filter</span>
              <Filter className="w-4 h-4" />
            </NeumorphicButton>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto styled-scrollbar">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 rounded-tl-lg bg-gray-50/50 dark:bg-gray-800/30">Event</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/30">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/30 hidden md:table-cell">Location</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/30 hidden lg:table-cell">
                    Registrations
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/30 hidden md:table-cell">Revenue</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/30">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400 rounded-tr-lg bg-gray-50/50 dark:bg-gray-800/30">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      No events found. Create your first event!
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((event, idx) => (
                    <tr 
                      key={event.id} 
                      className={`border-b border-gray-200 dark:border-gray-700/50 hover:bg-white/40 dark:hover:bg-gray-800/20 transition-colors ${idx === events.length - 1 ? 'border-b-0' : ''}`}
                    >
                      <td className="py-3 px-4 font-medium">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-md overflow-hidden mr-3 bg-gray-100 dark:bg-gray-800">
                            <Image
                              src={event.image || "/placeholder.jpg"}
                              alt={event.title}
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <span>{event.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {new Date(event.date).toLocaleDateString()}
                        {event.endDate && event.date !== event.endDate && 
                          ` - ${new Date(event.endDate).toLocaleDateString()}`
                        }
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400 hidden md:table-cell">{event.location}</td>
                      <td className="py-3 px-4 hidden lg:table-cell">{event.registrations.toLocaleString()}</td>
                      <td className="py-3 px-4 hidden md:table-cell">${event.revenue.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            event.status === "Active"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800/50"
                              : event.status === "Draft"
                                ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/50"
                                : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50"
                          }`}
                        >
                          {event.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button 
                            className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 bg-gray-100/50 dark:bg-gray-800/30 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1 rounded-md transition-colors"
                            onClick={() => openEventModal(event)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 bg-gray-100/50 dark:bg-gray-800/30 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded-md transition-colors"
                            onClick={() => openDeleteModal(event)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </GlassmorphicCard>

      {/* Event Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto styled-scrollbar"
          >
            <GlassmorphicCard className="p-6 border border-blue-100/50 dark:border-blue-800/30" borderGlow={true}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
                  {currentEvent?.id ? 'Edit Event' : 'Create Event'}
                </h2>
                <button onClick={closeModal} className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Title</label>
                      <NeumorphicInput 
                        name="title" 
                        value={currentEvent?.title || ''}
                        onChange={handleInputChange}
                        placeholder="Event title" 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        name="description"
                        value={currentEvent?.description || ''}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full p-3 bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Event description"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Start Date</label>
                        <NeumorphicInput 
                          type="date" 
                          name="date" 
                          value={currentEvent?.date || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">End Date</label>
                        <NeumorphicInput 
                          type="date" 
                          name="endDate" 
                          value={currentEvent?.endDate || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Location</label>
                      <NeumorphicInput 
                        name="location" 
                        value={currentEvent?.location || ''}
                        onChange={handleInputChange}
                        placeholder="City, State" 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Event Image</label>
                    <div 
                      className="h-48 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center relative bg-gray-50/50 dark:bg-gray-800/30 overflow-hidden"
                    >
                      {imagePreview ? (
                        <>
                          <Image
                            src={imagePreview}
                            alt="Event preview"
                            fill
                            className="object-cover"
                          />
                          <button 
                            className="absolute bottom-2 right-2 p-1 rounded-full bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800"
                            onClick={() => {
                              setImagePreview(null)
                              setImageFile(null)
                              if (fileInputRef.current) {
                                fileInputRef.current.value = ""
                              }
                            }}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <div className="text-center p-4">
                          <Upload className="w-10 h-10 mx-auto text-gray-400" />
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <select
                        name="category"
                        value={currentEvent?.category || ''}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      >
                        <option value="">Select category</option>
                        <option value="Technology">Technology</option>
                        <option value="Business">Business</option>
                        <option value="Design">Design</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Health">Health</option>
                        <option value="Education">Education</option>
                        <option value="Entertainment">Entertainment</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Status</label>
                      <select
                        name="status"
                        value={currentEvent?.status || 'Draft'}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Active">Active</option>
                        <option value="Upcoming">Upcoming</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Price</label>
                      <NeumorphicInput 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        name="price" 
                        value={currentEvent?.price?.toString() || '0'}
                        onChange={handleInputChange}
                        placeholder="0.00" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Available Seats</label>
                      <NeumorphicInput 
                        type="number" 
                        min="0" 
                        name="seats" 
                        value={currentEvent?.seats?.toString() || '0'}
                        onChange={handleInputChange}
                        placeholder="0" 
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      name="featured"
                      checked={currentEvent?.featured || false}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="featured" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Featured Event
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 space-x-3">
                <NeumorphicButton variant="outline" onClick={closeModal}>Cancel</NeumorphicButton>
                <NeumorphicButton onClick={saveEvent}>
                  <Check className="w-4 h-4 mr-2" />
                  {currentEvent?.id ? 'Update Event' : 'Create Event'}
                </NeumorphicButton>
              </div>
            </GlassmorphicCard>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md"
          >
            <GlassmorphicCard className="p-6 border border-red-100/50 dark:border-red-800/30" borderGlow={true}>
              <div className="flex items-center justify-center mb-4 text-red-500">
                <Trash2 className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-center mb-4">Delete Event</h2>
              <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{currentEvent?.title}"? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <NeumorphicButton variant="outline" onClick={closeModal}>Cancel</NeumorphicButton>
                <NeumorphicButton className="bg-red-500 hover:bg-red-600 text-white" onClick={confirmDeleteEvent}>
                  Delete
                </NeumorphicButton>
              </div>
            </GlassmorphicCard>
          </motion.div>
        </div>
      )}

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto styled-scrollbar"
          >
            <GlassmorphicCard className="p-6 border border-blue-100/50 dark:border-blue-800/30" borderGlow={true}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
                  Import Events from CSV
                </h2>
                <button onClick={closeImportModal} className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!importResult?.success && (
                <>
                  <p className="mb-4 text-gray-600 dark:text-gray-400">
                    Upload a CSV file containing event data. Your CSV should have the following headers:
                  </p>
                  
                  <div className="mb-4 p-3 bg-gray-50/80 dark:bg-gray-800/30 rounded-md overflow-x-auto">
                    <code className="text-xs">
                      title, description, date, endDate, location, category, price, seats, status, featured, image
                    </code>
                  </div>
                  
                  <div className="mb-6">
                    <NeumorphicButton 
                      size="sm" 
                      variant="outline" 
                      onClick={downloadCsvTemplate}
                      className="text-sm"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download Template
                    </NeumorphicButton>
                  </div>
                  
                  <div 
                    className="h-32 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center relative bg-gray-50/50 dark:bg-gray-800/30 mb-4"
                  >
                    {csvFile ? (
                      <div className="text-center p-4">
                        <Check className="w-10 h-10 mx-auto text-green-500" />
                        <p className="mt-2 text-sm">{csvFile.name}</p>
                        <p className="text-xs text-gray-500">{(csvFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="w-10 h-10 mx-auto text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Click to upload CSV file</p>
                        <p className="text-xs text-gray-400">CSV files only</p>
                      </div>
                    )}
                    <input
                      ref={csvInputRef}
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleCsvFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  
                  {importResult?.error && (
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-md">
                      <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-800 dark:text-red-300">{importResult.error}</p>
                          
                          {importResult.invalidRows && importResult.invalidRows.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm text-red-700 dark:text-red-400">Issues found in the following rows:</p>
                              <ul className="mt-1 text-xs text-red-600 dark:text-red-400 list-disc pl-5 space-y-1">
                                {importResult.invalidRows.slice(0, 5).map((row, index) => (
                                  <li key={index}>
                                    Row {row.rowIndex + 2}: {row.errors.join(', ')}
                                  </li>
                                ))}
                                {importResult.invalidRows.length > 5 && (
                                  <li>...and {importResult.invalidRows.length - 5} more errors</li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end mt-4 space-x-3">
                    <NeumorphicButton variant="outline" onClick={closeImportModal}>Cancel</NeumorphicButton>
                    <NeumorphicButton 
                      onClick={importCsv} 
                      disabled={!csvFile || importLoading}
                      className={importLoading ? "opacity-70 cursor-not-allowed" : ""}
                    >
                      {importLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <FileUp className="w-4 h-4 mr-2" />
                          Import Events
                        </>
                      )}
                    </NeumorphicButton>
                  </div>
                </>
              )}
              
              {importResult?.success && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Import Successful!</h3>
                  <p className="mb-6 text-gray-600 dark:text-gray-400">{importResult.message}</p>
                  
                  {importResult.events && importResult.events.length > 0 && (
                    <div className="mb-6 p-4 bg-white/50 dark:bg-gray-800/30 rounded-md max-h-40 overflow-auto styled-scrollbar text-left">
                      <p className="font-semibold mb-2 text-sm">Imported Events:</p>
                      <ul className="text-sm space-y-1">
                        {importResult.events.map(event => (
                          <li key={event.id} className="truncate">{event.title}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <NeumorphicButton onClick={closeImportModal}>Close</NeumorphicButton>
                </div>
              )}
            </GlassmorphicCard>
          </motion.div>
        </div>
      )}
    </div>
  )
}