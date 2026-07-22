'use client'

import { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  href?: string
  trend?: {
    value: number
    label: string
    direction: 'up' | 'down' | 'neutral'
  }
  className?: string
}

function TrendIndicator({ value, direction }: { value: number; direction: 'up' | 'down' | 'neutral' }) {
  const color = direction === 'up' ? 'text-green-600' : direction === 'down' ? 'text-red-600' : 'text-gray-500'
  const arrow = direction === 'up' ? '↑' : direction === 'down' ? '↓' : '→'
  return (
    <span className={`text-xs font-medium ${color}`}>
      {arrow} {Math.abs(value)}%
    </span>
  )
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  href,
  trend,
  className = '',
}: StatCardProps) {
  const content = (
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 mb-1 truncate">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {(subtitle || trend) && (
            <div className="flex items-center gap-2 mt-1">
              {trend && <TrendIndicator value={trend.value} direction={trend.direction} />}
              {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
            </div>
          )}
        </div>
        {icon && (
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <div className="text-primary">{icon}</div>
          </div>
        )}
      </div>
    </CardContent>
  )

  if (href) {
    return (
      <a href={href} className={`block hover:shadow-lg transition-all cursor-pointer ${className}`}>
        <Card className="h-full">{content}</Card>
      </a>
    )
  }

  return (
    <Card className={`h-full ${className}`}>
      {content}
    </Card>
  )
}
