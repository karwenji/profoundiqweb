import type { XPTransactionSource, Badge, BadgeCriteria, XPContext, StreakUpdateResult, StreakRecord } from '@/types/courseWorkflow'
import type { User } from '@/lib/users'
import { getStreakRecord, getOrCreateStreakRecord, addXPTransaction, getAllBadges, getTotalXPForUser } from '@/lib/courseWorkflow'
import { users } from '@/lib/users'

const BASE_XP: Record<XPTransactionSource, number> = {
  lesson_complete: 20,
  module_complete: 100,
  course_complete: 500,
  daily_login: 5,
  quiz_perfect: 50,
  assignment_on_time: 40,
  streak_bonus: 0,
  peer_help: 30,
  admin_adjustment: 0,
}

export function calculateXPForAction(source: XPTransactionSource, context: XPContext): number {
  let xp = BASE_XP[source] ?? 0

  if (source === 'lesson_complete' || source === 'daily_login') {
    const streakMultiplier = Math.min(2, 1 + (context.streakDays * 0.01))
    xp = Math.round(xp * streakMultiplier)
  }

  if (context.level > 5) {
    xp = Math.round(xp * (1 + (context.level - 5) * 0.05))
  }

  return xp
}

export function calculateLevel(totalXP: number): number {
  return Math.floor(Math.sqrt(totalXP / 100)) + 1
}

export function awardXP(userId: string, amount: number, source: XPTransactionSource, metadata?: Record<string, unknown>): { newTotalXP: number; newLevel: number; leveledUp: boolean } {
  const tx = addXPTransaction({
    userId,
    amount,
    source,
    metadata,
  })
  const newTotalXP = getTotalXPForUser(userId)
  const newLevel = calculateLevel(newTotalXP)
  return { newTotalXP, newLevel, leveledUp: false }
}

export function updateStreak(userId: string, activityDate: string): StreakUpdateResult {
  const record = getOrCreateStreakRecord(userId)

  const lastDate = record.lastActivityDate ? new Date(record.lastActivityDate) : null
  const today = new Date(activityDate)
  today.setHours(0, 0, 0, 0)

  if (!lastDate) {
    record.currentStreak = 1
    record.longestStreak = 1
    record.lastActivityDate = activityDate
    return { streak: 1, longestStreak: 1, bonusMultiplier: 1.01, milestones: [] }
  }

  const daysSince = Math.floor((today.getTime() - lastDate.getTime()) / 86400000)

  if (daysSince === 0) {
    return { streak: record.currentStreak, longestStreak: record.longestStreak, bonusMultiplier: Math.min(2, 1 + record.currentStreak * 0.01), milestones: [] }
  }

  if (daysSince === 1) {
    record.currentStreak += 1
    record.lastActivityDate = activityDate
    if (record.currentStreak > record.longestStreak) record.longestStreak = record.currentStreak
    return { streak: record.currentStreak, longestStreak: record.longestStreak, bonusMultiplier: Math.min(2, 1 + record.currentStreak * 0.01), milestones: getStreakMilestones(record.currentStreak) }
  }

  if (daysSince === 2 && record.streakFreezes > 0) {
    record.streakFreezes -= 1
    record.lastFreezeUsedDate = activityDate
    record.lastActivityDate = activityDate
    return { streak: record.currentStreak, longestStreak: record.longestStreak, bonusMultiplier: Math.min(2, 1 + record.currentStreak * 0.01), milestones: [], freezeUsed: true }
  }

  record.currentStreak = 1
  record.lastActivityDate = activityDate
  return { streak: 1, longestStreak: record.longestStreak, bonusMultiplier: 1.01, milestones: [], streakReset: true }
}

function getStreakMilestones(streak: number): number[] {
  const milestones = [3, 7, 14, 21, 30, 50, 75, 100]
  return milestones.filter(m => streak === m)
}

export function checkBadgeEligibility(userId: string, action: XPTransactionSource, context: XPContext): Badge[] {
  const user = users.find(u => u.id === userId)
  if (!user) return []

  const newlyEarned: Badge[] = []
  const allBadges = getAllBadges()
  const userBadges = (user as any).badges || []

  for (const badge of allBadges) {
    if (userBadges.includes(badge.id)) continue
    if (!matchesBadgeCriteria(user, action, badge, context)) continue

    newlyEarned.push(badge)
    if (badge.xpReward > 0) {
      awardXP(userId, badge.xpReward, 'admin_adjustment', { reason: `Badge: ${badge.name}` })
    }
  }

  return newlyEarned
}

function matchesBadgeCriteria(user: User, action: XPTransactionSource, badge: Badge, context: XPContext): boolean {
  const criteria = badge.criteria
  switch (criteria.type) {
    case 'lesson_count': {
      if (action !== 'lesson_complete') return false
      const count = getXPTransactionsForUser(user.id).filter((t: { source: string }) => t.source === 'lesson_complete').length
      return count >= criteria.threshold
    }
    case 'module_complete':
      return action === 'module_complete'
    case 'streak_days': {
      const streak = getStreakRecord(user.id)
      return (streak?.currentStreak || 0) >= criteria.threshold
    }
    case 'quiz_score':
      return action === 'quiz_perfect'
    case 'course_complete':
      return action === 'course_complete'
    default:
      return false
  }
}

export function getXPTransactionsForUser(userId: string) {
  return require('@/lib/courseWorkflow').getXPTransactionsForUser(userId)
}

export { addXPTransaction, getAllBadges, getLeaderboard, getCertificatesForUser, getOrCreateStreakRecord, getStreakRecord as getStreakRecordEntity } from '@/lib/courseWorkflow'
