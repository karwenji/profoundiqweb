import { NextRequest, NextResponse } from 'next/server'
import { getApiUrl } from '@/lib/api/client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000'

const DEFAULT_WEBHOOK_SETTINGS = {
  paystack: { url: '', secret: '', events: ['charge.success', 'charge.failure'] },
  flutterwave: { url: '', secret: '', events: ['charge.completed', 'charge.failed'] },
  email: { url: '', secret: '', events: ['payment.confirmed', 'receipt.ready'] },
}

function validateWebhookConfig(config: Record<string, unknown>): { success: boolean; error?: string } {
  if (!config.url || typeof config.url !== 'string' || !config.url.startsWith('https://')) {
    return { success: false, error: 'Webhook URL must be an HTTPS URL' }
  }
  if (!config.secret || typeof config.secret !== 'string' || config.secret.length < 8) {
    return { success: false, error: 'Webhook secret must be at least 8 characters' }
  }
  if (!Array.isArray(config.events) || config.events.length === 0) {
    return { success: false, error: 'Webhook must subscribe to at least one event' }
  }
  return { success: true }
}

async function tryBackend(path: string, options: RequestInit = {}) {
  try {
    const res = await fetch(`${API_URL}${path}`, options)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function GET() {
  try {
    const backend = await tryBackend('/api/settings/webhooks')
    if (backend && backend.data) {
      return NextResponse.json({ success: true, data: { ...DEFAULT_WEBHOOK_SETTINGS, ...backend.data } })
    }
    return NextResponse.json({ success: true, data: DEFAULT_WEBHOOK_SETTINGS })
  } catch (error) {
    return NextResponse.json({ success: true, data: DEFAULT_WEBHOOK_SETTINGS })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    for (const provider of Object.keys(body || {})) {
      const config = (body as Record<string, Record<string, unknown>>)[provider]
      if (config && typeof config === 'object') {
        const validation = validateWebhookConfig(config)
        if (!validation.success) {
          return NextResponse.json({ success: false, error: `${provider}: ${validation.error}` }, { status: 400 })
        }
      }
    }

    const backend = await tryBackend('/api/settings/webhooks', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (backend && backend.data) {
      return NextResponse.json({ success: true, data: { ...DEFAULT_WEBHOOK_SETTINGS, ...backend.data } })
    }

    return NextResponse.json({ success: true, data: { ...DEFAULT_WEBHOOK_SETTINGS, ...body } })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update webhook settings' }, { status: 500 })
  }
}
