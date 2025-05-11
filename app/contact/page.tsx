"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AtSign, MapPin, Phone, Send, Mail, MessageSquare, ArrowRight, Check } from "lucide-react"
import { OrganicShape } from "@/components/ui-elements/organic-shape"
import { GlassmorphicCard } from "@/components/ui-elements/glassmorphic-card"
import { NeumorphicButton } from "@/components/ui-elements/neumorphic-button"
import Link from "next/link"

export default function ContactPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Simple animation loading after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormState({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
      
      // Reset the success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    }, 1500);
  };
  
  return (
    <main className="min-h-screen bg-mesh-gradient dark:from-gray-900 dark:to-gray-800 overflow-hidden animated-bg pt-20">
      {/* Floating shapes for background effect */}
      {isLoaded && (
        <>
          <OrganicShape
            className="absolute -top-40 -left-40 w-[500px] h-[500px] text-blue-200 dark:text-blue-900 opacity-30 rotate-45"
            type="blob1"
          />
          <OrganicShape
            className="absolute bottom-0 right-0 w-[600px] h-[600px] text-cyan-200 dark:text-cyan-900 opacity-20 -rotate-12"
            type="blob2"
          />
        </>
      )}
      
      {/* Contact Hero Section */}
      <section className="relative py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="relative inline-block px-4 py-1 mb-4 rounded-full bg-blue-100 dark:bg-blue-900/40 backdrop-blur-sm">
                <span className="relative z-10 text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Get In Touch
                </span>
              </span>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                Contact Us
              </h1>
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
                Have questions or feedback? We'd love to hear from you. Reach out to our team and we'll respond as soon as possible.
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <GlassmorphicCard className="p-8 relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full -ml-20 -mb-20"></div>
                
                <h2 className="text-2xl font-bold mb-6 relative z-10 flex items-center">
                  <MessageSquare className="mr-2 h-6 w-6 text-blue-500" />
                  Send us a Message
                </h2>
                
                {isSubmitted ? (
                  <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-6 text-center">
                    <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                      <Check className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-2">Message Sent!</h3>
                    <p className="text-green-600 dark:text-green-400">Thank you for reaching out. We'll get back to you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formState.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formState.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                          placeholder="Your email"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Subject
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formState.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                      >
                        <option value="">Select a subject</option>
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Event Support">Event Support</option>
                        <option value="Registration Issues">Registration Issues</option>
                        <option value="Feature Request">Feature Request</option>
                        <option value="Bug Report">Bug Report</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formState.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                        placeholder="Your message"
                      ></textarea>
                    </div>
                    
                    <div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Message <Send className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </GlassmorphicCard>
            </motion.div>
            
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col gap-6"
            >
              <GlassmorphicCard className="p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-40 h-40 bg-cyan-500/10 rounded-full -ml-20 -mt-20"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full -mr-20 -mb-20"></div>
                
                <h2 className="text-2xl font-bold mb-6 relative z-10 flex items-center">
                  <Mail className="mr-2 h-6 w-6 text-blue-500" />
                  Contact Information
                </h2>
                
                <div className="space-y-6 relative z-10">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                        <AtSign className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Email</h3>
                      <p className="mt-1 text-gray-600 dark:text-gray-400">
                        <a href="mailto:contact@eventvibe.com" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          contact@eventvibe.com
                        </a>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                        <Phone className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Phone</h3>
                      <p className="mt-1 text-gray-600 dark:text-gray-400">
                        <a href="tel:+1234567890" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          +1 (234) 567-890
                        </a>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                        <MapPin className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Location</h3>
                      <p className="mt-1 text-gray-600 dark:text-gray-400">
                        123 Event Street<br />
                        Paris, France 75001
                      </p>
                    </div>
                  </div>
                </div>
              </GlassmorphicCard>
              
              <GlassmorphicCard className="p-8 relative overflow-hidden">
                <h2 className="text-2xl font-bold mb-4 relative z-10">Office Hours</h2>
                <div className="space-y-3 relative z-10">
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Monday - Friday</span>
                    <span className="font-medium">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Saturday</span>
                    <span className="font-medium">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Sunday</span>
                    <span className="font-medium">Closed</span>
                  </div>
                </div>
                
                <div className="mt-8">
                  <Link 
                    href="/about" 
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    Learn more about us <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </GlassmorphicCard>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Map Section (Static image placeholder) */}
      <section className="relative py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-xl overflow-hidden shadow-xl"
          >
            <div className="relative h-[400px] bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
              <MapPin className="h-12 w-12 text-blue-500 animate-bounce" />
              <div className="absolute inset-0 bg-blue-600/5 backdrop-blur-sm"></div>
              <div className="absolute z-10 bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
                <h3 className="text-xl font-bold">EventVibe Headquarters</h3>
                <p>123 Event Street, Paris, France</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="relative py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="relative inline-block px-4 py-1 mb-4 rounded-full bg-blue-100 dark:bg-blue-900/40 backdrop-blur-sm">
                <span className="relative z-10 text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Help Center
                </span>
              </span>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                Find quick answers to common questions about our platform
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                question: "How do I create an event?",
                answer: "To create an event, log in to your account, navigate to your dashboard, and click the 'Create Event' button. Fill in the required details and publish your event."
              },
              {
                question: "Can I edit my event after publishing?",
                answer: "Yes, you can edit your event details anytime after publishing. Simply go to your dashboard, find the event, and click 'Edit' to make changes."
              },
              {
                question: "How do I register for an event?",
                answer: "To register for an event, go to the event page and click the 'Register' button. Follow the prompts to complete your registration."
              },
              {
                question: "Are there fees for using EventVibe?",
                answer: "EventVibe offers both free and premium plans. Basic event creation and registration is free, while premium features may require a subscription."
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <GlassmorphicCard className="p-6 h-full">
                  <h3 className="text-lg font-bold mb-2">{faq.question}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                </GlassmorphicCard>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <NeumorphicButton asChild>
              <Link href="/events">Explore Events</Link>
            </NeumorphicButton>
          </div>
        </div>
      </section>
    </main>
  )
} 