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
  MessageSquare,
  Send,
  Search,
  Plus,
  ArrowLeft,
  User,
  Clock,
  Check,
  CheckCheck,
  Loader2,
  Trash2,
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

export default function MessagesPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [threadMessages, setThreadMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const [composeTo, setComposeTo] = useState('')
  const [composeSubject, setComposeSubject] = useState('')
  const [composeBody, setComposeBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
      const payload = isComposing
        ? { recipient_id: composeTo, subject: composeSubject, body: composeBody }
        : { recipient_id: selectedConversation, subject: 'Re: Message', body: newMessage }

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
        if (isComposing) {
          setIsComposing(false)
          setComposeTo('')
          setComposeSubject('')
          setComposeBody('')
          setSelectedConversation(composeTo)
        } else {
          setNewMessage('')
        }
        fetchConversations()
        if (selectedConversation || composeTo) {
          fetchThread(selectedConversation || composeTo)
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
    <ProtectedRoute>
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
                <Card className="flex-1">
                  <CardContent className="pt-6 pb-6 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6">
                      <Button variant="ghost" size="icon" onClick={() => setIsComposing(false)} className="lg:hidden">
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                      <h2 className="text-xl font-bold text-gray-900">New Message</h2>
                    </div>
                    <div className="space-y-4 flex-1">
                      <div className="space-y-2">
                        <Label>To (User ID)</Label>
                        <Input
                          value={composeTo}
                          onChange={(e) => setComposeTo(e.target.value)}
                          placeholder="Enter recipient user ID"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Subject</Label>
                        <Input
                          value={composeSubject}
                          onChange={(e) => setComposeSubject(e.target.value)}
                          placeholder="Message subject"
                        />
                      </div>
                      <div className="space-y-2 flex-1">
                        <Label>Message</Label>
                        <Textarea
                          value={composeBody}
                          onChange={(e) => setComposeBody(e.target.value)}
                          placeholder="Type your message..."
                          className="min-h-[200px] resize-none"
                        />
                      </div>
                      <Button onClick={sendMessage} disabled={sending || !composeTo || !composeBody} className="w-full">
                        {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                        Send Message
                      </Button>
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
