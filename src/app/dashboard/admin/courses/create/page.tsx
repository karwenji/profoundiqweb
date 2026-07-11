'use client'

import { useState } from 'react'
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
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function CreateCoursePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    instructor: '',
    category: '',
    price: '',
    duration: '',
    lessons: '',
    description: '',
    image: '',
    adminSplit: '40',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // In a real app, this would send data to the backend API
    // The backend would then create the course and generate its page
    setTimeout(() => {
      setLoading(false)
      // Redirect to the courses list after successful creation
      router.push('/dashboard/admin/courses')
    }, 2000)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
          <h1 className="text-3xl font-bold mb-2">Create New Course</h1>
          <p className="text-gray-600">Add a new course to the platform. A dedicated page will be automatically generated.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
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
                      <SelectItem value="leadership">Leadership</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
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
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Create Course
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

export default function CreateCoursePageWrapper() {
  return (
    <ProtectedRoute>
      <CreateCoursePage />
    </ProtectedRoute>
  )
}
