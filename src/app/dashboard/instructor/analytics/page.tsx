'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { BarChart3, Users, Star, TrendingUp } from 'lucide-react'

function InstructorAnalyticsPage() {
  const { user } = useAuth()

  const metrics = [
    { label: 'Total Students', value: '1,245', change: '+15%', icon: Users },
    { label: 'Avg. Rating', value: '4.8/5', change: '+2%', icon: Star },
    { label: 'Completion Rate', value: '78%', change: '+5%', icon: TrendingUp },
    { label: 'Revenue', value: '$12,450', change: '+10%', icon: BarChart3 },
  ]

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Course Analytics</h1>
          <p className="text-gray-600">Track your course performance and student engagement.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric) => (
            <Card key={metric.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className="text-sm text-green-600">{metric.change}</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <metric.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-bold text-lg mb-4">Student Enrollment Trends</h3>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Chart visualization would go here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default function InstructorAnalyticsPageWrapper() {
  return (
    <ProtectedRoute permission="view_reports">
      <InstructorAnalyticsPage />
    </ProtectedRoute>
  )
}
