'use client'

import { ReactNode, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Clock, Eye, ChevronDown, ChevronUp, User, BookOpen, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ApprovalItem {
  id: string
  title: string
  description?: string
  submittedBy?: string
  submittedAt: string
  category?: string
  level?: string
  metadata?: Record<string, unknown>
  status?: 'pending' | 'approved' | 'rejected'
}

interface ApprovalCardProps {
  item: ApprovalItem
  onApprove?: () => void
  onReject?: () => void
  onView?: () => void
  actions?: ReactNode
  expanded?: boolean
  onToggleExpand?: () => void
  children?: ReactNode
  className?: string
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

export function ApprovalCard({
  item,
  onApprove,
  onReject,
  onView,
  actions,
  expanded = false,
  onToggleExpand,
  children,
  className = '',
}: ApprovalCardProps) {
  const statusColor =
    item.status === 'approved'
      ? 'bg-green-100 text-green-800'
      : item.status === 'rejected'
        ? 'bg-red-100 text-red-800'
        : 'bg-yellow-100 text-yellow-800'

  const statusLabel =
    item.status === 'approved'
      ? 'Approved'
      : item.status === 'rejected'
        ? 'Rejected'
        : 'Pending'

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-gray-900 truncate">{item.title}</h4>
              <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', statusColor)}>{statusLabel}</span>
            </div>
            {item.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>}
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
              {item.submittedBy && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {item.submittedBy}
                </span>
              )}
              {item.category && (
                <span className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {item.category}
                </span>
              )}
              {item.level && (
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {item.level}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTimeAgo(item.submittedAt)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {onView && (
              <Button size="sm" variant="outline" onClick={onView}>
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {actions}
            {!item.status && (
              <>
                {onApprove && (
                  <Button size="sm" onClick={onApprove}>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                )}
                {onReject && (
                  <Button size="sm" variant="outline" onClick={onReject}>
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                )}
              </>
            )}
            {onToggleExpand && (
              <Button size="sm" variant="ghost" onClick={onToggleExpand}>
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
        {expanded && children && <div className="mt-4 pt-4 border-t">{children}</div>}
      </CardContent>
    </Card>
  )
}
