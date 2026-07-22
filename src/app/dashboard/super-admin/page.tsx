'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { getAllUsers, updateUserRole, deactivateUser, activateUser, getPendingInstructors, approveInstructor, rejectInstructor, UserRole } from '@/lib/users'
import { getPendingCourses, approveCourse, rejectCourse } from '@/lib/courses'
import { Users, UserPlus, CheckCircle, XCircle, BookOpen, TrendingUp, DollarSign, Activity, Clock, RefreshCw, ClipboardCheck } from 'lucide-react'
import AnnouncementsBanner from '@/components/AnnouncementsBanner'
import { useRealTimeSync } from '@/hooks/useRealTimeSync'
import { DashboardSkeleton } from '@/components/DashboardSkeleton'
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

function SuperAdminDashboard() {
  const { user } = useAuth()
  const [usersState, setUsers] = useState(getAllUsers())
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all')
  const [stats, setStats] = useState<SuperAdminStats | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [pendingInstructors, setPendingInstructors] = useState(getPendingInstructors())
  const [pendingCourses, setPendingCourses] = useState(getPendingCourses())

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/analytics/dashboard?role=super_admin')
      const result = await response.json()
      if (result.success) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setInitialLoading(false)
    }
  }, [])

  useRealTimeSync(fetchStats, 30000)

  const refreshWorkflows = useCallback(() => {
    setPendingInstructors(getPendingInstructors())
    setPendingCourses(getPendingCourses())
    setUsers(getAllUsers())
  }, [])

  useEffect(() => {
    refreshWorkflows()
  }, [refreshWorkflows])

  const handleApproveInstructor = (userId: string) => {
    approveInstructor(userId)
    refreshWorkflows()
  }

  const handleRejectInstructor = (userId: string) => {
    rejectInstructor(userId)
    refreshWorkflows()
  }

  const handleApproveCourse = (courseId: string) => {
    approveCourse(courseId)
    refreshWorkflows()
  }

  const handleRejectCourse = (courseId: string) => {
    rejectCourse(courseId)
    refreshWorkflows()
  }

  const filteredUsers = selectedRole === 'all' ? usersState : usersState.filter(u => u.role === selectedRole)

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    updateUserRole(userId, newRole)
    setUsers(getAllUsers())
    if (userId === user?.id) {
      setTimeout(() => window.location.reload(), 300)
    }
  }

  const handleToggleActive = (userId: string, isActive: boolean) => {
    if (isActive) {
      deactivateUser(userId)
    } else {
      activateUser(userId)
    }
    setUsers(getAllUsers())
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount)
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Super Admin Dashboard</h1>
            <p className="text-gray-600">Welcome, {user?.name}! Full system control and user management.</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchStats} disabled={initialLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${initialLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Announcements */}
        <div className="mb-8">
          <AnnouncementsBanner />
        </div>

        {initialLoading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* Approval Queue - Top Priority */}
            {(pendingInstructors.length > 0 || pendingCourses.length > 0) && (
              <div className="mb-8 space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-orange-600" />
                  Approval Queue
                  <span className="text-sm bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                    {pendingInstructors.length + pendingCourses.length}
                  </span>
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Pending Instructors */}
                  {pendingInstructors.length > 0 && (
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="font-bold text-lg mb-4">Instructor Registrations</h3>
                        <div className="space-y-4">
                          {pendingInstructors.map(({ user: pendingUser, daysWaiting }) => (
                            <div key={pendingUser.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div>
                                <p className="font-semibold">{pendingUser.name}</p>
                                <p className="text-sm text-gray-600">{pendingUser.email}</p>
                                <p className="text-xs text-gray-500">Waiting {daysWaiting} days</p>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleApproveInstructor(pendingUser.id)}>
                                  <CheckCircle className="h-4 w-4 mr-1" /> Approve
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleRejectInstructor(pendingUser.id)}>
                                  <XCircle className="h-4 w-4 mr-1" /> Reject
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Pending Courses */}
                  {pendingCourses.length > 0 && (
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="font-bold text-lg mb-4">Course Approvals</h3>
                        <div className="space-y-4">
                          {pendingCourses.map((course) => (
                            <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div>
                                <p className="font-semibold">{course.title}</p>
                                <p className="text-sm text-gray-600">by {course.instructor}</p>
                                <p className="text-xs text-gray-500">{course.category} • {course.level}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleApproveCourse(course.id)}>
                                  <CheckCircle className="h-4 w-4 mr-1" /> Approve
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleRejectCourse(course.id)}>
                                  <XCircle className="h-4 w-4 mr-1" /> Reject
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Link href="/dashboard/super-admin/users">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Users</p>
                        <p className="text-2xl font-bold">{usersState.length}</p>
                        <p className="text-xs text-gray-500 mt-1">{pendingInstructors.length} pending approvals</p>
                      </div>
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/admin/courses">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Active Courses</p>
                        <p className="text-2xl font-bold">{stats?.activeCourses || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">{pendingCourses.length} pending review</p>
                      </div>
                      <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/super-admin/analytics">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">System Revenue</p>
                        <p className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</p>
                        <p className="text-xs text-green-600 mt-1">+{formatCurrency(stats?.monthlyRevenue || 0)} this month</p>
                      </div>
                      <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Workflow Actions */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Link href="/dashboard/super-admin/users">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <h3 className="font-bold text-lg mb-2">User Management</h3>
                    <p className="text-sm text-gray-600 mb-4">Manage roles, permissions, and user access across the platform.</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">{usersState.filter(u => u.role === 'instructor').length} instructors</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">{usersState.filter(u => u.role === 'student').length} students</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/super-admin/roles">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <h3 className="font-bold text-lg mb-2">Role & Permissions</h3>
                    <p className="text-sm text-gray-600 mb-4">Configure role-based access control and permission policies.</p>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">System Active</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* User Management */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">User Management</h2>
                  <div className="flex gap-2">
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as UserRole | 'all')}
                      className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="all">All Roles</option>
                      <option value="super_admin">Super Admins</option>
                      <option value="admin">Admins</option>
                      <option value="instructor">Instructors</option>
                      <option value="student">Students</option>
                    </select>
                    <Button>
                      <UserPlus className="mr-2 h-4 w-4" /> Add User
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Name</th>
                        <th className="text-left py-3 px-4 font-semibold">Email</th>
                        <th className="text-left py-3 px-4 font-semibold">Role</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{u.name}</td>
                          <td className="py-3 px-4 text-gray-600">{u.email}</td>
                          <td className="py-3 px-4">
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                              className="px-2 py-1 border rounded text-sm"
                              disabled={u.id === user?.id}
                            >
                              <option value="super_admin">Super Admin</option>
                              <option value="admin">Admin</option>
                              <option value="instructor">Instructor</option>
                              <option value="student">Student</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {u.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleActive(u.id, u.isActive)}
                                disabled={u.id === user?.id}
                              >
                                {u.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

export default function SuperAdminPage() {
  return (
    <ProtectedRoute permission="view_analytics">
      <SuperAdminDashboard />
    </ProtectedRoute>
  )
}
