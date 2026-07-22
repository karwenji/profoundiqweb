'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { BookOpen, Plus, Edit, Trash2, Eye, Users, User } from 'lucide-react'
import { courses } from '@/data/courses'
import { formatCurrency } from '@/lib/currency'

function AdminCoursesPage() {
  const { user } = useAuth()

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage Courses</h1>
            <p className="text-gray-600">View and manage all courses on the platform.</p>
          </div>
          <Link href="/dashboard/admin/courses/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Course
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Course Title</th>
                    <th className="text-left py-3 px-4 font-semibold">Instructor</th>
                    <th className="text-left py-3 px-4 font-semibold">Students</th>
                    <th className="text-left py-3 px-4 font-semibold">Revenue</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => {
                    const adminSplitPercent = (course as any).adminSplit || 40;
                    const instructorSplitPercent = 100 - adminSplitPercent;
                    const totalRevenue = course.price * course.students;
                    const adminShare = totalRevenue * (adminSplitPercent / 100);
                    const instructorShare = totalRevenue * (instructorSplitPercent / 100);
                    return (
                      <tr key={course.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <Link href={`/courses/${course.id}`} className="font-medium text-primary hover:underline">
                            {course.title}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <Link href={`/dashboard/admin/instructors?search=${encodeURIComponent(course.instructor)}`} className="text-blue-600 hover:underline flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {course.instructor}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <Link href={`/dashboard/admin/courses/${course.id}/students`} className="flex items-center gap-1 text-blue-600 hover:underline">
                            <Users className="h-4 w-4" />
                            {course.students.toLocaleString()}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <Link href={`/dashboard/admin/reports?course=${course.id}`} className="block font-semibold text-green-600 hover:underline">
                              Total: {formatCurrency(totalRevenue, 'NGN')}
                            </Link>
                            <div className="text-xs text-gray-500 flex justify-between">
                              <span>Admin ({adminSplitPercent}%): {formatCurrency(adminShare, 'NGN')}</span>
                              <span>Instructor ({instructorSplitPercent}%): {formatCurrency(instructorShare, 'NGN')}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Link href={`/courses/${course.id}`}>
                              <Button size="sm" variant="outline" title="View Course">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/dashboard/admin/courses/edit/${course.id}`}>
                              <Button size="sm" variant="outline" title="Edit Course">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button size="sm" variant="outline" title="Delete Course">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default function AdminCoursesPageWrapper() {
  return (
    <ProtectedRoute permission="manage_courses">
      <AdminCoursesPage />
    </ProtectedRoute>
  )
}
