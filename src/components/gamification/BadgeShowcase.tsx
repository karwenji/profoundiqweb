'use client'

import { Lock, Star, Trophy, Award, Medal, Crown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Badge as BadgeType } from '@/types/courseWorkflow'

const tierOrder: Record<string, number> = { bronze: 0, silver: 1, gold: 2, platinum: 3 }

const tierStyles = {
  bronze: 'border-orange-200 bg-orange-50',
  silver: 'border-gray-300 bg-gray-50',
  gold: 'border-yellow-300 bg-yellow-50',
  platinum: 'border-purple-300 bg-purple-50',
}

const tierColors = {
  bronze: 'text-orange-600',
  silver: 'text-gray-600',
  gold: 'text-yellow-600',
  platinum: 'text-purple-600',
}

interface BadgeShowcaseProps {
  badges: BadgeType[]
  earnedBadgeIds: string[]
  className?: string
  columns?: 2 | 3 | 4
}

const iconMap: Record<string, React.ElementType> = {
  Trophy,
  Award,
  Medal,
  Crown,
  Star,
}

export function BadgeShowcase({ badges, earnedBadgeIds, className = '', columns = 4 }: BadgeShowcaseProps) {
  const sorted = [...badges].sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier])

  return (
    <div className={cn('grid gap-4', `grid-cols-${columns}`)} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {sorted.map(badge => {
        const earned = earnedBadgeIds.includes(badge.id)
        const Icon = iconMap[badge.icon] || Award
        return (
          <Card key={badge.id} className={cn('border-2', !earned && 'opacity-50', tierStyles[badge.tier])}>
            <CardContent className="pt-6 text-center">
              <div className={cn('mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full', tierColors[badge.tier], earned ? 'bg-white' : 'bg-gray-100')}>
                {earned ? <Icon className="h-6 w-6" /> : <Lock className="h-6 w-6 text-gray-400" />}
              </div>
              <h4 className="font-semibold text-sm text-gray-900 mb-1">{badge.name}</h4>
              <p className="text-xs text-gray-500 mb-2">{badge.description}</p>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="outline" className="text-xs capitalize">
                  {badge.tier}
                </Badge>
                <span className="text-xs text-gray-500">+{badge.xpReward} XP</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
