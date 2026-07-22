'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { BookOpen, Plus, Edit, Trash2, Eye } from 'lucide-react'
import { courses } from '@/data/courses'

function InstructorCoursesPage() {
  const { user } = useAuth()
  const myCourses = courses.filter(c => c.instructor === user?.name || c.instructorId === user?.id)
  const displayCourses = myCourses.length > 0 ? myCourses : courses.slice(0, 3)

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Courses</h1>
            <p className="text-gray-600">Manage your course content and settings.</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create New Course
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Course Title</th>
                    <th className="text-left py-3 px-4 font-semibold">Students</th>
                    <th className="text-left py-3 px-4 font-semibold">Rating</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayCourses.map((course) => (
                    <tr key={course.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{course.title}</td>
                      <td className="py-3 px-4 text-gray-600">{course.students.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className="text-yellow-500">★ {course.rating}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Published
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
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

export default function InstructorCoursesPageWrapper() {
  return (
    <ProtectedRoute permissions={['edit_own_courses', 'view_students']}>
      <InstructorCoursesPage />
    </ProtectedRoute>
  )
}
