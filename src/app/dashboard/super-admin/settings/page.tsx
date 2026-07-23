'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSettings } from '@/contexts/SettingsContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { Save, Loader2, Settings2, DollarSign, Globe, Palette, CreditCard, Eye, EyeOff, CheckCircle } from 'lucide-react'

function SuperAdminSettingsPage() {
  const { settings, updateSettings, loading } = useSettings()
  const [localSettings, setLocalSettings] = useState(settings)
  const [showKeys, setShowKeys] = useState({
    paystackPublic: false,
    paystackSecret: false,
    flutterwavePublic: false,
    flutterwaveSecret: false,
  })
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle')

  const handleSave = async () => {
    await updateSettings(localSettings)
    setSaveStatus('success')
    setTimeout(() => setSaveStatus('idle'), 3000)
  }

  const handleChange = (section: keyof typeof settings, key: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Platform Settings</h1>
          <p className="text-gray-600">Configure global settings for the entire platform.</p>
        </div>

        <div className="grid gap-6">
          {/* Revenue Split Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" /> Revenue Split Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Default Admin Percentage (%)</Label>
                  <Input 
                    type="number" 
                    value={localSettings.revenueSplit.defaultAdminPercentage}
                    onChange={(e) => handleChange('revenueSplit', 'defaultAdminPercentage', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Default Instructor Percentage (%)</Label>
                  <Input 
                    type="number" 
                    value={localSettings.revenueSplit.defaultInstructorPercentage}
                    onChange={(e) => handleChange('revenueSplit', 'defaultInstructorPercentage', parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={localSettings.revenueSplit.allowCustomSplits}
                  onCheckedChange={(checked) => handleChange('revenueSplit', 'allowCustomSplits', checked)}
                />
                <Label>Allow Custom Splits Per Course</Label>
              </div>
            </CardContent>
          </Card>

          {/* Currency Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" /> Currency Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Primary Currency</Label>
                <Select 
                  value={localSettings.currency.primary}
                  onValueChange={(value) => handleChange('currency', 'primary', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(new Set(localSettings.currency.supported)).map(curr => (
                      <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" /> Payment Method Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Paystack Configuration</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Public Key</Label>
                    <div className="relative">
                      <Input 
                        type={showKeys.paystackPublic ? "text" : "password"}
                        placeholder="pk_test_..."
                        value={localSettings.payments.paystackPublicKey}
                        onChange={(e) => handleChange('payments', 'paystackPublicKey', e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeys(prev => ({ ...prev, paystackPublic: !prev.paystackPublic }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showKeys.paystackPublic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label>Secret Key</Label>
                    <div className="relative">
                      <Input 
                        type={showKeys.paystackSecret ? "text" : "password"}
                        placeholder="sk_test_..."
                        value={localSettings.payments.paystackSecretKey}
                        onChange={(e) => handleChange('payments', 'paystackSecretKey', e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeys(prev => ({ ...prev, paystackSecret: !prev.paystackSecret }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showKeys.paystackSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Webhook Secret</Label>
                    <div className="relative">
                      <Input 
                        type={showKeys.paystackSecret ? "text" : "password"}
                        placeholder="whsec_..."
                        value={localSettings.payments.paystackWebhookSecret}
                        onChange={(e) => handleChange('payments', 'paystackWebhookSecret', e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeys(prev => ({ ...prev, paystackSecret: !prev.paystackSecret }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showKeys.paystackSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Used to verify webhook events from Paystack.</p>
                  </div>
                  <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <Label className="text-blue-800">Webhook URL</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="bg-white px-3 py-2 rounded border flex-1 text-sm break-all">
                        {typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/paystack` : 'Loading...'}
                      </code>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            navigator.clipboard.writeText(`${window.location.origin}/api/webhooks/paystack`)
                            alert('Webhook URL copied to clipboard!')
                          }
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      Add this URL to your Paystack Dashboard under <strong>Settings &gt; API Keys & Webhooks</strong> to receive real-time payment updates.
                    </p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <Label>Currency</Label>
                    <Select 
                      value={localSettings.payments.currency}
                      onValueChange={(value) => handleChange('payments', 'currency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="KES">KES (Kenyan Shilling)</SelectItem>
                        <SelectItem value="USD">USD (US Dollar)</SelectItem>
                        <SelectItem value="NGN">NGN (Nigerian Naira)</SelectItem>
                        <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Transaction Prefix</Label>
                    <Input 
                      placeholder="PQ"
                      value={localSettings.payments.transactionPrefix}
                      onChange={(e) => handleChange('payments', 'transactionPrefix', e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">Prefix for payment references (e.g., PQ_123).</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-lg">Flutterwave</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Public Key</Label>
                    <div className="relative">
                      <Input 
                        type={showKeys.flutterwavePublic ? "text" : "password"}
                        placeholder="FLWPUBK_TEST-..."
                        value={localSettings.payments.flutterwavePublicKey}
                        onChange={(e) => handleChange('payments', 'flutterwavePublicKey', e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeys(prev => ({ ...prev, flutterwavePublic: !prev.flutterwavePublic }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showKeys.flutterwavePublic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label>Secret Key</Label>
                    <div className="relative">
                      <Input 
                        type={showKeys.flutterwaveSecret ? "text" : "password"}
                        placeholder="FLWSECK_TEST-..."
                        value={localSettings.payments.flutterwaveSecretKey}
                        onChange={(e) => handleChange('payments', 'flutterwaveSecretKey', e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeys(prev => ({ ...prev, flutterwaveSecret: !prev.flutterwaveSecret }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showKeys.flutterwaveSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Label className="mb-2 block">Enabled Payment Methods</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={localSettings.payments.enabledMethods.includes('paystack')}
                      onCheckedChange={(checked) => {
                        const methods = checked 
                          ? [...localSettings.payments.enabledMethods, 'paystack']
                          : localSettings.payments.enabledMethods.filter(m => m !== 'paystack');
                        handleChange('payments', 'enabledMethods', methods);
                      }}
                    />
                    <Label>Paystack</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={localSettings.payments.enabledMethods.includes('flutterwave')}
                      onCheckedChange={(checked) => {
                        const methods = checked 
                          ? [...localSettings.payments.enabledMethods, 'flutterwave']
                          : localSettings.payments.enabledMethods.filter(m => m !== 'flutterwave');
                        handleChange('payments', 'enabledMethods', methods);
                      }}
                    />
                    <Label>Flutterwave</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature Toggles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" /> Feature Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Social Media Growth Services</Label>
                  <p className="text-sm text-gray-500">Enable social media follower/like services</p>
                </div>
                <Switch 
                  checked={localSettings.features.socialMediaGrowth}
                  onCheckedChange={(checked) => handleChange('features', 'socialMediaGrowth', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Certificates</Label>
                  <p className="text-sm text-gray-500">Enable course completion certificates</p>
                </div>
                <Switch 
                  checked={localSettings.features.certificates}
                  onCheckedChange={(checked) => handleChange('features', 'certificates', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Live Classes</Label>
                  <p className="text-sm text-gray-500">Enable live streaming for courses</p>
                </div>
                <Switch 
                  checked={localSettings.features.liveClasses}
                  onCheckedChange={(checked) => handleChange('features', 'liveClasses', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Branding Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" /> Branding Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Platform Name</Label>
                <Input 
                  value={localSettings.branding.platformName}
                  onChange={(e) => handleChange('branding', 'platformName', e.target.value)}
                />
              </div>
              <div>
                <Label>Primary Color (Hex)</Label>
                <Input 
                  value={localSettings.branding.primaryColor}
                  onChange={(e) => handleChange('branding', 'primaryColor', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end items-center gap-4">
            {saveStatus === 'success' && (
              <span className="text-green-600 font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> Settings saved successfully!
              </span>
            )}
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save All Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function SuperAdminSettingsPageWrapper() {
  return (
    <ProtectedRoute permission="system_settings">
      <SuperAdminSettingsPage />
    </ProtectedRoute>
  )
}
