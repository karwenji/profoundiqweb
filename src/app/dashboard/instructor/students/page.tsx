'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { Users, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

function InstructorStudentsPage() {
  const { user } = useAuth()

  // Mock student data for instructor's courses
  const students = [
    { id: 1, name: 'John Doe', email: 'john@example.com', course: 'Leadership Excellence', progress: 75 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', course: 'Digital Marketing Mastery', progress: 45 },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', course: 'Leadership Excellence', progress: 90 },
    { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', course: 'Project Management Professional', progress: 30 },
  ]

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Students</h1>
          <p className="text-gray-600">View and manage students enrolled in your courses.</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 font-semibold">Course</th>
                    <th className="text-left py-3 px-4 font-semibold">Progress</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{student.name}</td>
                      <td className="py-3 px-4 text-gray-600">{student.email}</td>
                      <td className="py-3 px-4">{student.course}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${student.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{student.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Button size="sm" variant="outline">
                          <Mail className="h-4 w-4 mr-2" /> Message
                        </Button>
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

export default function InstructorStudentsPageWrapper() {
  return (
    <ProtectedRoute permission="view_students">
      <InstructorStudentsPage />
    </ProtectedRoute>
  )
}
