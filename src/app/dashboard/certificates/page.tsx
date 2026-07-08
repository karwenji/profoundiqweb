'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { FileText, Download, Award } from 'lucide-react'

function StudentCertificatesPage() {
  const { user } = useAuth()

  const certificates = [
    { id: 1, course: 'Project Management Professional', date: 'Dec 15, 2025', grade: '95%' },
    { id: 2, course: 'Data Analytics Fundamentals', date: 'Oct 20, 2025', grade: '88%' },
    { id: 3, course: 'Business Communication Skills', date: 'Aug 5, 2025', grade: '92%' },
  ]

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Certificates</h1>
          <p className="text-gray-600">Download and share your course completion certificates.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <Card key={cert.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <Award className="h-6 w-6 text-yellow-600" />
                  </div>
                  <span className="text-sm font-semibold text-green-600">{cert.grade}</span>
                </div>
                <h3 className="font-bold mb-2">{cert.course}</h3>
                <p className="text-sm text-gray-600 mb-4">Completed on {cert.date}</p>
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" /> Download PDF
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {certificates.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No certificates yet</h3>
            <p className="text-gray-600">Complete a course to earn your first certificate!</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default function StudentCertificatesPageWrapper() {
  return (
    <ProtectedRoute>
      <StudentCertificatesPage />
    </ProtectedRoute>
  )
}
