import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  getConversations,
  getMessages,
  getAnnouncementsForUser,
  getNotificationsForUser,
  getUnreadNotificationCount,
  searchUsers,
  getUsersForRole,
  getCoursesForStudents,
  createConversation,
  sendMessage,
  createAnnouncement,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearReadNotifications,
} from '@/lib/communications'
import { hasPermission } from '@/lib/roles'
import { users } from '@/lib/users'
import { sendMessageSchema, createAnnouncementSchema, bulkMessageSchema } from '@/lib/validations/communications'

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000'

const FALLBACK_USERS = [
  { id: 'u-1', name: 'Stephen Mwihaki', email: 'superadmin@profoundiqconsulting.com', role: 'super_admin' },
  { id: 'u-2', name: 'Admin User', email: 'admin@profoundiqconsulting.com', role: 'admin' },
  { id: 'u-3', name: 'Dr. Sarah Johnson', email: 'sarah@profoundiqconsulting.com', role: 'instructor' },
  { id: 'u-4', name: 'John Student', email: 'student@profoundiqconsulting.com', role: 'student' },
]

type CurrentUser = { id: string; role: string; name: string; email: string }

function getCurrentUser(request: NextRequest): CurrentUser | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  try {
    const token = authHeader.split(' ')[1]
    const payload = token.startsWith('fallback-')
      ? JSON.parse(Buffer.from(token.replace('fallback-', ''), 'base64').toString())
      : JSON.parse(atob(token))
    const userId = payload.userId || payload.id
    if (!userId) return null
    const currentUser = users.find((u) => u.id === userId) || FALLBACK_USERS.find((u) => u.id === userId)
    if (!currentUser) return null
    return { id: currentUser.id, role: currentUser.role, name: currentUser.name, email: currentUser.email }
  } catch {
    return null
  }
}

function ok<T>(data: T) {
  return NextResponse.json({ success: true, data } as { success: true; data: T })
}

function fail(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message } as { success: false; error: string }, { status })
}

async function proxyToBackend(request: NextRequest, path: string): Promise<NextResponse | null> {
  try {
    const token = request.headers.get('authorization') ?? ''
    const url = new URL(request.url)
    const backendUrl = `${BACKEND}/api/messages${path}${url.search}`

    const res = await fetch(backendUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: ['POST', 'PATCH', 'DELETE'].includes(request.method) ? await request.text() : undefined,
      cache: 'no-store',
    })

    const contentType = res.headers.get('content-type') || ''
    const isJson = contentType.includes('application/json')
    if (!isJson) {
      return null
    }

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const user = getCurrentUser(request)
  if (!user) return fail('Unauthorized', 401)

  try {
    const { searchParams } = new URL(request.url)
    const resource = searchParams.get('resource')

    if (resource === 'thread') {
      const conversationId = searchParams.get('conversation_id')
      if (!conversationId) return fail('conversation_id is required')

      const backendResponse = await proxyToBackend(request, `/thread/${conversationId}`)
      if (backendResponse) return backendResponse

      return ok(getMessages(conversationId))
    }

    if (resource === 'messages' && searchParams.get('conversation_id')) {
      const backendResponse = await proxyToBackend(request, request.nextUrl.search)
      if (backendResponse) return backendResponse
      return ok(getMessages(searchParams.get('conversation_id')!))
    }

    if (resource === 'search') {
      const q = searchParams.get('q')
      if (!q) return ok([])
      const backendResponse = await proxyToBackend(request, `/search?q=${encodeURIComponent(q)}`)
      if (backendResponse) return backendResponse
      return ok([])
    }

    const backendResponse = await proxyToBackend(request, request.nextUrl.search)
    if (backendResponse) return backendResponse

    if (resource === 'conversations') {
      return ok(getConversations(user.id))
    }

    if (resource === 'announcements') {
      return ok(getAnnouncementsForUser(user.id, user.role))
    }

    if (resource === 'notifications') {
      return ok(getNotificationsForUser(user.id))
    }

    if (resource === 'notifications/unread-count') {
      return ok({ count: getUnreadNotificationCount(user.id) })
    }

    if (resource === 'users') {
      const search = searchParams.get('search') || ''
      const role = searchParams.get('role') || 'all'
      return ok(searchUsers(search, role))
    }

    if (resource === 'users/role') {
      const role = searchParams.get('role')
      if (!role) return fail('role is required')
      return ok(getUsersForRole(role))
    }

    if (resource === 'courses') {
      return ok(getCoursesForStudents())
    }

    return fail('Unknown resource')
  } catch (error) {
    console.error('Communications GET error:', error)
    return fail('Failed to process request', 500)
  }
}

export async function POST(request: NextRequest) {
  const user = getCurrentUser(request)
  if (!user) return fail('Unauthorized', 401)

  try {
    const body = await request.json()
    const { action } = body

    if (action === 'send_message') {
      const parsed = sendMessageSchema.safeParse(body)
      if (!parsed.success) {
        return fail(parsed.error.errors.map((e) => e.message).join(', '), 400)
      }

      const backendResponse = await proxyToBackend(request, '')
      if (backendResponse) return backendResponse

      const { conversation_id, recipient_id, recipient_ids, group_role, group_course_id, subject, body: messageBody } = parsed.data

      if (conversation_id) {
        const msg = sendMessage(conversation_id, user.id, messageBody)
        return ok({ message: msg, sent_count: 1 })
      }

      const conversation = createConversation(
        {
          recipient_id,
          recipient_ids,
          group_role,
          group_course_id,
          subject,
          body: messageBody,
          type: group_role || group_course_id ? 'group' : 'direct',
        },
        user.id
      )

      const msg = sendMessage(conversation.id, user.id, messageBody)
      return ok({ message: msg, conversation, sent_count: conversation.participants.length - 1 })
    }

    if (action === 'bulk_message') {
      const parsed = bulkMessageSchema.safeParse(body)
      if (!parsed.success) {
        return fail(parsed.error.errors.map((e) => e.message).join(', '), 400)
      }

      const backendResponse = await proxyToBackend(request, '/bulk')
      if (backendResponse) return backendResponse

      const { subject, body: messageBody } = parsed.data
      const conversation = createConversation(
        {
          recipient_id: (parsed.data.recipient_ids || [])[0],
          recipient_ids: parsed.data.recipient_ids,
          group_role: parsed.data.group_role,
          group_course_id: parsed.data.group_course_id,
          subject,
          body: messageBody,
          type: parsed.data.group_role && parsed.data.group_role !== 'all' ? 'group' : 'direct',
        },
        user.id
      )

      const msg = sendMessage(conversation.id, user.id, messageBody)
      return ok({ message: msg, conversation, sent_count: conversation.participants.length - 1 })
    }

    if (action === 'create_announcement') {
      if (!hasPermission(user.role, 'system_settings') && !hasPermission(user.role, 'announcements')) {
        return fail('Forbidden', 403)
      }
      const parsed = createAnnouncementSchema.safeParse(body)
      if (!parsed.success) {
        return fail(parsed.error.errors.map((e) => e.message).join(', '), 400)
      }

      const backendResponse = await proxyToBackend(request, '')
      if (backendResponse) return backendResponse

      const { title, body: announcementBody, priority, target_roles, target_course_ids } = parsed.data
      const ann = createAnnouncement(
        { title, body: announcementBody, priority, target_roles, target_course_ids },
        user.id
      )
      return ok(ann)
    }

    return fail('Unknown action')
  } catch (error) {
    console.error('Communications POST error:', error)
    return fail('Failed to process request', 500)
  }
}

export async function PATCH(request: NextRequest) {
  const user = getCurrentUser(request)
  if (!user) return fail('Unauthorized', 401)

  try {
    const body = await request.json()
    const { notification_id, mark_all_read } = body

    const backendResponse = await proxyToBackend(request, request.nextUrl.search)
    if (backendResponse) return backendResponse

    if (mark_all_read) {
      markAllNotificationsRead(user.id)
      return ok({ success: true })
    }

    if (notification_id) {
      markNotificationRead(notification_id)
      return ok({ success: true })
    }

    return fail('Invalid request')
  } catch (error) {
    console.error('Communications PATCH error:', error)
    return fail('Failed to process request', 500)
  }
}

export async function DELETE(request: NextRequest) {
  const user = getCurrentUser(request)
  if (!user) return fail('Unauthorized', 401)

  try {
    const body = await request.json()
    const { notification_id, clear_read } = body

    const backendResponse = await proxyToBackend(request, request.nextUrl.search)
    if (backendResponse) return backendResponse

    if (clear_read) {
      clearReadNotifications(user.id)
      return ok({ success: true })
    }

    if (notification_id) {
      deleteNotification(notification_id)
      return ok({ success: true })
    }

    return fail('Invalid request')
  } catch (error) {
    console.error('Communications DELETE error:', error)
    return fail('Failed to process request', 500)
  }
}
