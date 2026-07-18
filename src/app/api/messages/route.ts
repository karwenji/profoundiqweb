import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const userId = request.nextUrl.searchParams.get('userId')
    const unreadOnly = request.nextUrl.searchParams.get('unread')
    const usersList = request.nextUrl.searchParams.get('users')
    const coursesList = request.nextUrl.searchParams.get('courses')
    const role = request.nextUrl.searchParams.get('role')
    const courseId = request.nextUrl.searchParams.get('course_id')
    const search = request.nextUrl.searchParams.get('search')

    let url = `${API_URL}/api/messages`
    if (userId) {
      url += `/${userId}`
    } else if (unreadOnly === 'count') {
      url += '/unread/count'
    } else if (usersList === 'true') {
      url += '/users'
      const params = new URLSearchParams()
      if (role) params.set('role', role)
      if (courseId) params.set('course_id', courseId)
      if (search) params.set('search', search)
      const qs = params.toString()
      if (qs) url += `?${qs}`
    } else if (coursesList === 'true') {
      url += '/courses'
    }

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const body = await request.json()
    const isBulk = body.recipient_ids || body.group_role || body.group_course_id

    const endpoint = isBulk ? '/api/messages/bulk' : '/api/messages'
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to send message' }, { status: 500 })
  }
}
