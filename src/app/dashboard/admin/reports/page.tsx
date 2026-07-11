'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { TrendingUp, Users, BookOpen, DollarSign, ArrowLeft, Download, Printer, FileText } from 'lucide-react'
import Link from 'next/link'
import { courses } from '@/data/courses'
import { users } from '@/lib/users'
import { exportToPDF, exportToExcel, exportToWord } from '@/lib/report-export'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

function AdminReportsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setLoading(false), 500)
  }, [])

  // Prepare data for charts
  const categoryData = courses.reduce((acc: any[], course) => {
    const existing = acc.find(item => item.name === course.category)
    if (existing) {
      existing.value += course.students
    } else {
      acc.push({ name: course.category, value: course.students })
    }
    return acc
  }, [])

  const revenueByCourse = courses.map(course => ({
    name: course.title.length > 20 ? course.title.substring(0, 20) + '...' : course.title,
    revenue: course.price * course.students,
    students: course.students,
  }))

  const enrollmentTrend = [
    { month: 'Jan', enrollments: 120, revenue: 36000 },
    { month: 'Feb', enrollments: 150, revenue: 45000 },
    { month: 'Mar', enrollments: 180, revenue: 54000 },
    { month: 'Apr', enrollments: 200, revenue: 60000 },
    { month: 'May', enrollments: 250, revenue: 75000 },
    { month: 'Jun', enrollments: 300, revenue: 90000 },
  ]

  const userRoleDistribution = [
    { name: 'Students', value: users.filter(u => u.role === 'student').length },
    { name: 'Instructors', value: users.filter(u => u.role === 'instructor').length },
    { name: 'Admins', value: users.filter(u => u.role === 'admin' || u.role === 'super_admin').length },
  ]

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reports...</p>
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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
              <p className="text-gray-600">Comprehensive insights into platform performance.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" /> Print
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => exportToPDF('Admin Analytics Report', [], 'admin-report.pdf')}>
                    <FileText className="mr-2 h-4 w-4" /> PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportToExcel([], 'admin-report.xlsx')}>
                    <FileText className="mr-2 h-4 w-4" /> Excel (XLSX)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportToWord('Admin Analytics Report', [], 'admin-report.docx')}>
                    <FileText className="mr-2 h-4 w-4" /> Word (DOCX)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold">{courses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Enrollments</p>
                  <p className="text-2xl font-bold">{courses.reduce((sum, c) => sum + c.students, 0).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">₦{courses.reduce((sum, c) => sum + (c.price * c.students), 0).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Enrollment Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Enrollment & Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={enrollmentTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="enrollments" stroke="#0088FE" fill="#0088FE" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="revenue" stroke="#00C49F" fill="#00C49F" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Course Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Enrollments by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue by Course */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Course</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueByCourse}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* User Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>User Role Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userRoleDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {userRoleDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function AdminReportsPageWrapper() {
  return (
    <ProtectedRoute>
      <AdminReportsPage />
    </ProtectedRoute>
  )
}
