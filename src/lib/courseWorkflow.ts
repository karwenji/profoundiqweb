import type {
  CourseModule,
  Lesson,
  LessonPage,
  Badge,
  BadgeCriteria,
  XPTransaction,
  StreakRecord,
  LearnerProgress,
  ModuleProgress,
  Certificate,
  LeaderboardEntry,
  LeaderboardScope,
  LeaderboardPeriod,
} from '@/types/courseWorkflow'
import { courses } from '@/data/courses'
import { users } from '@/lib/users'
import type { User } from '@/types'

let courseModules: CourseModule[] = []
let lessons: Lesson[] = []
let lessonPages: LessonPage[] = []
let xpTransactions: XPTransaction[] = []
let streakRecords: StreakRecord[] = []
let learnerProgressList: LearnerProgress[] = []
let certificates: Certificate[] = []
let leaderboardEntries: LeaderboardEntry[] = []

let moduleSeq = 1
let lessonSeq = 1
let pageSeq = 1
let xpSeq = 1
let certSeq = 1

function nextId(prefix: string, seq: number): string {
  return `${prefix}-${seq}`
}

export function getCourseModules(courseId: string): CourseModule[] {
  return courseModules.filter(m => m.courseId === courseId).sort((a, b) => a.order - b.order)
}

export function getLessonsByModule(moduleId: string): Lesson[] {
  return lessons.filter(l => l.moduleId === moduleId).sort((a, b) => a.order - b.order)
}

export function getLessonById(lessonId: string): Lesson | undefined {
  return lessons.find(l => l.id === lessonId)
}

export function getPagesByLesson(lessonId: string): LessonPage[] {
  return lessonPages.filter(p => p.lessonId === lessonId).sort((a, b) => a.pageNumber - b.pageNumber)
}

export function getPageById(pageId: string): LessonPage | undefined {
  return lessonPages.find(p => p.id === pageId)
}

export function getModulesWithLessons(courseId: string): (CourseModule & { lessons: Lesson[] })[] {
  const modules = getCourseModules(courseId)
  return modules.map(m => ({
    ...m,
    lessons: getLessonsByModule(m.id),
  }))
}

export function getLessonWithPages(lessonId: string): (Lesson & { pages: LessonPage[] }) | undefined {
  const lesson = getLessonById(lessonId)
  if (!lesson) return undefined
  return {
    ...lesson,
    pages: getPagesByLesson(lessonId),
  }
}

export function createCourseModule(data: Omit<CourseModule, 'id' | 'createdAt' | 'updatedAt'>): CourseModule {
  const module: CourseModule = {
    ...data,
    id: `mod-${moduleSeq++}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  courseModules.push(module)
  return module
}

export function updateCourseModule(id: string, updates: Partial<CourseModule>): CourseModule | undefined {
  const idx = courseModules.findIndex(m => m.id === id)
  if (idx === -1) return undefined
  courseModules[idx] = { ...courseModules[idx], ...updates, updatedAt: new Date().toISOString() }
  return courseModules[idx]
}

export function deleteCourseModule(id: string): boolean {
  const idx = courseModules.findIndex(m => m.id === id)
  if (idx === -1) return false
  courseModules.splice(idx, 1)
  return true
}

export function createLesson(data: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>): Lesson {
  const lesson: Lesson = {
    ...data,
    id: `les-${lessonSeq++}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  lessons.push(lesson)
  return lesson
}

export function updateLesson(id: string, updates: Partial<Lesson>): Lesson | undefined {
  const idx = lessons.findIndex(l => l.id === id)
  if (idx === -1) return undefined
  lessons[idx] = { ...lessons[idx], ...updates, updatedAt: new Date().toISOString() }
  return lessons[idx]
}

export function deleteLesson(id: string): boolean {
  const idx = lessons.findIndex(l => l.id === id)
  if (idx === -1) return false
  lessons.splice(idx, 1)
  return true
}

export function createLessonPage(data: Omit<LessonPage, 'id' | 'createdAt' | 'updatedAt'>): LessonPage {
  const page: LessonPage = {
    ...data,
    id: `pg-${pageSeq++}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  lessonPages.push(page)
  return page
}

export function updateLessonPage(id: string, updates: Partial<LessonPage>): LessonPage | undefined {
  const idx = lessonPages.findIndex(p => p.id === id)
  if (idx === -1) return undefined
  lessonPages[idx] = { ...lessonPages[idx], ...updates, updatedAt: new Date().toISOString() }
  return lessonPages[idx]
}

export function deleteLessonPage(id: string): boolean {
  const idx = lessonPages.findIndex(p => p.id === id)
  if (idx === -1) return false
  lessonPages.splice(idx, 1)
  return true
}

export function getLearnerProgress(userId: string, courseId: string): LearnerProgress | undefined {
  return learnerProgressList.find(p => p.userId === userId && p.courseId === courseId)
}

export function getOrCreateLearnerProgress(userId: string, courseId: string): LearnerProgress {
  const existing = learnerProgressList.find(p => p.userId === userId && p.courseId === courseId)
  if (existing) return existing
  const progress: LearnerProgress = {
    userId,
    courseId,
    moduleProgress: {},
    overallProgress: 0,
    totalXP: 0,
    level: 1,
    enrolledAt: new Date().toISOString(),
    lastAccessedAt: new Date().toISOString(),
  }
  learnerProgressList.push(progress)
  return progress
}

export function updateLearnerProgress(
  userId: string,
  courseId: string,
  updater: (progress: LearnerProgress) => void
): LearnerProgress {
  const progress = getOrCreateLearnerProgress(userId, courseId)
  updater(progress)
  progress.lastAccessedAt = new Date().toISOString()
  return progress
}

export function getModuleProgress(userId: string, courseId: string, moduleId: string): ModuleProgress {
  const progress = getLearnerProgress(userId, courseId)
  if (!progress) return { moduleId, completedLessons: [], completedPages: {}, moduleXP: 0, isComplete: false }
  return progress.moduleProgress[moduleId] || { moduleId, completedLessons: [], completedPages: {}, moduleXP: 0, isComplete: false }
}

export function getStreakRecord(userId: string): StreakRecord | undefined {
  return streakRecords.find(s => s.userId === userId)
}

export function getOrCreateStreakRecord(userId: string): StreakRecord {
  const existing = streakRecords.find(s => s.userId === userId)
  if (existing) return existing
  const record: StreakRecord = {
    userId,
    currentStreak: 0,
    longestStreak: 0,
    streakFreezes: 0,
    lastActivityDate: '',
  }
  streakRecords.push(record)
  return record
}

export function addXPTransaction(transaction: Omit<XPTransaction, 'id' | 'createdAt'>): XPTransaction {
  const tx: XPTransaction = {
    ...transaction,
    id: `xp-${xpSeq++}`,
    createdAt: new Date().toISOString(),
  }
  xpTransactions.push(tx)
  return tx
}

export function getXPTransactionsForUser(userId: string): XPTransaction[] {
  return xpTransactions.filter(t => t.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getTotalXPForUser(userId: string): number {
  return xpTransactions.filter(t => t.userId === userId).reduce((sum, t) => sum + t.amount, 0)
}

export function addCertificate(certificate: Omit<Certificate, 'id' | 'issuedAt' | 'certificateNumber'>): Certificate {
  const cert: Certificate = {
    ...certificate,
    id: `cert-${certSeq++}`,
    issuedAt: new Date().toISOString(),
    certificateNumber: `PIQ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
  }
  certificates.push(cert)
  return cert
}

export function getCertificatesForUser(userId: string): Certificate[] {
  return certificates.filter(c => c.userId === userId).sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime())
}

export function getLeaderboard(scope: LeaderboardScope, period: LeaderboardPeriod): LeaderboardEntry[] {
  const entries: Omit<LeaderboardEntry, 'rank'>[] = []
  users.forEach(u => {
    if (u.role !== 'student') return
    const totalXP = getTotalXPForUser(u.id)
    const streak = getStreakRecord(u.id)
    const badgeCount = (u as any).badges?.length || 0
    entries.push({
      userId: u.id,
      userName: u.name,
      userAvatar: (u as any).avatar,
      totalXP,
      level: Math.floor(Math.sqrt(totalXP / 100)) + 1,
      currentStreak: streak?.currentStreak || 0,
      badgesCount: badgeCount,
      score: totalXP + (streak?.currentStreak || 0) * 10 + badgeCount * 50,
    })
  })
  entries.sort((a, b) => b.score - a.score)
  return entries.map((e, idx) => ({ ...e, rank: idx + 1 }))
}

const builtinBadges: Badge[] = [
  {
    id: 'b-1',
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: 'Footprints',
    tier: 'bronze',
    category: 'milestone',
    criteria: { type: 'lesson_count', threshold: 1, scope: 'course' },
    xpReward: 50,
    rarity: 10,
  },
  {
    id: 'b-2',
    name: 'Module Master',
    description: 'Complete your first module',
    icon: 'BookOpen',
    tier: 'silver',
    category: 'milestone',
    criteria: { type: 'module_complete', threshold: 1, scope: 'course' },
    xpReward: 100,
    rarity: 25,
  },
  {
    id: 'b-3',
    name: 'On Fire',
    description: 'Maintain a 7-day learning streak',
    icon: 'Flame',
    tier: 'gold',
    category: 'consistency',
    criteria: { type: 'streak_days', threshold: 7, scope: 'platform' },
    xpReward: 200,
    rarity: 40,
  },
  {
    id: 'b-4',
    name: 'Perfect Score',
    description: 'Score 100% on any quiz',
    icon: 'Award',
    tier: 'platinum',
    category: 'mastery',
    criteria: { type: 'quiz_score', threshold: 100, scope: 'platform' },
    xpReward: 100,
    rarity: 60,
  },
  {
    id: 'b-5',
    name: 'Course Conqueror',
    description: 'Complete your first course',
    icon: 'Trophy',
    tier: 'gold',
    category: 'milestone',
    criteria: { type: 'course_complete', threshold: 1, scope: 'course' },
    xpReward: 500,
    rarity: 30,
  },
]

export function getAllBadges(): Badge[] {
  return builtinBadges
}

export function getBadgeById(id: string): Badge | undefined {
  return builtinBadges.find(b => b.id === id)
}

export function seedCourseWorkflowData() {
  if (courseModules.length > 0) return
  courses.forEach(course => {
    const module1 = createCourseModule({
      courseId: course.id,
      title: 'Module 1: Foundation',
      description: 'Core concepts and fundamentals',
      order: 1,
      unlockRule: 'all_open',
      prerequisites: [],
      isPublished: true,
    })
    const lesson1 = createLesson({
      moduleId: module1.id,
      courseId: course.id,
      title: 'Introduction & Overview',
      description: 'Get started with the basics',
      order: 1,
      durationMinutes: 10,
      contentType: 'video',
      isFree: true,
      totalPages: 2,
      xpReward: 20,
    })
    createLessonPage({
      lessonId: lesson1.id,
      moduleId: module1.id,
      courseId: course.id,
      pageNumber: 1,
      content: '<p>Welcome to this course. In this lesson, we will cover the fundamentals.</p>',
      contentType: 'text',
      minDwellSeconds: 30,
    })
    createLessonPage({
      lessonId: lesson1.id,
      moduleId: module1.id,
      courseId: course.id,
      pageNumber: 2,
      content: '<p>By the end of this lesson, you will understand the key concepts.</p>',
      contentType: 'text',
      minDwellSeconds: 30,
    })
    const lesson2 = createLesson({
      moduleId: module1.id,
      courseId: course.id,
      title: 'Core Concepts',
      description: 'Deep dive into core topics',
      order: 2,
      durationMinutes: 15,
      contentType: 'video',
      isFree: false,
      totalPages: 3,
      xpReward: 30,
    })
    createLessonPage({
      lessonId: lesson2.id,
      moduleId: module1.id,
      courseId: course.id,
      pageNumber: 1,
      content: '<p>Let us explore the core concepts in detail.</p>',
      contentType: 'text',
      minDwellSeconds: 45,
    })
    createLessonPage({
      lessonId: lesson2.id,
      moduleId: module1.id,
      courseId: course.id,
      pageNumber: 2,
      content: '<p>Understanding these principles is essential for mastery.</p>',
      contentType: 'text',
      minDwellSeconds: 45,
    })
    createLessonPage({
      lessonId: lesson2.id,
      moduleId: module1.id,
      courseId: course.id,
      pageNumber: 3,
      content: '<p>Now let us apply these concepts in a practical scenario.</p>',
      contentType: 'quiz',
      minDwellSeconds: 60,
    })
  })
}
