'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Flame, Trophy, Zap, Medal } from 'lucide-react'
import type { LeaderboardEntry } from '@/types/courseWorkflow'
import { cn } from '@/lib/utils'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  currentUserId?: string
  className?: string
}

const periodLabels = {
  week: 'This Week',
  alltime: 'All Time',
}

export function LeaderboardTable({ entries, currentUserId, className = '' }: LeaderboardTableProps) {
  const [period, setPeriod] = useState<'week' | 'alltime'>('alltime')
  const [scope, setScope] = useState<'course' | 'platform'>('platform')

  const currentEntry = entries.find(e => e.userId === currentUserId)

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <h3 className="text-lg font-semibold">Leaderboard</h3>
          </div>
          <div className="flex gap-2">
            <div className="flex rounded-lg border">
              <Button variant="ghost" size="sm" onClick={() => setScope('platform')} className={cn(scope === 'platform' && 'bg-gray-100')}>
                Platform
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setScope('course')} className={cn(scope === 'course' && 'bg-gray-100')}>
                Course
              </Button>
            </div>
            <div className="flex rounded-lg border">
              <Button variant="ghost" size="sm" onClick={() => setPeriod('week')} className={cn(period === 'week' && 'bg-gray-100')}>
                Week
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setPeriod('alltime')} className={cn(period === 'alltime' && 'bg-gray-100')}>
                All Time
              </Button>
            </div>
          </div>
        </div>

        {currentEntry && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                  #{currentEntry.rank}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{currentEntry.userName}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>Level {currentEntry.level}</span>
                    <span className="flex items-center gap-1"><Zap className="h-3 w-3" />{currentEntry.totalXP} XP</span>
                    <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-orange-500" />{currentEntry.currentStreak}</span>
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="capitalize">You</Badge>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {entries.slice(0, 20).map((entry, idx) => {
            const isCurrent = entry.userId === currentUserId
            const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null
            return (
              <div
                key={entry.userId}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg transition-colors',
                  isCurrent ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 text-center font-semibold text-gray-600">{medal || `#${entry.rank}`}</span>
                  <div>
                    <p className="font-medium text-sm text-gray-900">{entry.userName}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Lvl {entry.level}</span>
                      <span className="flex items-center gap-1"><Zap className="h-3 w-3" />{entry.totalXP}</span>
                      <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-orange-500" />{entry.currentStreak}</span>
                      <span className="flex items-center gap-1"><Medal className="h-3 w-3" />{entry.badgesCount}</span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {entry.score.toLocaleString()} pts
                </Badge>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
