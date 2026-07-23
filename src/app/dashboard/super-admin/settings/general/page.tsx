'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { Settings, Save, Sliders, Loader2, CheckCircle, Globe } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { nextApi } from '@/lib/api/client'
import { useToast } from '@/components/dashboard/Toast'

const EMPTY_SETTINGS = {
  maintenanceMode: false,
  registrationEnabled: true,
  maxUploadSizeMB: 50,
  allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'mp4', 'zip'],
  rateLimitWindowMs: 60000,
  rateLimitMax: 100,
  platformVersion: '1.0.0',
  environment: 'development',
}

function SuperAdminGeneralSettingsPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [settings, setSettings] = useState(EMPTY_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const result = await nextApi.get<any>('/api/settings/system')
      if (result?.success && result.data) {
        setSettings({ ...EMPTY_SETTINGS, ...result.data })
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      addToast('error', 'Failed to load system settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const result = await nextApi.put<any>('/api/settings/system', settings)
      if (result?.success) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
        addToast('success', 'System settings saved successfully')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      addToast('error', 'Failed to save system settings')
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
          <h1 className="text-3xl font-bold mb-2">System Settings</h1>
          <p className="text-gray-600">Configure global system settings and preferences.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Menu */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  <Link href="/dashboard/super-admin/settings/general">
                    <div className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-white cursor-pointer">
                      <Sliders className="h-5 w-5" />
                      <span className="font-medium">General Settings</span>
                    </div>
                  </Link>
                  <Link href="/dashboard/super-admin/settings/payments">
                    <div className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer">
                      <Settings className="h-5 w-5" />
                      <span className="font-medium">Payment Methods</span>
                    </div>
                  </Link>
                  <Link href="/dashboard/super-admin/settings/webhooks">
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
                      <h4 className="font-semibold">Maintenance Mode</h4>
                      <p className="text-sm text-gray-600">Temporarily disable the site for maintenance</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                      className="h-5 w-5"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Enable Registration</h4>
                      <p className="text-sm text-gray-600">Allow new users to register</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.registrationEnabled}
                      onChange={(e) => setSettings({ ...settings, registrationEnabled: e.target.checked })}
                      className="h-5 w-5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Max Upload Size (MB)</label>
                    <input
                      type="number"
                      value={settings.maxUploadSizeMB}
                      onChange={(e) => setSettings({ ...settings, maxUploadSizeMB: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Rate Limit Window (ms)</label>
                    <input
                      type="number"
                      value={settings.rateLimitWindowMs}
                      onChange={(e) => setSettings({ ...settings, rateLimitWindowMs: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Max Requests Per Window</label>
                    <input
                      type="number"
                      value={settings.rateLimitMax}
                      onChange={(e) => setSettings({ ...settings, rateLimitMax: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Allowed File Types</label>
                    <input
                      type="text"
                      value={settings.allowedFileTypes?.join(', ') || ''}
                      onChange={(e) => setSettings({ ...settings, allowedFileTypes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      placeholder="pdf, doc, jpg, png, mp4"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-xs text-gray-500 mt-1">Comma-separated file extensions</p>
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

export default function SuperAdminGeneralSettingsPageWrapper() {
  return (
    <ProtectedRoute permission="system_settings">
      <SuperAdminGeneralSettingsPage />
    </ProtectedRoute>
  )
}