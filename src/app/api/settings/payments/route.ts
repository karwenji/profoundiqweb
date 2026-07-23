import { NextRequest, NextResponse } from 'next/server'
import { getApiUrl } from '@/lib/api/client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000'

const DEFAULT_PAYMENT_METHODS = [
  { id: 'paystack', name: 'Paystack', provider: 'paystack', enabled: true, config: { publicKey: '', secretKey: '', webhookSecret: '' } },
  { id: 'flutterwave', name: 'Flutterwave', provider: 'flutterwave', enabled: false, config: { publicKey: '', secretKey: '', merchantId: '' } },
  { id: 'cash', name: 'Cash / Bank Transfer', provider: 'manual', enabled: true, config: { accountName: '', accountNumber: '', bankName: '' } },
]

const DEFAULT_PAYMENT_SETTINGS = {
  currency: 'KES',
  supportedCurrencies: ['KES', 'USD', 'NGN', 'GBP', 'EUR'],
  transactionPrefix: 'PIQ',
  methods: DEFAULT_PAYMENT_METHODS,
}

function validatePaymentMethod(method: Record<string, unknown>): { success: boolean; error?: string } {
  if (!method.id || typeof method.id !== 'string') {
    return { success: false, error: 'Payment method id is required' }
  }
  if (!method.name || typeof method.name !== 'string') {
    return { success: false, error: 'Payment method name is required' }
  }
  if (!method.provider || typeof method.provider !== 'string') {
    return { success: false, error: 'Payment method provider is required' }
  }
  if (typeof method.enabled !== 'boolean') {
    return { success: false, error: 'Payment method enabled must be a boolean' }
  }
  return { success: true }
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

export async function GET() {
  try {
    const backend = await tryBackend('/api/settings/payments')
    if (backend && backend.data) {
      return NextResponse.json({ success: true, data: { ...DEFAULT_PAYMENT_SETTINGS, ...backend.data } })
    }
    return NextResponse.json({ success: true, data: DEFAULT_PAYMENT_SETTINGS })
  } catch (error) {
    return NextResponse.json({ success: true, data: DEFAULT_PAYMENT_SETTINGS })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const newMethod = body

    const validation = validatePaymentMethod(newMethod)
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 })
    }

    const backend = await tryBackend('/api/settings/payments', { method: 'POST', body: JSON.stringify(newMethod) })
    if (backend && backend.data) {
      return NextResponse.json({ success: true, data: backend.data }, { status: 201 })
    }

    const methods = DEFAULT_PAYMENT_METHODS.map(m => ({ ...m }))
    methods.push({ ...newMethod, id: newMethod.id || `pm-${Date.now()}` })
    return NextResponse.json({ success: true, data: { ...DEFAULT_PAYMENT_SETTINGS, methods } }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to add payment method' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { methods } = body

    if (!methods || !Array.isArray(methods)) {
      return NextResponse.json({ success: false, error: 'Methods array is required' }, { status: 400 })
    }

    for (const method of methods) {
      const validation = validatePaymentMethod(method as Record<string, unknown>)
      if (!validation.success) {
        return NextResponse.json({ success: false, error: validation.error }, { status: 400 })
      }
    }

    const backend = await tryBackend('/api/settings/payments', { method: 'PUT', body: JSON.stringify({ methods }) })
    if (backend && backend.data) {
      return NextResponse.json({ success: true, data: backend.data })
    }

    return NextResponse.json({ success: true, data: { ...DEFAULT_PAYMENT_SETTINGS, methods } })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update payment methods' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, error: 'Method ID is required' }, { status: 400 })
    }

    const backend = await tryBackend(`/api/settings/payments?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (backend) {
      return NextResponse.json(backend, { status: 200 })
    }

    const methods = DEFAULT_PAYMENT_METHODS.filter(m => m.id !== id)
    return NextResponse.json({ success: true, data: { ...DEFAULT_PAYMENT_SETTINGS, methods }, message: 'Payment method deleted' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete payment method' }, { status: 500 })
  }
}
