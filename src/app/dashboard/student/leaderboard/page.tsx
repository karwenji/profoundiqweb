'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { LeaderboardTable } from '@/components/gamification/LeaderboardTable'
import { Card, CardContent } from '@/components/ui/card'
import { nextApi } from '@/lib/api/client'
import { useToast } from '@/components/dashboard/Toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface LeaderboardEntry {
  userId: string
  userName: string
  userAvatar?: string
  totalXP: number
  level: number
  currentStreak: number
  badgesCount: number
  rank: number
  score: number
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [scope, setScope] = useState('platform')
  const [period, setPeriod] = useState('alltime')

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({ scope, period })
        const result = await nextApi.get<{ success: boolean; data: LeaderboardEntry[] }>(`/api/gamification/leaderboard?${params.toString()}`)
        if (!cancelled) setEntries(result.data || [])
      } catch (err) {
        if (!cancelled) addToast('error', err instanceof Error ? err.message : 'Failed to load leaderboard')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [scope, period, addToast])

  return (
    <DashboardShell showAnnouncements={false}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
          <p className="text-gray-600 mt-1">See how you rank against other learners.</p>
        </div>
        <Tabs value={scope} onValueChange={setScope} className="space-y-4">
          <TabsList>
            <TabsTrigger value="platform">Platform</TabsTrigger>
            <TabsTrigger value="course">My Courses</TabsTrigger>
          </TabsList>
          <TabsContent value={scope}>
            {loading ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ) : entries.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-gray-500">No leaderboard data yet. Keep learning!</CardContent>
              </Card>
            ) : (
              <LeaderboardTable entries={entries} currentUserId={user?.id} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}
