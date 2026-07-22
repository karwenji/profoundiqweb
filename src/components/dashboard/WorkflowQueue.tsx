'use client'

import { ReactNode, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Clock, AlertTriangle, Eye, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NotificationType } from '@/types/communications'

export interface WorkflowItem {
  id: string
  type: NotificationType
  title: string
  description?: string
  timestamp: string
  metadata?: Record<string, unknown>
  actions?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline' | 'destructive'
    icon?: ReactNode
  }[]
}

interface WorkflowQueueProps {
  title: string
  items: WorkflowItem[]
  emptyTitle?: string
  emptyDescription?: string
  onViewAll?: () => void
  viewAllLabel?: string
  className?: string
  maxItems?: number
}

const priorityIcons: Record<NotificationType, ReactNode> = {
  approval: <AlertTriangle className="h-4 w-4 text-orange-500" />,
  message: <MessageSquare className="h-4 w-4 text-blue-500" />,
  announcement: <AlertTriangle className="h-4 w-4 text-purple-500" />,
  system: <Clock className="h-4 w-4 text-gray-500" />,
  enrollment: <CheckCircle className="h-4 w-4 text-green-500" />,
  payment: <Clock className="h-4 w-4 text-yellow-500" />,
}

function formatTimeAgo(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export function WorkflowQueue({
  title,
  items,
  emptyTitle = 'No items',
  emptyDescription = 'There are no items in this queue right now.',
  onViewAll,
  viewAllLabel = 'View all',
  className = '',
  maxItems = 5,
}: WorkflowQueueProps) {
  const [expanded, setExpanded] = useState(false)
  const visibleItems = expanded ? items : items.slice(0, maxItems)
  const hasMore = items.length > maxItems

  if (items.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <span className="text-sm bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">0</span>
          </div>
          <p className="text-sm text-gray-500">{emptyDescription}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <span className="text-sm bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
              {items.length}
            </span>
          </div>
          {onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              {viewAllLabel}
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {visibleItems.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="mt-0.5 flex-shrink-0">{priorityIcons[item.type] || <Clock className="h-4 w-4 text-gray-500" />}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                  {item.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-400">{formatTimeAgo(item.timestamp)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                {item.actions?.map((action, idx) => (
                  <Button
                    key={idx}
                    size="sm"
                    variant={action.variant || 'outline'}
                    onClick={action.onClick}
                    className="whitespace-nowrap"
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="w-full mt-4 text-gray-600"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show {items.length - maxItems} more
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
