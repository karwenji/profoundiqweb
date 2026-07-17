'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { X, UserPlus, ArrowRight } from 'lucide-react'

export default function FloatingRegisterButton() {
  const { user } = useAuth()
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [animatePulse, setAnimatePulse] = useState(false)

  useEffect(() => {
    if (!user && !isDismissed) {
      // Show after 2 seconds delay
      const showTimer = setTimeout(() => {
        setIsVisible(true)
      }, 2000)

      // Pulse animation every 5 seconds to draw attention
      const pulseInterval = setInterval(() => {
        setAnimatePulse(true)
        setTimeout(() => setAnimatePulse(false), 1000)
      }, 5000)

      return () => {
        clearTimeout(showTimer)
        clearInterval(pulseInterval)
      }
    } else {
      setIsVisible(false)
    }
  }, [user, isDismissed])

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDismissed(true)
    setIsVisible(false)
  }

  // Don't render if user is logged in or dismissed
  if (user || !isVisible || isDismissed) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="bg-gray-800 text-white rounded-full p-1.5 shadow-lg hover:bg-gray-700 transition-all duration-200 opacity-70 hover:opacity-100"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Main CTA button */}
      <Link
        href="/auth/register"
        className={`group relative flex items-center gap-3 bg-gradient-to-r from-secondary via-yellow-500 to-orange-500 text-white px-10 py-6 sm:px-12 sm:py-7 rounded-full shadow-[0_0_40px_rgba(234,179,8,0.5)] hover:shadow-[0_0_60px_rgba(234,179,8,0.7)] hover:scale-105 transition-all duration-300 border-2 border-white/30 ${
          animatePulse ? 'animate-bounce scale-110' : ''
        }`}
      >
        {/* Animated glow ring */}
        <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-secondary via-yellow-400 to-orange-500 opacity-75 blur-lg animate-pulse" />
        <span className="absolute inset-0 rounded-full bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <UserPlus className="h-8 w-8 sm:h-9 sm:w-9 relative z-10 drop-shadow-md" />
        <div className="flex flex-col relative z-10">
          <span className="font-extrabold text-lg sm:text-xl tracking-wide drop-shadow-md">Join Now — It's Free!</span>
          <span className="text-xs sm:text-sm font-medium text-white/90">Start learning in minutes</span>
        </div>
        <ArrowRight className="h-6 w-6 sm:h-7 sm:w-7 relative z-10 group-hover:translate-x-2 transition-transform drop-shadow-md" />

        {/* Notification badge */}
        <span className="absolute -top-2 -right-2 flex h-6 w-6 sm:h-7 sm:w-7">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-6 w-6 sm:h-7 sm:w-7 bg-red-500 border-2 border-white items-center justify-center">
            <span className="text-[10px] sm:text-xs font-bold text-white">!</span>
          </span>
        </span>
      </Link>

      {/* Tooltip text */}
      <div className="bg-white text-gray-900 text-sm font-semibold px-5 py-2.5 rounded-xl shadow-xl max-w-[260px] text-center animate-in fade-in slide-in-from-bottom-2 duration-500 border border-gray-100">
        🔥 Join 10,000+ professionals transforming their careers!
        {/* Arrow pointing to button */}
        <div className="absolute -bottom-1.5 right-10 w-3 h-3 bg-white rotate-45 border-r border-b border-gray-100" />
      </div>
    </div>
  )
}
