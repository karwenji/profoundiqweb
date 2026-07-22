'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Logo from '@/components/Logo'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api/client'
import { Users, BookOpen, DollarSign, TrendingUp, Plus, LogOut, RefreshCw } from 'lucide-react'
import { useToast } from '@/components/dashboard/Toast'
import Link from 'next/link'

interface AdminStats {
  totalStudents: number
  activeCourses: number
  monthlyRevenue: number
  completionRate: number
  totalRevenue: number
}

interface RecentEnrollment {
  id: string
  student: string
  course: string
  date: string
  amount: number
}

function AdminDashboardContent() {
  const { user, logout } = useAuth()
  const { addToast } = useToast()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentEnrollments, setRecentEnrollments] = useState<RecentEnrollment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true)
      const result = await apiClient.get<{ success: boolean; data: { stats: AdminStats; recentEnrollments: RecentEnrollment[] } }>('/api/analytics/dashboard')
      if (result.success) {
        setStats(result.data.stats)
        setRecentEnrollments(result.data.recentEnrollments || [])
      }
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome, {user?.name}! Manage your e-learning platform</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Link href="/dashboard/admin/courses/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add New Course
              </Button>
            </Link>
            <Button variant="outline" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Students</p>
                  <p className="text-2xl font-bold">{(stats?.totalStudents || 0).toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Courses</p>
                  <p className="text-2xl font-bold">{stats?.activeCourses || 0}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold">${(stats?.totalRevenue || 0).toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
                  <p className="text-2xl font-bold">{stats?.completionRate || 0}%</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-4">Recent Enrollments</h2>
            {recentEnrollments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No enrollments yet</p>
            ) : (
              <div className="space-y-3">
                {recentEnrollments.map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{enrollment.student}</p>
                      <p className="text-sm text-gray-600">{enrollment.course}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${enrollment.amount}</p>
                      <p className="text-sm text-gray-500">{enrollment.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AdminPage() {
  return (
    <ProtectedRoute adminOnly>
      <AdminDashboardContent />
    </ProtectedRoute>
  )
}
