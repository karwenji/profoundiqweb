import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateLearnerProgress, getModuleProgress, updateLearnerProgress, getCourseModules, getLessonsByModule, getPageById, getLessonById, getModulesWithLessons, seedCourseWorkflowData } from '@/lib/courseWorkflow'
import { addXPTransaction, calculateXPForAction, calculateLevel, checkBadgeEligibility, updateStreak } from '@/lib/gamification/xp'
import { users } from '@/lib/users'
import type { Badge, PageCompletionPayload, PageCompletionResult, XPContext } from '@/types/courseWorkflow'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const userId = token ? decodeToken(token) : undefined
    if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id: courseId } = await params
    seedCourseWorkflowData()
    const progress = getOrCreateLearnerProgress(userId, courseId)
    const modules = getModulesWithLessons(courseId)

    const moduleProgressMap: Record<string, { module: ReturnType<typeof getCourseModules>[0]; progress: ReturnType<typeof getModuleProgress>; lessons: ReturnType<typeof getLessonsByModule> }> = {}
    modules.forEach(m => {
      moduleProgressMap[m.id] = {
        module: m,
        progress: getModuleProgress(userId, courseId, m.id),
        lessons: m.lessons,
      }
    })

    return NextResponse.json({ success: true, data: { progress, modules: moduleProgressMap } })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch progress' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const userId = token ? decodeToken(token) : undefined
    if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id: courseId } = await params
    const body = await request.json()
    const { action, payload } = body

    if (action === 'page-complete') {
      const result = await handlePageComplete(userId, payload as PageCompletionPayload, courseId)
      return NextResponse.json({ success: true, data: result })
    }

    if (action === 'lesson-complete') {
      const result = await handleLessonComplete(userId, payload, courseId)
      return NextResponse.json({ success: true, data: result })
    }

    if (action === 'module-complete') {
      const result = await handleModuleComplete(userId, payload, courseId)
      return NextResponse.json({ success: true, data: result })
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update progress' }, { status: 500 })
  }
}

async function handlePageComplete(userId: string, payload: PageCompletionPayload, courseId: string): Promise<PageCompletionResult> {
  const page = getPageById(payload.pageId)
  const lesson = page ? getLessonById(page.lessonId) : getLessonById(payload.lessonId)
  const module = lesson ? getCourseModules(courseId).find(m => m.id === lesson.moduleId) : undefined

  if (!lesson || !module) {
    return { success: false, xpEarned: 0, newLevel: 1, leveledUp: false, newBadges: [], progress: { coursePercent: 0, modulePercent: 0 }, streak: { current: 0, bonusMultiplier: 1 } }
  }

  const progress = getOrCreateLearnerProgress(userId, courseId)
  const streakResult = updateStreak(userId, new Date().toISOString())
  const streakDays = streakResult.streak
  const currentLevel = calculateLevel(progress.totalXP)

  const xpEarned = calculateXPForAction('lesson_complete', { streakDays, level: currentLevel, courseId, lessonId: lesson.id, moduleId: module.id })

  const newBadges = checkBadgeEligibility(userId, 'lesson_complete', { streakDays, level: currentLevel, courseId, lessonId: lesson.id, moduleId: module.id })

  addXPTransaction({
    userId,
    courseId,
    lessonId: lesson.id,
    amount: xpEarned,
    source: 'lesson_complete',
    metadata: { pageId: payload.pageId, dwellSeconds: payload.dwellSeconds, scrollDepth: payload.scrollDepth },
  })

  const moduleProgress = getModuleProgress(userId, courseId, module.id)
  const currentPage = getPageById(payload.pageId)
  const pageNumber = currentPage?.pageNumber || 1
  const completedPages = moduleProgress.completedPages[lesson.id] || []
  if (!completedPages.includes(pageNumber)) {
    completedPages.push(pageNumber)
  }

  const allLessonsInModule = getLessonsByModule(module.id)
  const moduleLessonsComplete = moduleProgress.completedLessons.length >= allLessonsInModule.length - 1

  updateLearnerProgress(userId, courseId, (p) => {
    p.totalXP += xpEarned
    p.level = calculateLevel(p.totalXP)
    p.currentModuleId = module.id
    p.currentLessonId = lesson.id
    p.currentPageNumber = currentPage?.pageNumber || 1
    p.moduleProgress[module.id] = {
      ...moduleProgress,
      completedPages: { ...moduleProgress.completedPages, [lesson.id]: completedPages },
      moduleXP: (moduleProgress.moduleXP || 0) + xpEarned,
    }
    p.overallProgress = calculateOverallProgress(userId, courseId)
  })

  return {
    success: true,
    xpEarned,
    newLevel: calculateLevel(progress.totalXP + xpEarned),
    leveledUp: false,
    newBadges,
    progress: {
      coursePercent: Math.round(progress.overallProgress),
      modulePercent: Math.round((moduleProgress.completedLessons.length / Math.max(1, allLessonsInModule.length)) * 100),
    },
    streak: { current: streakDays, bonusMultiplier: streakResult.bonusMultiplier },
  }
}

async function handleLessonComplete(userId: string, _payload: unknown, courseId: string): Promise<PageCompletionResult> {
  return { success: false, xpEarned: 0, newLevel: 1, leveledUp: false, newBadges: [], progress: { coursePercent: 0, modulePercent: 0 }, streak: { current: 0, bonusMultiplier: 1 } }
}

async function handleModuleComplete(userId: string, _payload: unknown, courseId: string): Promise<PageCompletionResult> {
  return { success: false, xpEarned: 0, newLevel: 1, leveledUp: false, newBadges: [], progress: { coursePercent: 0, modulePercent: 0 }, streak: { current: 0, bonusMultiplier: 1 } }
}

function calculateOverallProgress(userId: string, courseId: string): number {
  const modules = getModulesWithLessons(courseId)
  if (modules.length === 0) return 0
  let completed = 0
  let total = 0
  modules.forEach(m => {
    const progress = getModuleProgress(userId, courseId, m.id)
    total += m.lessons.length
    completed += progress.completedLessons.length
  })
  return total === 0 ? 0 : Math.round((completed / total) * 100)
}

function decodeToken(token: string): string | undefined {
  try {
    const payload = token.startsWith('fallback-') ? JSON.parse(Buffer.from(token.replace('fallback-', ''), 'base64').toString()) : JSON.parse(Buffer.from(token, 'base64').toString())
    return payload.userId || payload.id
  } catch {
    return undefined
  }
}
