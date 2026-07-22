'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { BookOpen, Users, Star, TrendingUp, Plus, Edit, Trash2, Loader2, DollarSign, CheckCircle, RefreshCw } from 'lucide-react'
import AnnouncementsBanner from '@/components/AnnouncementsBanner'
import { useRealTimeSync } from '@/hooks/useRealTimeSync'
import Link from 'next/link'
import { courses } from '@/data/courses'

interface InstructorStats {
  totalCourses: number
  activeCourses: number
  totalStudents: number
  totalRevenue: number
  monthlyRevenue: number
  averageRating: number
  completionRate: number
}

function InstructorDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<InstructorStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      if (!loading) setLoading(true)
      const response = await fetch(`/api/analytics/dashboard?role=instructor&userId=${user?.id}`)
      const result = await response.json()
      if (result.success) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }, [loading, user?.id])

  // Real-time sync every 10 seconds
  useRealTimeSync(fetchStats, 10000)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount)
  }

  // Filter courses for this instructor (mock data)
  const myCourses = courses.filter(c => c.instructor === user?.name || c.instructorId === user?.id)
  const allCourses = myCourses.length > 0 ? myCourses : courses.slice(0, 3)

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Instructor Dashboard</h1>
            <p className="text-gray-600">Welcome, {user?.name}! Manage your courses and students.</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Announcements */}
        <div className="mb-8">
          <AnnouncementsBanner />
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/dashboard/instructor/analytics">
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

          <Link href="/dashboard/instructor/students">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Students</p>
                    <p className="text-2xl font-bold">{stats?.totalStudents || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Across {stats?.activeCourses || 0} courses</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/instructor/courses">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                    <p className="text-2xl font-bold">{stats?.averageRating || 0}/5</p>
                    <p className="text-xs text-gray-500 mt-1">{stats?.completionRate || 0}% completion rate</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/instructor/courses">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Active Courses</p>
                    <p className="text-2xl font-bold">{stats?.activeCourses || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">of {stats?.totalCourses || 0} total</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* My Courses */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-4">My Courses</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Course Title</th>
                    <th className="text-left py-3 px-4 font-semibold">Students</th>
                    <th className="text-left py-3 px-4 font-semibold">Rating</th>
                    <th className="text-left py-3 px-4 font-semibold">Lessons</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allCourses.map((course) => (
                    <tr key={course.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{course.title}</td>
                      <td className="py-3 px-4 text-gray-600">{course.students.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span>{course.rating}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{course.lessons}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
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
      </div>
    </DashboardLayout>
  )
}

export default function InstructorPage() {
  return (
    <ProtectedRoute permissions={['create_courses', 'view_students', 'edit_own_courses']}>
      <InstructorDashboard />
    </ProtectedRoute>
  )
}
