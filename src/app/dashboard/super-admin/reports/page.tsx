'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { TrendingUp, Users, BookOpen, DollarSign, ArrowLeft, Download, Activity, Printer, FileText } from 'lucide-react'
import Link from 'next/link'
import { courses } from '@/data/courses'
import { users } from '@/lib/users'
import { exportToPDF, exportToExcel, exportToWord } from '@/lib/report-export'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B']

function SuperAdminReportsPage() {
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
    name: course.title.length > 25 ? course.title.substring(0, 25) + '...' : course.title,
    revenue: course.price * course.students,
    students: course.students,
  }))

  const monthlyGrowth = [
    { month: 'Jan', users: 800, revenue: 120000, courses: 120 },
    { month: 'Feb', users: 850, revenue: 135000, courses: 125 },
    { month: 'Mar', users: 920, revenue: 158000, courses: 130 },
    { month: 'Apr', users: 1000, revenue: 180000, courses: 138 },
    { month: 'May', users: 1100, revenue: 210000, courses: 145 },
    { month: 'Jun', users: 1247, revenue: 245000, courses: 156 },
  ]

  const userRoleDistribution = [
    { name: 'Students', value: users.filter(u => u.role === 'student').length },
    { name: 'Instructors', value: users.filter(u => u.role === 'instructor').length },
    { name: 'Admins', value: users.filter(u => u.role === 'admin').length },
    { name: 'Super Admins', value: users.filter(u => u.role === 'super_admin').length },
  ]

  const systemHealth = [
    { name: 'Uptime', value: 99.9, color: '#00C49F' },
    { name: 'API Response', value: 98.5, color: '#0088FE' },
    { name: 'Database', value: 99.2, color: '#FFBB28' },
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
          <Link href="/dashboard/super-admin">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">System Reports & Analytics</h1>
              <p className="text-gray-600">Comprehensive platform-wide insights and performance metrics.</p>
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
                  <DropdownMenuItem onClick={() => exportToPDF('System Analytics Report', [], 'system-report.pdf')}>
                    <FileText className="mr-2 h-4 w-4" /> PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportToExcel([], 'system-report.xlsx')}>
                    <FileText className="mr-2 h-4 w-4" /> Excel (XLSX)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportToWord('System Analytics Report', [], 'system-report.docx')}>
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
          {/* Monthly Growth */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Growth Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#0088FE" strokeWidth={2} />
                  <Line type="monotone" dataKey="revenue" stroke="#00C49F" strokeWidth={2} />
                  <Line type="monotone" dataKey="courses" stroke="#FFBB28" strokeWidth={2} />
                </LineChart>
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
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
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
              <CardTitle>Top Performing Courses by Revenue</CardTitle>
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

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {systemHealth.map((metric) => (
                <div key={metric.name} className="text-center">
                  <div className="relative h-32 w-32 mx-auto mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[{ value: metric.value }, { value: 100 - metric.value }]}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={50}
                          startAngle={90}
                          endAngle={-270}
                          dataKey="value"
                        >
                          <Cell fill={metric.color} />
                          <Cell fill="#f0f0f0" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold">{metric.value}%</span>
                    </div>
                  </div>
                  <p className="font-semibold">{metric.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default function SuperAdminReportsPageWrapper() {
  return (
    <ProtectedRoute>
      <SuperAdminReportsPage />
    </ProtectedRoute>
  )
}
