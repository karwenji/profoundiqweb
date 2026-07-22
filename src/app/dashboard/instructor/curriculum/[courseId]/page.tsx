'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { ModuleBuilder } from '@/components/course/ModuleBuilder'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/dashboard/Toast'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Course } from '@/types'
import { courses } from '@/data/courses'

export default function CurriculumBuilderPage({ params }: { params: { courseId: string } }) {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [modules, setModules] = useState<(any)[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const course = courses.find(c => c.id === params.courseId)

  const fetchCurriculum = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/courses/${params.courseId}/curriculum`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setModules(data.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [params.courseId])

  useEffect(() => {
    fetchCurriculum()
  }, [fetchCurriculum])

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      addToast('success', 'Curriculum saved successfully')
      setSaving(false)
    }, 800)
  }

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/instructor/courses">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Curriculum Builder</h1>
              <p className="text-gray-600 mt-1">{course?.title || 'Course'}</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Curriculum'}
          </Button>
        </div>

        <ModuleBuilder courseId={params.courseId} modules={modules} onSave={fetchCurriculum} />
      </div>
    </DashboardShell>
  )
}

export function CurriculumBuilderPageWrapper() {
  return (
    <ProtectedRoute permissions={['create_courses', 'edit_own_courses']}>
      <CurriculumBuilderPage params={{ courseId: '' }} />
    </ProtectedRoute>
  )
}
