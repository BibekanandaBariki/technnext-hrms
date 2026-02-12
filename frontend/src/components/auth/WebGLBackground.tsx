"use client"

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial, Sphere } from '@react-three/drei'
import * as THREE from 'three'

function AnimatedParticles() {
    const ref = useRef<THREE.Points>(null!)
    const particleCount = 3000

    const positions = useMemo(() => {
        const positions = new Float32Array(particleCount * 3)
        const colors = new Float32Array(particleCount * 3)

        for (let i = 0; i < particleCount; i++) {
            // Create particles in a sphere
            const radius = 8 + Math.random() * 4
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
            positions[i * 3 + 2] = radius * Math.cos(phi)

            // Color gradient from blue to purple to pink
            const colorMix = Math.random()
            colors[i * 3] = 0.4 + colorMix * 0.6 // R
            colors[i * 3 + 1] = 0.3 + colorMix * 0.3 // G
            colors[i * 3 + 2] = 0.8 + colorMix * 0.2 // B
        }

        return { positions, colors }
    }, [])

    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        if (ref.current) {
            ref.current.rotation.y = time * 0.03
            ref.current.rotation.x = Math.sin(time * 0.02) * 0.1
        }
    })

    return (
        <Points ref={ref} positions={positions.positions} colors={positions.colors} stride={3}>
            <PointMaterial
                transparent
                vertexColors
                size={0.015}
                sizeAttenuation={true}
                depthWrite={false}
                opacity={0.8}
                blending={THREE.AdditiveBlending}
            />
        </Points>
    )
}

function FloatingOrbs() {
    const orb1Ref = useRef<THREE.Mesh>(null!)
    const orb2Ref = useRef<THREE.Mesh>(null!)
    const orb3Ref = useRef<THREE.Mesh>(null!)

    useFrame((state) => {
        const time = state.clock.getElapsedTime()

        if (orb1Ref.current) {
            orb1Ref.current.position.x = Math.sin(time * 0.3) * 3
            orb1Ref.current.position.y = Math.cos(time * 0.2) * 2
        }

        if (orb2Ref.current) {
            orb2Ref.current.position.x = Math.cos(time * 0.4) * 4
            orb2Ref.current.position.y = Math.sin(time * 0.3) * 3
        }

        if (orb3Ref.current) {
            orb3Ref.current.position.x = Math.sin(time * 0.25) * 3.5
            orb3Ref.current.position.y = Math.cos(time * 0.35) * 2.5
        }
    })

    return (
        <>
            <Sphere ref={orb1Ref} args={[0.5, 32, 32]} position={[3, 2, -8]}>
                <meshBasicMaterial color="#667eea" transparent opacity={0.3} />
            </Sphere>
            <Sphere ref={orb2Ref} args={[0.7, 32, 32]} position={[-4, -2, -10]}>
                <meshBasicMaterial color="#764ba2" transparent opacity={0.25} />
            </Sphere>
            <Sphere ref={orb3Ref} args={[0.6, 32, 32]} position={[2, -3, -9]}>
                <meshBasicMaterial color="#f093fb" transparent opacity={0.2} />
            </Sphere>
        </>
    )
}

export default function WebGLBackground() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden">
            {/* Enhanced gradient background */}
            <div
                className="absolute inset-0"
                style={{
                    background: `
            radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(240, 147, 251, 0.1) 0%, transparent 50%),
            linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)
          `
                }}
            />

            {/* Animated gradient overlay */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    background: 'linear-gradient(45deg, transparent 30%, rgba(102, 126, 234, 0.1) 50%, transparent 70%)',
                    backgroundSize: '200% 200%',
                    animation: 'gradientShift 15s ease infinite',
                }}
            />

            {/* WebGL Canvas */}
            <Canvas
                camera={{ position: [0, 0, 8], fov: 60 }}
                gl={{
                    alpha: true,
                    antialias: true,
                    powerPreference: "high-performance"
                }}
                dpr={[1, 2]}
            >
                <ambientLight intensity={0.3} />
                <pointLight position={[10, 10, 10]} intensity={0.5} />
                <AnimatedParticles />
                <FloatingOrbs />
            </Canvas>

            <style jsx global>{`
        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
        </div>
    )
}
