'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { FileText } from 'lucide-react'

function AuditLogsPage() {
  const { user } = useAuth()

  const logs = [
    { id: 1, action: 'User Login', user: 'admin@profoundiqconsulting.com', timestamp: '2 minutes ago', status: 'Success' },
    { id: 2, action: 'Course Created', user: 'sarah@profoundiqconsulting.com', timestamp: '1 hour ago', status: 'Success' },
    { id: 3, action: 'Payment Processed', user: 'student@profoundiqconsulting.com', timestamp: '3 hours ago', status: 'Success' },
    { id: 4, action: 'Failed Login', user: 'unknown@test.com', timestamp: '5 hours ago', status: 'Failed' },
    { id: 5, action: 'Role Updated', user: 'superadmin@profoundiqconsulting.com', timestamp: '1 day ago', status: 'Success' },
  ]

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Audit Logs</h1>
          <p className="text-gray-600">Track system activities and user actions.</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Action</th>
                    <th className="text-left py-3 px-4 font-semibold">User</th>
                    <th className="text-left py-3 px-4 font-semibold">Timestamp</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{log.action}</td>
                      <td className="py-3 px-4 text-gray-600">{log.user}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{log.timestamp}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          log.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default function AuditLogsPageWrapper() {
  return (
    <ProtectedRoute permission="audit_logs">
      <AuditLogsPage />
    </ProtectedRoute>
  )
}
