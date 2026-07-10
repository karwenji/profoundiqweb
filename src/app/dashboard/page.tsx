'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'

function DashboardRedirect() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      // Redirect to role-specific dashboard
      switch (user.role) {
        case 'super_admin':
          router.push('/dashboard/super-admin')
          break
        case 'admin':
          router.push('/dashboard/admin')
          break
        case 'instructor':
          router.push('/dashboard/instructor')
          break
        case 'student':
          // Redirect student to their courses overview
          router.push('/dashboard/courses')
          break
        default:
          router.push('/dashboard')
      }
    }
  }, [user, router])

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardRedirect />
    </ProtectedRoute>
  )
}