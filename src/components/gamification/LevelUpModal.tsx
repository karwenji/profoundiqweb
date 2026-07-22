'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Trophy, Star, Zap } from 'lucide-react'

interface LevelUpModalProps {
  open: boolean
  newLevel: number
  badgesEarned: { name: string; tier: string }[]
  onClose: () => void
}

export function LevelUpModal({ open, newLevel, badgesEarned, onClose }: LevelUpModalProps) {
  const [confetti, setConfetti] = useState<{ id: number; left: number; delay: number; color: string }[]>([])

  useEffect(() => {
    if (open) {
      const colors = ['#2563eb', '#16a34a', '#dc2626', '#f59e0b', '#8b5cf6']
      const items = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      }))
      setConfetti(items)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Level Up!</DialogTitle>
          <DialogDescription className="text-center">
            <div className="py-6">
              <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <p className="text-4xl font-bold text-gray-900 mb-2">Level {newLevel}</p>
              <p className="text-sm text-gray-500">You have reached a new level!</p>
            </div>
            {badgesEarned.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">Badges Earned</p>
                {badgesEarned.map((badge, idx) => (
                  <div key={idx} className="flex items-center gap-2 justify-center">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">{badge.name}</span>
                    <span className="text-xs text-gray-500 capitalize">({badge.tier})</span>
                  </div>
                ))}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        {confetti.map(item => (
          <div
            key={item.id}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${item.left}%`,
              backgroundColor: item.color,
              animation: `confetti-fall ${1 + item.delay}s ease-out forwards`,
              top: '-10px',
            }}
          />
        ))}
        <style jsx>{`
          @keyframes confetti-fall {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(400px) rotate(720deg); opacity: 0; }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  )
}
