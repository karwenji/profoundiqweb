import { NextRequest, NextResponse } from 'next/server'
import { getApiUrl } from '@/lib/api/client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000'

const DEFAULT_SETTINGS = {
  revenueSplit: { defaultAdminPercentage: 40, defaultInstructorPercentage: 60, allowCustomSplits: true },
  currency: { primary: 'KES', supported: ['KES', 'USD', 'NGN', 'GBP', 'EUR'] },
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
  features: { socialMediaGrowth: true, certificates: true, liveClasses: false },
  branding: { platformName: 'Profound IQ Consulting', logoUrl: '/logo.png', primaryColor: '#2563eb' },
  email: { provider: 'smtp', smtpHost: '', smtpPort: 587, smtpUser: '', smtpPassword: '', fromAddress: '', fromName: '' },
  sms: { provider: '', apiKey: '', senderId: '' },
  notifications: { emailEnabled: true, smsEnabled: false, pushEnabled: true },
  security: { twoFactorEnabled: false, sessionTimeoutMinutes: 60, maxLoginAttempts: 5, passwordMinLength: 8 },
  backup: { autoBackupEnabled: true, backupFrequency: 'daily', retentionDays: 30 },
  ai: { enabled: false, provider: 'openai', apiKey: '', model: 'gpt-4', maxTokensPerResponse: 1024 },
}

function validateSettings(partial: Record<string, unknown>): { success: boolean; error?: string } {
  if (partial.revenueSplit && typeof partial.revenueSplit === 'object') {
    const rs = partial.revenueSplit as Record<string, number>
    const admin = Number(rs.defaultAdminPercentage)
    const instructor = Number(rs.defaultInstructorPercentage)
    if (!Number.isFinite(admin) || !Number.isFinite(instructor)) {
      return { success: false, error: 'Revenue split percentages must be numbers' }
    }
    if (admin + instructor !== 100) {
      return { success: false, error: 'Revenue split percentages must total 100' }
    }
  }

  if (partial.security && typeof partial.security === 'object') {
    const sec = partial.security as Record<string, number>
    if (sec.sessionTimeoutMinutes !== undefined && (!Number.isFinite(sec.sessionTimeoutMinutes) || sec.sessionTimeoutMinutes < 1)) {
      return { success: false, error: 'Session timeout must be at least 1 minute' }
    }
    if (sec.maxLoginAttempts !== undefined && (!Number.isFinite(sec.maxLoginAttempts) || sec.maxLoginAttempts < 1)) {
      return { success: false, error: 'Max login attempts must be at least 1' }
    }
    if (sec.passwordMinLength !== undefined && (!Number.isFinite(sec.passwordMinLength) || sec.passwordMinLength < 6)) {
      return { success: false, error: 'Password minimum length must be at least 6' }
    }
  }

  if (partial.backup && typeof partial.backup === 'object') {
    const backup = partial.backup as Record<string, unknown>
    if (backup.retentionDays !== undefined && (!Number.isFinite(Number(backup.retentionDays)) || Number(backup.retentionDays) < 1)) {
      return { success: false, error: 'Backup retention must be at least 1 day' }
    }
  }

  return { success: true }
}

function mergeSettings(base: Record<string, unknown>, patch: Record<string, unknown>): Record<string, unknown> {
  const merged = { ...base }
  for (const key of Object.keys(patch)) {
    const patchValue = patch[key]
    const current = merged[key]
    if (patchValue && typeof patchValue === 'object' && !Array.isArray(patchValue) && current && typeof current === 'object' && !Array.isArray(current)) {
      merged[key] = mergeSettings(current as Record<string, unknown>, patchValue as Record<string, unknown>)
    } else {
      merged[key] = patchValue
    }
  }
  return merged
}

async function tryBackend(path: string, options: RequestInit = {}) {
  try {
    const token = options.headers ? (options.headers as Record<string, string>)['Authorization']?.replace('Bearer ', '') : undefined
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const backend = await tryBackend('/api/settings', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
    if (backend && backend.data) {
      return NextResponse.json({ success: true, data: { ...DEFAULT_SETTINGS, ...backend.data } })
    }
    return NextResponse.json({ success: true, data: DEFAULT_SETTINGS })
  } catch (error) {
    return NextResponse.json({ success: true, data: DEFAULT_SETTINGS })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const body = await request.json()

    const validation = validateSettings(body)
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 })
    }

    const backend = await tryBackend('/api/settings', { method: 'PUT', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: JSON.stringify(body) })
    if (backend && backend.data) {
      return NextResponse.json({ success: true, data: { ...DEFAULT_SETTINGS, ...backend.data } })
    }

    return NextResponse.json({ success: true, data: mergeSettings(DEFAULT_SETTINGS, body) })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}

