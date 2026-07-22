'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { BookOpen, Play, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { courses } from '@/data/courses'

function StudentCoursesPage() {
  const { user } = useAuth()

  // Mock enrolled courses for student
  const enrolledCourses = [
    {
      id: '1',
      title: 'Leadership Excellence Program',
      progress: 65,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
      lastAccessed: '2 days ago',
      nextLesson: 'Module 4: Strategic Decision Making',
    },
    {
      id: '2',
      title: 'Digital Marketing Mastery',
      progress: 30,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
      lastAccessed: '1 week ago',
      nextLesson: 'Module 2: SEO Fundamentals',
    },
  ]

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Courses</h1>
          <p className="text-gray-600">Continue your learning journey.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {enrolledCourses.map((course) => (
            <Card key={course.id}>
              <CardContent className="pt-6">
                <div className="relative h-40 w-full mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">Next: {course.nextLesson}</p>
                <p className="text-xs text-gray-500 mb-4">Last accessed: {course.lastAccessed}</p>
                <Link href={`/courses/${course.id}`}>
                  <Button className="w-full">
                    <Play className="mr-2 h-4 w-4" /> Continue Learning
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Browse More Courses</h2>
          <Link href="/courses">
            <Button variant="outline">View Course Catalog</Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function StudentCoursesPageWrapper() {
  return (
    <ProtectedRoute permission="enroll_courses">
      <StudentCoursesPage />
    </ProtectedRoute>
  )
}
