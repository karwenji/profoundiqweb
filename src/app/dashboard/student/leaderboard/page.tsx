'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { LeaderboardTable } from '@/components/gamification/LeaderboardTable'
import { Card, CardContent } from '@/components/ui/card'
import { getLeaderboard } from '@/lib/courseWorkflow'

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<any[]>([])

  useEffect(() => {
    const data = getLeaderboard('platform', 'alltime')
    setEntries(data)
  }, [])

  return (
    <DashboardShell showAnnouncements={false}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
          <p className="text-gray-600 mt-1">See how you rank against other learners.</p>
        </div>
        <LeaderboardTable entries={entries} currentUserId={user?.id} />
      </div>
    </DashboardShell>
  )
}

export function LeaderboardPageWrapper() {
  return (
    <ProtectedRoute>
      <LeaderboardPage />
    </ProtectedRoute>
  )
}
