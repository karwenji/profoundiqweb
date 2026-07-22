'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { getAllUsers } from '@/lib/users'
import type { UserRole } from '@/types'
import { ArrowLeft, Mail, Calendar, Shield, User as UserIcon, CheckCircle, XCircle } from 'lucide-react'

function UserProfilePage() {
  const { user: currentUser } = useAuth()
  const params = useParams()
  const userId = params.id as string
  
  const users = getAllUsers()
  const userProfile = users.find(u => u.id === userId)

  if (!userProfile) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
            <p className="text-gray-600 mb-4">The user you're looking for doesn't exist.</p>
            <Link href="/dashboard/super-admin/users">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800'
      case 'admin': return 'bg-blue-100 text-blue-800'
      case 'instructor': return 'bg-green-100 text-green-800'
      case 'student': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <Link href="/dashboard/super-admin/users">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">User Profile</h1>
          <p className="text-gray-600">View detailed information about this user.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-xl font-bold mb-1">{userProfile.name}</h2>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(userProfile.role)}`}>
                  {userProfile.role.replace('_', ' ').toUpperCase()}
                </span>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{userProfile.email}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {new Date().toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-center gap-2">
                    {userProfile.isActive ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className={`font-medium ${userProfile.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {userProfile.isActive ? 'Active' : 'Inactive'}
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
                <Shield className="h-5 w-5" />
                Account Details
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <p className="mt-1 font-medium">{userProfile.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email Address</label>
                    <p className="mt-1 font-medium">{userProfile.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">User Role</label>
                    <p className="mt-1 font-medium capitalize">{userProfile.role.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Account Status</label>
                    <p className="mt-1 font-medium">{userProfile.isActive ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Quick Actions</h4>
                  <div className="flex gap-3">
                    <Button variant="outline">
                      <Mail className="mr-2 h-4 w-4" /> Send Email
                    </Button>
                    <Button variant="outline">
                      <Shield className="mr-2 h-4 w-4" /> Change Role
                    </Button>
                    <Button variant={userProfile.isActive ? 'destructive' : 'default'}>
                      {userProfile.isActive ? 'Deactivate' : 'Activate'} Account
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

export default function UserProfilePageWrapper() {
  return (
    <ProtectedRoute permission="manage_users">
      <UserProfilePage />
    </ProtectedRoute>
  )
}
