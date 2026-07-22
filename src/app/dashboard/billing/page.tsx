'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { CreditCard, Download, FileText } from 'lucide-react'

function StudentBillingPage() {
  const { user } = useAuth()

  const transactions = [
    { id: 1, description: 'Leadership Excellence Program', date: 'Jan 15, 2026', amount: '$299.00', status: 'Paid' },
    { id: 2, description: 'Digital Marketing Mastery', date: 'Feb 1, 2026', amount: '$249.00', status: 'Paid' },
    { id: 3, description: 'Project Management Professional', date: 'Nov 10, 2025', amount: '$349.00', status: 'Paid' },
  ]

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Billing & Payments</h1>
          <p className="text-gray-600">View your payment history and manage billing information.</p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <h3 className="font-bold text-lg mb-4">Payment Method</h3>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <CreditCard className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">Visa ending in 4242</p>
                  <p className="text-sm text-gray-600">Expires 12/2027</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Update</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-bold text-lg mb-4">Transaction History</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Description</th>
                    <th className="text-left py-3 px-4 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{tx.description}</td>
                      <td className="py-3 px-4 text-gray-600">{tx.date}</td>
                      <td className="py-3 px-4 font-semibold">{tx.amount}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4 mr-2" /> PDF
                        </Button>
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

export default function StudentBillingPageWrapper() {
  return (
    <ProtectedRoute permission="access_billing">
      <StudentBillingPage />
    </ProtectedRoute>
  )
}
