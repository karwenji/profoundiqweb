'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { getAllUsers } from '@/lib/users'
import { ArrowLeft, Mail, Calendar, GraduationCap, User as UserIcon, CheckCircle, XCircle, BookOpen } from 'lucide-react'

function StudentProfilePage() {
  const { user: currentUser } = useAuth()
  const params = useParams()
  const userId = params.id as string
  
  const users = getAllUsers()
  const studentProfile = users.find(u => u.id === userId)

  if (!studentProfile) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Not Found</h2>
            <p className="text-gray-600 mb-4">The student you're looking for doesn't exist.</p>
            <Link href="/dashboard/admin/students">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Students
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <Link href="/dashboard/admin/students">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Students
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Student Profile</h1>
          <p className="text-gray-600">View detailed information about this student.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-xl font-bold mb-1">{studentProfile.name}</h2>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  STUDENT
                </span>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{studentProfile.email}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {new Date().toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-center gap-2">
                    {studentProfile.isActive ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className={`font-medium ${studentProfile.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {studentProfile.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card className="lg:col-span-2">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Student Details
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <p className="mt-1 font-medium">{studentProfile.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email Address</label>
                    <p className="mt-1 font-medium">{studentProfile.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">User Role</label>
                    <p className="mt-1 font-medium capitalize">{studentProfile.role.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Account Status</label>
                    <p className="mt-1 font-medium">{studentProfile.isActive ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Enrollment Statistics</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <BookOpen className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                      <p className="text-2xl font-bold text-blue-600">0</p>
                      <p className="text-xs text-gray-600">Enrolled Courses</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
                      <p className="text-2xl font-bold text-green-600">0</p>
                      <p className="text-xs text-gray-600">Completed</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <GraduationCap className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                      <p className="text-2xl font-bold text-purple-600">0</p>
                      <p className="text-xs text-gray-600">Certificates</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Quick Actions</h4>
                  <div className="flex gap-3">
                    <Button variant="outline">
                      <Mail className="mr-2 h-4 w-4" /> Send Email
                    </Button>
                    <Button variant="outline">
                      <BookOpen className="mr-2 h-4 w-4" /> View Enrollments
                    </Button>
                    <Button variant={studentProfile.isActive ? 'destructive' : 'default'}>
                      {studentProfile.isActive ? 'Deactivate' : 'Activate'} Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function StudentProfilePageWrapper() {
  return (
    <ProtectedRoute>
      <StudentProfilePage />
    </ProtectedRoute>
  )
}
