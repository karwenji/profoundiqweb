'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { BookOpen, Users, Star, TrendingUp, Plus, Edit, Trash2 } from 'lucide-react'
import { courses } from '@/data/courses'

function InstructorDashboard() {
  const { user } = useAuth()

  // Filter courses for this instructor (mock data)
  const myCourses = courses.filter(c => c.instructor === user?.name || c.instructorId === user?.id)
  const allCourses = myCourses.length > 0 ? myCourses : courses.slice(0, 3)

  const stats = {
    totalCourses: allCourses.length,
    totalStudents: allCourses.reduce((sum, c) => sum + c.students, 0),
    avgRating: allCourses.length > 0 
      ? (allCourses.reduce((sum, c) => sum + c.rating, 0) / allCourses.length).toFixed(1)
      : '0.0',
    totalLessons: allCourses.reduce((sum, c) => sum + c.lessons, 0),
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Instructor Dashboard</h1>
          <p className="text-gray-600">Welcome, {user?.name}! Manage your courses and students.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">My Courses</p>
                  <p className="text-2xl font-bold">{stats.totalCourses}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Students</p>
                  <p className="text-2xl font-bold">{stats.totalStudents.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg Rating</p>
                  <p className="text-2xl font-bold">{stats.avgRating}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Lessons</p>
                  <p className="text-2xl font-bold">{stats.totalLessons}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
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
    <ProtectedRoute>
      <InstructorDashboard />
    </ProtectedRoute>
  )
}
