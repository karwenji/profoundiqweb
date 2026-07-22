'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'

const CATEGORIES = [
  { value: 'leadership', label: 'Leadership' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'technology', label: 'Technology' },
  { value: 'business', label: 'Business' },
  { value: 'design', label: 'Design' },
]

const STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
]

function EditCoursePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    instructor: '',
    category: '',
    price: '',
    duration: '',
    lessons: '',
    description: '',
    image: '',
    status: 'published',
    adminSplit: '40',
  })

  useEffect(() => {
    const courseId = params.id as string
    if (!courseId) return

    fetch(`/api/courses/${courseId}`)
      .then(res => {
        if (!res.ok) throw new Error('not_found')
        return res.json()
      })
      .then(result => {
        if (result.success && result.data) {
          const course = result.data
          setFormData({
            title: course.title || '',
            instructor: course.instructor || '',
            category: course.category || '',
            price: course.price?.toString() || '',
            duration: course.duration || '8 weeks',
            lessons: course.lessons?.toString() || '12',
            description: course.description || '',
            image: course.image || '',
            status: course.status || 'published',
            adminSplit: course.adminSplit?.toString() || '40',
          })
        } else {
          setNotFound(true)
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setFetching(false))
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/courses/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          instructor: formData.instructor,
          category: formData.category,
          price: parseFloat(formData.price) || 0,
          duration: formData.duration,
          lessons: parseInt(formData.lessons) || 12,
          description: formData.description,
          image: formData.image,
          status: formData.status,
          adminSplit: parseInt(formData.adminSplit) || 40,
        }),
      })

      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update course')
      }

      router.push('/dashboard/admin/courses')
    } catch (err: any) {
      alert(err.message || 'Failed to update course')
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (fetching) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading course details...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (notFound) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
            <p className="text-gray-600 mb-4">The course you're trying to edit doesn't exist.</p>
            <Link href="/dashboard/admin/courses">
              <Button>Back to Courses</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <Link href="/dashboard/admin/courses">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Edit Course</h1>
          <p className="text-gray-600">Update course parameters and details.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Course Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Course Title</Label>
                  <Input
                    placeholder="Enter course title"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Instructor Name</Label>
                  <Input
                    placeholder="Enter instructor name"
                    value={formData.instructor}
                    onChange={(e) => handleChange('instructor', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
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
                  <Label>Price (NGN)</Label>
                  <Input
                    type="number"
                    placeholder="Enter price"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Duration</Label>
                  <Input
                    placeholder="e.g., 8 weeks"
                    value={formData.duration}
                    onChange={(e) => handleChange('duration', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Number of Lessons</Label>
                  <Input
                    type="number"
                    placeholder="Enter number of lessons"
                    value={formData.lessons}
                    onChange={(e) => handleChange('lessons', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Admin Revenue Split (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Default: 40"
                    value={formData.adminSplit}
                    onChange={(e) => handleChange('adminSplit', e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Instructor will receive {100 - parseInt(formData.adminSplit || '40')}%</p>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Enter course description..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label>Image URL</Label>
                <Input
                  placeholder="https://..."
                  value={formData.image}
                  onChange={(e) => handleChange('image', e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-4">
                <Link href="/dashboard/admin/courses">
                  <Button variant="outline" type="button">Cancel</Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default function EditCoursePageWrapper() {
  return (
    <ProtectedRoute permission="manage_courses">
      <EditCoursePage />
    </ProtectedRoute>
  )
}
