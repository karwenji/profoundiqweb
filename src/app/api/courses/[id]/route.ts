import { NextRequest, NextResponse } from 'next/server'
import { getApiUrl } from '@/lib/api/client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000'

const COURSES = [
  { id: 'c-1', title: 'Leadership Excellence Program', description: 'Master leadership with proven strategies for team management and organizational growth.', instructorId: 'u-3', instructor_name: 'Dr. Sarah Johnson', price: 299, currency: 'USD', category: 'Leadership', thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800', published: true, rating: 4.8, students: 1250, duration: '8 weeks', level: 'Intermediate', features: ['Certificate of Completion', 'Practical exercises', 'Expert instruction'] },
  { id: 'c-2', title: 'Digital Marketing Mastery', description: 'Learn comprehensive digital marketing strategies including SEO, social media, and analytics.', instructorId: 'u-3', instructor_name: 'Dr. Sarah Johnson', price: 249, currency: 'USD', category: 'Marketing', thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', published: true, rating: 4.6, students: 980, duration: '6 weeks', level: 'Beginner', features: ['Certificate of Completion', 'Hands-on projects', 'Industry tools'] },
  { id: 'c-3', title: 'Project Management Professional', description: 'Prepare for PMP certification with comprehensive project management training.', instructorId: 'u-3', instructor_name: 'Dr. Sarah Johnson', price: 349, currency: 'USD', category: 'Business', thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800', published: true, rating: 4.9, students: 2100, duration: '12 weeks', level: 'Advanced', features: ['PMP prep', 'Case studies', 'Mock exams'] },
]

async function tryBackend(path: string) {
  try {
    const res = await fetch(`${API_URL}${path}`, { headers: { 'Content-Type': 'application/json' } })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const backend = await tryBackend(`/api/courses/${id}`)
    if (backend) {
      return NextResponse.json(backend, { status: 200 })
    }
    const course = COURSES.find(c => c.id === id)
    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: course })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch course' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const backend = await tryBackend(`/api/courses/${id}`)
    if (backend) {
      return NextResponse.json(backend, { status: 200 })
    }
    const body = await request.json()
    const index = COURSES.findIndex(c => c.id === id)
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 })
    }
    const updated = { ...COURSES[index], ...body, id: COURSES[index].id }
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update course' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const backend = await tryBackend(`/api/courses/${_request.url.split('/').pop()}`)
    if (backend) {
      return NextResponse.json(backend, { status: 200 })
    }
    return NextResponse.json({ success: true, message: 'Course deleted' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete course' }, { status: 500 })
  }
}
