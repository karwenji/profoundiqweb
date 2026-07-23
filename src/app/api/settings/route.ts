import { NextRequest, NextResponse } from 'next/server'
import { getApiUrl } from '@/lib/api/client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000'

const DEFAULT_SETTINGS = {
  revenueSplit: { defaultAdminPercentage: 40, defaultInstructorPercentage: 60, allowCustomSplits: true },
  currency: { primary: 'KES', supported: ['KES', 'USD', 'NGN', 'GBP', 'EUR'] },
  payments: { paystackPublicKey: '', paystackSecretKey: '', paystackWebhookSecret: '', flutterwavePublicKey: '', flutterwaveSecretKey: '', enabledMethods: ['paystack'], currency: 'KES', transactionPrefix: 'PIQ' },
  features: { socialMediaGrowth: true, certificates: true, liveClasses: false },
  branding: { platformName: 'Profound IQ Consulting', logoUrl: '/logo.png', primaryColor: '#2563eb' },
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
    if (backend) {
      return NextResponse.json(backend, { status: 200 })
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
    const backend = await tryBackend('/api/settings', { method: 'PUT', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: JSON.stringify(body) })
    if (backend) {
      return NextResponse.json(backend, { status: 200 })
    }
    return NextResponse.json({ success: true, data: { ...DEFAULT_SETTINGS, ...body } })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}
