'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { Webhook, Save, Copy, Check, Sliders, CreditCard, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { nextApi } from '@/lib/api/client'
import { useToast } from '@/components/dashboard/Toast'

const EMPTY_WEBHOOK_SETTINGS = {
  paystack: { url: '', secret: '', events: ['charge.success', 'charge.failure'] },
  flutterwave: { url: '', secret: '', events: ['charge.completed', 'charge.failed'] },
  email: { url: '', secret: '', events: ['payment.confirmed', 'receipt.ready'] },
}

function WebhookSettingsPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [webhookSettings, setWebhookSettings] = useState<any>(EMPTY_WEBHOOK_SETTINGS)
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
      const result = await nextApi.get<any>('/api/settings/webhooks')
      if (result?.success && result.data) {
        setWebhookSettings({ ...EMPTY_WEBHOOK_SETTINGS, ...result.data })
      }
    } catch (error) {
      console.error('Failed to fetch webhook settings:', error)
      addToast('error', 'Failed to load webhook settings')
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
    setWebhookSettings({
      ...webhookSettings,
      paystack: { ...webhookSettings.paystack, secret: result },
      flutterwave: { ...webhookSettings.flutterwave, secret: result },
      email: { ...webhookSettings.email, secret: result },
    })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const result = await nextApi.put<any>('/api/settings/webhooks', webhookSettings)
      if (result?.success) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
        addToast('success', 'Webhook settings saved successfully')
      }
    } catch (error) {
      console.error('Failed to save webhook settings:', error)
      addToast('error', 'Failed to save webhook settings')
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
                    <div className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer">
                      <Sliders className="h-5 w-5" />
                      <span className="font-medium">General Settings</span>
                    </div>
                  </Link>
                  <Link href="/dashboard/admin/settings/payments">
                    <div className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer">
                      <CreditCard className="h-5 w-5" />
                      <span className="font-medium">Payment Methods</span>
                    </div>
                  </Link>
                  <Link href="/dashboard/admin/settings/webhooks">
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
                  {Object.entries(webhookSettings).map(([provider, config]: [string, any]) => (
                    <div key={provider} className="border rounded-lg p-4 space-y-4">
                      <h4 className="font-semibold capitalize">{provider}</h4>
                      <div>
                        <label className="block text-sm font-medium mb-2">Webhook URL</label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={config.url}
                            onChange={(e) => setWebhookSettings({
                              ...webhookSettings,
                              [provider]: { ...config, url: e.target.value },
                            })}
                            placeholder="https://yourdomain.com/api/webhooks/..."
                            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(config.url, provider)}
                          >
                            {copiedField === provider ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Secret Key</label>
                        <div className="flex gap-2">
                          <input
                            type="password"
                            value={config.secret}
                            onChange={(e) => setWebhookSettings({
                              ...webhookSettings,
                              [provider]: { ...config, secret: e.target.value },
                            })}
                            placeholder="Webhook secret for signature verification"
                            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <Button variant="outline" size="sm" onClick={generateWebhookSecret}>
                            Generate
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(config.secret, `${provider}-secret`)}
                          >
                            {copiedField === `${provider}-secret` ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Subscribed Events</label>
                        <input
                          type="text"
                          value={(config.events || []).join(', ')}
                          onChange={(e) => setWebhookSettings({
                            ...webhookSettings,
                            [provider]: { ...config, events: e.target.value.split(',').map(s => s.trim()).filter(Boolean) },
                          })}
                          placeholder="e.g. charge.success, charge.failure"
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <p className="text-xs text-gray-500 mt-1">Comma-separated list of events to receive.</p>
                      </div>
                    </div>
                  ))}
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

export default function WebhookSettingsPageWrapper() {
  return (
    <ProtectedRoute permission="system_settings">
      <WebhookSettingsPage />
    </ProtectedRoute>
  )
}