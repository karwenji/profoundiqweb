'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { BarChart3, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

function AdminReportsPage() {
  const { user } = useAuth()

  const reports = [
    { name: 'Monthly Revenue Report', date: 'July 2026', type: 'Financial' },
    { name: 'Student Enrollment Summary', date: 'July 2026', type: 'Enrollment' },
    { name: 'Course Performance Analysis', date: 'June 2026', type: 'Performance' },
    { name: 'Instructor Activity Report', date: 'June 2026', type: 'Activity' },
  ]

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Reports</h1>
            <p className="text-gray-600">View and download platform reports.</p>
          </div>
          <Button>
            <Download className="mr-2 h-4 w-4" /> Export All
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {reports.map((report) => (
            <Card key={report.name}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold">{report.name}</h3>
                      <p className="text-sm text-gray-600">{report.date}</p>
                      <span className="inline-block mt-2 px-2 py-1 bg-gray-100 rounded text-xs">{report.type}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function AdminReportsPageWrapper() {
  return (
    <ProtectedRoute>
      <AdminReportsPage />
    </ProtectedRoute>
  )
}
