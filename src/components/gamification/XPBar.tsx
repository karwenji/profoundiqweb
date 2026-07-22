'use client'

import { Progress } from '@/components/ui/progress'
import { Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface XPBarProps {
  currentXP: number
  level: number
  className?: string
  showLabel?: boolean
}

export function XPBar({ currentXP, level, className = '', showLabel = true }: XPBarProps) {
  const xpForCurrentLevel = (level - 1) * (level - 1) * 100
  const xpForNextLevel = level * level * 100
  const levelProgress = xpForNextLevel - xpForCurrentLevel
  const currentLevelProgress = currentXP - xpForCurrentLevel
  const percent = Math.min(100, Math.max(0, Math.round((currentLevelProgress / Math.max(1, levelProgress)) * 100)))

  return (
    <div className={cn('space-y-1', className)}>
      {showLabel && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">Level {level}</span>
          </div>
          <span className="text-xs text-gray-500">
            {currentLevelProgress} / {levelProgress} XP
          </span>
        </div>
      )}
      <Progress value={percent} className="h-2" />
    </div>
  )
}
