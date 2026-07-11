'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { TrendingUp, DollarSign, BookOpen, Award, Clock, Loader2, ArrowLeft, Download, Printer } from 'lucide-react'
import { exportToPDF, exportToExcel } from '@/lib/report-export'
import Link from 'next/link'

interface StudentStats {
  enrolledCourses: number
  completedCourses: number
  inProgressCourses: number
  certificatesEarned: number
  totalSpent: number
  learningHours: number
}

function StudentAnalyticsPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics/dashboard?role=student&userId=${user?.id}`)
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
          <Link href="/dashboard/student">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Learning Analytics</h1>
              <p className="text-gray-600">Track your progress and learning journey.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" /> Print
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" /> Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => exportToPDF('My Learning Report', [], 'learning-report.pdf')}>
                    <FileText className="mr-2 h-4 w-4" /> PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportToExcel([], 'learning-report.xlsx')}>
                    <FileText className="mr-2 h-4 w-4" /> Excel (XLSX)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Learning Progress */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Course Progress
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Enrolled Courses</p>
                  <p className="text-3xl font-bold">{stats?.enrolledCourses || 0}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-xl font-bold text-green-600">{stats?.completedCourses || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">In Progress</p>
                    <p className="text-xl font-bold text-blue-600">{stats?.inProgressCourses || 0}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  Achievements
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Certificates Earned</p>
                  <p className="text-3xl font-bold">{stats?.certificatesEarned || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold">
                    {stats?.enrolledCourses ? Math.round((stats.completedCourses / stats.enrolledCourses) * 100) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Time & Investment */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Learning Time</p>
                  <p className="text-3xl font-bold">{stats?.learningHours || 0} hours</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Keep up the great work! Consistent learning leads to success.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Investment</p>
                  <p className="text-3xl font-bold">{formatCurrency(stats?.totalSpent || 0)}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Investing in your education is investing in your future.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function StudentAnalyticsPageWrapper() {
  return (
    <ProtectedRoute>
      <StudentAnalyticsPage />
    </ProtectedRoute>
  )
}
