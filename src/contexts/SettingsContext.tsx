'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface PlatformSettings {
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

const defaultSettings: PlatformSettings = {
  revenueSplit: {
    defaultAdminPercentage: 40,
    defaultInstructorPercentage: 60,
    allowCustomSplits: true,
  },
  currency: {
    primary: 'KES',
    supported: ['KES', 'USD', 'NGN', 'GBP', 'EUR'],
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

interface SettingsContextType {
  settings: PlatformSettings
  updateSettings: (newSettings: Partial<PlatformSettings>) => Promise<void>
  loading: boolean
  error: string | null
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/settings')
      const result = await response.json()
      if (result.success) {
        setSettings(result.data)
        // Sync to localStorage for immediate client-side availability
        localStorage.setItem('platform_settings', JSON.stringify(result.data))
      }
    } catch (err) {
      setError('Failed to load settings')
      console.error(err)
      // Fallback to localStorage if API fails
      const saved = localStorage.getItem('platform_settings')
      if (saved) setSettings(JSON.parse(saved))
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (newSettings: Partial<PlatformSettings>) => {
    try {
      setLoading(true)
      const updated = { ...settings, ...newSettings }
      
      // Optimistic update for immediate UI feedback
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
      // Revert on failure
      fetchSettings()
    } finally {
      setLoading(false)
    }
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading, error }}>
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
