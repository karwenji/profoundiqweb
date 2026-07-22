'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { Webhook, Save, Copy, Check, Sliders, CreditCard, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

function SuperAdminWebhookSettingsPage() {
  const { user } = useAuth()
  const [webhookSettings, setWebhookSettings] = useState({
    callbackUrl: 'https://profoundiqconsulting.com/api/payment/callback',
    webhookUrl: 'https://profoundiqconsulting.com/api/payment/webhook',
    webhookSecret: 'whsec_xxxxxxxxxxxxxxxxxxxxxxxx',
    enableInstantProcessing: true,
    autoEnrollOnSuccess: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  useEffect(() => {
    fetchWebhookSettings()
  }, [])

  const fetchWebhookSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/settings/webhooks')
      const result = await response.json()
      if (result.success) {
        setWebhookSettings(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch webhook settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const generateWebhookSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = 'whsec_'
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setWebhookSettings({ ...webhookSettings, webhookSecret: result })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/settings/webhooks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookSettings),
      })
      const result = await response.json()
      if (result.success) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Failed to save webhook settings:', error)
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
            <p className="text-gray-600">Loading webhook settings...</p>
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
            <Check className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">Webhook settings saved successfully!</span>
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
                    <div className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer">
                      <Sliders className="h-5 w-5" />
                      <span className="font-medium">General Settings</span>
                    </div>
                  </Link>
                  <Link href="/dashboard/super-admin/settings/payments">
                    <div className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer">
                      <CreditCard className="h-5 w-5" />
                      <span className="font-medium">Payment Methods</span>
                    </div>
                  </Link>
                  <Link href="/dashboard/super-admin/settings/webhooks">
                    <div className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-white cursor-pointer">
                      <Webhook className="h-5 w-5" />
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
                <div className="mb-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Webhook className="h-5 w-5" />
                    Webhook & Callback Configuration
                  </h3>
                  <p className="text-sm text-gray-600">Configure URLs for instant payment processing and notifications</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Callback URL</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={webhookSettings.callbackUrl}
                        onChange={(e) => setWebhookSettings({ ...webhookSettings, callbackUrl: e.target.value })}
                        placeholder="https://yourdomain.com/api/payment/callback"
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(webhookSettings.callbackUrl, 'callback')}
                      >
                        {copiedField === 'callback' ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      URL where users are redirected after payment completion
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Webhook URL</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={webhookSettings.webhookUrl}
                        onChange={(e) => setWebhookSettings({ ...webhookSettings, webhookUrl: e.target.value })}
                        placeholder="https://yourdomain.com/api/payment/webhook"
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(webhookSettings.webhookUrl, 'webhook')}
                      >
                        {copiedField === 'webhook' ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      URL that receives payment status updates from payment gateways
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Webhook Secret Key</label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={webhookSettings.webhookSecret}
                        onChange={(e) => setWebhookSettings({ ...webhookSettings, webhookSecret: e.target.value })}
                        placeholder="Webhook secret for signature verification"
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <Button variant="outline" size="sm" onClick={generateWebhookSecret}>
                        Generate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(webhookSettings.webhookSecret, 'secret')}
                      >
                        {copiedField === 'secret' ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Secret key used to verify webhook signatures from payment providers
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="font-semibold text-sm">Instant Processing Options</h4>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h5 className="font-medium text-sm">Enable Instant Processing</h5>
                        <p className="text-xs text-gray-600">Process payments immediately upon webhook confirmation</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={webhookSettings.enableInstantProcessing}
                        onChange={(e) => setWebhookSettings({ ...webhookSettings, enableInstantProcessing: e.target.checked })}
                        className="h-5 w-5"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h5 className="font-medium text-sm">Auto-Enroll on Success</h5>
                        <p className="text-xs text-gray-600">Automatically enroll students after successful payment</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={webhookSettings.autoEnrollOnSuccess}
                        onChange={(e) => setWebhookSettings({ ...webhookSettings, autoEnrollOnSuccess: e.target.checked })}
                        className="h-5 w-5"
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSave} className="w-full mt-6" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Save Webhook Settings
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function SuperAdminWebhookSettingsPageWrapper() {
  return (
    <ProtectedRoute permission="system_settings">
      <SuperAdminWebhookSettingsPage />
    </ProtectedRoute>
  )
}
