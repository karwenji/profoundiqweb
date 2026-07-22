'use client'

import { useState } from 'react'
import { ChevronRight, ChevronDown, BookOpen, PlayCircle, Lock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/course/ProgressBar'
import type { CourseModule, Lesson } from '@/types/courseWorkflow'
import { cn } from '@/lib/utils'

interface CurriculumTreeProps {
  modules: (CourseModule & { lessons: Lesson[] })[]
  currentLessonId?: string
  completedLessonIds?: string[]
  lockedLessonIds?: string[]
  onSelectLesson?: (lessonId: string) => void
  className?: string
}

export function CurriculumTree({
  modules,
  currentLessonId,
  completedLessonIds = [],
  lockedLessonIds = [],
  onSelectLesson,
  className = '',
}: CurriculumTreeProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(modules.map(m => m.id)))

  const toggleModule = (id: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className={cn('space-y-3', className)}>
      {modules.map(module => {
        const moduleLessonsCount = module.lessons.length
        const moduleCompletedCount = module.lessons.filter(l => completedLessonIds.includes(l.id)).length
        const moduleProgress = moduleLessonsCount > 0 ? Math.round((moduleCompletedCount / moduleLessonsCount) * 100) : 0

        return (
          <Card key={module.id}>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Button variant="ghost" size="icon" onClick={() => toggleModule(module.id)} className="h-8 w-8">
                  {expandedModules.has(module.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-900">{module.title}</p>
                  <p className="text-xs text-gray-500">{moduleCompletedCount}/{moduleLessonsCount} lessons</p>
                </div>
                <span className="text-xs text-gray-500">{moduleProgress}%</span>
              </div>
              <ProgressBar value={moduleProgress} size="sm" className="mb-3" />
              {expandedModules.has(module.id) && (
                <div className="ml-8 space-y-1">
                  {module.lessons.map(lesson => {
                    const isCurrent = currentLessonId === lesson.id
                    const isCompleted = completedLessonIds.includes(lesson.id)
                    const isLocked = lockedLessonIds.includes(lesson.id) && !isCompleted
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => !isLocked && onSelectLesson?.(lesson.id)}
                        disabled={isLocked}
                        className={cn(
                          'w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors',
                          isCurrent && 'bg-blue-50 border border-blue-200',
                          !isCurrent && !isLocked && 'hover:bg-gray-50',
                          isLocked && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        {isCompleted ? (
                          <PlayCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        ) : isLocked ? (
                          <Lock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        ) : (
                          <BookOpen className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-sm truncate', isCurrent && 'font-medium text-blue-700')}>{lesson.title}</p>
                          <p className="text-xs text-gray-500">{lesson.durationMinutes} min • +{lesson.xpReward} XP</p>
                        </div>
                        {isLocked && <Lock className="h-3 w-3 text-gray-400 flex-shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
