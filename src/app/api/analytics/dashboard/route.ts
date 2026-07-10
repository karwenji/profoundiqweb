import { NextResponse } from 'next/server'
import { getSuperAdminStats, getAdminStats, getInstructorStats, getStudentStats } from '@/lib/analytics'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const userId = searchParams.get('userId')

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

    return NextResponse.json({ success: true, data: stats })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
