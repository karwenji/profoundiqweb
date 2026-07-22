'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { Settings, Save, Sliders, Loader2, CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

function GeneralSettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState({
    allowInstructorRegistration: true,
    autoApproveCourses: false,
    commissionRate: 20,
    notificationEmail: 'admin@profoundiqconsulting.com',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/settings/admin')
      const result = await response.json()
      if (result.success) {
        setSettings(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/settings/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const result = await response.json()
      if (result.success) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {showSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">Settings saved successfully!</span>
          </div>
        )}
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Settings</h1>
          <p className="text-gray-600">Configure platform-wide settings and preferences.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Menu */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  <Link href="/dashboard/admin/settings/general">
                    <div className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-white cursor-pointer">
                      <Sliders className="h-5 w-5" />
                      <span className="font-medium">General Settings</span>
                    </div>
                  </Link>
                  <Link href="/dashboard/admin/settings/payments">
                    <div className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer">
                      <Settings className="h-5 w-5" />
                      <span className="font-medium">Payment Methods</span>
                    </div>
                  </Link>
                  <Link href="/dashboard/admin/settings/webhooks">
                    <div className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer">
                      <Settings className="h-5 w-5" />
                      <span className="font-medium">Webhook & Callback</span>
                    </div>
                  </Link>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
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

                  <Button onClick={handleSave} className="w-full" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Save Settings
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function GeneralSettingsPageWrapper() {
  return (
    <ProtectedRoute permission="system_settings">
      <GeneralSettingsPage />
    </ProtectedRoute>
  )
}
