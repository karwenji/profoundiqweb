import { NextRequest, NextResponse } from 'next/server'
import { courses as mockCourses } from '@/data/courses'

const defaultCurriculum = [
  { id: 'l1', title: 'Introduction', duration: '30 min', isFree: true },
  { id: 'l2', title: 'Core Concepts', duration: '45 min', isFree: false },
  { id: 'l3', title: 'Practical Application', duration: '60 min', isFree: false },
]

let courses = [...mockCourses]
let nextId = Math.max(...courses.map(c => Number(c.id))) + 1

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const published = searchParams.get('published')
    const category = searchParams.get('category')

    let results = courses
    if (published === 'true') {
      results = results.filter(c => c.status === 'published')
    }
    if (category) {
      results = results.filter(c => c.category === category)
    }

    return NextResponse.json({ success: true, data: results })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch courses' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, instructor, category, price, level, duration, lessons, image, status, adminSplit } = body

    if (!title || !instructor) {
      return NextResponse.json({ success: false, error: 'Title and instructor are required' }, { status: 400 })
    }

    const newCourse = {
      id: String(nextId++),
      title,
      description: description || '',
      instructor,
      category: category || 'business',
      price: typeof price === 'number' ? price : 0,
      originalPrice: undefined,
      image: image || '/course-placeholder.png',
      level: level || 'Beginner',
      duration: duration || '8 weeks',
      students: 0,
      rating: 0,
      lessons: typeof lessons === 'number' ? lessons : 12,
      curriculum: defaultCurriculum,
      features: ['Certificate of Completion'],
      status: status || 'draft',
      adminSplit: typeof adminSplit === 'number' ? adminSplit : 40,
    }

    courses.push(newCourse)
    return NextResponse.json({ success: true, data: newCourse }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create course' }, { status: 500 })
  }
}
