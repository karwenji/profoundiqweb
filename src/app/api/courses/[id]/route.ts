import { NextRequest, NextResponse } from 'next/server'
import { courses as mockCourses } from '@/data/courses'

let courses = [...mockCourses]
let nextId = Math.max(...courses.map(c => Number(c.id)), 0) + 1

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  try {
    const course = courses.find(c => c.id.toString() === id)
    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: course })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch course' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  try {
    const body = await request.json()
    const index = courses.findIndex(c => c.id.toString() === id)
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 })
    }

    const updated = {
      ...courses[index],
      ...body,
      id: courses[index].id,
    }

    courses[index] = updated
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update course' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  try {
    const index = courses.findIndex(c => c.id.toString() === id)
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 })
    }

    courses.splice(index, 1)
    return NextResponse.json({ success: true, message: 'Course deleted' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete course' }, { status: 500 })
  }
}
