'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { useToast } from '@/components/dashboard/Toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Flame, Clock, CheckCircle2, RefreshCw, Brain, AlertCircle } from 'lucide-react'
import { getDueReviews, getSpacedReviews, scheduleNextReview } from '@/lib/courseBuilder'
import type { SpacedReviewItem } from '@/types/courseWorkflow'

export default function SpacedRetrievalPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [dueReviews, setDueReviews] = useState<SpacedReviewItem[]>([])
  const [allReviews, setAllReviews] = useState<SpacedReviewItem[]>([])
  const [reviewing, setReviewing] = useState<string | null>(null)
  const [quality, setQuality] = useState(3)

  useEffect(() => {
    if (user) {
      setDueReviews(getDueReviews(user.id))
      setAllReviews(getSpacedReviews(user.id))
    }
  }, [user])

  const handleReview = (item: SpacedReviewItem) => {
    setReviewing(item.id)
    const updated = scheduleNextReview(item, quality)
    setDueReviews(getDueReviews(user?.id || ''))
    setAllReviews(getSpacedReviews(user?.id || ''))
    setReviewing(null)
    const labels = ['Very difficult', 'Difficult', 'Moderate', 'Easy', 'Very easy']
    addToast('success', `Reviewed! Next review in ${updated.intervalDays} day(s). (${labels[quality - 1]})`)
  }

  if (!user) return null

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Brain className="h-7 w-7 text-primary" /> Spaced Retrieval Practice
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Review material at optimal intervals to strengthen long-term retention. Based on the SM-2 spaced repetition algorithm.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Flame className="h-5 w-5 text-orange-500" />} label="Due Today" value={dueReviews.length.toString()} />
          <StatCard icon={<CheckCircle2 className="h-5 w-5 text-green-500" />} label="Total Reviews" value={allReviews.length.toString()} />
          <StatCard icon={<Clock className="h-5 w-5 text-blue-500" />} label="Avg Interval" value={allReviews.length > 0 ? `${Math.round(allReviews.reduce((a, b) => a + b.intervalDays, 0) / allReviews.length)}d` : '0d'} />
          <StatCard icon={<RefreshCw className="h-5 w-5 text-purple-500" />} label="Active Items" value={allReviews.filter(r => r.repetitions > 0).length.toString()} />
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-500" /> Due for Review ({dueReviews.length})
        </h2>

        {dueReviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <p className="text-gray-700 font-medium">All caught up!</p>
              <p className="text-sm text-gray-500 mt-1">No reviews are due right now. New items will appear as you complete lessons.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {dueReviews.map(item => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs capitalize">{item.contentType}</Badge>
                        <span className="text-xs text-gray-400">ID: {item.contentId}</span>
                      </div>
                      <p className="text-sm text-gray-700">Course: {item.courseId}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Repetitions: {item.repetitions}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Last interval: {item.intervalDays}d</span>
                        <span className="flex items-center gap-1"><Brain className="h-3 w-3" /> Mastery: {Math.round(item.masteryScore)}%</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-xs text-gray-400">How well did you recall this?</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(q => (
                          <button
                            key={q}
                            onClick={() => { setQuality(q); handleReview(item) }}
                            disabled={reviewing === item.id}
                            className={cn(
                              'h-8 w-8 rounded-full text-xs font-medium transition-colors',
                              quality === q ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                              reviewing === item.id && 'opacity-50'
                            )}
                            title={['Very difficult', 'Difficult', 'Moderate', 'Easy', 'Very easy'][q - 1]}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {allReviews.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Upcoming Schedule</h3>
            <div className="space-y-2">
              {allReviews
                .filter(r => !dueReviews.find(d => d.id === r.id))
                .sort((a, b) => new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime())
                .slice(0, 10)
                .map(item => (
                  <div key={item.id} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2">
                    <span className="text-gray-600 capitalize">{item.contentType}: {item.contentId}</span>
                    <span className="text-xs text-gray-400">{new Date(item.nextReviewAt).toLocaleDateString()}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">{icon}</div>
        <div>
          <p className="text-xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

export function SpacedRetrievalWrapper() {
  return (
    <ProtectedRoute>
      <SpacedRetrievalPage />
    </ProtectedRoute>
  )
}
