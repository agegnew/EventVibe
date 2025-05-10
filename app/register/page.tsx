"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Check, CreditCard, User, Mail, Phone, Calendar, MapPin, ArrowLeft } from "lucide-react"
import { GlassmorphicCard } from "@/components/ui-elements/glassmorphic-card"
import { NeumorphicButton } from "@/components/ui-elements/neumorphic-button"
import { NeumorphicInput } from "@/components/ui-elements/neumorphic-input"
import { OrganicShape } from "@/components/ui-elements/organic-shape"

const steps = [
  { id: 1, name: "Personal Information" },
  { id: 2, name: "Event Details" },
  { id: 3, name: "Payment" },
  { id: 4, name: "Confirmation" },
]

// Sample event data - in a real app, this would be fetched based on the event ID
const eventData = {
  id: "1",
  title: "Tech Conference 2025",
  date: "May 15-17, 2025",
  location: "Moscone Center, San Francisco, CA",
  price: 299,
  processingFee: 14.95,
  image: "/placeholder.svg?height=400&width=600",
  category: "Technology",
}

function RegisterContent() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoaded, setIsLoaded] = useState(false)
  const [eventId, setEventId] = useState<string | null>(null)
  const searchParams = useSearchParams()
  
  // Defer non-critical animations until after page load
  useEffect(() => {
    // Get the event ID from the URL if present
    const event = searchParams.get('event')
    setEventId(event)
    
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [searchParams])

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
      // Scroll to top when changing steps
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      // Scroll to top when changing steps
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const getTotalPrice = () => {
    return eventData.price + eventData.processingFee
  }

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
        <Link
          href={eventId ? `/events/${eventId}` : "/events"}
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-4 sm:mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to {eventId ? "Event" : "Events"}
        </Link>

        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 mb-4 title-3d">Event Registration</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Complete the form below to register for {eventData.title}
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <GlassmorphicCard className="mb-12 p-6" borderGlow={true}>
            <div className="flex flex-wrap items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center relative">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                      step.id < currentStep
                        ? "bg-green-500 text-white"
                        : step.id === currentStep
                          ? "bg-blue-600 dark:bg-blue-500 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {step.id < currentStep ? <Check className="w-5 h-5" /> : <span>{step.id}</span>}
                  </div>
                  <span
                    className={`text-sm ${
                      step.id === currentStep
                        ? "font-medium text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {step.name}
                  </span>
                  
                  {/* Progress line between steps */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute h-[2px] bg-gray-200 dark:bg-gray-700 w-[100px] top-5 left-[calc(100%+0.5rem)]">
                      <div
                        className="h-full bg-green-500 transition-all duration-500"
                        style={{ width: step.id < currentStep ? "100%" : "0%" }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </GlassmorphicCard>
        </motion.div>

        {/* Registration Form */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <GlassmorphicCard className="p-6 md:p-8 max-w-4xl mx-auto" borderGlow={true}>
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name
                    </label>
                    <NeumorphicInput placeholder="Enter your first name" icon={<User className="h-4 w-4" />} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                    <NeumorphicInput placeholder="Enter your last name" icon={<User className="h-4 w-4" />} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <NeumorphicInput type="email" placeholder="Enter your email" icon={<Mail className="h-4 w-4" />} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <NeumorphicInput
                      type="tel"
                      placeholder="Enter your phone number"
                      icon={<Phone className="h-4 w-4" />}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Event Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Event</label>
                    <NeumorphicInput value={eventData.title} readOnly icon={<Calendar className="h-4 w-4" />} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
                    <NeumorphicInput value={eventData.date} readOnly icon={<Calendar className="h-4 w-4" />} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                    <NeumorphicInput
                      value={eventData.location}
                      readOnly
                      icon={<MapPin className="h-4 w-4" />}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Number of Tickets
                    </label>
                    <NeumorphicInput
                      type="number"
                      defaultValue="1"
                      min="1"
                      max="10"
                      icon={<User className="h-4 w-4" />}
                    />
                  </div>
                </div>

                <GlassmorphicCard className="mt-6 p-4">
                  <h3 className="font-medium mb-4 text-gray-800 dark:text-gray-200">Ticket Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2">
                      <span className="text-gray-700 dark:text-gray-300">{eventData.title} x 1</span>
                      <span className="font-medium">${eventData.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2">
                      <span className="text-gray-700 dark:text-gray-300">Processing Fee</span>
                      <span className="font-medium">${eventData.processingFee.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800 dark:text-gray-200">Total</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">${getTotalPrice().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </GlassmorphicCard>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Payment Information</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Card Number
                    </label>
                    <NeumorphicInput placeholder="1234 5678 9012 3456" icon={<CreditCard className="h-4 w-4" />} />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Expiration Date
                      </label>
                      <NeumorphicInput placeholder="MM/YY" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CVC</label>
                      <NeumorphicInput placeholder="123" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name on Card
                    </label>
                    <NeumorphicInput placeholder="Enter the name on your card" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Billing Address
                    </label>
                    <NeumorphicInput placeholder="Enter your billing address" />
                  </div>
                </div>

                <GlassmorphicCard className="mt-6 p-4">
                  <h3 className="font-medium mb-4 text-gray-800 dark:text-gray-200">Payment Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2">
                      <span className="text-gray-700 dark:text-gray-300">{eventData.title} x 1</span>
                      <span className="font-medium">${eventData.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2">
                      <span className="text-gray-700 dark:text-gray-300">Processing Fee</span>
                      <span className="font-medium">${eventData.processingFee.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800 dark:text-gray-200">Total</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">${getTotalPrice().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </GlassmorphicCard>
              </div>
            )}

            {currentStep === 4 && (
              <div className="text-center py-8">
                <motion.div 
                  className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                >
                  <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h2 className="text-2xl font-bold mb-4 text-gradient">Registration Complete!</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-8 max-w-lg mx-auto">
                    Thank you for registering for {eventData.title}. A confirmation email has been sent to your email address.
                  </p>
                  
                  <GlassmorphicCard className="p-6 mb-8 max-w-md mx-auto text-left">
                    <h3 className="font-bold mb-4 text-gray-800 dark:text-gray-200">Your Registration Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-400">Event:</span>
                        <span className="font-medium">{eventData.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-400">Date:</span>
                        <span className="font-medium">{eventData.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-400">Location:</span>
                        <span className="font-medium">{eventData.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-400">Ticket:</span>
                        <span className="font-medium">1 General Admission</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-400">Order Total:</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">${getTotalPrice().toFixed(2)}</span>
                      </div>
                    </div>
                  </GlassmorphicCard>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <NeumorphicButton asChild>
                      <Link href="/dashboard">View in Dashboard</Link>
                    </NeumorphicButton>
                    <NeumorphicButton asChild variant="outline">
                      <Link href="/events">Browse More Events</Link>
                    </NeumorphicButton>
                  </div>
                </motion.div>
              </div>
            )}
          </GlassmorphicCard>
        </motion.div>

        {/* Navigation Buttons */}
        {currentStep < 4 && (
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-between max-w-4xl mx-auto px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {currentStep > 1 ? (
              <NeumorphicButton onClick={prevStep} variant="outline">
                Back
              </NeumorphicButton>
            ) : (
              <div></div> // Empty div to maintain spacing
            )}
            <NeumorphicButton onClick={nextStep}>
              {currentStep === 3 ? "Complete Registration" : "Continue"}
            </NeumorphicButton>
          </motion.div>
        )}
      </div>
    </main>
  )
}

// Wrap the page component in a Suspense boundary
export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
