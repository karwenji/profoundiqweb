'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { GraduationCap, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

function StudentEnrolledPage() {
  const { user } = useAuth()

  const enrolledCourses = [
    { id: '1', title: 'Leadership Excellence Program', status: 'In Progress', lessonsCompleted: 28, totalLessons: 42, startDate: 'Jan 15, 2026' },
    { id: '2', title: 'Digital Marketing Mastery', status: 'In Progress', lessonsCompleted: 12, totalLessons: 38, startDate: 'Feb 1, 2026' },
    { id: '3', title: 'Project Management Professional', status: 'Completed', lessonsCompleted: 45, totalLessons: 45, startDate: 'Nov 10, 2025' },
  ]

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Enrolled Courses</h1>
          <p className="text-gray-600">Track your enrollment history and progress.</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Course Title</th>
                    <th className="text-left py-3 px-4 font-semibold">Start Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Progress</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enrolledCourses.map((course) => (
                    <tr key={course.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{course.title}</td>
                      <td className="py-3 px-4 text-gray-600">{course.startDate}</td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">{course.lessonsCompleted}/{course.totalLessons} lessons</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          course.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {course.status === 'Completed' ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                          {course.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`/courses/${course.id}`}>
                          <Button size="sm" variant="outline">View Course</Button>
                        </Link>
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

export default function StudentEnrolledPageWrapper() {
  return (
    <ProtectedRoute>
      <StudentEnrolledPage />
    </ProtectedRoute>
  )
}
