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
import { nextApi } from '@/lib/api/client'
import { useToast } from '@/components/dashboard/Toast'

interface GamificationOverview {
  totalXP: number
  level: number
  streak: { current_streak: number; longest_streak: number; streak_freezes: number }
  badgesEarned: number
}

interface EarnedBadge {
  id: string
  badge_id: string
  name: string
  description: string
  icon: string
  tier: string
  category: string
  earned_at: string
  course_id?: string
}

interface Certificate {
  id: string
  certificate_number: string
  issued_at: string
  course_title?: string
  course_thumbnail?: string
  download_url?: string
  verification_url?: string
}

export default function AchievementsPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [badges, setBadges] = useState<Badge[]>([])
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [overview, setOverview] = useState<GamificationOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('badges')

  useEffect(() => {
    if (!user?.id) return
    let cancelled = false
    const fetchData = async () => {
      try {
        setLoading(true)
        const [badgesRes, earnedRes, certRes, overviewRes] = await Promise.all([
          nextApi.get<{ success: boolean; data: Badge[] }>('/api/gamification/badges'),
          nextApi.get<{ success: boolean; data: EarnedBadge[] }>('/api/gamification/badges/earned'),
          nextApi.get<{ success: boolean; data: Certificate[] }>('/api/gamification/certificates'),
          nextApi.get<{ success: boolean; data: GamificationOverview }>('/api/gamification/overview'),
        ])

        if (!cancelled) {
          setBadges(badgesRes.data || [])
          setEarnedBadges(earnedRes.data || [])
          setCertificates(certRes.data || [])
          setOverview(overviewRes.data || null)
        }
      } catch (err) {
        if (!cancelled) addToast('error', err instanceof Error ? err.message : 'Failed to load achievements')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [user?.id, addToast])

  const totalXP = overview?.totalXP || 0
  const level = overview?.level || 1
  const streak = overview?.streak || { current_streak: 0, longest_streak: 0, streak_freezes: 0 }
  const earnedBadgeIds = earnedBadges.map(b => b.badge_id)

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
                  <p className="text-2xl font-bold">{streak.current_streak || 0} days</p>
                </div>
                <div>
                  <StreakCounter currentStreak={streak.current_streak || 0} longestStreak={streak.longest_streak || 0} streakFreezes={streak.streak_freezes || 0} size="lg" />
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

        <Tabs defaultValue="badges" className="space-y-6" value={activeTab} onValueChange={setActiveTab}>
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
                          <p className="font-medium text-gray-900">Certificate #{cert.certificate_number}</p>
                          <p className="text-sm text-gray-500">Issued {new Date(cert.issued_at).toLocaleDateString()}</p>
                          {cert.course_title && <p className="text-sm text-gray-600">{cert.course_title}</p>}
                        </div>
                        <div className="flex gap-2">
                          {cert.download_url && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={cert.download_url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-1" /> Download
                              </a>
                            </Button>
                          )}
                          {cert.verification_url && (
                            <Button size="sm" variant="ghost" asChild>
                              <a href={cert.verification_url} target="_blank" rel="noopener noreferrer">
                                <Share2 className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
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
