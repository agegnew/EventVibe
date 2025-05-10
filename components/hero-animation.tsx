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
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={0.5}
    >
      <group ref={groupRef} position={[0, 0, 0]} rotation={[0.1, 0.4, 0]}>
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
            emissiveIntensity={0.5}
            transparent
            opacity={0.6}
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

// Fallback component if 3D rendering fails
function FallbackAnimation() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white/10 blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-white/10 blur-3xl"></div>
      </div>
      <div className="text-white text-center p-8 relative z-10">
        <div className="text-2xl font-bold mb-2">EventVibe</div>
        <div>Discover amazing events</div>
      </div>
    </div>
  )
}

export default function HeroAnimation() {
  // Use a simpler approach - immediately render both the fallback and the real component
  // The fallback will be shown first while the 3D component loads
  const [fallbackVisible, setFallbackVisible] = useState(true);
  const [canvasInitialized, setCanvasInitialized] = useState(false);
  
  // After component mounts, begin a timer to hide the fallback
  useEffect(() => {
    // Force initialization immediately
    setCanvasInitialized(true);
    
    // Give time for the 3D canvas to initialize before showing it
    const timer = setTimeout(() => {
      setFallbackVisible(false);
    }, 800); // Give it a little more time to fully render
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden">
      {/* Always render the 3D component, but it might take time to initialize */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${fallbackVisible ? 'opacity-0' : 'opacity-100'}`}>
        {canvasInitialized && (
          <ErrorBoundary fallback={<FallbackAnimation />}>
            <Canvas
              camera={{ position: [0, 0, 5], fov: 45 }}
              dpr={[1, 2]}
              gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
              style={{ width: '100%', height: '100%' }}
            >
              <ambientLight intensity={0.4} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={0.7} castShadow />
              <pointLight position={[-10, -10, -10]} intensity={0.5} color="#60a5fa" />
              <AdvancedModel />
              <Environment preset="city" blur={0.8} />
            </Canvas>
          </ErrorBoundary>
        )}
      </div>
      
      {/* Always show the fallback initially, then fade it out */}
      <div className={`absolute inset-0 z-10 transition-opacity duration-500 ${fallbackVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <FallbackAnimation />
      </div>
    </div>
  )
}

// Updated error boundary component with fallback prop
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
