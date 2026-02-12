"use client"

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'

interface AnimatedLogoProps {
    size?: number
}

export default function AnimatedLogo({ size = 120 }: AnimatedLogoProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const logoRef = useRef<HTMLDivElement>(null)
    const glow1Ref = useRef<HTMLDivElement>(null)
    const glow2Ref = useRef<HTMLDivElement>(null)
    const glow3Ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!logoRef.current || !containerRef.current) return

        const ctx = gsap.context(() => {
            // Entry animation - dramatic entrance
            const tl = gsap.timeline()

            tl.fromTo(
                containerRef.current,
                {
                    scale: 0,
                    opacity: 0,
                    rotation: -180,
                },
                {
                    scale: 1,
                    opacity: 1,
                    rotation: 0,
                    duration: 1.2,
                    ease: 'elastic.out(1, 0.5)',
                    delay: 0.3,
                }
            )

            // Breathing animation
            gsap.to(logoRef.current, {
                scale: 1.08,
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: 1.5,
            })

            // Rotating glow layers
            if (glow1Ref.current) {
                gsap.to(glow1Ref.current, {
                    rotation: 360,
                    duration: 20,
                    repeat: -1,
                    ease: 'none',
                })
            }

            if (glow2Ref.current) {
                gsap.to(glow2Ref.current, {
                    rotation: -360,
                    duration: 15,
                    repeat: -1,
                    ease: 'none',
                })
            }

            if (glow3Ref.current) {
                gsap.to(glow3Ref.current, {
                    scale: 1.2,
                    opacity: 0.4,
                    duration: 2.5,
                    repeat: -1,
                    yoyo: true,
                    ease: 'sine.inOut',
                })
            }
        })

        return () => ctx.revert()
    }, [])

    return (
        <div ref={containerRef} className="relative flex items-center justify-center" style={{ width: size * 2, height: size * 2 }}>
            {/* Animated glow layers */}
            <div
                ref={glow1Ref}
                className="absolute inset-0 rounded-full opacity-60"
                style={{
                    background: 'conic-gradient(from 0deg, rgba(102, 126, 234, 0.6), rgba(118, 75, 162, 0.6), rgba(240, 147, 251, 0.6), rgba(102, 126, 234, 0.6))',
                    filter: 'blur(40px)',
                }}
            />

            <div
                ref={glow2Ref}
                className="absolute inset-0 rounded-full opacity-50"
                style={{
                    background: 'conic-gradient(from 180deg, rgba(240, 147, 251, 0.5), rgba(102, 126, 234, 0.5), rgba(118, 75, 162, 0.5), rgba(240, 147, 251, 0.5))',
                    filter: 'blur(30px)',
                }}
            />

            <div
                ref={glow3Ref}
                className="absolute rounded-full opacity-70"
                style={{
                    width: size * 1.8,
                    height: size * 1.8,
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.8) 0%, transparent 70%)',
                    filter: 'blur(25px)',
                }}
            />

            {/* Logo container with enhanced effects */}
            <div
                ref={logoRef}
                className="relative logo-container z-10"
                style={{
                    width: size,
                    height: size,
                }}
            >
                {/* Shine effect overlay */}
                <div className="absolute inset-0 rounded-full overflow-hidden">
                    <div
                        className="absolute inset-0 shine-effect"
                        style={{
                            background: 'linear-gradient(135deg, transparent 40%, rgba(255, 255, 255, 0.3) 50%, transparent 60%)',
                            backgroundSize: '200% 200%',
                        }}
                    />
                </div>

                <Image
                    src="/technext-logo.png"
                    alt="Technnext Logo"
                    width={size}
                    height={size}
                    className="relative z-10 drop-shadow-2xl"
                    priority
                />
            </div>

            <style jsx>{`
        .logo-container {
          filter: 
            drop-shadow(0 0 20px rgba(102, 126, 234, 1))
            drop-shadow(0 0 40px rgba(118, 75, 162, 0.8))
            drop-shadow(0 0 60px rgba(240, 147, 251, 0.6));
          transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-style: preserve-3d;
        }

        .logo-container:hover {
          transform: perspective(1000px) rotateY(15deg) rotateX(10deg) scale(1.05);
          filter: 
            drop-shadow(0 0 30px rgba(102, 126, 234, 1))
            drop-shadow(0 0 50px rgba(118, 75, 162, 1))
            drop-shadow(0 0 70px rgba(240, 147, 251, 0.8));
        }

        .shine-effect {
          animation: shine 3s ease-in-out infinite;
        }

        @keyframes shine {
          0%, 100% {
            background-position: -200% 0;
          }
          50% {
            background-position: 200% 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .logo-container,
          .shine-effect {
            animation: none !important;
          }
        }
      `}</style>
        </div>
    )
}
