import { NextRequest, NextResponse } from 'next/server'
import { getApiUrl } from '@/lib/api/client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000'

async function tryBackend(path: string) {
  try {
    const res = await fetch(`${API_URL}${path}`, { headers: { 'Content-Type': 'application/json' } })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const role = url.searchParams.get('role') || 'student'
    const backend = await tryBackend(`/api/analytics/dashboard?${url.searchParams.toString()}`)
    if (backend) {
      return NextResponse.json(backend, { status: 200 })
    }

    const fallbackData: Record<string, any> = {
      student: {
        role: 'student',
        stats: {
          enrolledCourses: 3,
          completedCourses: 1,
          inProgressCourses: 2,
          certificatesEarned: 1,
          totalXP: 1250,
          level: 3,
          streakDays: 7,
          longestStreak: 14,
          learningHours: 48,
          totalSpent: 597,
        },
        courses: [
          { id: 'c-1', title: 'Leadership Excellence Program', progress: 66, lastAccessed: new Date(Date.now() - 2 * 86400000).toISOString(), totalLessons: 42, completedLessons: 28 },
          { id: 'c-2', title: 'Digital Marketing Mastery', progress: 31, lastAccessed: new Date(Date.now() - 86400000).toISOString(), totalLessons: 38, completedLessons: 12 },
          { id: 'c-3', title: 'Project Management Professional', progress: 100, lastAccessed: new Date(Date.now() - 7 * 86400000).toISOString(), totalLessons: 45, completedLessons: 45 },
        ],
      },
      instructor: {
        role: 'instructor',
        stats: {
          totalCourses: 3,
          activeCourses: 3,
          totalStudents: 1230,
          totalRevenue: 125000,
          monthlyRevenue: 15000,
          averageRating: 4.7,
          completionRate: 85,
        },
      },
      admin: {
        role: 'admin',
        stats: {
          totalStudents: 10247,
          activeCourses: 52,
          totalRevenue: 452300,
          monthlyRevenue: 45230,
          completionRate: 78,
        },
        recentEnrollments: [
          { id: '1', student: 'John Doe', course: 'Leadership Excellence', date: '2 hours ago', amount: 299 },
          { id: '2', student: 'Jane Smith', course: 'Digital Marketing Mastery', date: '5 hours ago', amount: 249 },
          { id: '3', student: 'Mike Johnson', course: 'Project Management Professional', date: '1 day ago', amount: 349 },
          { id: '4', student: 'Sarah Williams', course: 'Data Analytics for Business', date: '2 days ago', amount: 279 },
        ],
      },
      super_admin: {
        role: 'super_admin',
        stats: {
          totalStudents: 10247,
          activeCourses: 52,
          totalRevenue: 452300,
          monthlyRevenue: 45230,
          completionRate: 78,
        },
        recentEnrollments: [
          { id: '1', student: 'John Doe', course: 'Leadership Excellence', date: '2 hours ago', amount: 299 },
          { id: '2', student: 'Jane Smith', course: 'Digital Marketing Mastery', date: '5 hours ago', amount: 249 },
        ],
      },
    }

    return NextResponse.json({ success: true, data: fallbackData[role] || fallbackData.student })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
