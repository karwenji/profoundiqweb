'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { LessonPlayer } from '@/components/course/LessonPlayer'
import { XPBar } from '@/components/gamification/XPBar'
import { StreakCounter } from '@/components/gamification/StreakCounter'
import { CurriculumTree } from '@/components/course/CurriculumTree'
import { UnlockAnimation } from '@/components/gamification/UnlockAnimation'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/dashboard/Toast'
import type { CourseModule, Lesson, LearnerProgress, ModuleProgress, StreakRecord } from '@/types/courseWorkflow'
import { getModulesWithLessons, getOrCreateLearnerProgress, getModuleProgress, getStreakRecord } from '@/lib/courseWorkflow'

export default function LearnPage({ params }: { params: { courseId: string; lessonId: string } }) {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [modules, setModules] = useState<(CourseModule & { lessons: Lesson[] })[]>([])
  const [selectedLesson, setSelectedLesson] = useState<(Lesson & { pages: any[] }) | null>(null)
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null)
  const [progress, setProgress] = useState<LearnerProgress | null>(null)
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress | null>(null)
  const [streak, setStreak] = useState<{ current: number; bonusMultiplier: number }>({ current: 0, bonusMultiplier: 1 })
  const [loading, setLoading] = useState(true)
  const [showUnlock, setShowUnlock] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    const modulesData = getModulesWithLessons(params.courseId)
    setModules(modulesData)
    const lesson = modulesData.flatMap(m => m.lessons).find(l => l.id === params.lessonId)
    const module = modulesData.find(m => m.lessons.some(l => l.id === params.lessonId))
    if (lesson && module) {
      setSelectedLesson({ ...lesson, pages: [] } as any)
      setSelectedModule(module)
    }
    const prog = getOrCreateLearnerProgress(user.id, params.courseId)
    setProgress(prog)
    if (module) {
      setModuleProgress(getModuleProgress(user.id, params.courseId, module.id))
    }
    const streakRecord = getStreakRecord(user.id)
    setStreak({ current: streakRecord?.currentStreak || 0, bonusMultiplier: Math.min(2, 1 + (streakRecord?.currentStreak || 0) * 0.01) })
    setLoading(false)
  }, [params.courseId, params.lessonId, user?.id])

  const handlePageComplete = async (pageId: string, dwellSeconds: number, scrollDepth: number) => {
    if (!user?.id || !selectedLesson || !selectedModule) return { success: false, xpEarned: 0, newLevel: 1, leveledUp: false, newBadges: [], progress: { coursePercent: 0, modulePercent: 0 }, streak: { current: 0, bonusMultiplier: 1 } }
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/courses/${params.courseId}/progress`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'page-complete',
          payload: { pageId, lessonId: selectedLesson.id, moduleId: selectedModule.id, courseId: params.courseId, dwellSeconds, scrollDepth },
        }),
      })
      const data = await res.json()
      if (data.success) {
        addToast('success', `+${data.data.xpEarned} XP earned!`)
        if (data.data.leveledUp) {
          addToast('success', `Level Up! Now Level ${data.data.newLevel}`)
        }
        return data.data
      }
      return { success: false, xpEarned: 0, newLevel: 1, leveledUp: false, newBadges: [], progress: { coursePercent: 0, modulePercent: 0 }, streak: { current: 0, bonusMultiplier: 1 } }
    } catch (e) {
      console.error(e)
      return { success: false, xpEarned: 0, newLevel: 1, leveledUp: false, newBadges: [], progress: { coursePercent: 0, modulePercent: 0 }, streak: { current: 0, bonusMultiplier: 1 } }
    }
  }

  const handleLessonComplete = () => {
    addToast('success', 'Lesson completed!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!selectedLesson || !selectedModule) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Lesson not found</p>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="pt-6">
                  {progress && <XPBar currentXP={progress.totalXP} level={progress.level} className="mb-4" />}
                  <LessonPlayer
                    lesson={selectedLesson}
                    module={selectedModule}
                    progress={progress || undefined}
                    moduleProgress={moduleProgress || undefined}
                    streak={streak}
                    onPageComplete={handlePageComplete}
                    onLessonComplete={handleLessonComplete}
                  />
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Your Progress</h3>
                    <StreakCounter currentStreak={streak.current} longestStreak={streak.current} streakFreezes={0} size="sm" />
                  </div>
                  {progress && (
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Course Progress</span>
                          <span>{Math.round(progress.overallProgress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress.overallProgress}%` }} />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              <CurriculumTree
                modules={modules}
                currentLessonId={params.lessonId}
                completedLessonIds={moduleProgress?.completedLessons || []}
                onSelectLesson={(lessonId) => {
                  window.location.href = `/courses/${params.courseId}/learn/${lessonId}`
                }}
              />
            </div>
          </div>
        </div>
        <UnlockAnimation open={showUnlock} title="Module Unlocked!" description="You have completed the previous module." type="module" onClose={() => setShowUnlock(false)} />
      </div>
    </ProtectedRoute>
  )
}
