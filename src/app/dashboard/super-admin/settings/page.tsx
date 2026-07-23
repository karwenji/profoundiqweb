'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSettings } from '@/contexts/SettingsContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { Save, Loader2, Settings2, DollarSign, Globe, Palette, CreditCard, Eye, EyeOff, CheckCircle, Shield, HardDrive, Bot } from 'lucide-react'
import { nextApi } from '@/lib/api/client'
import { useToast } from '@/components/dashboard/Toast'

const EMPTY_SETTINGS = {
  revenueSplit: { defaultAdminPercentage: 40, defaultInstructorPercentage: 60, allowCustomSplits: true },
  currency: { primary: 'KES', supported: ['KES', 'USD', 'NGN', 'GBP', 'EUR'] },
  payments: { paystackPublicKey: '', paystackSecretKey: '', paystackWebhookSecret: '', flutterwavePublicKey: '', flutterwaveSecretKey: '', enabledMethods: ['paystack'], currency: 'KES', transactionPrefix: 'PIQ' },
  features: { socialMediaGrowth: true, certificates: true, liveClasses: false },
  branding: { platformName: 'Profound IQ Consulting', logoUrl: '/logo.png', primaryColor: '#2563eb' },
  email: { provider: 'smtp', smtpHost: '', smtpPort: 587, smtpUser: '', smtpPassword: '', fromAddress: '', fromName: '' },
  sms: { provider: '', apiKey: '', senderId: '' },
  notifications: { emailEnabled: true, smsEnabled: false, pushEnabled: true },
  security: { twoFactorEnabled: false, sessionTimeoutMinutes: 60, maxLoginAttempts: 5, passwordMinLength: 8 },
  backup: { autoBackupEnabled: true, backupFrequency: 'daily', retentionDays: 30 },
  ai: { enabled: false, provider: 'openai', apiKey: '', model: 'gpt-4', maxTokensPerResponse: 1024 },
}

function SuperAdminSettingsPage() {
  const { settings, updateSettings, loading: contextLoading } = useSettings()
  const { addToast } = useToast()
  const [localSettings, setLocalSettings] = useState<any>(EMPTY_SETTINGS)
  const [showKeys, setShowKeys] = useState({
    paystackPublic: false,
    paystackSecret: false,
    flutterwavePublic: false,
    flutterwaveSecret: false,
    smtpPassword: false,
    smsApiKey: false,
    aiApiKey: false,
  })
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!initialized && settings) {
      setLocalSettings({ ...EMPTY_SETTINGS, ...settings })
      setInitialized(true)
    }
  }, [settings, initialized])

  const handleSave = async () => {
    try {
      setSaveStatus('saving')
      await updateSettings(localSettings)
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save settings'
      setSaveStatus('error')
      addToast('error', message)
    }
  }

  const handleChange = (section: keyof typeof localSettings, key: string, value: unknown) => {
    setLocalSettings((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
  }

  const syncFromServer = async () => {
    try {
      const data = await nextApi.get<any>('/api/settings')
      const merged = { ...EMPTY_SETTINGS, ...(data?.data || {}) }
      setLocalSettings(merged)
      setInitialized(true)
    } catch {
      addToast('error', 'Failed to reload settings from server')
    }
  }

  useEffect(() => {
    syncFromServer()
  }, [])

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
                    {Array.from(new Set((localSettings.currency.supported as string[]) ?? [])).map((curr) => (
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
                       checked={(localSettings.payments.enabledMethods as string[]).includes('paystack')}
                       onCheckedChange={(checked) => {
                         const methods = checked 
                           ? [...(localSettings.payments.enabledMethods as string[]), 'paystack']
                           : (localSettings.payments.enabledMethods as string[]).filter((m: string) => m !== 'paystack');
                         handleChange('payments', 'enabledMethods', methods);
                       }}
                     />
                     <Label>Paystack</Label>
                   </div>
                   <div className="flex items-center space-x-2">
                     <Switch 
                       checked={(localSettings.payments.enabledMethods as string[]).includes('flutterwave')}
                       onCheckedChange={(checked) => {
                         const methods = checked 
                           ? [...(localSettings.payments.enabledMethods as string[]), 'flutterwave']
                           : (localSettings.payments.enabledMethods as string[]).filter((m: string) => m !== 'flutterwave');
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

          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" /> Email Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>SMTP Host</Label>
                  <Input 
                    value={localSettings.email.smtpHost}
                    onChange={(e) => handleChange('email', 'smtpHost', e.target.value)}
                    placeholder="smtp.provider.com"
                  />
                </div>
                <div>
                  <Label>SMTP Port</Label>
                  <Input 
                    type="number"
                    value={localSettings.email.smtpPort}
                    onChange={(e) => handleChange('email', 'smtpPort', parseInt(e.target.value || '0'))}
                  />
                </div>
                <div>
                  <Label>SMTP Username</Label>
                  <Input 
                    value={localSettings.email.smtpUser}
                    onChange={(e) => handleChange('email', 'smtpUser', e.target.value)}
                  />
                </div>
                <div>
                  <Label>SMTP Password</Label>
                  <div className="relative">
                    <Input 
                      type={showKeys.smtpPassword ? 'text' : 'password'}
                      value={localSettings.email.smtpPassword}
                      onChange={(e) => handleChange('email', 'smtpPassword', e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKeys(prev => ({ ...prev, smtpPassword: !prev.smtpPassword }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showKeys.smtpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label>From Address</Label>
                  <Input 
                    value={localSettings.email.fromAddress}
                    onChange={(e) => handleChange('email', 'fromAddress', e.target.value)}
                    placeholder="noreply@profoundiqconsulting.com"
                  />
                </div>
                <div>
                  <Label>From Name</Label>
                  <Input 
                    value={localSettings.email.fromName}
                    onChange={(e) => handleChange('email', 'fromName', e.target.value)}
                    placeholder="Profound IQ"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SMS Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" /> SMS Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Provider</Label>
                  <Input 
                    value={localSettings.sms.provider}
                    onChange={(e) => handleChange('sms', 'provider', e.target.value)}
                    placeholder="e.g. africastalking, twilio"
                  />
                </div>
                <div>
                  <Label>Sender ID</Label>
                  <Input 
                    value={localSettings.sms.senderId}
                    onChange={(e) => handleChange('sms', 'senderId', e.target.value)}
                    placeholder="PROFIQ"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>API Key</Label>
                  <div className="relative">
                    <Input 
                      type={showKeys.smsApiKey ? 'text' : 'password'}
                      value={localSettings.sms.apiKey}
                      onChange={(e) => handleChange('sms', 'apiKey', e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKeys(prev => ({ ...prev, smsApiKey: !prev.smsApiKey }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showKeys.smsApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" /> Notification Channels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">Send system notifications via email</p>
                </div>
                <Switch 
                  checked={localSettings.notifications.emailEnabled}
                  onCheckedChange={(checked) => handleChange('notifications', 'emailEnabled', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-gray-500">Send critical alerts via SMS</p>
                </div>
                <Switch 
                  checked={localSettings.notifications.smsEnabled}
                  onCheckedChange={(checked) => handleChange('notifications', 'smsEnabled', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-500">Enable browser/device push alerts</p>
                </div>
                <Switch 
                  checked={localSettings.notifications.pushEnabled}
                  onCheckedChange={(checked) => handleChange('notifications', 'pushEnabled', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" /> Security Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
                </div>
                <Switch 
                  checked={localSettings.security.twoFactorEnabled}
                  onCheckedChange={(checked) => handleChange('security', 'twoFactorEnabled', checked)}
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Session Timeout (minutes)</Label>
                  <Input 
                    type="number"
                    value={localSettings.security.sessionTimeoutMinutes}
                    onChange={(e) => handleChange('security', 'sessionTimeoutMinutes', parseInt(e.target.value || '0'))}
                  />
                </div>
                <div>
                  <Label>Max Login Attempts</Label>
                  <Input 
                    type="number"
                    value={localSettings.security.maxLoginAttempts}
                    onChange={(e) => handleChange('security', 'maxLoginAttempts', parseInt(e.target.value || '0'))}
                  />
                </div>
                <div>
                  <Label>Password Min Length</Label>
                  <Input 
                    type="number"
                    value={localSettings.security.passwordMinLength}
                    onChange={(e) => handleChange('security', 'passwordMinLength', parseInt(e.target.value || '0'))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Backup Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" /> Backup Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Automatic Backups</Label>
                  <p className="text-sm text-gray-500">Enable scheduled platform backups</p>
                </div>
                <Switch 
                  checked={localSettings.backup.autoBackupEnabled}
                  onCheckedChange={(checked) => handleChange('backup', 'autoBackupEnabled', checked)}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Backup Frequency</Label>
                  <Select 
                    value={localSettings.backup.backupFrequency}
                    onValueChange={(value) => handleChange('backup', 'backupFrequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Retention (days)</Label>
                  <Input 
                    type="number"
                    value={localSettings.backup.retentionDays}
                    onChange={(e) => handleChange('backup', 'retentionDays', parseInt(e.target.value || '0'))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" /> AI / Automation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable AI Features</Label>
                  <p className="text-sm text-gray-500">Use AI for recommendations, summaries, or support</p>
                </div>
                <Switch 
                  checked={localSettings.ai.enabled}
                  onCheckedChange={(checked) => handleChange('ai', 'enabled', checked)}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Provider</Label>
                  <Select 
                    value={localSettings.ai.provider}
                    onValueChange={(value) => handleChange('ai', 'provider', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="google">Google AI</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Model</Label>
                  <Input 
                    value={localSettings.ai.model}
                    onChange={(e) => handleChange('ai', 'model', e.target.value)}
                    placeholder="gpt-4"
                  />
                </div>
                <div>
                  <Label>Max Tokens Per Response</Label>
                  <Input 
                    type="number"
                    value={localSettings.ai.maxTokensPerResponse}
                    onChange={(e) => handleChange('ai', 'maxTokensPerResponse', parseInt(e.target.value || '0'))}
                  />
                </div>
                <div>
                  <Label>API Key</Label>
                  <div className="relative">
                    <Input 
                      type={showKeys.aiApiKey ? 'text' : 'password'}
                      value={localSettings.ai.apiKey}
                      onChange={(e) => handleChange('ai', 'apiKey', e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKeys(prev => ({ ...prev, aiApiKey: !prev.aiApiKey }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showKeys.aiApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center">
            <div>
              {saveStatus === 'success' && (
                <span className="text-green-600 font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Settings saved successfully!
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="text-red-600 font-medium">Failed to save settings. Please try again.</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={syncFromServer}>
                Reload
              </Button>
              <Button onClick={handleSave} disabled={saveStatus === 'saving' || contextLoading}>
                {saveStatus === 'saving' || contextLoading ? (
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
