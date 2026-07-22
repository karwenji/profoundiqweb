'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MessageSquare,
  Send,
  Search,
  Plus,
  ArrowLeft,
  User,
  Users,
  GraduationCap,
  Clock,
  Check,
  CheckCheck,
  Loader2,
  Trash2,
  X,
  ChevronDown,
  Filter,
} from 'lucide-react'

interface Message {
  id: string
  sender_id: string
  recipient_id: string
  subject: string
  body: string
  is_read: number
  created_at: string
  sender_name?: string
  sender_role?: string
}

interface Conversation {
  last_message_id: string
  other_user_id: string
  other_user_name: string
  other_user_role: string
  subject: string
  last_message: string
  last_message_at: string
  is_read: number
  unread_count: number
}

interface UserOption {
  id: string
  name: string
  email: string
  role: string
}

interface CourseOption {
  id: string
  title: string
}

type RecipientMode = 'individual' | 'role' | 'course'

export default function MessagesPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [threadMessages, setThreadMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const [composeSubject, setComposeSubject] = useState('')
  const [composeBody, setComposeBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Compose recipient state
  const [recipientMode, setRecipientMode] = useState<RecipientMode>('individual')
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [availableUsers, setAvailableUsers] = useState<UserOption[]>([])
  const [availableCourses, setAvailableCourses] = useState<CourseOption[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [sentSuccess, setSentSuccess] = useState<string | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchThread(selectedConversation)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [threadMessages])

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/messages', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const result = await response.json()
      if (result.success) {
        setConversations(result.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableUsers = async (search?: string, role?: string, courseId?: string) => {
    setUsersLoading(true)
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({ users: 'true' })
      if (search) params.set('search', search)
      if (role && role !== 'all') params.set('role', role)
      if (courseId) params.set('course_id', courseId)

      const response = await fetch(`/api/messages?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const result = await response.json()
      if (result.success) {
        setAvailableUsers(result.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setUsersLoading(false)
    }
  }

  const fetchAvailableCourses = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/messages?courses=true', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const result = await response.json()
      if (result.success) {
        setAvailableCourses(result.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    }
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const resetCompose = () => {
    setIsComposing(false)
    setComposeSubject('')
    setComposeBody('')
    setSelectedUserIds([])
    setSelectedRole('')
    setSelectedCourseId('')
    setUserSearch('')
    setRecipientMode('individual')
    setSentSuccess(null)
  }

  const fetchThread = async (userId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/messages?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const result = await response.json()
      if (result.success) {
        setThreadMessages(result.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch thread:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() && !composeBody.trim()) return

    setSending(true)
    try {
      const token = localStorage.getItem('token')

      if (isComposing) {
        // Build payload based on recipient mode
        let payload: Record<string, unknown> = { subject: composeSubject, body: composeBody }

        if (recipientMode === 'individual') {
          if (selectedUserIds.length === 1) {
            payload.recipient_id = selectedUserIds[0]
          } else if (selectedUserIds.length > 1) {
            payload.recipient_ids = selectedUserIds
          } else {
            setSending(false)
            return
          }
        } else if (recipientMode === 'role') {
          payload.group_role = selectedRole
          if (selectedUserIds.length > 0) payload.recipient_ids = selectedUserIds
        } else if (recipientMode === 'course') {
          payload.group_course_id = selectedCourseId
          if (selectedUserIds.length > 0) payload.recipient_ids = selectedUserIds
        }

        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        })

        const result = await response.json()
        if (result.success) {
          const count = result.data?.sent_count || 1
          setSentSuccess(`Message sent to ${count} recipient${count > 1 ? 's' : ''}!`)
          setTimeout(() => {
            resetCompose()
            fetchConversations()
          }, 2000)
        }
      } else {
        // Reply in thread
        const payload = { recipient_id: selectedConversation, subject: 'Re: Message', body: newMessage }
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        })

        const result = await response.json()
        if (result.success) {
          setNewMessage('')
          fetchConversations()
          if (selectedConversation) fetchThread(selectedConversation)
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  const filteredConversations = conversations.filter(
    (c) =>
      c.other_user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <ProtectedRoute permission="send_messages">
      <DashboardLayout>
        <div className="p-6 h-[calc(100vh-4rem)]">
          <div className="flex flex-col lg:flex-row gap-6 h-full">
            {/* Conversations List */}
            <div className={`lg:w-1/3 flex flex-col gap-4 ${selectedConversation || isComposing ? 'hidden lg:flex' : 'flex'}`}>
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-primary" />
                  Messages
                </h1>
                <Button onClick={() => { setIsComposing(true); setSelectedConversation(null) }} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-2">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No conversations yet</p>
                    <Button variant="outline" className="mt-3" onClick={() => setIsComposing(true)}>
                      Start a conversation
                    </Button>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <Card
                      key={conv.other_user_id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedConversation === conv.other_user_id
                          ? 'border-primary bg-primary/5'
                          : 'border-transparent'
                      }`}
                      onClick={() => {
                        setSelectedConversation(conv.other_user_id)
                        setIsComposing(false)
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-gray-900">{conv.other_user_name}</p>
                              <p className="text-xs text-gray-500 capitalize">{conv.other_user_role.replace('_', ' ')}</p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap">{formatTime(conv.last_message_at)}</span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{conv.last_message}</p>
                        {conv.unread_count > 0 && (
                          <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 mt-2 text-xs font-bold text-white bg-primary rounded-full">
                            {conv.unread_count}
                          </span>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Message Thread / Compose */}
            <div className={`lg:w-2/3 flex flex-col ${!selectedConversation && !isComposing ? 'hidden lg:flex' : 'flex'}`}>
              {isComposing ? (
                <Card className="flex-1 overflow-y-auto">
                  <CardContent className="pt-6 pb-6 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={resetCompose} className="lg:hidden">
                          <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h2 className="text-xl font-bold text-gray-900">New Message</h2>
                      </div>
                      {sentSuccess && (
                        <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full animate-in fade-in duration-300">
                          ✓ {sentSuccess}
                        </span>
                      )}
                    </div>

                    <div className="space-y-5 flex-1">
                      {/* Recipient Mode Selector */}
                      <div className="space-y-2">
                        <Label>Send To</Label>
                        <div className="flex gap-2">
                          <Button
                            variant={recipientMode === 'individual' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => { setRecipientMode('individual'); setSelectedRole(''); setSelectedCourseId(''); fetchAvailableUsers() }}
                          >
                            <User className="h-4 w-4 mr-1" />
                            Individual
                          </Button>
                          {(user?.role === 'admin' || user?.role === 'super_admin') && (
                            <>
                              <Button
                                variant={recipientMode === 'role' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => { setRecipientMode('role'); setSelectedUserIds([]); }}
                              >
                                <Users className="h-4 w-4 mr-1" />
                                By Role
                              </Button>
                              <Button
                                variant={recipientMode === 'course' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => { setRecipientMode('course'); setSelectedUserIds([]); fetchAvailableCourses() }}
                              >
                                <GraduationCap className="h-4 w-4 mr-1" />
                                Course Students
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Role Group Selector */}
                      {recipientMode === 'role' && (
                        <div className="space-y-2">
                          <Label>Select User Group</Label>
                          <Select value={selectedRole} onValueChange={(val) => { setSelectedRole(val); setSelectedUserIds([]) }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a user group..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">All Students</SelectItem>
                              <SelectItem value="instructor">All Instructors</SelectItem>
                              <SelectItem value="admin">All Admins</SelectItem>
                              {user?.role === 'super_admin' && (
                                <SelectItem value="super_admin">All Super Admins</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          {selectedRole && (
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Filter className="h-3 w-3" />
                              Message will be sent to all {selectedRole.replace('_', ' ')}s
                            </p>
                          )}
                        </div>
                      )}

                      {/* Course Group Selector */}
                      {recipientMode === 'course' && (
                        <div className="space-y-2">
                          <Label>Select Course</Label>
                          <Select value={selectedCourseId} onValueChange={(val) => { setSelectedCourseId(val); setSelectedUserIds([]) }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a course..." />
                            </SelectTrigger>
                            <SelectContent>
                              {availableCourses.map((course) => (
                                <SelectItem key={course.id} value={course.id}>
                                  {course.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {selectedCourseId && (
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <GraduationCap className="h-3 w-3" />
                              Message will be sent to all students enrolled in this course
                            </p>
                          )}
                        </div>
                      )}

                      {/* Individual User Picker / Additional Recipients for Groups */}
                      <div className="space-y-2">
                        <Label>
                          {recipientMode === 'individual'
                            ? 'Select Recipients'
                            : 'Additional Recipients (optional)'}
                        </Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search users by name or email..."
                            value={userSearch}
                            onChange={(e) => {
                              setUserSearch(e.target.value)
                              const params: Record<string, string> = {}
                              if (recipientMode === 'role' && selectedRole) params.role = selectedRole
                              if (recipientMode === 'course' && selectedCourseId) params.course_id = selectedCourseId
                              fetchAvailableUsers(e.target.value, params.role, params.course_id)
                            }}
                            onFocus={() => {
                              if (availableUsers.length === 0) {
                                const params: Record<string, string> = {}
                                if (recipientMode === 'role' && selectedRole) params.role = selectedRole
                                if (recipientMode === 'course' && selectedCourseId) params.course_id = selectedCourseId
                                fetchAvailableUsers('', params.role, params.course_id)
                              }
                            }}
                            className="pl-10"
                          />
                        </div>

                        {/* Selected Users Chips */}
                        {selectedUserIds.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {selectedUserIds.map((id) => {
                              const u = availableUsers.find((au) => au.id === id)
                              return (
                                <span key={id} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
                                  {u?.name || id}
                                  <button onClick={() => toggleUserSelection(id)} className="hover:text-primary/70">
                                    <X className="h-3 w-3" />
                                  </button>
                                </span>
                              )
                            })}
                          </div>
                        )}

                        {/* User List Dropdown */}
                        {(userSearch || recipientMode !== 'individual') && availableUsers.length > 0 && (
                          <div className="border rounded-lg max-h-48 overflow-y-auto divide-y">
                            {usersLoading ? (
                              <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                              </div>
                            ) : (
                              availableUsers
                                .filter((u) => !selectedUserIds.includes(u.id))
                                .map((u) => (
                                  <button
                                    key={u.id}
                                    onClick={() => toggleUserSelection(u.id)}
                                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left transition-colors"
                                  >
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                      <User className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                                      <p className="text-xs text-gray-500 truncate">{u.email}</p>
                                    </div>
                                    <span className="text-[10px] text-gray-400 capitalize flex-shrink-0">
                                      {u.role.replace('_', ' ')}
                                    </span>
                                  </button>
                                ))
                            )}
                          </div>
                        )}
                      </div>

                      {/* Subject */}
                      <div className="space-y-2">
                        <Label>Subject</Label>
                        <Input
                          value={composeSubject}
                          onChange={(e) => setComposeSubject(e.target.value)}
                          placeholder="Message subject"
                        />
                      </div>

                      {/* Body */}
                      <div className="space-y-2 flex-1">
                        <Label>Message</Label>
                        <Textarea
                          value={composeBody}
                          onChange={(e) => setComposeBody(e.target.value)}
                          placeholder="Type your message..."
                          className="min-h-[150px] resize-none"
                        />
                      </div>

                      {/* Recipient Summary & Send */}
                      <div className="border-t pt-4 space-y-3">
                        <div className="text-xs text-gray-500">
                          {recipientMode === 'individual' && selectedUserIds.length > 0 && (
                            <span>Sending to {selectedUserIds.length} recipient{selectedUserIds.length > 1 ? 's' : ''}</span>
                          )}
                          {recipientMode === 'role' && selectedRole && (
                            <span>Sending to all {selectedRole.replace('_', ' ')}s{selectedUserIds.length > 0 ? ` + ${selectedUserIds.length} additional` : ''}</span>
                          )}
                          {recipientMode === 'course' && selectedCourseId && (
                            <span>Sending to enrolled students{selectedUserIds.length > 0 ? ` + ${selectedUserIds.length} additional` : ''}</span>
                          )}
                        </div>
                        <Button
                          onClick={sendMessage}
                          disabled={
                            sending ||
                            !composeBody.trim() ||
                            (recipientMode === 'individual' && selectedUserIds.length === 0) ||
                            (recipientMode === 'role' && !selectedRole) ||
                            (recipientMode === 'course' && !selectedCourseId)
                          }
                          className="w-full"
                        >
                          {sending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Send className="h-4 w-4 mr-2" />
                          )}
                          {recipientMode === 'individual' && selectedUserIds.length > 1
                            ? `Send to ${selectedUserIds.length} Recipients`
                            : recipientMode !== 'individual'
                            ? 'Send to Group'
                            : 'Send Message'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : selectedConversation ? (
                <Card className="flex-1 flex flex-col overflow-hidden">
                  {/* Thread Header */}
                  <div className="p-4 border-b flex items-center gap-3 bg-gray-50">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedConversation(null)}
                      className="lg:hidden"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        {conversations.find((c) => c.other_user_id === selectedConversation)?.other_user_name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {conversations.find((c) => c.other_user_id === selectedConversation)?.other_user_role.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                    {threadMessages.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <p>No messages in this conversation</p>
                      </div>
                    ) : (
                      threadMessages.map((msg) => {
                        const isMine = msg.sender_id === user?.id
                        return (
                          <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div
                              className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                                isMine
                                  ? 'bg-primary text-white rounded-br-sm'
                                  : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                              }`}
                            >
                              {!isMine && (
                                <p className="text-xs font-semibold mb-1 opacity-70">{msg.sender_name}</p>
                              )}
                              <p className="text-sm leading-relaxed">{msg.body}</p>
                              <div className={`flex items-center gap-1 mt-1 text-[10px] ${isMine ? 'text-white/70' : 'text-gray-400'}`}>
                                <Clock className="h-3 w-3" />
                                <span>{formatTime(msg.created_at)}</span>
                                {isMine && (
                                  msg.is_read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Reply Input */}
                  <div className="p-4 border-t bg-gray-50">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a reply..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            sendMessage()
                          }
                        }}
                        className="flex-1"
                      />
                      <Button onClick={sendMessage} disabled={sending || !newMessage.trim()}>
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg">Select a conversation to start messaging</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
