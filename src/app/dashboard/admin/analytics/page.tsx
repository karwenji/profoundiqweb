'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { TrendingUp, DollarSign, Users, BookOpen, Loader2, ArrowLeft } from 'lucide-react'
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

function AdminAnalyticsPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/analytics/dashboard?role=admin')
      const result = await response.json()
      if (result.success) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <Link href="/dashboard/admin">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Admin Analytics</h1>
          <p className="text-gray-600">Detailed analytics and insights for your platform.</p>
        </div>

        {/* Revenue Analytics */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  Revenue Overview
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats?.monthlyRevenue || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  Performance Metrics
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-3xl font-bold">{stats?.completionRate || 0}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Enrollments</p>
                  <p className="text-2xl font-bold">{stats?.totalEnrollments || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Analytics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p>Active: {stats?.activeUsers || 0}</p>
                <p>New Students: +{stats?.newStudentsThisMonth || 0} this month</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Instructors</p>
                  <p className="text-2xl font-bold">{stats?.totalInstructors || 0}</p>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p>Active: {stats?.activeInstructors || 0}</p>
                <p>New: +{stats?.newInstructorsThisMonth || 0} this month</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="h-8 w-8 text-secondary" />
                <div>
                  <p className="text-sm text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold">{stats?.totalCourses || 0}</p>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p>Active: {stats?.activeCourses || 0}</p>
                <p>Pending: {stats?.pendingCourses || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function AdminAnalyticsPageWrapper() {
  return (
    <ProtectedRoute permission="view_reports">
      <AdminAnalyticsPage />
    </ProtectedRoute>
  )
}
