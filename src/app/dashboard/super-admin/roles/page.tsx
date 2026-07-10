'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { Shield, Plus, X, Save, CheckCircle, AlertCircle, Edit, Loader2 } from 'lucide-react'

interface Permission {
  id: string
  name: string
  category: string
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
}

function RolePermissionsPage() {
  const { user } = useAuth()

  const [roles, setRoles] = useState<Role[]>([])
  const [allPermissions, setAllPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [pendingChanges, setPendingChanges] = useState<{ roleId: string; roleName: string }[]>([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch roles and permissions on mount
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch roles
      const rolesResponse = await fetch('/api/roles')
      const rolesData = await rolesResponse.json()
      
      // Fetch permissions
      const permsResponse = await fetch('/api/permissions')
      const permsData = await permsResponse.json()
      
      if (rolesData.success && permsData.success) {
        setRoles(rolesData.data)
        setAllPermissions(permsData.data)
      } else {
        setError('Failed to load data')
      }
    } catch (err) {
      setError('Failed to connect to server')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openEditModal = (role: Role) => {
    setEditingRole({ ...role })
  }

  const closeEditModal = () => {
    setEditingRole(null)
  }

  const togglePermission = (permissionId: string) => {
    if (!editingRole) return
    
    const hasPermission = editingRole.permissions.includes(permissionId)
    const updatedPermissions = hasPermission
      ? editingRole.permissions.filter(p => p !== permissionId)
      : [...editingRole.permissions, permissionId]
    
    setEditingRole({ ...editingRole, permissions: updatedPermissions })
  }

  const saveRoleChanges = async () => {
    if (!editingRole) return
    
    try {
      setSaving(true)
      
      // Send update to backend
      const response = await fetch(`/api/roles/${editingRole.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: editingRole.permissions }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Update local state
        setRoles(roles.map(r => r.id === editingRole.id ? result.data : r))
        
        // Add to pending changes if not already there
        if (!pendingChanges.some(c => c.roleId === editingRole.id)) {
          setPendingChanges([...pendingChanges, { roleId: editingRole.id, roleName: editingRole.name }])
        }
        
        closeEditModal()
      } else {
        setError(result.error || 'Failed to save changes')
      }
    } catch (err) {
      setError('Failed to connect to server')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const saveAllChanges = async () => {
    try {
      setSaving(true)
      
      // Save each pending change to backend
      for (const change of pendingChanges) {
        const role = roles.find(r => r.id === change.roleId)
        if (role) {
          await fetch(`/api/roles/${role.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ permissions: role.permissions }),
          })
        }
      }
      
      setPendingChanges([])
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (err) {
      setError('Failed to save changes')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const cancelAllChanges = async () => {
    // Reload from backend to revert changes
    await fetchData()
    setPendingChanges([])
  }

  const getPermissionName = (id: string) => {
    return allPermissions.find(p => p.id === id)?.name || id
  }

  const getPermissionCategory = (id: string) => {
    return allPermissions.find(p => p.id === id)?.category || 'Other'
  }

  const groupPermissionsByCategory = () => {
    const grouped: { [key: string]: Permission[] } = {}
    allPermissions.forEach(perm => {
      if (!grouped[perm.category]) {
        grouped[perm.category] = []
      }
      grouped[perm.category].push(perm)
    })
    return grouped
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-gray-600">Loading roles and permissions...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">{error}</p>
            <Button onClick={fetchData} className="mt-2" size="sm">
              Retry
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">Role permissions saved successfully!</span>
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
                    {pendingChanges.length} Role{pendingChanges.length > 1 ? 's' : ''} with Unsaved Changes
                  </h4>
                  <ul className="space-y-1 mb-3">
                    {pendingChanges.map(change => (
                      <li key={change.roleId} className="text-sm text-yellow-800">
                        <strong>{change.roleName}</strong>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    <Button onClick={saveAllChanges} size="sm" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" /> Save All Changes
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={cancelAllChanges} disabled={saving}>
                      Cancel All
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
          {roles.map((role) => {
            const hasPendingChanges = pendingChanges.some(c => c.roleId === role.id)
            return (
              <Card key={role.id} className={hasPendingChanges ? 'border-yellow-300' : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg">{role.name}</h3>
                        {hasPendingChanges && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                            Modified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{role.description}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Permissions ({role.permissions.length}):</h4>
                    <ul className="space-y-2">
                      {role.permissions.slice(0, 4).map((perm) => (
                        <li key={perm} className="flex items-center text-sm">
                          <Shield className="h-4 w-4 text-green-500 mr-2" />
                          {getPermissionName(perm)}
                        </li>
                      ))}
                      {role.permissions.length > 4 && (
                        <li className="text-sm text-gray-500 italic">
                          +{role.permissions.length - 4} more permissions
                        </li>
                      )}
                    </ul>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => openEditModal(role)}
                  >
                    <Edit className="mr-2 h-4 w-4" /> Edit Permissions
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Edit Role Modal */}
        {editingRole && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Edit {editingRole.name} Permissions</h2>
                  <p className="text-sm text-gray-600">Select the permissions for this role</p>
                </div>
                <Button variant="ghost" size="sm" onClick={closeEditModal}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="p-6 space-y-6">
                {Object.entries(groupPermissionsByCategory()).map(([category, perms]) => (
                  <div key={category}>
                    <h3 className="font-semibold text-lg mb-3 text-gray-700">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {perms.map(perm => {
                        const isChecked = editingRole.permissions.includes(perm.id)
                        return (
                          <label
                            key={perm.id}
                            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                              isChecked ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePermission(perm.id)}
                              className="h-5 w-5"
                            />
                            <span className="text-sm font-medium">{perm.name}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="sticky bottom-0 bg-white border-t p-6 flex gap-3">
                <Button onClick={saveRoleChanges} className="flex-1" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Save Changes
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={closeEditModal} disabled={saving}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
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
