'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { StatCard } from '@/components/dashboard/StatCard'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { FilterBar } from '@/components/dashboard/FilterBar'
import { DataTable } from '@/components/dashboard/DataTable'
import { ChartPanel } from '@/components/dashboard/ChartPanel'
import { WorkflowQueue } from '@/components/dashboard/WorkflowQueue'
import { EmptyState, ErrorState } from '@/components/dashboard/EmptyState'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/dashboard/Toast'
import { useRealTimeSync } from '@/hooks/useRealTimeSync'
import { RefreshCw, BookOpen, Clock, DollarSign, CheckCircle, Award, TrendingUp, Search, MessageSquare } from 'lucide-react'
import Link from 'next/link'

interface CourseProgress {
  id: string
  title: string
  progress: number
  lastAccessed: string
  nextLesson?: string
  totalLessons: number
  completedLessons: number
}

interface StudentStats {
  enrolledCourses: number
  completedCourses: number
  inProgressCourses: number
  certificatesEarned: number
  totalSpent: number
  learningHours: number
  streakDays: number
  weeklyGoal: number
  weeklyProgress: number
}

const quickActions = [
  {
    label: 'Continue Learning',
    href: '/dashboard/enrolled',
    icon: <BookOpen className="h-4 w-4" />,
    description: 'Pick up where you left off',
    variant: 'default' as const,
  },
  {
    label: 'Browse Catalog',
    href: '/courses',
    icon: <TrendingUp className="h-4 w-4" />,
    description: 'Discover new skills',
    variant: 'outline' as const,
  },
  {
    label: 'My Certificates',
    href: '/dashboard/certificates',
    icon: <Award className="h-4 w-4" />,
    description: 'View achievements',
    variant: 'outline' as const,
  },
  {
    label: 'Get Support',
    href: '/dashboard/support',
    icon: <MessageSquare className="h-4 w-4" />,
    description: 'We\'re here to help',
    variant: 'outline' as const,
  },
]

export default function StudentDashboard() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [courses, setCourses] = useState<CourseProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const mockCourses: CourseProgress[] = [
    { id: '1', title: 'Leadership Excellence Program', progress: 66, lastAccessed: new Date(Date.now() - 2 * 86400000).toISOString(), nextLesson: 'Module 7: Strategic Decision Making', totalLessons: 42, completedLessons: 28 },
    { id: '2', title: 'Digital Marketing Mastery', progress: 31, lastAccessed: new Date(Date.now() - 86400000).toISOString(), nextLesson: 'SEO Best Practices', totalLessons: 38, completedLessons: 12 },
    { id: '3', title: 'Project Management Professional', progress: 100, lastAccessed: new Date(Date.now() - 7 * 86400000).toISOString(), totalLessons: 45, completedLessons: 45 },
  ]

  const fetchData = useCallback(async () => {
    if (!user?.id) return
    try {
      setError(null)
      const [statsRes] = await Promise.all([
        fetch(`/api/analytics/dashboard?role=student&userId=${user.id}`),
      ])

      if (!statsRes.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const statsResult = await statsRes.json()
      if (statsResult.success) setStats(statsResult.data)
      setCourses(mockCourses)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard'
      setError(message)
      addToast('error', message)
    } finally {
      setLoading(false)
    }
  }, [user?.id, addToast])

  useRealTimeSync(fetchData, 60000)

  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nextLesson?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const columns = [
    { key: 'title', header: 'Course', sortable: true },
    {
      key: 'progress',
      header: 'Progress',
      render: (item: CourseProgress) => (
        <div className="w-full">
          <div className="flex justify-between text-xs mb-1">
            <span>{item.progress}%</span>
            <span>{item.completedLessons}/{item.totalLessons} lessons</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${item.progress}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'lastAccessed',
      header: 'Last Accessed',
      render: (item: CourseProgress) => new Date(item.lastAccessed).toLocaleDateString(),
    },
  ]

  if (loading) {
    return (
      <DashboardShell>
        <div className="space-y-2">
          <div className="animate-pulse h-8 w-48 bg-gray-200 rounded" />
          <div className="animate-pulse h-4 w-64 bg-gray-200 rounded" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse h-32 bg-gray-200 rounded-lg" />
          ))}
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
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name}! Here's your learning overview.</p>
        </div>

        {/* Primary KPIs with trends */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Enrolled Courses"
            value={stats?.enrolledCourses || 0}
            subtitle={`${stats?.inProgressCourses || 0} in progress`}
            icon={<BookOpen className="h-6 w-6" />}
            href="/dashboard/enrolled"
            trend={{ value: 12, label: 'vs last month', direction: 'up' }}
          />
          <StatCard
            title="Completed"
            value={stats?.completedCourses || 0}
            subtitle={`${stats?.certificatesEarned || 0} certificates`}
            icon={<CheckCircle className="h-6 w-6" />}
            href="/dashboard/certificates"
            trend={{ value: 8, label: 'vs last month', direction: 'up' }}
          />
          <StatCard
            title="Learning Hours"
            value={`${stats?.learningHours || 0}h`}
            subtitle={`${stats?.streakDays || 0} day streak`}
            icon={<Clock className="h-6 w-6" />}
            href="/dashboard/student/analytics"
            trend={{ value: 5, label: 'vs last week', direction: 'up' }}
          />
          <StatCard
            title="Total Investment"
            value={`KES ${(stats?.totalSpent || 0).toLocaleString()}`}
            subtitle="Lifetime spending"
            icon={<DollarSign className="h-6 w-6" />}
            href="/dashboard/billing"
          />
        </div>

        {/* Quick Actions */}
        <QuickActions actions={quickActions} columns={4} />

        {/* Learning Progress */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <FilterBar
              title="My Learning"
              searchPlaceholder="Search courses..."
              onSearch={setSearchQuery}
            />
            <DataTable
              data={filteredCourses}
              columns={columns}
              keyExtractor={(item) => item.id}
              onRowClick={(item) => {
                window.location.href = `/dashboard/enrolled?course=${item.id}`
              }}
              loading={loading}
              emptyState={
                <EmptyState
                  icon={<BookOpen className="h-8 w-8" />}
                  title="No courses yet"
                  description="Start learning by browsing our catalog."
                  action={{ label: 'Browse Courses', href: '/courses' }}
                />
              }
              actions={(item) => (
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/dashboard/enrolled?course=${item.id}`}>Resume</Link>
                </Button>
              )}
            />
          </div>

          {/* Weekly Goal */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Weekly Goal</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{stats?.weeklyProgress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full transition-all"
                      style={{ width: `${stats?.weeklyProgress || 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {stats?.weeklyProgress || 0}% complete — {stats?.weeklyGoal || 0}h target
                  </p>
                </div>
              </CardContent>
            </Card>

            {stats && (
              <ChartPanel
                title="Learning Activity"
                subtitle="Hours per day this week"
                type="bar"
                data={[
                  { name: 'Mon', value: 2.5 },
                  { name: 'Tue', value: 1.8 },
                  { name: 'Wed', value: 3.2 },
                  { name: 'Thu', value: 2.1 },
                  { name: 'Fri', value: 0 },
                  { name: 'Sat', value: 4.0 },
                  { name: 'Sun', value: 1.5 },
                ]}
                xAxisKey="name"
                dataKey="value"
                height={200}
                colors={['#2563eb']}
              />
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

export function StudentDashboardWrapper() {
  return (
    <ProtectedRoute>
      <StudentDashboard />
    </ProtectedRoute>
  )
}
