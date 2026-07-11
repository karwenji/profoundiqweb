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

function StudentSupportPage() {
  const { user } = useAuth()
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject || !category || !message) return

    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      setSubject('')
      setCategory('')
      setMessage('')
      setTimeout(() => setSuccess(false), 3000)
    }, 1500)
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <Link href="/dashboard/student">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Student Support</h1>
          <p className="text-gray-600">Get help with your courses, billing, or technical issues.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Support Form */}
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
                      <SelectItem value="course">Course Access</SelectItem>
                      <SelectItem value="billing">Billing & Payments</SelectItem>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="certificate">Certificate Issue</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
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

                <Button type="submit" className="w-full" disabled={loading}>
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

          {/* FAQ / Contact Info */}
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

export default function StudentSupportPageWrapper() {
  return (
    <ProtectedRoute>
      <StudentSupportPage />
    </ProtectedRoute>
  )
}
