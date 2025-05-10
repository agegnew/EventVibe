"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import { GlassmorphicCard } from "@/components/ui-elements/glassmorphic-card"
import { NeumorphicButton } from "@/components/ui-elements/neumorphic-button"
import { NeumorphicInput } from "@/components/ui-elements/neumorphic-input"
import { OrganicShape } from "@/components/ui-elements/organic-shape"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false);

  // Defer non-critical animations until after page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-mesh-gradient dark:from-gray-900 dark:to-gray-800 flex items-center justify-center pt-28 sm:pt-32 md:pt-20 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden animated-bg">
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

      <motion.div
        className="max-w-md w-full relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <GlassmorphicCard className="p-8" borderGlow={true}>
          <div className="text-center mb-8">
            <motion.h1 
              className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 title-3d"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Welcome Back
            </motion.h1>
            <motion.p 
              className="text-gray-600 dark:text-gray-400 mt-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Sign in to your account to continue
            </motion.p>
          </div>

          <motion.form 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <NeumorphicInput type="email" placeholder="Enter your email" icon={<Mail className="h-4 w-4" />} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <NeumorphicInput
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                icon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  href="#"
                  className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <NeumorphicButton className="w-full" size="lg">
                Sign In
              </NeumorphicButton>
            </div>
          </motion.form>

          <motion.div 
            className="mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <NeumorphicButton variant="outline" className="w-full">
                Google
              </NeumorphicButton>
              <NeumorphicButton variant="outline" className="w-full">
                Apple
              </NeumorphicButton>
              <NeumorphicButton variant="outline" className="w-full">
                GitHub
              </NeumorphicButton>
            </div>
          </motion.div>

          <motion.div 
            className="mt-6 text-center text-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
            <Link
              href="/signup"
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Sign up
            </Link>
          </motion.div>
        </GlassmorphicCard>
      </motion.div>
    </main>
  )
}
