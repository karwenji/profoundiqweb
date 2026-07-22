export type ContentType = 'video' | 'text' | 'quiz' | 'assignment' | 'reflection'
export type UnlockRule = 'sequential' | 'all_open' | 'prerequisite'
export type XPTransactionSource =
  | 'lesson_complete'
  | 'module_complete'
  | 'course_complete'
  | 'daily_login'
  | 'quiz_perfect'
  | 'assignment_on_time'
  | 'streak_bonus'
  | 'peer_help'
  | 'admin_adjustment'

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum'
export type BadgeCategory = 'milestone' | 'consistency' | 'mastery' | 'social' | 'special'
export type LeaderboardScope = 'course' | 'platform'
export type LeaderboardPeriod = 'week' | 'alltime'

export interface CourseModule {
  id: string
  courseId: string
  title: string
  description: string
  order: number
  unlockRule: UnlockRule
  prerequisites: string[]
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export interface Lesson {
  id: string
  moduleId: string
  courseId: string
  title: string
  description: string
  order: number
  durationMinutes: number
  contentType: ContentType
  isFree: boolean
  totalPages: number
  xpReward: number
  quizId?: string
  createdAt: string
  updatedAt: string
}

export interface LessonPage {
  id: string
  lessonId: string
  moduleId: string
  courseId: string
  pageNumber: number
  content: string
  contentType: ContentType
  mediaUrl?: string
  minDwellSeconds: number
  createdAt: string
  updatedAt: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  tier: BadgeTier
  category: BadgeCategory
  criteria: BadgeCriteria
  xpReward: number
  rarity: number
}

export interface BadgeCriteria {
  type: 'lesson_count' | 'module_complete' | 'streak_days' | 'quiz_score' | 'course_complete'
  threshold: number
  scope: 'course' | 'platform'
  courseId?: string
}

export interface XPTransaction {
  id: string
  userId: string
  courseId?: string
  lessonId?: string
  amount: number
  source: XPTransactionSource
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface StreakRecord {
  userId: string
  currentStreak: number
  longestStreak: number
  streakFreezes: number
  lastActivityDate: string
  lastFreezeUsedDate?: string
}

export interface LeaderboardEntry {
  userId: string
  userName: string
  userAvatar?: string
  totalXP: number
  level: number
  currentStreak: number
  badgesCount: number
  rank: number
  score: number
}

export interface LearnerProgress {
  userId: string
  courseId: string
  moduleProgress: Record<string, ModuleProgress>
  currentModuleId?: string
  currentLessonId?: string
  currentPageNumber?: number
  overallProgress: number
  totalXP: number
  level: number
  enrolledAt: string
  completedAt?: string
  lastAccessedAt: string
}

export interface ModuleProgress {
  moduleId: string
  completedLessons: string[]
  currentLessonId?: string
  completedPages: Record<string, number[]>
  moduleXP: number
  isComplete: boolean
  completedAt?: string
}

export interface Certificate {
  id: string
  userId: string
  courseId: string
  issuedAt: string
  certificateNumber: string
  downloadUrl?: string
  verificationUrl?: string
}

export interface XPContext {
  streakDays: number
  level: number
  courseId?: string
  lessonId?: string
  moduleId?: string
}

export interface StreakUpdateResult {
  streak: number
  longestStreak: number
  bonusMultiplier: number
  milestones: number[]
  freezeUsed?: boolean
  streakReset?: boolean
}

export interface PageCompletionPayload {
  pageId: string
  lessonId: string
  moduleId: string
  courseId: string
  dwellSeconds: number
  scrollDepth: number
}

export interface PageCompletionResult {
  success: boolean
  xpEarned: number
  newLevel: number
  leveledUp: boolean
  newBadges: Badge[]
  progress: {
    coursePercent: number
    modulePercent: number
    nextPageId?: string
  }
  streak: {
    current: number
    bonusMultiplier: number
  }
}
