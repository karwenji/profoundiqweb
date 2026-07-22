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
import { ApprovalCard } from '@/components/dashboard/ApprovalCard'
import { WorkflowQueue } from '@/components/dashboard/WorkflowQueue'
import { EmptyState, ErrorState } from '@/components/dashboard/EmptyState'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/dashboard/Toast'
import { useRealTimeSync } from '@/hooks/useRealTimeSync'
import { RefreshCw, BookOpen, Users, TrendingUp, DollarSign, CheckCircle, ClipboardCheck, Award, MessageSquare } from 'lucide-react'
import { getPendingCourses, approveCourse, rejectCourse } from '@/lib/courses'
import { getAllUsers } from '@/lib/users'
import type { Course } from '@/types'
import Link from 'next/link'

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalCourses: number
  activeCourses: number
  totalRevenue: number
  monthlyRevenue: number
  totalEnrollments: number
  completionRate: number
  newStudentsThisMonth: number
  newInstructorsThisMonth: number
  pendingCourses: number
  totalInstructors: number
  activeInstructors: number
}

interface ApprovalItem {
  id: string
  title: string
  description?: string
  submittedBy: string
  submittedAt: string
  category?: string
  level?: string
  status?: 'pending' | 'approved' | 'rejected'
}

const quickActions = [
  {
    label: 'Manage Courses',
    href: '/dashboard/admin/courses',
    icon: <BookOpen className="h-4 w-4" />,
    description: 'Review and approve',
    variant: 'default' as const,
  },
  {
    label: 'Instructors',
    href: '/dashboard/admin/instructors',
    icon: <Users className="h-4 w-4" />,
    description: 'Onboard and support',
    variant: 'outline' as const,
  },
  {
    label: 'Students',
    href: '/dashboard/admin/students',
    icon: <Award className="h-4 w-4" />,
    description: 'Monitor progress',
    variant: 'outline' as const,
  },
  {
    label: 'Reports',
    href: '/dashboard/admin/reports',
    icon: <TrendingUp className="h-4 w-4" />,
    description: 'Analyze growth',
    variant: 'outline' as const,
  },
]

export default function AdminDashboard() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [pendingCourses, setPendingCourses] = useState<Course[]>([])
  const [recentUsers, setRecentUsers] = useState(getAllUsers().slice(-5).reverse())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshWorkflows = useCallback(() => {
    setPendingCourses(getPendingCourses())
    setRecentUsers(getAllUsers().slice(-5).reverse())
  }, [])

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch('/api/analytics/dashboard?role=admin')
      if (!res.ok) throw new Error('Failed to fetch stats')
      const result = await res.json()
      if (result.success) setStats(result.data)
      refreshWorkflows()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard'
      setError(message)
      addToast('error', message)
    } finally {
      setLoading(false)
    }
  }, [addToast, refreshWorkflows])

  useRealTimeSync({
    'progress:update': fetchData,
  }, [addToast, refreshWorkflows])

  const handleApproveCourse = (courseId: string) => {
    approveCourse(courseId)
    addToast('success', 'Course approved')
    refreshWorkflows()
    fetchData()
  }

  const handleRejectCourse = (courseId: string) => {
    rejectCourse(courseId)
    addToast('success', 'Course rejected')
    refreshWorkflows()
    fetchData()
  }

  const approvalItems: ApprovalItem[] = pendingCourses.map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    submittedBy: course.instructor,
    submittedAt: new Date().toISOString(),
    category: course.category,
    level: course.level,
    status: course.status === 'pending' ? 'pending' : undefined,
  }))

  const userColumns = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email' },
    {
      key: 'role',
      header: 'Role',
      render: (u: typeof recentUsers[0]) => (
        <span className="capitalize text-sm">{u.role.replace('_', ' ')}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (u: typeof recentUsers[0]) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {u.isActive ? 'Active' : 'Inactive'}
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome, {user?.name}! Oversee platform content and users.</p>
        </div>

        {/* Pending Approvals */}
        {approvalItems.length > 0 && (
          <WorkflowQueue
            title="Pending Course Approvals"
            items={approvalItems.map((item) => ({
              ...item,
              type: 'approval' as const,
              timestamp: item.submittedAt,
              actions: [
                {
                  label: 'Review',
                  onClick: () => window.location.href = `/dashboard/admin/courses?course=${item.id}`,
                },
              ],
            }))}
            emptyTitle="No pending approvals"
            emptyDescription="All courses have been reviewed."
            maxItems={3}
          />
        )}

        {/* Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={`KES ${(stats?.totalRevenue || 0).toLocaleString()}`}
            subtitle={`KES ${(stats?.monthlyRevenue || 0).toLocaleString()} this month`}
            icon={<DollarSign className="h-6 w-6" />}
            href="/dashboard/admin/payments"
            trend={{ value: 18, label: 'vs last month', direction: 'up' }}
          />
          <StatCard
            title="Total Courses"
            value={stats?.totalCourses || 0}
            subtitle={`${stats?.pendingCourses || 0} pending approval`}
            icon={<BookOpen className="h-6 w-6" />}
            href="/dashboard/admin/courses"
          />
          <StatCard
            title="Total Instructors"
            value={stats?.totalInstructors || 0}
            subtitle={`${stats?.activeInstructors || 0} active`}
            icon={<Users className="h-6 w-6" />}
            href="/dashboard/admin/instructors"
            trend={{ value: 5, label: 'new this month', direction: 'up' }}
          />
          <StatCard
            title="Completion Rate"
            value={`${stats?.completionRate || 0}%`}
            subtitle={`${stats?.totalEnrollments || 0} enrollments`}
            icon={<CheckCircle className="h-6 w-6" />}
            href="/dashboard/admin/analytics"
          />
        </div>

        <QuickActions actions={quickActions} columns={4} />

        {/* Enrollment Trend */}
        <ChartPanel
          title="Enrollment Trend"
          subtitle="New enrollments over the last 6 months"
          type="area"
          data={[
            { name: 'Jan', value: 120 },
            { name: 'Feb', value: 150 },
            { name: 'Mar', value: 180 },
            { name: 'Apr', value: 220 },
            { name: 'May', value: 280 },
            { name: 'Jun', value: 340 },
          ]}
          xAxisKey="name"
          dataKey="value"
          height={250}
          colors={['#16a34a']}
        />

        {/* Recent Users */}
        <FilterBar
          title="Recent Users"
          searchPlaceholder="Search users..."
          onSearch={() => {}}
        />
        <DataTable
          data={recentUsers}
          columns={userColumns}
          keyExtractor={(u) => u.id}
          loading={loading}
          emptyState={
            <EmptyState
              icon={<Users className="h-8 w-8" />}
              title="No users yet"
              description="Users will appear here once they register."
            />
          }
        />
      </div>
    </DashboardShell>
  )
}

export function AdminPage() {
  return (
    <ProtectedRoute permissions={['manage_courses', 'manage_instructors', 'student_management']}>
      <AdminDashboard />
    </ProtectedRoute>
  )
}

