import { NextRequest, NextResponse } from 'next/server'
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
import { getRolePermissions, hasPermission } from '@/lib/roles'
import { users } from '@/lib/users'

function getCurrentUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  try {
    const token = authHeader.split(' ')[1]
    const decoded = JSON.parse(atob(token))
    const currentUser = users.find((u) => u.id === decoded.userId)
    if (!currentUser) return null
    return { id: currentUser.id, role: currentUser.role }
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

function authOr401(request: NextRequest) {
  const user = getCurrentUser(request)
  if (!user) return { error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) }
  return { user, error: null as null }
}

export async function GET(request: NextRequest) {
  const auth = authOr401(request)
  if (auth.error) return auth.error
  const user = auth.user!

  const { searchParams } = new URL(request.url)
  const resource = searchParams.get('resource')

  if (resource === 'conversations') {
    return ok(getConversations(user.id))
  }

  if (resource === 'messages') {
    const conversationId = searchParams.get('conversation_id')
    if (!conversationId) return fail('conversation_id is required')
    return ok(getMessages(conversationId))
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
}

export async function POST(request: NextRequest) {
  const auth = authOr401(request)
  if (auth.error) return auth.error
  const user = auth.user!

  const body = await request.json()
  const { action } = body

  if (action === 'send_message') {
    const { conversation_id, recipient_id, recipient_ids, group_role, group_course_id, subject, body: messageBody } = body
    if (!messageBody || (!conversation_id && !recipient_id && !recipient_ids && !group_role && !group_course_id)) {
      return fail('Message body and at least one recipient are required')
    }

    if (conversation_id) {
      const msg = sendMessage(conversation_id, user.id, messageBody)
      return ok({ message: msg, sent_count: 1 })
    }

    const conversation = createConversation(
      {
        conversation_id,
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

  if (action === 'create_announcement') {
    if (!hasPermission(user.role, 'system_settings') && !hasPermission(user.role, 'announcements')) {
      return fail('Forbidden', 403)
    }
    const { title, body: announcementBody, priority, target_roles, target_course_ids } = body
    if (!title || !announcementBody) return fail('Title and body are required')

    const ann = createAnnouncement(
      { title, body: announcementBody, priority, target_roles, target_course_ids },
      user.id
    )
    return ok(ann)
  }

  return fail('Unknown action')
}

export async function PATCH(request: NextRequest) {
  const auth = authOr401(request)
  if (auth.error) return auth.error
  const user = auth.user!

  const body = await request.json()
  const { notification_id, mark_all_read } = body

  if (mark_all_read) {
    markAllNotificationsRead(user.id)
    return ok({ success: true })
  }

  if (notification_id) {
    markNotificationRead(notification_id)
    return ok({ success: true })
  }

  return fail('Invalid request')
}

export async function DELETE(request: NextRequest) {
  const auth = authOr401(request)
  if (auth.error) return auth.error
  const user = auth.user!

  const body = await request.json()
  const { notification_id, clear_read } = body

  if (clear_read) {
    clearReadNotifications(user.id)
    return ok({ success: true })
  }

  if (notification_id) {
    deleteNotification(notification_id)
    return ok({ success: true })
  }

  return fail('Invalid request')
}
