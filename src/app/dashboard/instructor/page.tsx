'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { StatCard } from '@/components/dashboard/StatCard'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { DataTable } from '@/components/dashboard/DataTable'
import { ChartPanel } from '@/components/dashboard/ChartPanel'
import { FilterBar } from '@/components/dashboard/FilterBar'
import { EmptyState, ErrorState } from '@/components/dashboard/EmptyState'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/dashboard/Toast'
import { useRealTimeSync } from '@/hooks/useRealTimeSync'
import { RefreshCw, BookOpen, Users, Star, DollarSign, TrendingUp, Edit, Trash2, Eye, Plus, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import type { Course } from '@/types'
import { nextApi } from '@/lib/api/client'

interface InstructorStats {
  totalCourses: number
  activeCourses: number
  totalStudents: number
  totalRevenue: number
  monthlyRevenue: number
  averageRating: number
  completionRate: number
}

const statusStyles: Record<string, string> = {
  published: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  rejected: 'bg-red-100 text-red-800',
  draft: 'bg-gray-100 text-gray-800',
  archived: 'bg-gray-100 text-gray-800',
}

const quickActions = [
  {
    label: 'Create Course',
    href: '/dashboard/instructor/create',
    icon: <Plus className="h-4 w-4" />,
    description: 'Start building a new course',
    variant: 'default' as const,
  },
  {
    label: 'Manage Courses',
    href: '/dashboard/instructor/courses',
    icon: <BookOpen className="h-4 w-4" />,
    description: 'Edit and update content',
    variant: 'outline' as const,
  },
  {
    label: 'My Students',
    href: '/dashboard/instructor/students',
    icon: <Users className="h-4 w-4" />,
    description: 'Track engagement',
    variant: 'outline' as const,
  },
  {
    label: 'Earnings',
    href: '/dashboard/instructor/earnings',
    icon: <DollarSign className="h-4 w-4" />,
    description: 'View payouts',
    variant: 'outline' as const,
  },
]

export default function InstructorDashboard() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [stats, setStats] = useState<InstructorStats | null>(null)
  const [myCourses, setMyCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchData = useCallback(async () => {
    if (!user?.id) return
    try {
      setError(null)
      const [statsResult, coursesResult] = await Promise.all([
        fetch(`/api/analytics/dashboard?role=instructor&userId=${user.id}`),
        fetch('/api/courses', { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } }),
      ])

      if (!statsResult.ok || !coursesResult.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const statsData = await statsResult.json()
      const coursesData = await coursesResult.json()

      if (statsData.success) {
        setStats(statsData.data.stats || statsData.data)
      }
      const allCourses = coursesData.data || coursesData || []
      const instructorCourses = allCourses.filter((c: Course) => c.instructorId === user.id)
      setMyCourses(instructorCourses.length > 0 ? instructorCourses : [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard'
      setError(message)
      addToast('error', message)
    } finally {
      setLoading(false)
    }
  }, [user?.id, addToast])

  useRealTimeSync({
    'progress:update': fetchData,
  }, [user?.id])

  const handleApproveCourse = async (courseId: string) => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/courses/${courseId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published' }),
      })
      addToast('success', 'Course published successfully')
      fetchData()
    } catch {
      addToast('error', 'Failed to publish course')
    }
  }

  const handleRejectCourse = async (courseId: string) => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/courses/${courseId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      })
      addToast('success', 'Course rejected')
      fetchData()
    } catch {
      addToast('error', 'Failed to reject course')
    }
  }

  const filteredCourses = myCourses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const columns = [
    {
      key: 'title',
      header: 'Course Title',
      sortable: true,
      render: (item: Course) => (
        <div>
          <p className="font-medium text-gray-900">{item.title}</p>
          <p className="text-xs text-gray-500">{item.category} • {item.level}</p>
        </div>
      ),
    },
    {
      key: 'students',
      header: 'Students',
      render: (item: Course) => item.students.toLocaleString(),
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (item: Course) => (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          <span>{item.rating}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Course) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusStyles[item.status] || statusStyles.draft}`}>
          {item.status?.charAt(0).toUpperCase()}{item.status?.slice(1)}
        </span>
      ),
    },
  ]

  if (loading) {
    return (
      <DashboardShell>
        <div className="space-y-2">
          <div className="animate-pulse h-8 w-48 bg-gray-200 rounded" />
          <div className="animate-pulse h-4 w-64 bg-gray-200 rounded" />
        </div>
      </DashboardShell>
    )
  }

  if (error) {
    return (
      <DashboardShell>
        <ErrorState
          title="Dashboard unavailable"
          message={error}
          onRetry={fetchData}
          retryLabel="Reload dashboard"
        />
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome, {user?.name}! Manage your courses and students.</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={`KES ${(stats?.totalRevenue || 0).toLocaleString()}`}
            subtitle={`KES ${(stats?.monthlyRevenue || 0).toLocaleString()} this month`}
            icon={<DollarSign className="h-6 w-6" />}
            href="/dashboard/instructor/earnings"
          />
          <StatCard
            title="Total Students"
            value={stats?.totalStudents || 0}
            subtitle={`${stats?.activeCourses || 0} active courses`}
            icon={<Users className="h-6 w-6" />}
            href="/dashboard/instructor/students"
          />
          <StatCard
            title="Average Rating"
            value={`${stats?.averageRating || 0}/5`}
            subtitle={`${stats?.completionRate || 0}% completion`}
            icon={<Star className="h-6 w-6" />}
            href="/dashboard/instructor/analytics"
          />
          <StatCard
            title="Active Courses"
            value={stats?.activeCourses || 0}
            subtitle={`of ${stats?.totalCourses || 0} total`}
            icon={<CheckCircle className="h-6 w-6" />}
            href="/dashboard/instructor/courses"
          />
        </div>

        <QuickActions actions={quickActions} columns={4} />

        {/* Course Management */}
        <FilterBar
          title="My Courses"
          searchPlaceholder="Search courses..."
          onSearch={setSearchQuery}
          actions={
            <Button asChild size="sm">
              <Link href="/dashboard/instructor/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Link>
            </Button>
          }
        />
        <DataTable
          data={filteredCourses}
          columns={columns}
          keyExtractor={(item) => item.id}
          onRowClick={(item) => {
            window.location.href = `/dashboard/instructor/courses?course=${item.id}`
          }}
          loading={loading}
          emptyState={
            <EmptyState
              icon={<BookOpen className="h-8 w-8" />}
              title="No courses yet"
              description="Create your first course to get started."
              action={{ label: 'Create Course', href: '/dashboard/instructor/create' }}
            />
          }
          actions={(item) => (
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" asChild>
                <Link href={`/dashboard/instructor/courses?course=${item.id}`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="sm" variant="ghost" asChild>
                <Link href={`/dashboard/instructor/edit/${item.id}`}>
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
              {(item.status === 'pending' || item.status === 'draft') && (
                <>
                  <Button size="sm" variant="ghost" onClick={() => handleApproveCourse(item.id)}>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleRejectCourse(item.id)}>
                    <XCircle className="h-4 w-4 text-red-600" />
                  </Button>
                </>
              )}
            </div>
          )}
        />
      </div>
    </DashboardShell>
  )
}

export function InstructorPage() {
  return (
    <ProtectedRoute permissions={['create_courses', 'view_students', 'edit_own_courses']}>
      <InstructorDashboard />
    </ProtectedRoute>
  )
}

