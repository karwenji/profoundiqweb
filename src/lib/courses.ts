import { courses as courseData } from '@/data/courses'
import { Course } from '@/types'

export function getPendingCourses(): Course[] {
  return courseData.filter(c => c.status === 'pending')
}

export function approveCourse(courseId: string): boolean {
  const course = courseData.find(c => c.id === courseId)
  if (course) {
    course.status = 'published'
    return true
  }
  return false
}

export function rejectCourse(courseId: string): boolean {
  const course = courseData.find(c => c.id === courseId)
  if (course) {
    course.status = 'rejected'
    return true
  }
  return false
}
