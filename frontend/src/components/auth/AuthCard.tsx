"use client"

import { ReactNode } from 'react'

interface AuthCardProps {
    children: ReactNode
    className?: string
}

export default function AuthCard({ children, className = '' }: AuthCardProps) {
    return (
        <div className="relative group">
            {/* Outer glow - animated */}
            <div
                className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-1000"
                style={{
                    animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
            />

            {/* Middle glow layer */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-blue-500/30 rounded-3xl blur-xl" />

            {/* Glass card with enhanced styling */}
            <div
                className={`
          relative
          backdrop-blur-2xl
          bg-gradient-to-br from-white/10 via-white/5 to-white/10
          border border-white/20
          rounded-3xl
          p-10
          shadow-2xl
          overflow-hidden
          ${className}
        `}
                style={{
                    boxShadow: `
            0 0 80px rgba(139, 92, 246, 0.4),
            0 30px 60px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            inset 0 -1px 0 rgba(255, 255, 255, 0.05)
          `,
                }}
            >
                {/* Top highlight */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                {/* Noise texture overlay for depth */}
                <div
                    className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
                    }}
                />

                {/* Content */}
                <div className="relative z-10">
                    {children}
                </div>
            </div>

            <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.35;
          }
        }
      `}</style>
        </div>
    )
}
