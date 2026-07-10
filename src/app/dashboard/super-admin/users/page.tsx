'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { getAllUsers, updateUserRole, deactivateUser, activateUser, UserRole } from '@/lib/users'
import { UserPlus, CheckCircle, XCircle, Search, Eye, Save, AlertCircle } from 'lucide-react'

interface PendingChange {
  userId: string
  userName: string
  oldRole: UserRole
  newRole: UserRole
}

function UserManagementPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState(getAllUsers())
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all')
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([])
  const [showSuccess, setShowSuccess] = useState(false)

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === 'all' || u.role === selectedRole
    return matchesSearch && matchesRole
  })

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    const currentUser = users.find(u => u.id === userId)
    if (!currentUser || currentUser.role === newRole) return

    // Add to pending changes
    const existingChangeIndex = pendingChanges.findIndex(c => c.userId === userId)
    if (existingChangeIndex >= 0) {
      // Update existing change
      const updatedChanges = [...pendingChanges]
      updatedChanges[existingChangeIndex] = {
        userId,
        userName: currentUser.name,
        oldRole: updatedChanges[existingChangeIndex].oldRole,
        newRole,
      }
      setPendingChanges(updatedChanges)
    } else {
      // Add new change
      setPendingChanges([
        ...pendingChanges,
        {
          userId,
          userName: currentUser.name,
          oldRole: currentUser.role,
          newRole,
        },
      ])
    }

    // Update local state for immediate UI feedback
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
  }

  const handleSaveChanges = () => {
    // Apply all pending changes
    pendingChanges.forEach(change => {
      updateUserRole(change.userId, change.newRole)
    })
    
    // Clear pending changes
    setPendingChanges([])
    
    // Refresh user list
    setUsers(getAllUsers())
    
    // Show success message
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const cancelPendingChange = (userId: string) => {
    const change = pendingChanges.find(c => c.userId === userId)
    if (change) {
      // Revert to old role
      setUsers(users.map(u => u.id === userId ? { ...u, role: change.oldRole } : u))
      setPendingChanges(pendingChanges.filter(c => c.userId !== userId))
    }
  }

  const handleToggleActive = (userId: string, isActive: boolean) => {
    if (isActive) {
      deactivateUser(userId)
    } else {
      activateUser(userId)
    }
    setUsers(getAllUsers())
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-gray-600">Manage all users, roles, and permissions.</p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">Role changes saved successfully!</span>
          </div>
        )}

        {/* Pending Changes Alert */}
        {pendingChanges.length > 0 && (
          <Card className="mb-6 border-yellow-300 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-900 mb-2">
                    {pendingChanges.length} Pending Change{pendingChanges.length > 1 ? 's' : ''}
                  </h4>
                  <ul className="space-y-1 mb-3">
                    {pendingChanges.map(change => (
                      <li key={change.userId} className="text-sm text-yellow-800">
                        <strong>{change.userName}</strong>: {change.oldRole.replace('_', ' ')} → {change.newRole.replace('_', ' ')}
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveChanges} size="sm">
                      <Save className="mr-2 h-4 w-4" /> Save All Changes
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        pendingChanges.forEach(change => {
                          setUsers(users.map(u => u.id === change.userId ? { ...u, role: change.oldRole } : u))
                        })
                        setPendingChanges([])
                      }}
                    >
                      Cancel All
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole | 'all')}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Roles</option>
                <option value="super_admin">Super Admins</option>
                <option value="admin">Admins</option>
                <option value="instructor">Instructors</option>
                <option value="student">Students</option>
              </select>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" /> Add User
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 font-semibold">Role</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <Link href={`/dashboard/super-admin/users/${u.id}`} className="font-medium text-primary hover:underline">
                          {u.name}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{u.email}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                            className={`px-2 py-1 border rounded text-sm ${
                              pendingChanges.some(c => c.userId === u.id) ? 'border-yellow-500 bg-yellow-50' : ''
                            }`}
                            disabled={u.id === user?.id}
                          >
                            <option value="super_admin">Super Admin</option>
                            <option value="admin">Admin</option>
                            <option value="instructor">Instructor</option>
                            <option value="student">Student</option>
                          </select>
                          {pendingChanges.some(c => c.userId === u.id) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => cancelPendingChange(u.id)}
                              title="Cancel change"
                              className="h-6 w-6 p-0"
                            >
                              <XCircle className="h-4 w-4 text-yellow-600" />
                            </Button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Link href={`/dashboard/super-admin/users/${u.id}`}>
                            <Button size="sm" variant="outline" title="View Profile">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleActive(u.id, u.isActive)}
                            disabled={u.id === user?.id}
                            title={u.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {u.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-600">
                No users found matching your criteria.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default function UserManagementPageWrapper() {
  return (
    <ProtectedRoute>
      <UserManagementPage />
    </ProtectedRoute>
  )
}
