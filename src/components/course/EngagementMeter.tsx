'use client'

import { Progress } from '@/components/ui/progress'
import { Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EngagementMeterProps {
  dwellSeconds: number
  minDwellSeconds: number
  scrollDepth: number
  className?: string
}

export function EngagementMeter({ dwellSeconds, minDwellSeconds, scrollDepth, className = '' }: EngagementMeterProps) {
  const dwellPercent = Math.min(100, Math.round((dwellSeconds / Math.max(1, minDwellSeconds)) * 100))
  const scrollPercent = Math.round(scrollDepth * 100)
  const overall = Math.round((dwellPercent * 0.6) + (scrollPercent * 0.4))

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Eye className="h-3 w-3" />
        <span>Engagement</span>
        <span className="font-medium text-gray-700">{overall}%</span>
      </div>
      <Progress value={overall} className="h-1.5" />
      <div className="flex justify-between text-xs text-gray-400">
        <span>Dwell: {dwellSeconds}s / {minDwellSeconds}s</span>
        <span>Scroll: {scrollPercent}%</span>
      </div>
    </div>
  )
}
