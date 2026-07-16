'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { CreditCard, Save, Trash2, Plus, Sliders, Webhook, Loader2, CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface PaymentMethod {
  id: string
  name: string
  type: 'paystack' | 'stripe' | 'paypal' | 'bank_transfer'
  enabled: boolean
  publicKey?: string
  secretKey?: string
  currency?: string
  currencies?: string[]
  accountDetails?: string
}

function SuperAdminPaymentSettingsPage() {
  const { user } = useAuth()
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const availableCurrencies = ['NGN', 'KES', 'USD', 'EUR', 'GBP']
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/settings/payments')
      const result = await response.json()
      if (result.success) {
        // Ensure all payment methods have a currencies array
        const normalizedMethods = result.data.map((method: PaymentMethod) => ({
          ...method,
          currencies: method.currencies && method.currencies.length > 0 ? method.currencies : ['NGN'],
        }))
        setPaymentMethods(normalizedMethods)
      }
    } catch (error) {
      console.error('Failed to fetch payment methods:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/settings/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ methods: paymentMethods }),
      })
      const result = await response.json()
      if (result.success) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Failed to save payment methods:', error)
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
            <p className="text-gray-600">Loading payment methods...</p>
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
            <span className="text-green-800 font-medium">Payment methods saved successfully!</span>
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
                    <div className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-white cursor-pointer">
                      <CreditCard className="h-5 w-5" />
                      <span className="font-medium">Payment Methods</span>
                    </div>
                  </Link>
                  <Link href="/dashboard/super-admin/settings/webhooks">
                    <div className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer">
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
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Methods
                    </h3>
                    <p className="text-sm text-gray-600">Configure payment gateways for course purchases</p>
                  </div>
                  <Button
                    onClick={() => {
                      const newMethod: PaymentMethod = {
                        id: Date.now().toString(),
                        name: '',
                        type: 'paystack',
                        enabled: false,
                        currencies: ['NGN'],
                      }
                      setPaymentMethods([...paymentMethods, newMethod])
                    }}
                    size="sm"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Method
                  </Button>
                </div>

                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div>
                            <label className="block text-sm font-medium mb-2">Supported Currencies</label>
                            <div className="grid grid-cols-2 gap-2">
                              {availableCurrencies.map((currency) => (
                                <label key={currency} className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                                  <input
                                    type="checkbox"
                                    checked={(method.currencies ?? []).includes(currency)}
                                    onChange={(e) => {
                                      setPaymentMethods(
                                        paymentMethods.map((m) => {
                                          if (m.id === method.id) {
                                            const current = m.currencies ?? []
                                            const newCurrencies = e.target.checked
                                              ? [...current, currency]
                                              : current.filter(c => c !== currency)
                                            return { ...m, currencies: newCurrencies }
                                          }
                                          return m
                                        })
                                      )
                                    }}
                                    className="h-4 w-4"
                                  />
                                  <span className="text-sm">{currency}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">Gateway Type</label>
                            <select
                              value={method.type}
                              onChange={(e) => {
                                setPaymentMethods(
                                  paymentMethods.map((m) =>
                                    m.id === method.id
                                      ? { ...m, type: e.target.value as PaymentMethod['type'] }
                                      : m
                                  )
                                )
                              }}
                              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="paystack">Paystack</option>
                              <option value="stripe">Stripe</option>
                              <option value="paypal">PayPal</option>
                              <option value="bank_transfer">Bank Transfer</option>
                            </select>
                          </div>

                          {method.type !== 'bank_transfer' && (
                            <>
                              <div>
                                <label className="block text-sm font-medium mb-1">Public Key / Client ID</label>
                                <input
                                  type="text"
                                  value={method.publicKey || ''}
                                  onChange={(e) => {
                                    setPaymentMethods(
                                      paymentMethods.map((m) =>
                                        m.id === method.id ? { ...m, publicKey: e.target.value } : m
                                      )
                                    )
                                  }}
                                  placeholder="Enter public key or client ID"
                                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-1">Secret Key</label>
                                <input
                                  type="password"
                                  value={method.secretKey || ''}
                                  onChange={(e) => {
                                    setPaymentMethods(
                                      paymentMethods.map((m) =>
                                        m.id === method.id ? { ...m, secretKey: e.target.value } : m
                                      )
                                    )
                                  }}
                                  placeholder="Enter secret key"
                                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-1">Currency</label>
                                <input
                                  type="text"
                                  value={method.currency || ''}
                                  onChange={(e) => {
                                    setPaymentMethods(
                                      paymentMethods.map((m) =>
                                        m.id === method.id ? { ...m, currency: e.target.value } : m
                                      )
                                    )
                                  }}
                                  placeholder="e.g., NGN, USD, EUR"
                                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                              </div>
                            </>
                          )}

                          {method.type === 'bank_transfer' && (
                            <div>
                              <label className="block text-sm font-medium mb-1">Account Details</label>
                              <textarea
                                value={method.accountDetails || ''}
                                onChange={(e) => {
                                  setPaymentMethods(
                                    paymentMethods.map((m) =>
                                      m.id === method.id ? { ...m, accountDetails: e.target.value } : m
                                    )
                                  )
                                }}
                                placeholder="Enter bank name, account number, etc."
                                rows={3}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">Enabled</label>
                            <input
                              type="checkbox"
                              checked={method.enabled}
                              onChange={(e) => {
                                setPaymentMethods(
                                  paymentMethods.map((m) =>
                                    m.id === method.id ? { ...m, enabled: e.target.checked } : m
                                  )
                                )
                              }}
                              className="h-5 w-5"
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setPaymentMethods(paymentMethods.filter((m) => m.id !== method.id))
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {paymentMethods.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No payment methods configured yet</p>
                    </div>
                  )}
                </div>

                <Button onClick={handleSave} className="w-full mt-6" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Save Payment Settings
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

export default function SuperAdminPaymentSettingsPageWrapper() {
  return (
    <ProtectedRoute>
      <SuperAdminPaymentSettingsPage />
    </ProtectedRoute>
  )
}
