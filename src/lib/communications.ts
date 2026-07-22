import { 
  type Conversation,
  type Message,
  type Notification,
  type Announcement,
  type CreateMessagePayload,
  type CreateAnnouncementPayload,
  type User,
} from '@/types/communications'
import { users as defaultUsers } from '@/lib/users'

let conversations: Conversation[] = []
let messages: Message[] = []
let notifications: Notification[] = []
let announcements: Announcement[] = []
let conversationSeq = 1
let messageSeq = 1
let notificationSeq = 1
let announcementSeq = 1

const DAY_MS = 86_400_000

function now() {
  return new Date().toISOString()
}

function userById(id: string): User | undefined {
  return defaultUsers.find((u) => u.id === id)
}

function publicUser(id: string): Pick<User, 'id' | 'name' | 'email' | 'role' | 'avatar'> | undefined {
  const u = userById(id)
  if (!u) return undefined
  return { id: u.id, name: u.name, email: u.email, role: u.role, avatar: u.avatar }
}

function seeded(): boolean {
  return conversations.length > 0 || messages.length > 0 || notifications.length > 0 || announcements.length > 0
}

function seed() {
  if (seeded()) return
  const teacher = defaultUsers.find((u) => u.role === 'instructor')!
  const student = defaultUsers.find((u) => u.role === 'student')!
  const admin = defaultUsers.find((u) => u.role === 'admin')!
  const superAdmin = defaultUsers.find((u) => u.role === 'super_admin')!

  announcements.push(
    {
      id: `ann-${announcementSeq++}`,
      title: 'Welcome to Profound IQ',
      body: 'Explore our leadership and marketing programs. Instructors can now submit new courses for approval.',
      priority: 'high',
      target_roles: ['student', 'instructor'],
      created_by: superAdmin.id,
      created_by_name: superAdmin.name,
      is_active: true,
      created_at: new Date(Date.now() - 2 * DAY_MS).toISOString(),
    },
    {
      id: `ann-${announcementSeq++}`,
      title: 'Maintenance window tonight',
      body: 'We will run platform maintenance from 2:00 AM to 4:00 AM EAT. Messaging may be briefly unavailable.',
      priority: 'normal',
      target_roles: ['student', 'instructor', 'admin'],
      created_by: admin.id,
      created_by_name: admin.name,
      is_active: true,
      created_at: new Date(Date.now() - DAY_MS).toISOString(),
    },
  )

  const direct: Conversation = {
    id: `conv-${conversationSeq++}`,
    type: 'direct',
    participants: [student.id, teacher.id],
    created_by: student.id,
    updated_at: new Date(Date.now() - 3 * DAY_MS).toISOString(),
    created_at: new Date(Date.now() - 5 * DAY_MS).toISOString(),
  }
  conversations.push(direct)

  const support: Conversation = {
    id: `conv-${conversationSeq++}`,
    type: 'support',
    participants: [student.id, admin.id],
    subject: 'Support: course access issue',
    created_by: student.id,
    updated_at: new Date(Date.now() - DAY_MS).toISOString(),
    created_at: new Date(Date.now() - 2 * DAY_MS).toISOString(),
  }
  conversations.push(support)

  messages.push(
    {
      id: `msg-${messageSeq++}`,
      conversation_id: direct.id,
      sender_id: student.id,
      body: 'Hi Dr. Johnson, when does the Leadership Excellence Program reopen for new cohorts?',
      status: 'read',
      created_at: new Date(Date.now() - 5 * DAY_MS).toISOString(),
    },
    {
      id: `msg-${messageSeq++}`,
      conversation_id: direct.id,
      sender_id: teacher.id,
      body: 'Hi John! The next cohort starts on the 10th. I have also attached the updated syllabus for you.',
      status: 'read',
      created_at: new Date(Date.now() - 4 * DAY_MS).toISOString(),
    },
    {
      id: `msg-${messageSeq++}`,
      conversation_id: support.id,
      sender_id: student.id,
      body: 'I am unable to resume my last lesson in Digital Marketing Mastery.',
      status: 'read',
      created_at: new Date(Date.now() - 2 * DAY_MS).toISOString(),
    },
    {
      id: `msg-${messageSeq++}`,
      conversation_id: support.id,
      sender_id: admin.id,
      body: 'We have reset your progress marker. Please try again and let me know if the issue continues.',
      status: 'delivered',
      created_at: new Date(Date.now() - DAY_MS).toISOString(),
    },
  )

  notifications.push(
    {
      id: `notif-${notificationSeq++}`,
      user_id: student.id,
      type: 'message',
      title: 'New message from Dr. Sarah Johnson',
      body: 'Hi John! The next cohort starts on the 10th...',
      link: `/dashboard/messages?conversation=${direct.id}`,
      is_read: true,
      created_at: new Date(Date.now() - 4 * DAY_MS).toISOString(),
    },
    {
      id: `notif-${notificationSeq++}`,
      user_id: student.id,
      type: 'announcement',
      title: 'Welcome to Profound IQ',
      body: 'Explore our leadership and marketing programs.',
      link: '/dashboard/student',
      is_read: false,
      created_at: new Date(Date.now() - 2 * DAY_MS).toISOString(),
    },
    {
      id: `notif-${notificationSeq++}`,
      user_id: student.id,
      type: 'system',
      title: 'Support ticket update',
      body: 'We have reset your progress marker.',
      link: `/dashboard/messages?conversation=${support.id}`,
      is_read: false,
      created_at: new Date(Date.now() - DAY_MS).toISOString(),
    },
  )
}

seed()

export function getConversations(userId: string) {
  return conversations
    .filter((c) => c.participants.includes(userId))
    .map((c) => {
      const otherId = c.participants.find((p) => p !== userId)
      const other = otherId ? publicUser(otherId) : undefined
      const thread = messages
        .filter((m) => m.conversation_id === c.id)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      const last = thread[thread.length - 1]
      const unread = thread.filter((m) => m.sender_id !== userId && m.status !== 'read').length

      return {
        id: c.id,
        type: c.type,
        other_user_id: other?.id,
        other_user_name: other?.name ?? 'Unknown',
        other_user_role: other?.role ?? '',
        other_user_avatar: other?.avatar,
        subject: c.subject,
        last_message: last?.body ?? '',
        last_message_at: last?.created_at ?? c.updated_at,
        is_read: last ? last.status === 'read' : true,
        unread_count: unread,
      }
    })
    .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
}

export function getMessages(conversationId: string) {
  return messages
    .filter((m) => m.conversation_id === conversationId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((m) => {
      const sender = publicUser(m.sender_id)
      return {
        ...m,
        sender_name: sender?.name,
        sender_role: sender?.role,
      }
    })
}

export function getAnnouncementsForUser(userId: string, role: string) {
  return announcements
    .filter((a) => {
      if (!a.is_active) return false
      if (!a.target_roles || a.target_roles.length === 0) return true
      return a.target_roles.includes(role)
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function getNotificationsForUser(userId: string) {
  return notifications
    .filter((n) => n.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function getUnreadNotificationCount(userId: string) {
  return notifications.filter((n) => n.user_id === userId && !n.is_read).length
}

export function searchUsers(term: string, filterRole?: string) {
  const q = term.toLowerCase()
  return defaultUsers
    .filter((u) => {
      const matchesTerm = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      const matchesRole = !filterRole || filterRole === 'all' || u.role === filterRole
      return matchesTerm && matchesRole
    })
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar,
    }))
}

export function getUsersForRole(role: string) {
  return defaultUsers
    .filter((u) => u.role === role)
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar,
    }))
}

export function getCoursesForStudents() {
  return []
}

export function createConversation(payload: CreateMessagePayload, currentUserId: string): Conversation {
  let participantIds: string[] = []

  if (payload.recipient_ids && payload.recipient_ids.length > 0) {
    participantIds = [currentUserId, ...payload.recipient_ids]
  } else if (payload.recipient_id) {
    participantIds = [currentUserId, payload.recipient_id]
  } else if (payload.group_role) {
    const matches = defaultUsers.filter((u) => u.role === payload.group_role && u.id !== currentUserId)
    participantIds = [currentUserId, ...matches.map((u) => u.id)]
  } else if (payload.group_course_id) {
    participantIds = [currentUserId]
  }

  const convo: Conversation = {
    id: `conv-${conversationSeq++}`,
    type: payload.group_role ? 'group' : payload.group_course_id ? 'group' : 'direct',
    participants: Array.from(new Set(participantIds)),
    subject: payload.subject,
    created_by: currentUserId,
    updated_at: now(),
    created_at: now(),
  }
  conversations.push(convo)
  return convo
}

export function sendMessage(conversationId: string, senderId: string, body: string): Message {
  const convo = conversations.find((c) => c.id === conversationId)
  const msg: Message = {
    id: `msg-${messageSeq++}`,
    conversation_id: conversationId,
    sender_id: senderId,
    body,
    status: 'sent',
    created_at: now(),
  }
  messages.push(msg)
  if (convo) convo.updated_at = now()

  const recipientIds = convo?.participants.filter((p) => p !== senderId) ?? []
  const sender = publicUser(senderId)
  recipientIds.forEach((rid) => {
    const existing = notifications.find((n) => n.user_id === rid && n.type === 'message' && n.link?.includes(conversationId))
    if (!existing) {
      notifications.push({
        id: `notif-${notificationSeq++}`,
        user_id: rid,
        type: 'message',
        title: `New message from ${sender?.name ?? 'a user'}`,
        body: body.length > 120 ? `${body.slice(0, 120)}...` : body,
        link: `/dashboard/messages?conversation=${conversationId}`,
        is_read: false,
        created_at: now(),
      })
    }
  })

  return msg
}

export function createAnnouncement(payload: CreateAnnouncementPayload, createdBy: string): Announcement {
  const creator = publicUser(createdBy)
  const ann: Announcement = {
    id: `ann-${announcementSeq++}`,
    title: payload.title,
    body: payload.body,
    priority: payload.priority ?? 'normal',
    target_roles: payload.target_roles,
    target_course_ids: payload.target_course_ids,
    created_by: createdBy,
    created_by_name: creator?.name,
    is_active: true,
    created_at: now(),
  }
  announcements.push(ann)

  const roles = payload.target_roles && payload.target_roles.length > 0 ? payload.target_roles : defaultUsers.map((u) => u.role)
  const seen = new Set<string>()
  defaultUsers.forEach((u) => {
    if (!seen.has(u.id) && roles.includes(u.role) && u.id !== createdBy) {
      seen.add(u.id)
      notifications.push({
        id: `notif-${notificationSeq++}`,
        user_id: u.id,
        type: 'announcement',
        title: `Announcement: ${payload.title}`,
        body: payload.body.length > 120 ? `${payload.body.slice(0, 120)}...` : payload.body,
        is_read: false,
        created_at: now(),
      })
    }
  })

  return ann
}

export function markNotificationRead(notificationId: string) {
  const n = notifications.find((n) => n.id === notificationId)
  if (n) n.is_read = true
}

export function markAllNotificationsRead(userId: string) {
  notifications.forEach((n) => {
    if (n.user_id === userId) n.is_read = true
  })
}

export function deleteNotification(notificationId: string) {
  const idx = notifications.findIndex((n) => n.id === notificationId)
  if (idx >= 0) notifications.splice(idx, 1)
}

export function clearReadNotifications(userId: string) {
  for (let i = notifications.length - 1; i >= 0; i--) {
    const n = notifications[i]
    if (n.user_id === userId && n.is_read) notifications.splice(i, 1)
  }
}
