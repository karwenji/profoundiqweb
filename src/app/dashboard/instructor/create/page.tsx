'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { FileText, Save, Loader2, CheckCircle } from 'lucide-react'
import { useState } from 'react'

const CATEGORIES = [
  { value: 'leadership', label: 'Leadership' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'technology', label: 'Technology' },
  { value: 'business', label: 'Business' },
  { value: 'design', label: 'Design' },
]

const LEVELS = [
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
]

function CreateCoursePage() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    level: 'Beginner',
    price: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          instructor: user?.name || '',
          instructor_id: user?.id,
          category: form.category,
          price: parseFloat(form.price) || 0,
          duration: form.level === 'Beginner' ? '4 weeks' : form.level === 'Intermediate' ? '8 weeks' : '12 weeks',
          lessons: form.level === 'Beginner' ? 8 : form.level === 'Intermediate' ? 16 : 24,
          image: '/course-placeholder.png',
          status: 'draft',
          adminSplit: 40,
        }),
      })

      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create course')
      }

      setSuccess(true)
      setForm({ title: '', description: '', category: '', level: 'Beginner', price: '' })
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to create course')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Course</h1>
          <p className="text-gray-600">Add a new course to the platform.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Course created successfully!
          </div>
        )}

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label>Course Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Enter course title"
                  required
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe your course"
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(value) => handleChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Level</Label>
                  <Select value={form.level} onValueChange={(value) => handleChange('level', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Price (NGN)</Label>
                  <Input
                    type="number"
                    value={form.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading || !form.title}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Draft
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default function CreateCoursePageWrapper() {
  return (
    <ProtectedRoute permission="create_courses">
      <CreateCoursePage />
    </ProtectedRoute>
  )
}
