'use client'

import { ReactNode } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { ErrorBoundary } from '@/components/dashboard/ErrorBoundary'
import AnnouncementsBanner from '@/components/AnnouncementsBanner'

interface DashboardShellProps {
  children: ReactNode
  showAnnouncements?: boolean
}

export function DashboardShell({ children, showAnnouncements = true }: DashboardShellProps) {
  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        {showAnnouncements && <AnnouncementsBanner />}
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </div>
    </DashboardLayout>
  )
}
