import { NextResponse } from 'next/server'
import { getApiUrl } from '@/lib/api/client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000'

const USERS = [
  { id: 'u-1', name: 'Stephen Mwihaki', email: 'superadmin@profoundiqconsulting.com', role: 'super_admin' as const },
  { id: 'u-2', name: 'Admin User', email: 'admin@profoundiqconsulting.com', role: 'admin' as const },
  { id: 'u-3', name: 'Dr. Sarah Johnson', email: 'sarah@profoundiqconsulting.com', role: 'instructor' as const },
  { id: 'u-4', name: 'John Student', email: 'student@profoundiqconsulting.com', role: 'student' as const },
]

async function tryBackend(token: string) {
  try {
    const res = await fetch(`${API_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    const json = await res.json()
    return json.data || json.user || null
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    if (token.startsWith('fallback-')) {
      const payload = JSON.parse(Buffer.from(token.replace('fallback-', ''), 'base64').toString())
      const user = USERS.find(u => u.id === payload.id)
      if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      return NextResponse.json({ success: true, data: user })
    }

    const backendUser = await tryBackend(token)
    if (backendUser) {
      return NextResponse.json({ success: true, data: backendUser })
    }

    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const body = await request.json()

    if (token.startsWith('fallback-')) {
      const payload = JSON.parse(Buffer.from(token.replace('fallback-', ''), 'base64').toString())
      const user = USERS.find(u => u.id === payload.id)
      if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      const updated = { ...user, ...body }
      return NextResponse.json({ success: true, data: updated })
    }

    const res = await fetch(`${API_URL}/api/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
