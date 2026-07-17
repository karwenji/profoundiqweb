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
        className={`group relative flex items-center gap-2 bg-gradient-to-r from-secondary to-yellow-500 text-white px-6 py-4 rounded-full shadow-2xl hover:shadow-yellow-500/40 hover:scale-105 transition-all duration-300 ${
          animatePulse ? 'animate-bounce scale-110' : ''
        }`}
      >
        {/* Glow effect */}
        <span className="absolute inset-0 rounded-full bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <UserPlus className="h-5 w-5 relative z-10" />
        <span className="font-bold text-sm sm:text-base relative z-10">Get Started Free</span>
        <ArrowRight className="h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform" />

        {/* Notification badge */}
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500" />
        </span>
      </Link>

      {/* Tooltip text */}
      <div className="bg-white text-gray-900 text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg max-w-[200px] text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
        Join thousands of learners today!
        {/* Arrow pointing to button */}
        <div className="absolute -bottom-1 right-8 w-2 h-2 bg-white rotate-45" />
      </div>
    </div>
  )
}
