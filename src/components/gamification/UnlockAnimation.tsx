'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Sparkles, BookOpen, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UnlockAnimationProps {
  open: boolean
  title: string
  description: string
  type?: 'module' | 'course' | 'bonus'
  onClose: () => void
  onContinue?: () => void
}

export function UnlockAnimation({ open, title, description, type = 'module', onClose, onContinue }: UnlockAnimationProps) {
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (open) {
      setAnimating(true)
      const timer = setTimeout(() => setAnimating(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [open])

  const icons = {
    module: <BookOpen className="h-12 w-12 text-blue-600" />,
    course: <Trophy className="h-12 w-12 text-yellow-600" />,
    bonus: <Sparkles className="h-12 w-12 text-purple-600" />,
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="py-6 text-center">
            <div className={cn('mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50', animating && 'animate-bounce')}>
              {icons[type]}
            </div>
            <DialogTitle className="text-2xl mb-2">{title}</DialogTitle>
            <DialogDescription className="text-sm">{description}</DialogDescription>
          </div>
        </DialogHeader>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={onClose}>Close</Button>
          {onContinue && <Button onClick={onContinue}>Continue</Button>}
        </div>
      </DialogContent>
    </Dialog>
  )
}
