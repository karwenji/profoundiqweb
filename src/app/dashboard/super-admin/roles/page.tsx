'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { Shield, Plus } from 'lucide-react'

function RolePermissionsPage() {
  const { user } = useAuth()

  const roles = [
    {
      name: 'Super Admin',
      description: 'Full system access and control',
      permissions: ['Manage Users', 'Manage Roles', 'System Settings', 'View Analytics', 'Audit Logs'],
    },
    {
      name: 'Admin',
      description: 'Course and user management',
      permissions: ['Manage Courses', 'Manage Instructors', 'View Reports', 'Student Management'],
    },
    {
      name: 'Instructor',
      description: 'Course creation and student management',
      permissions: ['Create Courses', 'Edit Own Courses', 'View Students', 'Send Messages'],
    },
    {
      name: 'Student',
      description: 'Learning and course enrollment',
      permissions: ['Enroll in Courses', 'View Progress', 'Download Certificates', 'Access Billing'],
    },
  ]

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Role Permissions</h1>
            <p className="text-gray-600">Manage role-based access control and permissions.</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Custom Role
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {roles.map((role) => (
            <Card key={role.name}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{role.name}</h3>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Permissions:</h4>
                  <ul className="space-y-2">
                    {role.permissions.map((perm) => (
                      <li key={perm} className="flex items-center text-sm">
                        <Shield className="h-4 w-4 text-green-500 mr-2" />
                        {perm}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button variant="outline" className="w-full mt-4">Edit Permissions</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function RolePermissionsPageWrapper() {
  return (
    <ProtectedRoute>
      <RolePermissionsPage />
    </ProtectedRoute>
  )
}
