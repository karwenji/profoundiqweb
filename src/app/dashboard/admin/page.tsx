'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { getAllUsers } from '@/lib/users'
import { getPendingCourses, approveCourse, rejectCourse } from '@/lib/courses'
import { Users, BookOpen, TrendingUp, DollarSign, CheckCircle, Clock, RefreshCw, ClipboardCheck, XCircle } from 'lucide-react'
import AnnouncementsBanner from '@/components/AnnouncementsBanner'
import { useRealTimeSync } from '@/hooks/useRealTimeSync'
import { DashboardSkeleton } from '@/components/DashboardSkeleton'
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

function AdminDashboard() {
  const { user } = useAuth()
  const users = getAllUsers()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [pendingCourses, setPendingCourses] = useState(getPendingCourses())

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/analytics/dashboard?role=admin')
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
    setPendingCourses(getPendingCourses())
  }, [])

  useEffect(() => {
    refreshWorkflows()
  }, [refreshWorkflows])

  const handleApproveCourse = (courseId: string) => {
    approveCourse(courseId)
    refreshWorkflows()
  }

  const handleRejectCourse = (courseId: string) => {
    rejectCourse(courseId)
    refreshWorkflows()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount)
  }

  const recentUsers = users.slice(-5).reverse()

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome, {user?.name}! Manage courses and users.</p>
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
            {/* Course Approval Queue */}
            {pendingCourses.length > 0 && (
              <div className="mb-8">
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <ClipboardCheck className="h-5 w-5 text-orange-600" />
                      Pending Course Approvals
                      <span className="text-sm bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                        {pendingCourses.length}
                      </span>
                    </h2>
                    <div className="space-y-4">
                      {pendingCourses.map((course) => (
                        <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-semibold">{course.title}</p>
                            <p className="text-sm text-gray-600">by {course.instructor}</p>
                            <p className="text-xs text-gray-500">{course.category} • {course.level} • {course.duration}</p>
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
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Link href="/dashboard/admin/analytics">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
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

              <Link href="/dashboard/admin/courses">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Courses</p>
                        <p className="text-2xl font-bold">{stats?.totalCourses || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">{stats?.pendingCourses || 0} pending approval</p>
                      </div>
                      <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/admin/instructors">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Instructors</p>
                        <p className="text-2xl font-bold">{stats?.totalInstructors || 0}</p>
                        <p className="text-xs text-green-600 mt-1">+{stats?.newInstructorsThisMonth || 0} this month</p>
                      </div>
                      <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/admin/students">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
                        <p className="text-2xl font-bold">{stats?.completionRate || 0}%</p>
                        <p className="text-xs text-gray-500 mt-1">{stats?.totalEnrollments || 0} enrollments</p>
                      </div>
                      <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Recent Users */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold mb-4">Recent Users</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Name</th>
                        <th className="text-left py-3 px-4 font-semibold">Email</th>
                        <th className="text-left py-3 px-4 font-semibold">Role</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((u) => (
                        <tr key={u.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{u.name}</td>
                          <td className="py-3 px-4 text-gray-600">{u.email}</td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {u.role.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {u.isActive ? 'Active' : 'Inactive'}
                            </span>
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

export default function AdminPage() {
  return (
    <ProtectedRoute permissions={['manage_courses', 'manage_instructors', 'student_management']}>
      <AdminDashboard />
    </ProtectedRoute>
  )
}
