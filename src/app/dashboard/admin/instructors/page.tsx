'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { Users, Plus, Mail } from 'lucide-react'
import { getAllUsers } from '@/lib/users'

function AdminInstructorsPage() {
  const { user } = useAuth()
  const users = getAllUsers()
  const instructors = users.filter(u => u.role === 'instructor')

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage Instructors</h1>
            <p className="text-gray-600">View and manage all instructors on the platform.</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Instructor
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {instructors.map((instructor) => (
                    <tr key={instructor.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{instructor.name}</td>
                      <td className="py-3 px-4 text-gray-600">{instructor.email}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          instructor.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {instructor.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button size="sm" variant="outline">
                          <Mail className="h-4 w-4 mr-2" /> Contact
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

export default function AdminInstructorsPageWrapper() {
  return (
    <ProtectedRoute>
      <AdminInstructorsPage />
    </ProtectedRoute>
  )
}
