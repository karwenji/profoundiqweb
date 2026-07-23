'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
  X,
  Filter,
  Inbox,
  PenSquare,
} from 'lucide-react'
import type { Conversation, Message as MessageType, UserOption } from '@/types/communications'

type RecipientMode = 'individual' | 'role' | 'course'

export default function MessagesPage() {
  const { user } = useAuth()
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [threadMessages, setThreadMessages] = useState<MessageType[]>([])
  const [reply, setReply] = useState('')
  const [mode, setMode] = useState<'inbox' | 'compose'>('inbox')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [composeSubject, setComposeSubject] = useState('')
  const [composeBody, setComposeBody] = useState('')
  const [recipientMode, setRecipientMode] = useState<RecipientMode>('individual')
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [availableUsers, setAvailableUsers] = useState<UserOption[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [sentSuccess, setSentSuccess] = useState(false)

  const api = useCallback(
    async (path: string, options: RequestInit = {}) => {
      const res = await fetch(`/api/communications${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...(options.headers || {}),
        },
      })
      const contentType = res.headers.get('content-type') || ''
      const isJson = contentType.includes('application/json')
      if (!isJson) {
        throw new Error(`Server error: expected JSON response from /api/communications${path}, got ${contentType || 'no content-type'}`)
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      return data
    },
    [token]
  )

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) loadThread(selectedConversation)
  }, [selectedConversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [threadMessages])

  const loadConversations = async () => {
    try {
      const data = await api('?resource=conversations')
      setConversations(data.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const loadThread = async (conversationId: string) => {
    try {
      const data = await api(`?resource=messages&conversation_id=${conversationId}`)
      setThreadMessages(data.data || [])
    } catch (e) {
      console.error(e)
    }
  }

  const loadAvailableUsers = async (search = '', role = 'all', courseId?: string) => {
    setUsersLoading(true)
    try {
      const params = new URLSearchParams({ resource: 'users', search, role })
      if (courseId) params.set('course_id', courseId)
      const data = await api(`?${params.toString()}`)
      setAvailableUsers(data.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setUsersLoading(false)
    }
  }

  const resetCompose = () => {
    setMode('inbox')
    setComposeSubject('')
    setComposeBody('')
    setSelectedUserIds([])
    setSelectedRole('')
    setSelectedCourseId('')
    setUserSearch('')
    setRecipientMode('individual')
    setSentSuccess(false)
  }

  const send = async () => {
    const messageBody = mode === 'compose' ? composeBody : reply
    if (!messageBody.trim()) return

    setSending(true)
    try {
      if (mode === 'compose') {
        const payload: Record<string, unknown> = {
          action: 'send_message',
          subject: composeSubject,
          body: composeBody,
        }
        if (recipientMode === 'individual') {
          if (selectedUserIds.length === 0) {
            setSending(false)
            return
          }
          if (selectedUserIds.length === 1) {
            payload.recipient_id = selectedUserIds[0]
          } else {
            payload.recipient_ids = selectedUserIds
          }
        } else if (recipientMode === 'role') {
          payload.group_role = selectedRole
          if (selectedUserIds.length > 0) payload.recipient_ids = selectedUserIds
        } else if (recipientMode === 'course') {
          payload.group_course_id = selectedCourseId
          if (selectedUserIds.length > 0) payload.recipient_ids = selectedUserIds
        }

        const result = await api('', { method: 'POST', body: JSON.stringify(payload) })
        setSentSuccess(true)
        setTimeout(() => {
          resetCompose()
          loadConversations()
          const newConversationId = result.data?.conversation?.id
          if (newConversationId) setSelectedConversation(newConversationId)
        }, 800)
      } else if (selectedConversation) {
        await api(
          `?resource=messages&conversation_id=${selectedConversation}`,
          {
            method: 'POST',
            body: JSON.stringify({
              action: 'send_message',
              conversation_id: selectedConversation,
              body: messageBody,
            }),
          }
        )
        setReply('')
        loadConversations()
        loadThread(selectedConversation)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSending(false)
    }
  }

  const filtered = conversations.filter(
    (c) =>
      (c.other_user_name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.subject ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.last_message ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const nowIso = new Date()
    const diffMs = nowIso.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86_400_000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return date.toLocaleDateString()
  }

  const selectedConvo = selectedConversation ? conversations.find((c) => c.id === selectedConversation) : null

  return (
    <ProtectedRoute permission="send_messages">
      <DashboardLayout>
        <div className="p-6 h-[calc(100vh-4rem)]">
          <div className="flex flex-col lg:flex-row gap-6 h-full">
            <div className={`lg:w-1/3 flex flex-col gap-4 ${selectedConversation || mode === 'compose' ? 'hidden lg:flex' : 'flex'}`}>
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Inbox className="h-6 w-6 text-primary" />
                  Messages
                </h1>
                <Button onClick={() => { resetCompose(); setMode('compose') }} size="sm">
                  <PenSquare className="h-4 w-4 mr-1" />
                  Compose
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
                ) : filtered.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No conversations yet</p>
                      <Button variant="outline" className="mt-3" size="sm" onClick={() => { resetCompose(); setMode('compose') }}>
                        Start a conversation
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  filtered.map((conv) => (
                    <Card
                      key={conv.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedConversation === conv.id ? 'border-primary bg-primary/5' : 'border-transparent'
                      }`}
                      onClick={() => { setSelectedConversation(conv.id); setMode('inbox') }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-gray-900">{conv.other_user_name}</p>
                              <p className="text-xs text-gray-500 capitalize">{(conv.other_user_role ?? '').replace('_', ' ')}</p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap">{conv.last_message_at ? formatTime(conv.last_message_at) : ''}</span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{conv.last_message}</p>
                        {(conv.unread_count ?? 0) > 0 && (
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

            <div className={`lg:w-2/3 flex flex-col ${!selectedConversation && mode !== 'compose' ? 'hidden lg:flex' : 'flex'}`}>
              {mode === 'compose' ? (
                <Card className="flex-1 overflow-y-auto">
                  <CardContent className="pt-6 pb-6 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => { resetCompose(); setMode('inbox') }} className="lg:hidden">
                          <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h2 className="text-xl font-bold text-gray-900">New Message</h2>
                      </div>
                      {sentSuccess && (
                        <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                          Sent
                        </span>
                      )}
                    </div>

                    <div className="space-y-5 flex-1">
                      <div className="space-y-2">
                        <Label>Send To</Label>
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            variant={recipientMode === 'individual' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => { setRecipientMode('individual'); setSelectedRole(''); setSelectedCourseId(''); loadAvailableUsers() }}
                          >
                            <User className="h-4 w-4 mr-1" />
                            Individual
                          </Button>
                          {(user?.role === 'admin' || user?.role === 'super_admin') && (
                            <>
                              <Button
                                variant={recipientMode === 'role' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => { setRecipientMode('role'); setSelectedUserIds([]) }}
                              >
                                <Users className="h-4 w-4 mr-1" />
                                By Role
                              </Button>
                              <Button
                                variant={recipientMode === 'course' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => { setRecipientMode('course'); setSelectedUserIds([]); }}
                              >
                                <GraduationCap className="h-4 w-4 mr-1" />
                                Course Students
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {recipientMode === 'role' && (
                        <div className="space-y-2">
                          <Label>Select User Group</Label>
                          <Select value={selectedRole} onValueChange={(val) => { setSelectedRole(val); setSelectedUserIds([]) }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a group..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">Students</SelectItem>
                              <SelectItem value="instructor">Instructors</SelectItem>
                              <SelectItem value="admin">Admins</SelectItem>
                              {user?.role === 'super_admin' && (
                                <SelectItem value="super_admin">Super Admins</SelectItem>
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

                      {recipientMode === 'course' && (
                        <div className="space-y-2">
                          <Label>Select Course</Label>
                          <Select value={selectedCourseId} onValueChange={(val) => { setSelectedCourseId(val); setSelectedUserIds([]) }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a course..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All courses</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>
                          {recipientMode === 'individual' ? 'Select Recipients' : 'Additional Recipients'}
                        </Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search users..."
                            value={userSearch}
                            onChange={async (e) => {
                              const value = e.target.value
                              setUserSearch(value)
                              const roleParam = recipientMode === 'role' && selectedRole ? selectedRole : 'all'
                              const courseParam = recipientMode === 'course' && selectedCourseId ? selectedCourseId : undefined
                              await loadAvailableUsers(value, roleParam, courseParam)
                            }}
                            onFocus={async () => {
                              if (availableUsers.length === 0) {
                                const roleParam = recipientMode === 'role' && selectedRole ? selectedRole : 'all'
                                await loadAvailableUsers('', roleParam)
                              }
                            }}
                            className="pl-10"
                          />
                        </div>

                        {selectedUserIds.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {selectedUserIds.map((id) => {
                              const found = availableUsers.find((u) => u.id === id)
                              return (
                                <span key={id} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
                                  {found?.name || id}
                                  <button onClick={() => setSelectedUserIds((prev) => prev.filter((x) => x !== id))} className="hover:text-primary/70">
                                    <X className="h-3 w-3" />
                                  </button>
                                </span>
                              )
                            })}
                          </div>
                        )}

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
                                    onClick={() => setSelectedUserIds((prev) => [...prev, u.id])}
                                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left transition-colors"
                                  >
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                      <User className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                                      <p className="text-xs text-gray-500 truncate">{u.email}</p>
                                    </div>
                                    <span className="text-[10px] text-gray-400 capitalize flex-shrink-0">{u.role.replace('_', ' ')}</span>
                                  </button>
                                ))
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Subject</Label>
                        <Input value={composeSubject} onChange={(e) => setComposeSubject(e.target.value)} placeholder="Message subject" />
                      </div>

                      <div className="space-y-2 flex-1">
                        <Label>Message</Label>
                        <Textarea value={composeBody} onChange={(e) => setComposeBody(e.target.value)} placeholder="Type your message..." className="min-h-[150px] resize-none" />
                      </div>

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
                          onClick={send}
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
              ) : selectedConvo ? (
                <Card className="flex-1 flex flex-col overflow-hidden">
                  <div className="p-4 border-b flex items-center gap-3 bg-gray-50">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedConversation(null)} className="lg:hidden">
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{selectedConvo.other_user_name}</p>
                      <p className="text-xs text-gray-500 capitalize">{(selectedConvo.other_user_role ?? '').replace('_', ' ')}</p>
                    </div>
                  </div>

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
                                isMine ? 'bg-primary text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                              }`}
                            >
                              {!isMine && (
                                <p className="text-xs font-semibold mb-1 opacity-70">{msg.sender_name}</p>
                              )}
                              <p className="text-sm leading-relaxed">{msg.body}</p>
                              <div className={`flex items-center gap-1 mt-1 text-[10px] ${isMine ? 'text-white/70' : 'text-gray-400'}`}>
                                <Clock className="h-3 w-3" />
                                <span>{formatTime(msg.created_at)}</span>
                                {isMine && (msg.status === 'read' ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="p-4 border-t bg-gray-50">
                    <div className="flex gap-2">
                      <Input
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Type a reply..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            send()
                          }
                        }}
                        className="flex-1"
                      />
                      <Button onClick={send} disabled={sending || !reply.trim()}>
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
