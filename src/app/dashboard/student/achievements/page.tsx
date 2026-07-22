'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { XPBar } from '@/components/gamification/XPBar'
import { StreakCounter } from '@/components/gamification/StreakCounter'
import { BadgeShowcase } from '@/components/gamification/BadgeShowcase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trophy, Flame, Zap, Download, Share2 } from 'lucide-react'
import Link from 'next/link'
import type { Badge } from '@/types/courseWorkflow'
import { getAllBadges, getXPTransactionsForUser } from '@/lib/gamification/xp'
import { getCertificatesForUser, getTotalXPForUser, getOrCreateStreakRecord } from '@/lib/courseWorkflow'

export default function AchievementsPage() {
  const { user } = useAuth()
  const [badges, setBadges] = useState<Badge[]>([])
  const [certificates, setCertificates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const streakRecord = user?.id ? getOrCreateStreakRecord(user.id) : null
  const streak = {
    current: streakRecord?.currentStreak || 0,
    longestStreak: streakRecord?.longestStreak || 0,
    streakFreezes: streakRecord?.streakFreezes || 0,
  }

  const earnedBadgeIds = (user as any)?.badges || []
  const totalXP = getTotalXPForUser(user?.id || '')
  const level = Math.floor(Math.sqrt(totalXP / 100)) + 1

  useEffect(() => {
    if (!user?.id) return
    setBadges(getAllBadges())
    setCertificates(getCertificatesForUser(user.id))
    setLoading(false)
  }, [user?.id])

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell showAnnouncements={false}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Achievements</h1>
          <p className="text-gray-600 mt-1">Track your progress, badges, and certifications.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total XP</p>
                  <p className="text-2xl font-bold">{totalXP.toLocaleString()}</p>
                </div>
              </div>
              <XPBar currentXP={totalXP} level={level} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Flame className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Streak</p>
                  <p className="text-2xl font-bold">{streak.current || 0} days</p>
                </div>
                <div>
                  <StreakCounter currentStreak={streak.current || 0} longestStreak={streak.longestStreak || 0} streakFreezes={streak.streakFreezes || 0} size="lg" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Badges Earned</p>
                  <p className="text-2xl font-bold">{earnedBadgeIds.length} / {badges.length}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">Keep learning to unlock more badges!</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="badges" className="space-y-6">
          <TabsList>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
          </TabsList>
          <TabsContent value="badges">
            <Card>
              <CardContent className="pt-6">
                <BadgeShowcase badges={badges} earnedBadgeIds={earnedBadgeIds} columns={4} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="certificates">
            <Card>
              <CardContent className="pt-6">
                {certificates.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No certificates yet. Complete a course to earn your first certificate!</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {certificates.map(cert => (
                      <div key={cert.id} className="border rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Certificate #{cert.certificateNumber}</p>
                          <p className="text-sm text-gray-500">Issued {new Date(cert.issuedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-1" /> Download
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}

export function AchievementsPageWrapper() {
  return (
    <ProtectedRoute>
      <AchievementsPage />
    </ProtectedRoute>
  )
}
