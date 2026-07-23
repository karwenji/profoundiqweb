import { NextRequest, NextResponse } from 'next/server'
import { getApiUrl } from '@/lib/api/client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000'

const USERS = [
  { id: 'u-1', name: 'Stephen Mwihaki', email: 'superadmin@profoundiqconsulting.com', role: 'super_admin', phone: '+254 700 000 000', bio: 'Platform administrator' },
  { id: 'u-2', name: 'Admin User', email: 'admin@profoundiqconsulting.com', role: 'admin', phone: '+254 711 000 000', bio: 'System administrator' },
  { id: 'u-3', name: 'Dr. Sarah Johnson', email: 'sarah@profoundiqconsulting.com', role: 'instructor', phone: '+254 722 000 000', bio: 'Leadership expert' },
  { id: 'u-4', name: 'John Student', email: 'student@profoundiqconsulting.com', role: 'student', phone: '+254 733 000 000', bio: 'Eager learner' },
]

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
    const url = new URL(request.url)
    const query = url.searchParams.toString()
    const backend = await tryBackend(`/api/users${query ? `?${query}` : ''}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
    if (backend) {
      return NextResponse.json(backend, { status: 200 })
    }
    return NextResponse.json({ success: true, data: USERS })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const body = await request.json()
    const backend = await tryBackend('/api/users', { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: JSON.stringify(body) })
    if (backend) {
      return NextResponse.json(backend, { status: 200 })
    }
    const newUser = {
      id: `u-${Date.now()}`,
      name: body.name || 'New User',
      email: body.email || '',
      role: body.role || 'student',
      phone: body.phone || '',
      bio: body.bio || '',
    }
    return NextResponse.json({ success: true, data: newUser }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
