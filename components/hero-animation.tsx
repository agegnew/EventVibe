"use client"

import { useRef, useState, useEffect, Component } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, Box, Sphere, MeshDistortMaterial, Float, Text, Decal } from "@react-three/drei"
import { motion } from "framer-motion"
import type * as THREE from "three"

// Advanced animated model with distortion and light effects
function AdvancedModel() {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      // More dynamic animation
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.2
      meshRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1
      
      // Subtle pulsing scale
      const scale = 1 + Math.sin(state.clock.getElapsedTime() * 1.5) * 0.05
      meshRef.current.scale.set(scale, scale, scale)
    }
    
    if (groupRef.current) {
      // Subtle floating movement
      groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2
    }
  })

  return (
    <Float
      speed={1.5}
      rotationIntensity={0.4}
      floatIntensity={0.4}
    >
      <group ref={groupRef} position={[0, 0, 0]} rotation={[0.1, 0.4, 0]} scale={1.2}>
        {/* Main glowing sphere with distortion */}
        <Sphere ref={meshRef} args={[1.2, 64, 64]} position={[0, 0, 0]}>
          <MeshDistortMaterial 
            color="#3b82f6" 
            attach="material" 
            distort={0.4} 
            speed={2} 
            roughness={0.2}
            metalness={0.8}
            emissive="#1d4ed8"
            emissiveIntensity={0.5}
          />
        </Sphere>
        
        {/* Orbit ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2, 0.04, 16, 64]} />
          <meshStandardMaterial 
            color="#60a5fa" 
            emissive="#60a5fa"
            emissiveIntensity={0.8}
            transparent
            opacity={0.8}
          />
        </mesh>
        
        {/* Smaller orbiting spheres */}
        <OrbitingSphere radius={2} speed={1.5} color="#0284c7" size={0.15} />
        <OrbitingSphere radius={2} speed={-1.8} color="#0ea5e9" size={0.12} phase={Math.PI} />
        <OrbitingSphere radius={2} speed={1.2} color="#38bdf8" size={0.08} phase={Math.PI / 2} />
      </group>
    </Float>
  )
}

// Helper component for creating orbiting spheres
interface OrbitingSphereProps {
  radius: number
  speed: number
  color: string
  size?: number
  phase?: number
}

function OrbitingSphere({ radius, speed, color, size = 0.1, phase = 0 }: OrbitingSphereProps) {
  const ref = useRef<THREE.Mesh>(null)
  
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime() * speed + phase
      ref.current.position.x = radius * Math.cos(t)
      ref.current.position.z = radius * Math.sin(t)
    }
  })
  
  return (
    <Sphere ref={ref} args={[size, 24, 24]}>
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={1}
      />
    </Sphere>
  )
}

// Mobile-friendly fallback animation (pure CSS/HTML)
function MobileAnimation() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full bg-white/30 blur-2xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-60 h-60 rounded-full bg-white/20 blur-3xl animate-pulse" style={{animationDelay: '1s', animationDuration: '3s'}}></div>
        
        {/* Additional animated elements for visual interest */}
        <div className="absolute top-1/2 left-1/3 w-20 h-20 rounded-full bg-blue-400/20 blur-xl animate-ping" style={{animationDuration: '3s'}}></div>
        <div className="absolute bottom-1/3 right-1/3 w-12 h-12 rounded-full bg-cyan-300/30 blur-xl animate-ping" style={{animationDuration: '4s', animationDelay: '1s'}}></div>
      </div>
      
      {/* Animated circles */}
      <motion.div 
        className="absolute w-8 h-8 rounded-full bg-blue-500/70"
        animate={{
          x: [0, 80, 0, -80, 0],
          y: [-80, 0, 80, 0, -80],
        }}
        transition={{
          duration: 10,
          ease: "linear",
          repeat: Infinity,
        }}
      />
      
      <motion.div 
        className="absolute w-5 h-5 rounded-full bg-cyan-400/70"
        animate={{
          x: [0, -60, 0, 60, 0],
          y: [60, 0, -60, 0, 60],
        }}
        transition={{
          duration: 8,
          ease: "linear",
          repeat: Infinity,
        }}
      />
      
      <motion.div 
        className="text-white text-center p-8 relative z-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          EventVibe
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-lg text-white/90"
        >
          Discover amazing events
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function HeroAnimation() {
  const [isMobile, setIsMobile] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Detect mobile devices responsively
  useEffect(() => {
    // Function to check if screen is mobile-sized
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // 768px is typical tablet breakpoint
    }
    
    // Check initially
    checkMobile()
    setIsLoaded(true)
    
    // Add resize listener
    window.addEventListener('resize', checkMobile)
    
    // Clean up
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // If not loaded yet, return the mobile animation as initial display to prevent flicker
  if (!isLoaded) {
    return (
      <div className="w-full h-full relative rounded-xl overflow-hidden">
        <MobileAnimation />
      </div>
    )
  }
  
  // If mobile, use the simpler animation
  if (isMobile) {
    return (
      <div className="w-full h-full relative rounded-xl overflow-hidden">
        <MobileAnimation />
      </div>
    )
  }
  
  // For tablets and larger screens, use the 3D animation
  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden">
      <ErrorBoundary fallback={<MobileAnimation />}>
        <Canvas
          camera={{ position: [0, 0, 6], fov: 50 }}
          dpr={[1, 1.5]}
          gl={{ alpha: true, antialias: true, powerPreference: "default" }}
          style={{ width: '100%', height: '100%' }}
        >
          <ambientLight intensity={0.6} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={0.8} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#60a5fa" />
          <AdvancedModel />
          <Environment preset="city" blur={0.8} />
        </Canvas>
      </ErrorBoundary>
    </div>
  )
}

// Error boundary component for graceful fallback if 3D animation fails
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
