export type MessageStatus = 'draft' | 'sent' | 'delivered' | 'read'
export type NotificationType = 'message' | 'announcement' | 'system' | 'enrollment' | 'payment' | 'approval'
export type AnnouncementPriority = 'low' | 'normal' | 'high'
export type ConversationType = 'direct' | 'group' | 'support' | 'announcement'

export interface User {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
}

export interface Conversation {
  id: string
  type: ConversationType
  participants: string[]
  subject?: string
  created_by?: string
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
  other_user_id?: string
  other_user_name?: string
  other_user_role?: string
  other_user_avatar?: string
  last_message?: string
  last_message_at?: string
  is_read?: boolean
  unread_count?: number
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  status: MessageStatus
  metadata?: Record<string, unknown>
  created_at: string
  sender_name?: string
  sender_role?: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string
  link?: string
  metadata?: Record<string, unknown>
  is_read: boolean
  created_at: string
}

export interface Announcement {
  id: string
  title: string
  body: string
  priority: AnnouncementPriority
  target_roles?: string[]
  target_course_ids?: string[]
  created_by: string
  created_by_name?: string
  is_active: boolean
  created_at: string
}

export interface CommunicationsResponse<T> {
  success: boolean
  data: T
  error?: string
}

export interface CreateMessagePayload {
  conversation_id?: string
  recipient_id?: string
  recipient_ids?: string[]
  group_role?: string
  group_course_id?: string
  subject?: string
  body: string
  type?: ConversationType
}

export interface CreateAnnouncementPayload {
  title: string
  body: string
  priority?: AnnouncementPriority
  target_roles?: string[]
  target_course_ids?: string[]
}

export interface UserOption {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
}
