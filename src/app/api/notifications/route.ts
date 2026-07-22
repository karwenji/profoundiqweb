import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function getAuthHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}

async function proxyFetch(token: string, path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}/api/notifications${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(token),
      ...options.headers,
    },
  })
  const data = await response.json()
  return NextResponse.json(data, { status: response.status })
}

// GET /api/notifications - Get user notifications
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    return proxyFetch(token, '')
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch notifications' }, { status: 500 })
  }
}

// PATCH /api/notifications - Mark notification as read or mark all read
export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    if (body.markAllRead) {
      return proxyFetch(token, '/read-all', { method: 'PATCH' })
    }
    if (body.id) {
      return proxyFetch(token, `/${body.id}/read`, { method: 'PATCH' })
    }

    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update notification' }, { status: 500 })
  }
}

// DELETE /api/notifications - Delete notification(s)
export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, clearRead } = body

    if (clearRead) {
      return proxyFetch(token, '', { method: 'DELETE' })
    }
    if (id) {
      return proxyFetch(token, `/${id}`, { method: 'DELETE' })
    }

    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete notification' }, { status: 500 })
  }
}
