import { z } from 'zod'

export const sendMessageSchema = z.object({
  conversation_id: z.string().uuid().optional(),
  recipient_id: z.string().min(1).optional(),
  recipient_ids: z.array(z.string().min(1)).optional(),
  group_role: z.enum(['student', 'instructor', 'admin', 'super_admin']).optional(),
  group_course_id: z.string().uuid().optional(),
  subject: z.string().max(200).optional(),
  body: z.string().min(1).max(5000),
  type: z.enum(['direct', 'group', 'support']).optional(),
})

export const createAnnouncementSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(10000),
  priority: z.enum(['low', 'normal', 'high']).optional(),
  target_roles: z.array(z.enum(['student', 'instructor', 'admin', 'super_admin'])).optional(),
  target_course_ids: z.array(z.string().uuid()).optional(),
})

export const bulkMessageSchema = z.object({
  recipient_ids: z.array(z.string().min(1)).optional(),
  group_role: z.enum(['student', 'instructor', 'admin', 'super_admin', 'all']).optional(),
  group_course_id: z.string().uuid().optional(),
  subject: z.string().max(200).optional(),
  body: z.string().min(1).max(5000),
})
