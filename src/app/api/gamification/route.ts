import { NextRequest, NextResponse } from 'next/server'
import { getAllBadges, getLeaderboard, getXPTransactionsForUser, addXPTransaction, calculateLevel, checkBadgeEligibility } from '@/lib/gamification/xp'
import { getOrCreateStreakRecord, getCertificatesForUser } from '@/lib/courseWorkflow'
import { users } from '@/lib/users'

export async function GET(request: NextRequest, { params }: { params: Promise<{ courseId?: string }> }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const userId = token ? decodeToken(token) : undefined
    if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const url = new URL(request.url)
    const resource = url.searchParams.get('resource') || 'overview'

    switch (resource) {
      case 'badges':
        return NextResponse.json({ success: true, data: getAllBadges() })
      case 'badges/earned': {
        const user = users.find(u => u.id === userId)
        const badges = getAllBadges().filter(b => (user as any)?.badges?.includes(b.id))
        return NextResponse.json({ success: true, data: badges })
      }
      case 'xp/history':
        return NextResponse.json({ success: true, data: getXPTransactionsForUser(userId) })
      case 'leaderboard': {
        const scope = (url.searchParams.get('scope') || 'platform') as 'course' | 'platform'
        const period = (url.searchParams.get('period') || 'alltime') as 'week' | 'alltime'
        const entries = getLeaderboard(scope, period)
        const currentUserEntry = entries.find(e => e.userId === userId)
        return NextResponse.json({ success: true, data: { entries, currentUser: currentUserEntry } })
      }
      case 'streak': {
        const streak = getOrCreateStreakRecord(userId)
        return NextResponse.json({ success: true, data: streak })
      }
      case 'certificates':
        return NextResponse.json({ success: true, data: getCertificatesForUser(userId) })
      case 'overview': {
        const streak = getOrCreateStreakRecord(userId)
        const totalXP = getXPTransactionsForUser(userId).reduce((sum: number, t: { amount: number }) => sum + t.amount, 0)
        const level = calculateLevel(totalXP)
        return NextResponse.json({ success: true, data: { totalXP, level, streak, badgesEarned: (users.find(u => u.id === userId) as any)?.badges?.length || 0 } })
      }
      default:
        return NextResponse.json({ success: false, error: 'Unknown resource' }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch gamification data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ courseId?: string }> }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const userId = token ? decodeToken(token) : undefined
    if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { action } = body

    if (action === 'award_xp') {
      const { amount, source, metadata, targetUserId } = body
      const targetId = targetUserId || userId
      const result = addXPTransaction({
        userId: targetId,
        amount,
        source: source === 'lesson_complete' ? 'lesson_complete' : 'admin_adjustment',
        metadata: metadata || { reason: 'Manual award' },
      })
      return NextResponse.json({ success: true, data: result })
    }

    if (action === 'check_badges') {
      const badges = checkBadgeEligibility(userId, body.source || 'lesson_complete', { streakDays: 0, level: 1 })
      return NextResponse.json({ success: true, data: badges })
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to process gamification action' }, { status: 500 })
  }
}

function decodeToken(token: string): string | undefined {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
    return decoded.userId
  } catch {
    return undefined
  }
}
