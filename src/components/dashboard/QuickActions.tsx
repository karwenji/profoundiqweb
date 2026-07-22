'use client'

import { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, GraduationCap, DollarSign, MessageSquare, Settings, ClipboardCheck, Award, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface QuickAction {
  label: string
  href?: string
  onClick?: () => void
  icon?: ReactNode
  variant?: 'default' | 'outline'
  description?: string
}

interface QuickActionsProps {
  title?: string
  actions: QuickAction[]
  className?: string
  columns?: 2 | 3 | 4
}

const iconMap: Record<string, ReactNode> = {
  book: <BookOpen className="h-4 w-4" />,
  graduation: <GraduationCap className="h-4 w-4" />,
  dollar: <DollarSign className="h-4 w-4" />,
  message: <MessageSquare className="h-4 w-4" />,
  settings: <Settings className="h-4 w-4" />,
  clipboard: <ClipboardCheck className="h-4 w-4" />,
  award: <Award className="h-4 w-4" />,
  trending: <TrendingUp className="h-4 w-4" />,
}

export function QuickActions({ title = 'Quick Actions', actions, className = '', columns = 3 }: QuickActionsProps) {
  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {actions.map((action, idx) => {
            const actionIcon = action.icon || iconMap[Object.keys(iconMap)[idx % Object.keys(iconMap).length]]
            if (action.href) {
              return (
                <Link key={idx} href={action.href}>
                  <Button
                    variant={action.variant || 'outline'}
                    className="w-full justify-start h-auto py-3 px-4"
                    onClick={action.onClick}
                  >
                    <div className="flex flex-col items-start gap-1 text-left">
                      <div className="flex items-center gap-2">
                        {actionIcon}
                        <span className="font-medium">{action.label}</span>
                      </div>
                      {action.description && <span className="text-xs text-gray-500 font-normal">{action.description}</span>}
                    </div>
                  </Button>
                </Link>
              )
            }
            return (
              <div key={idx}>
                <Button
                  variant={action.variant || 'outline'}
                  className="w-full justify-start h-auto py-3 px-4"
                  onClick={action.onClick}
                >
                  <div className="flex flex-col items-start gap-1 text-left">
                    <div className="flex items-center gap-2">
                      {actionIcon}
                      <span className="font-medium">{action.label}</span>
                    </div>
                    {action.description && <span className="text-xs text-gray-500 font-normal">{action.description}</span>}
                  </div>
                </Button>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
