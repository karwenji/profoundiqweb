'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { MessageSquare, Send, CheckCircle, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const SUPPORT_CATEGORIES = [
  { value: 'course', label: 'Course Access' },
  { value: 'billing', label: 'Billing & Payments' },
  { value: 'technical', label: 'Technical Issue' },
  { value: 'certificate', label: 'Certificate Issue' },
  { value: 'other', label: 'Other' },
]

function SupportPage() {
  const { user } = useAuth()
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject || !category || !message) return

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const token = localStorage.getItem('token')
      const subjectLine = `[${category.toUpperCase()}] ${subject}`

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipient_id: 'ad-001',
          subject: subjectLine,
          body: message,
        }),
      })

      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to send support ticket')
      }

      setSuccess(true)
      setSubject('')
      setCategory('')
      setMessage('')
      setTimeout(() => setSuccess(false), 4000)
    } catch (err: any) {
      setError(err.message || 'Failed to send support ticket')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard/student">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Student Support</h1>
          <p className="text-gray-600">Get help with your courses, billing, or technical issues.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Support ticket submitted successfully! We will get back to you soon.
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Submit a Ticket</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Subject</Label>
                  <Input
                    placeholder="Brief description of your issue"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label>Message</Label>
                  <Textarea
                    placeholder="Please provide detailed information about your issue..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading || !subject || !category || !message}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" /> Ticket Submitted!
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" /> Submit Ticket
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">How do I access my courses?</h4>
                  <p className="text-sm text-gray-600">Go to "My Courses" in the sidebar to see all your enrolled courses.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">When will I receive my certificate?</h4>
                  <p className="text-sm text-gray-600">Certificates are generated automatically upon 100% course completion.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">How do I update my payment method?</h4>
                  <p className="text-sm text-gray-600">Visit the "Billing" section in your dashboard to manage payment methods.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span>Send us a message via the Messages page</span>
                  </p>
                  <p><strong>Email:</strong> support@profoundiq.com</p>
                  <p><strong>Phone:</strong> +234 800 123 4567</p>
                  <p><strong>Hours:</strong> Mon-Fri, 9am - 6pm WAT</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function SupportPageWrapper() {
  return (
    <ProtectedRoute>
      <SupportPage />
    </ProtectedRoute>
  )
}