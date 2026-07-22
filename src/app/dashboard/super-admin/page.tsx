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
import { WorkflowQueue } from '@/components/dashboard/WorkflowQueue'
import { ApprovalCard } from '@/components/dashboard/ApprovalCard'
import { EmptyState, ErrorState } from '@/components/dashboard/EmptyState'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/dashboard/Toast'
import { useRealTimeSync } from '@/hooks/useRealTimeSync'
import { RefreshCw, Users, BookOpen, DollarSign, Activity, UserPlus, Shield, Settings, ClipboardCheck, CheckCircle, XCircle } from 'lucide-react'
import {
  getAllUsers,
  updateUserRole,
  deactivateUser,
  activateUser,
  getPendingInstructors,
  approveInstructor,
  rejectInstructor,
} from '@/lib/users'
import { getPendingCourses, approveCourse, rejectCourse } from '@/lib/courses'
import type { UserRole } from '@/types'
import Link from 'next/link'

interface SuperAdminStats {
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
  totalAdmins: number
  systemUptime: number
  pendingApprovals: number
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
    label: 'User Management',
    href: '/dashboard/super-admin/users',
    icon: <Users className="h-4 w-4" />,
    description: 'Manage roles and access',
    variant: 'default' as const,
  },
  {
    label: 'Role Permissions',
    href: '/dashboard/super-admin/roles',
    icon: <Shield className="h-4 w-4" />,
    description: 'Configure access control',
    variant: 'outline' as const,
  },
  {
    label: 'System Settings',
    href: '/dashboard/super-admin/settings',
    icon: <Settings className="h-4 w-4" />,
    description: 'Platform configuration',
    variant: 'outline' as const,
  },
  {
    label: 'Audit Logs',
    href: '/dashboard/super-admin/logs',
    icon: <ClipboardCheck className="h-4 w-4" />,
    description: 'Review system activity',
    variant: 'outline' as const,
  },
]

export default function SuperAdminDashboard() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [usersState, setUsers] = useState(getAllUsers())
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all')
  const [stats, setStats] = useState<SuperAdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingInstructors, setPendingInstructors] = useState(getPendingInstructors())
  const [pendingCourses, setPendingCourses] = useState(getPendingCourses())

  const refreshWorkflows = useCallback(() => {
    setPendingInstructors(getPendingInstructors())
    setPendingCourses(getPendingCourses())
    setUsers(getAllUsers())
  }, [])

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch('/api/analytics/dashboard?role=super_admin')
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

  const handleApproveInstructor = (userId: string) => {
    approveInstructor(userId)
    addToast('success', 'Instructor approved')
    refreshWorkflows()
    fetchData()
  }

  const handleRejectInstructor = (userId: string) => {
    rejectInstructor(userId)
    addToast('success', 'Instructor registration rejected')
    refreshWorkflows()
    fetchData()
  }

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

  const filteredUsers = selectedRole === 'all' ? usersState : usersState.filter((u) => u.role === selectedRole)

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    updateUserRole(userId, newRole)
    setUsers(getAllUsers())
    addToast('success', `User role updated to ${newRole.replace('_', ' ')}`)
    if (userId === user?.id) {
      setTimeout(() => window.location.reload(), 300)
    }
  }

  const handleToggleActive = (userId: string, isActive: boolean) => {
    if (isActive) {
      deactivateUser(userId)
      addToast('success', 'User deactivated')
    } else {
      activateUser(userId)
      addToast('success', 'User activated')
    }
    setUsers(getAllUsers())
  }

  const allApprovalItems: ApprovalItem[] = [
    ...pendingInstructors.map(({ user: pendingUser, daysWaiting }) => ({
      id: pendingUser.id,
      title: `Instructor Registration: ${pendingUser.name}`,
      description: `Email: ${pendingUser.email} • Waiting ${daysWaiting} days`,
      submittedBy: pendingUser.name,
      submittedAt: pendingUser.createdAt,
      status: 'pending' as const,
    })),
    ...pendingCourses.map((course) => ({
      id: course.id,
      title: `Course Submission: ${course.title}`,
      description: `By ${course.instructor} • ${course.category} • ${course.level}`,
      submittedBy: course.instructor,
      submittedAt: new Date().toISOString(),
      category: course.category,
      level: course.level,
      status: 'pending' as const,
    })),
  ]

  const userColumns = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (u: typeof usersState[0]) => (
        <div>
          <p className="font-medium text-gray-900">{u.name}</p>
          <p className="text-xs text-gray-500">{u.uniqueId}</p>
        </div>
      ),
    },
    { key: 'email', header: 'Email' },
    {
      key: 'role',
      header: 'Role',
      render: (u: typeof usersState[0]) => (
        <select
          value={u.role}
          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
          disabled={u.id === user?.id}
          className="px-2 py-1 border rounded text-sm capitalize"
        >
          <option value="super_admin">Super Admin</option>
          <option value="admin">Admin</option>
          <option value="instructor">Instructor</option>
          <option value="student">Student</option>
        </select>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (u: typeof usersState[0]) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {u.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (u: typeof usersState[0]) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleToggleActive(u.id, u.isActive)}
          disabled={u.id === user?.id}
        >
          {u.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
        </Button>
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
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome, {user?.name}! Full system control and monitoring.</p>
        </div>

        {/* Approval Queue */}
        {allApprovalItems.length > 0 && (
          <WorkflowQueue
            title="Approval Queue"
            items={allApprovalItems.map((item) => ({
              id: item.id,
              type: 'approval' as const,
              title: item.title,
              description: item.description,
              timestamp: item.submittedAt,
              actions: item.submittedBy.includes('Instructor') || item.submittedBy.includes('User')
                ? [
                    {
                      label: 'Approve',
                      onClick: () => handleApproveInstructor(item.id),
                      variant: 'default' as const,
                    },
                    {
                      label: 'Reject',
                      onClick: () => handleRejectInstructor(item.id),
                      variant: 'outline' as const,
                    },
                  ]
                : [
                    {
                      label: 'Review',
                      onClick: () => window.location.href = `/dashboard/admin/courses?course=${item.id}`,
                      variant: 'outline' as const,
                    },
                    {
                      label: 'Approve',
                      onClick: () => handleApproveCourse(item.id),
                      variant: 'default' as const,
                    },
                    {
                      label: 'Reject',
                      onClick: () => handleRejectCourse(item.id),
                      variant: 'outline' as const,
                    },
                  ],
            }))}
            emptyTitle="All caught up"
            emptyDescription="No pending approvals."
            maxItems={5}
          />
        )}

        {/* Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || usersState.length}
            subtitle={`${pendingInstructors.length} pending approvals`}
            icon={<Users className="h-6 w-6" />}
            href="/dashboard/super-admin/users"
            trend={{ value: 8, label: 'new this month', direction: 'up' }}
          />
          <StatCard
            title="Active Courses"
            value={stats?.activeCourses || 0}
            subtitle={`${pendingCourses.length} pending review`}
            icon={<BookOpen className="h-6 w-6" />}
            href="/dashboard/admin/courses"
          />
          <StatCard
            title="System Revenue"
            value={`KES ${(stats?.totalRevenue || 0).toLocaleString()}`}
            subtitle={`KES ${(stats?.monthlyRevenue || 0).toLocaleString()} this month`}
            icon={<DollarSign className="h-6 w-6" />}
            href="/dashboard/super-admin/analytics"
            trend={{ value: 22, label: 'vs last month', direction: 'up' }}
          />
          <StatCard
            title="System Uptime"
            value={`${stats?.systemUptime || 99.9}%`}
            subtitle="Last 30 days"
            icon={<Activity className="h-6 w-6" />}
            href="/dashboard/super-admin/logs"
          />
        </div>

        <QuickActions actions={quickActions} columns={4} />

        {/* Revenue Trend */}
        <ChartPanel
          title="Platform Revenue"
          subtitle="Monthly revenue across all courses"
          type="line"
          data={[
            { name: 'Jan', value: 450000 },
            { name: 'Feb', value: 520000 },
            { name: 'Mar', value: 480000 },
            { name: 'Apr', value: 610000 },
            { name: 'May', value: 580000 },
            { name: 'Jun', value: 720000 },
          ]}
          xAxisKey="name"
          dataKey="value"
          height={250}
          colors={['#2563eb']}
        />

        {/* User Management */}
        <FilterBar
          title="User Management"
          searchPlaceholder="Search users..."
          onSearch={() => {}}
          actions={
            <Button size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          }
        />
        <DataTable
          data={filteredUsers}
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

export function SuperAdminPage() {
  return (
    <ProtectedRoute permission="view_analytics">
      <SuperAdminDashboard />
    </ProtectedRoute>
  )
}

