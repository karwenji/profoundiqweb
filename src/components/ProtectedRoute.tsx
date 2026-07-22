'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { hasPermission } from '@/lib/roles'

interface ProtectedRouteProps {
  children: React.ReactNode
  adminOnly?: boolean
  permission?: string
  anyPermission?: boolean
  permissions?: string[]
}

export default function ProtectedRoute({ children, adminOnly = false, permission, anyPermission = true, permissions }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
      return
    }
    if (!isLoading && user) {
      if (adminOnly && !['admin', 'super_admin'].includes(user.role)) {
        router.push('/dashboard/student')
      }
      if (permission && !hasPermission(user.role, permission)) {
        router.push('/dashboard/student')
      }
      if (permissions && permissions.length > 0) {
        const allowed = anyPermission
          ? permissions.some(p => hasPermission(user.role, p))
          : permissions.every(p => hasPermission(user.role, p))
        if (!allowed) {
          router.push('/dashboard/student')
        }
      }
    }
  }, [user, isLoading, router, adminOnly, permission, permissions, anyPermission])

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
