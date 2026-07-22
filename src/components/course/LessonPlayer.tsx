'use client'

import { useState, useEffect, useCallback, useRef, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight, CheckCircle, Lock, Flame, Zap, Trophy, Star, Loader2 } from 'lucide-react'
import type { Lesson, LessonPage, LearnerProgress, ModuleProgress } from '@/types/courseWorkflow'
import { cn } from '@/lib/utils'

interface LessonPlayerProps {
  lesson: Lesson & { pages: LessonPage[] }
  module: { id: string; title: string; unlockRule: string }
  progress: LearnerProgress | undefined
  moduleProgress: ModuleProgress | undefined
  streak: { current: number; bonusMultiplier: number }
  onPageComplete: (pageId: string, dwellSeconds: number, scrollDepth: number) => Promise<{ xpEarned: number; newLevel: number; leveledUp: boolean; newBadges: any[] }>
  onLessonComplete?: () => void
  onModuleComplete?: () => void
  className?: string
}

export function LessonPlayer({
  lesson,
  module,
  progress,
  moduleProgress,
  streak,
  onPageComplete,
  onLessonComplete,
  onModuleComplete,
  className = '',
}: LessonPlayerProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)
  const [engagementData, setEngagementData] = useState({ dwellSeconds: 0, scrollDepth: 0 })
  const [showXPReward, setShowXPReward] = useState<{ amount: number; newLevel?: number; badges?: any[] } | null>(null)
  const [completedPages, setCompletedPages] = useState<Set<string>>(new Set())
  const pageRef = useRef<HTMLDivElement>(null)

  const currentPage = lesson.pages[currentPageIndex]
  const isLastPage = currentPageIndex === lesson.pages.length - 1
  const isFirstPage = currentPageIndex === 0

  const currentCompletedPages = moduleProgress?.completedPages?.[lesson.id] || []
  const totalCompletedInLesson = currentCompletedPages.length + completedPages.size
  const lessonComplete = totalCompletedInLesson >= lesson.totalPages

  useEffect(() => {
    const timer = setInterval(() => {
      setEngagementData(prev => ({ ...prev, dwellSeconds: prev.dwellSeconds + 1 }))
    }, 1000)
    return () => clearInterval(timer)
  }, [currentPageIndex])

  useEffect(() => {
    const handleScroll = () => {
      if (!pageRef.current) return
      const { scrollTop, scrollHeight, clientHeight } = pageRef.current
      const depth = Math.min(1, scrollTop / Math.max(1, scrollHeight - clientHeight))
      setEngagementData(prev => ({ ...prev, scrollDepth: Math.max(prev.scrollDepth, depth) }))
    }
    const el = pageRef.current
    el?.addEventListener('scroll', handleScroll)
    return () => el?.removeEventListener('scroll', handleScroll)
  }, [currentPage?.id])

  useEffect(() => {
    setCompletedPages(new Set())
    setCurrentPageIndex(0)
    setEngagementData({ dwellSeconds: 0, scrollDepth: 0 })
  }, [lesson.id])

  const canGoNext = engagementData.scrollDepth >= 0.5 && engagementData.dwellSeconds >= (currentPage?.minDwellSeconds || 30)

  const handleNext = async () => {
    if (!canGoNext || isCompleting) return

    if (!isLastPage) {
      setCurrentPageIndex(prev => prev + 1)
      setEngagementData({ dwellSeconds: 0, scrollDepth: 0 })
      return
    }

    setIsCompleting(true)
    try {
      const result = await onPageComplete(currentPage.id, engagementData.dwellSeconds, engagementData.scrollDepth)
      if (result.xpEarned > 0 || result.newBadges?.length) {
        setShowXPReward({ amount: result.xpEarned, newLevel: result.leveledUp ? result.newLevel : undefined, badges: result.newBadges })
        setTimeout(() => setShowXPReward(null), 3000)
      }
      if (lessonComplete && onLessonComplete) {
        onLessonComplete()
      }
    } finally {
      setIsCompleting(false)
    }
  }

  const handlePrevious = () => {
    if (!isFirstPage) {
      setCurrentPageIndex(prev => prev - 1)
      setEngagementData({ dwellSeconds: 0, scrollDepth: 0 })
    }
  }

  const pageProgress = ((currentPageIndex + 1) / lesson.pages.length) * 100

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{module.title}</p>
            <h2 className="text-lg font-semibold text-gray-900">{lesson.title}</h2>
          </div>
          <div className="flex items-center gap-3">
            {streak.current > 0 && (
              <div className="flex items-center gap-1 text-orange-600">
                <Flame className="h-4 w-4" />
                <span className="text-sm font-medium">{streak.current}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-blue-600">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-medium">+{lesson.xpReward} XP</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Progress value={pageProgress} className="flex-1" />
          <span className="text-xs text-gray-500">{currentPageIndex + 1}/{lesson.pages.length}</span>
        </div>
      </div>

      <div ref={pageRef} className="flex-1 overflow-y-auto border rounded-lg p-6 bg-white mb-4">
        <div className="prose prose-sm max-w-none">
          <div dangerouslySetInnerHTML={{ __html: currentPage?.content || '' }} />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="outline" onClick={handlePrevious} disabled={isFirstPage}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <div className="flex items-center gap-4">
          {!canGoNext && !isLastPage && (
            <p className="text-xs text-gray-500">Scroll down and stay for a moment to continue...</p>
          )}
          {canGoNext && !isLastPage && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Ready to continue
            </p>
          )}
        </div>
        <Button onClick={handleNext} disabled={(!canGoNext && !isLastPage) || isCompleting}>
          {isCompleting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : isLastPage ? (
            <CheckCircle className="h-4 w-4 mr-2" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-2" />
          )}
          {isLastPage ? 'Complete' : 'Next'}
        </Button>
      </div>

      {showXPReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="p-6 text-center">
            <div className="mb-4">
              <Trophy className="h-12 w-12 text-yellow-500 mx-auto" />
            </div>
            <h3 className="text-xl font-bold mb-2">+{showXPReward.amount} XP</h3>
            {showXPReward.newLevel && (
              <p className="text-lg font-semibold text-blue-600 mb-2">Level Up! Now Level {showXPReward.newLevel}</p>
            )}
            {showXPReward.badges && showXPReward.badges.length > 0 && (
              <div className="space-y-2 mt-4">
                {showXPReward.badges.map(badge => (
                  <div key={badge.id} className="flex items-center gap-2 justify-center">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">Badge: {badge.name}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
