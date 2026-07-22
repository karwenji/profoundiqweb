'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface PlatformSettings {
  revenueSplit: {
    defaultAdminPercentage: number
    defaultInstructorPercentage: number
    allowCustomSplits: boolean
  }
  currency: {
    primary: string
    supported: string[]
  }
  payments: {
    paystackPublicKey: string
    paystackSecretKey: string
    paystackWebhookSecret: string
    flutterwavePublicKey: string
    flutterwaveSecretKey: string
    enabledMethods: string[]
    currency: string
    transactionPrefix: string
  }
  features: {
    socialMediaGrowth: boolean
    certificates: boolean
    liveClasses: boolean
  }
  branding: {
    platformName: string
    logoUrl: string
    primaryColor: string
  }
}

export interface AdminSettings {
  allowInstructorRegistration: boolean
  autoApproveCourses: boolean
  commissionRate: number
  notificationEmail: string
}

interface SettingsContextType {
  settings: PlatformSettings
  adminSettings: AdminSettings
  updateSettings: (newSettings: Partial<PlatformSettings>) => Promise<void>
  updateAdminSettings: (newSettings: Partial<AdminSettings>) => Promise<void>
  loading: boolean
  error: string | null
}

const defaultPlatformSettings: PlatformSettings = {
  revenueSplit: {
    defaultAdminPercentage: 40,
    defaultInstructorPercentage: 60,
    allowCustomSplits: true,
  },
  currency: {
    primary: 'KES',
    supported: ['KES', 'USD', 'EUR', 'GBP', 'KES'],
  },
  payments: {
    paystackPublicKey: '',
    paystackSecretKey: '',
    paystackWebhookSecret: '',
    flutterwavePublicKey: '',
    flutterwaveSecretKey: '',
    enabledMethods: ['paystack'],
    currency: 'KES',
    transactionPrefix: 'PIQ',
  },
  features: {
    socialMediaGrowth: true,
    certificates: true,
    liveClasses: false,
  },
  branding: {
    platformName: 'Profound IQ Consulting',
    logoUrl: '/logo.png',
    primaryColor: '#2563eb',
  },
}

const defaultAdminSettings: AdminSettings = {
  allowInstructorRegistration: true,
  autoApproveCourses: false,
  commissionRate: 20,
  notificationEmail: 'admin@profoundiqconsulting.com',
}

function toPlatformSettings(data: any): PlatformSettings {
  const system = data?.systemSettings || {}
  const payments = data?.webhookSettings || {}
  return {
    revenueSplit: {
      defaultAdminPercentage: system.defaultAdminPercentage ?? defaultPlatformSettings.revenueSplit.defaultAdminPercentage,
      defaultInstructorPercentage: 60,
      allowCustomSplits: true,
    },
    currency: {
      primary: system.defaultCurrency || 'KES',
      supported: system.supportedCurrencies || ['KES', 'USD', 'EUR', 'GBP', 'KES'],
    },
    payments: {
      paystackPublicKey: payments.paystackPublicKey || '',
      paystackSecretKey: payments.paystackSecretKey || '',
      paystackWebhookSecret: payments.webhookSecret || '',
      flutterwavePublicKey: payments.flutterwavePublicKey || '',
      flutterwaveSecretKey: payments.flutterwaveSecretKey || '',
      enabledMethods: ['paystack'],
      currency: 'KES',
      transactionPrefix: 'PIQ',
    },
    features: {
      socialMediaGrowth: true,
      certificates: true,
      liveClasses: false,
    },
    branding: {
      platformName: system.siteName || defaultPlatformSettings.branding.platformName,
      logoUrl: '/logo.png',
      primaryColor: '#2563eb',
    },
  }
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PlatformSettings>(defaultPlatformSettings)
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(defaultAdminSettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const [platformRes, adminRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/settings/admin'),
      ])

      const platformResult = await platformRes.json()
      const adminResult = await adminRes.json()

      if (platformResult.success && platformResult.data) {
        const platform = toPlatformSettings(platformResult.data)
        setSettings(platform)
        localStorage.setItem('platform_settings', JSON.stringify(platform))
      }

      if (adminResult.success && adminResult.data) {
        setAdminSettings(adminResult.data)
        localStorage.setItem('admin_settings', JSON.stringify(adminResult.data))
      }
    } catch (err) {
      setError('Failed to load settings')
      console.error(err)
      const savedPlatform = localStorage.getItem('platform_settings')
      const savedAdmin = localStorage.getItem('admin_settings')
      if (savedPlatform) setSettings(JSON.parse(savedPlatform))
      if (savedAdmin) setAdminSettings(JSON.parse(savedAdmin))
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (newSettings: Partial<PlatformSettings>) => {
    try {
      setLoading(true)
      const updated = { ...settings, ...newSettings }

      setSettings(updated)
      localStorage.setItem('platform_settings', JSON.stringify(updated))

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      })

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error)
      }
    } catch (err) {
      setError('Failed to update settings')
      console.error(err)
      fetchSettings()
    } finally {
      setLoading(false)
    }
  }

  const updateAdminSettingsHandler = async (newSettings: Partial<AdminSettings>) => {
    try {
      setLoading(true)
      const updated = { ...adminSettings, ...newSettings }

      setAdminSettings(updated)
      localStorage.setItem('admin_settings', JSON.stringify(updated))

      const response = await fetch('/api/settings/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      })

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error)
      }
    } catch (err) {
      setError('Failed to update admin settings')
      console.error(err)
      fetchSettings()
    } finally {
      setLoading(false)
    }
  }

  return (
    <SettingsContext.Provider value={{ settings, adminSettings, updateSettings, updateAdminSettings: updateAdminSettingsHandler, loading, error }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
