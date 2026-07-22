'use client'

import { Flame, Snowflake } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StreakCounterProps {
  currentStreak: number
  longestStreak: number
  streakFreezes: number
  onUseFreeze?: () => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
}

export function StreakCounter({
  currentStreak,
  longestStreak,
  streakFreezes,
  onUseFreeze,
  className = '',
  size = 'md',
}: StreakCounterProps) {
  const hasStreak = currentStreak > 0
  const sizeClass = sizeClasses[size]

  return (
    <div className={cn('flex items-center gap-3', sizeClass, className)}>
      <div className={cn('flex items-center gap-1', hasStreak ? 'text-orange-600' : 'text-gray-400')}>
        <Flame className={cn(size === 'lg' ? 'h-6 w-6' : size === 'md' ? 'h-5 w-5' : 'h-4 w-4')} />
        <span className="font-semibold">{currentStreak}</span>
        <span className="text-xs text-gray-500 hidden sm:inline">day streak</span>
      </div>
      {streakFreezes > 0 && (
        <Badge variant="outline" className="flex items-center gap-1 cursor-pointer" onClick={onUseFreeze}>
          <Snowflake className="h-3 w-3 text-blue-500" />
          <span className="text-xs">{streakFreezes}</span>
        </Badge>
      )}
    </div>
  )
}
