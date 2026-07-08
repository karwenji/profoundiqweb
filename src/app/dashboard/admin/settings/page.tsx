'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { Settings, Save } from 'lucide-react'
import { useState } from 'react'

function AdminSettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState({
    allowInstructorRegistration: true,
    autoApproveCourses: false,
    commissionRate: 20,
    notificationEmail: 'admin@profoundiqconsulting.com',
  })

  const handleSave = () => {
    alert('Admin settings saved successfully!')
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Settings</h1>
          <p className="text-gray-600">Configure platform-wide settings and preferences.</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Allow Instructor Registration</h4>
                  <p className="text-sm text-gray-600">Enable new instructors to sign up</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.allowInstructorRegistration}
                  onChange={(e) => setSettings({ ...settings, allowInstructorRegistration: e.target.checked })}
                  className="h-5 w-5"
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Auto-Approve Courses</h4>
                  <p className="text-sm text-gray-600">Automatically publish new courses</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoApproveCourses}
                  onChange={(e) => setSettings({ ...settings, autoApproveCourses: e.target.checked })}
                  className="h-5 w-5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Commission Rate (%)</label>
                <input
                  type="number"
                  value={settings.commissionRate}
                  onChange={(e) => setSettings({ ...settings, commissionRate: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notification Email</label>
                <input
                  type="email"
                  value={settings.notificationEmail}
                  onChange={(e) => setSettings({ ...settings, notificationEmail: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <Button onClick={handleSave} className="w-full">
                <Save className="mr-2 h-4 w-4" /> Save Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default function AdminSettingsPageWrapper() {
  return (
    <ProtectedRoute>
      <AdminSettingsPage />
    </ProtectedRoute>
  )
}
