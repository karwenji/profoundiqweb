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
import { Award, TrendingUp, AlertTriangle, Flame, BookOpen } from 'lucide-react'
import { getCompetencies, getCompetencyMasteryForCompetency, calculateCourseCompetencies } from '@/lib/courseBuilder'
import { courses } from '@/data/courses'
import type { Competency, CompetencyMastery } from '@/types/courseWorkflow'

export default function CompetencyTrackingPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '')
  const [masteryData, setMasteryData] = useState<(Competency & { mastery?: number; trend?: string })[]>([])

  const enrolledCourses = courses

  useEffect(() => {
    if (!user || !selectedCourseId) return
    const competencies = getCompetencies(selectedCourseId)
    const mastery = competencies.map(comp => {
      const record = getCompetencyMasteryForCompetency(user.id, selectedCourseId, comp.id)
      return {
        ...comp,
        mastery: record?.masteryScore ?? 0,
        trend: record?.trend || 'stable',
      }
    })
    setMasteryData(mastery)
  }, [user, selectedCourseId])

  const overallMastery = masteryData.length > 0
    ? Math.round(masteryData.reduce((sum, c) => sum + (c.mastery || 0), 0) / masteryData.length)
    : 0

  const masteredCount = masteryData.filter(c => (c.mastery || 0) >= 80).length
  const atRiskCount = masteryData.filter(c => (c.mastery || 0) < 50 && (c.mastery || 0) > 0).length

  if (!user) return null

  return (
    <DashboardShell>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Award className="h-7 w-7 text-primary" /> Competency Tracker
          </h1>
          <p className="text-gray-500 text-sm mt-1">Track your mastery across learning objectives in each course.</p>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <label className="text-sm font-medium text-gray-700">Course:</label>
          <select
            value={selectedCourseId}
            onChange={e => setSelectedCourseId(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm bg-white"
          >
            {enrolledCourses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Award className="h-5 w-5 text-primary" />} label="Overall Mastery" value={`${overallMastery}%`} sub={`${masteredCount}/${masteryData.length} mastered`} />
          <StatCard icon={<Flame className="h-5 w-5 text-orange-500" />} label="Strengths" value={masteredCount.toString()} sub="At or above 80%" />
          <StatCard icon={<AlertTriangle className="h-5 w-5 text-red-500" />} label="At Risk" value={atRiskCount.toString()} sub="Below 50% — needs attention" />
          <StatCard icon={<BookOpen className="h-5 w-5 text-green-500" />} label="In Progress" value={(masteryData.length - masteredCount - atRiskCount).toString()} sub="Growing toward mastery" />
        </div>

        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold text-gray-900 mb-4">Competency Heatmap</h2>
            {masteryData.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Award className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No competencies defined for this course yet.</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => addToast('info', 'Competencies are set up by the instructor.')}>
                  Learn More
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {masteryData.map(comp => {
                  const mastery = comp.mastery || 0
                  const tier = mastery >= 80 ? 'green' : mastery >= 50 ? 'amber' : 'red'
                  return (
                    <div key={comp.id} className="border rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-gray-400">{comp.code}</span>
                            <p className="font-medium text-sm text-gray-900">{comp.label}</p>
                          </div>
                          <p className="text-xs text-gray-400 capitalize mt-0.5">{comp.taxonomyLevel} • weight: {comp.weight}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={tier === 'green' ? 'default' : tier === 'amber' ? 'secondary' : 'destructive'} className="text-xs">
                            {mastery >= 80 ? <><TrendingUp className="h-3 w-3 mr-1" />Mastered</> : mastery >= 50 ? 'In Progress' : <><AlertTriangle className="h-3 w-3 mr-1" />At Risk</>}
                          </Badge>
                          <span className={cn('text-lg font-bold w-12 text-right', tier === 'green' ? 'text-green-600' : tier === 'amber' ? 'text-amber-600' : 'text-red-600')}>
                            {Math.round(mastery)}%
                          </span>
                        </div>
                      </div>
                      <Progress value={mastery} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1.5 line-clamp-1">{comp.description}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">{icon}</div>
        <div>
          <p className="text-xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
          {sub && <p className="text-xs text-gray-400">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

export function CompetencyTrackingWrapper() {
  return (
    <ProtectedRoute>
      <CompetencyTrackingPage />
    </ProtectedRoute>
  )
}
