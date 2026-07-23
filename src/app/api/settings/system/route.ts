import { NextRequest, NextResponse } from 'next/server'
import { getApiUrl } from '@/lib/api/client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000'

const DEFAULT_SYSTEM_SETTINGS = {
  maintenanceMode: false,
  registrationEnabled: true,
  maxUploadSizeMB: 50,
  allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'mp4', 'zip'],
  rateLimitWindowMs: 60000,
  rateLimitMax: 100,
  platformVersion: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
}

function validateSystemSettings(partial: Record<string, unknown>): { success: boolean; error?: string } {
  if (partial.maxUploadSizeMB !== undefined) {
    const size = Number(partial.maxUploadSizeMB)
    if (!Number.isFinite(size) || size < 1 || size > 500) {
      return { success: false, error: 'Max upload size must be between 1MB and 500MB' }
    }
  }

  if (partial.rateLimitWindowMs !== undefined) {
    const window = Number(partial.rateLimitWindowMs)
    if (!Number.isFinite(window) || window < 1000) {
      return { success: false, error: 'Rate limit window must be at least 1000ms' }
    }
  }

  if (partial.rateLimitMax !== undefined) {
    const max = Number(partial.rateLimitMax)
    if (!Number.isFinite(max) || max < 1) {
      return { success: false, error: 'Rate limit max must be at least 1' }
    }
  }

  if (partial.allowedFileTypes && !Array.isArray(partial.allowedFileTypes)) {
    return { success: false, error: 'allowedFileTypes must be an array' }
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

export async function GET() {
  try {
    const backend = await tryBackend('/api/settings/system')
    if (backend && backend.data) {
      return NextResponse.json({ success: true, data: { ...DEFAULT_SYSTEM_SETTINGS, ...backend.data } })
    }
    return NextResponse.json({ success: true, data: DEFAULT_SYSTEM_SETTINGS })
  } catch (error) {
    return NextResponse.json({ success: true, data: DEFAULT_SYSTEM_SETTINGS })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    const validation = validateSystemSettings(body)
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 })
    }

    const backend = await tryBackend('/api/settings/system', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (backend && backend.data) {
      return NextResponse.json({ success: true, data: { ...DEFAULT_SYSTEM_SETTINGS, ...backend.data } })
    }

    return NextResponse.json({ success: true, data: mergeSettings(DEFAULT_SYSTEM_SETTINGS, body) })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update system settings' }, { status: 500 })
  }
}
