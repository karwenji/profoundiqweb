'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { MessageSquare, Send } from 'lucide-react'
import { useState } from 'react'

function InstructorMessagesPage() {
  const { user } = useAuth()
  const [message, setMessage] = useState('')

  const messages = [
    { id: 1, from: 'John Doe', subject: 'Question about Assignment 3', time: '2 hours ago', read: false },
    { id: 2, from: 'Jane Smith', subject: 'Course Feedback', time: '5 hours ago', read: true },
    { id: 3, from: 'Mike Johnson', subject: 'Extension Request', time: '1 day ago', read: false },
  ]

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Messages</h1>
          <p className="text-gray-600">Communicate with your students.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <Card className="lg:col-span-1">
            <CardContent className="pt-6">
              <h3 className="font-bold mb-4">Inbox</h3>
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${!msg.read ? 'bg-blue-50' : ''}`}>
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm">{msg.from}</h4>
                      <span className="text-xs text-gray-500">{msg.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{msg.subject}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Message Composition */}
          <Card className="lg:col-span-2">
            <CardContent className="pt-6">
              <h3 className="font-bold mb-4">Compose Message</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">To</label>
                  <input
                    type="text"
                    placeholder="Student name or email"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <input
                    type="text"
                    placeholder="Message subject"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-32"
                    placeholder="Type your message here..."
                  />
                </div>
                <Button>
                  <Send className="mr-2 h-4 w-4" /> Send Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function InstructorMessagesPageWrapper() {
  return (
    <ProtectedRoute>
      <InstructorMessagesPage />
    </ProtectedRoute>
  )
}
