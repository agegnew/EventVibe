"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Search, Filter, Edit, Trash2, Plus, Calendar, X, Upload, Check } from "lucide-react"
import { GlassmorphicCard } from "@/components/ui-elements/glassmorphic-card"
import { NeumorphicButton } from "@/components/ui-elements/neumorphic-button"
import { NeumorphicInput } from "@/components/ui-elements/neumorphic-input"
import Image from "next/image"
import { Event, createEvent, updateEvent, deleteEvent, getAllEvents } from "@/lib/data-service"

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

  // Load events on component mount
  useEffect(() => {
    fetchEvents()
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

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 title-3d">Manage Events</h1>
        <NeumorphicButton className="w-full sm:w-auto" onClick={() => openEventModal()}>
          <Plus className="w-4 h-4 mr-2" />
          <span>Create Event</span>
        </NeumorphicButton>
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
    </div>
  )
}