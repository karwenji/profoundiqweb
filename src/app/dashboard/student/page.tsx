'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { BookOpen, Award, Clock, TrendingUp, CheckCircle, DollarSign, RefreshCw } from 'lucide-react'
import AnnouncementsBanner from '@/components/AnnouncementsBanner'
import { useRealTimeSync } from '@/hooks/useRealTimeSync'
import { DashboardSkeleton } from '@/components/DashboardSkeleton'
import Link from 'next/link'

interface StudentStats {
  enrolledCourses: number
  completedCourses: number
  inProgressCourses: number
  certificatesEarned: number
  totalSpent: number
  learningHours: number
}

function StudentDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/analytics/dashboard?role=student&userId=${user?.id}`)
      const result = await response.json()
      if (result.success) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setInitialLoading(false)
    }
  }, [user?.id])

  useRealTimeSync(fetchStats, 30000)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount)
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Student Dashboard</h1>
            <p className="text-gray-600">Welcome, {user?.name}! Continue your learning journey.</p>
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
            {/* Learning Progress - Primary Workflow */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Link href="/dashboard/courses">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Enrolled Courses</p>
                        <p className="text-2xl font-bold">{stats?.enrolledCourses || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">{stats?.inProgressCourses || 0} in progress</p>
                      </div>
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/student/analytics">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Completed</p>
                        <p className="text-2xl font-bold">{stats?.completedCourses || 0}</p>
                        <p className="text-xs text-green-600 mt-1">{stats?.certificatesEarned || 0} certificates earned</p>
                      </div>
                      <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/student/analytics">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Learning Hours</p>
                        <p className="text-2xl font-bold">{stats?.learningHours || 0}h</p>
                        <p className="text-xs text-gray-500 mt-1">Keep learning!</p>
                      </div>
                      <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/student/analytics">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                        <p className="text-2xl font-bold">{formatCurrency(stats?.totalSpent || 0)}</p>
                        <p className="text-xs text-gray-500 mt-1">Investment in learning</p>
                      </div>
                      <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Learning Workflow Actions */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Link href="/dashboard/courses">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">My Learning</h3>
                        <p className="text-sm text-gray-600">{stats?.inProgressCourses || 0} courses in progress</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Continue where you left off. Track your progress and complete lessons.</p>
                    <Button className="w-full">
                      <BookOpen className="mr-2 h-4 w-4" /> View My Courses
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/courses">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Browse Catalog</h3>
                        <p className="text-sm text-gray-600">Discover new courses</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Explore new skills and advance your career with our curated courses.</p>
                    <Button variant="outline" className="w-full">
                      <TrendingUp className="mr-2 h-4 w-4" /> Browse Courses
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <Link href="/dashboard/certificates">
                    <Button variant="outline" className="w-full">
                      <Award className="mr-2 h-4 w-4" /> View Certificates
                    </Button>
                  </Link>
                  <Link href="/dashboard/support">
                    <Button variant="outline" className="w-full">
                      <DollarSign className="mr-2 h-4 w-4" /> Get Support
                    </Button>
                  </Link>
                  <Link href="/dashboard/student/analytics">
                    <Button variant="outline" className="w-full">
                      <TrendingUp className="mr-2 h-4 w-4" /> View Analytics
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

export default function StudentDashboardWrapper() {
  return (
    <ProtectedRoute>
      <StudentDashboard />
    </ProtectedRoute>
  )
}
