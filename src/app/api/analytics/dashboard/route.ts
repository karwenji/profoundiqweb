import { NextResponse } from 'next/server'
import { getSuperAdminStats, getAdminStats, getInstructorStats, getStudentStats } from '@/lib/analytics'
import { courses } from '@/data/courses'
import { users } from '@/lib/users'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') // 'summary' or 'detailed'

    // Basic stats
    let stats
    switch (role) {
      case 'super_admin':
        stats = getSuperAdminStats()
        break
      case 'admin':
        stats = getAdminStats()
        break
      case 'instructor':
        stats = getInstructorStats(userId)
        break
      case 'student':
        stats = getStudentStats(userId)
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid role' },
          { status: 400 }
        )
    }

    // If detailed report data is requested
    if (type === 'detailed') {
      const categoryData = courses.reduce((acc: any[], course) => {
        const existing = acc.find(item => item.name === course.category)
        if (existing) {
          existing.value += course.students
        } else {
          acc.push({ name: course.category, value: course.students })
        }
        return acc
      }, [])

      const revenueByCourse = courses.map(course => ({
        name: course.title,
        revenue: course.price * course.students,
        students: course.students,
      }))

      const userRoleDistribution = [
        { name: 'Students', value: users.filter(u => u.role === 'student').length },
        { name: 'Instructors', value: users.filter(u => u.role === 'instructor').length },
        { name: 'Admins', value: users.filter(u => u.role === 'admin' || u.role === 'super_admin').length },
      ]

      const monthlyGrowth = [
        { month: 'Jan', users: 800, revenue: 120000, courses: 120 },
        { month: 'Feb', users: 850, revenue: 135000, courses: 125 },
        { month: 'Mar', users: 920, revenue: 158000, courses: 130 },
        { month: 'Apr', users: 1000, revenue: 180000, courses: 138 },
        { month: 'May', users: 1100, revenue: 210000, courses: 145 },
        { month: 'Jun', users: stats.totalUsers, revenue: stats.monthlyRevenue * 6, courses: stats.totalCourses },
      ]

      return NextResponse.json({ 
        success: true, 
        data: stats,
        reports: {
          categoryData,
          revenueByCourse,
          userRoleDistribution,
          monthlyGrowth
        }
      })
    }

    return NextResponse.json({ success: true, data: stats })
  } catch (error) {
    console.error('Analytics API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
