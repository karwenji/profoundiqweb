'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'

function AdminSettingsRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/dashboard/admin/settings/general')
  }, [router])
  return null
}

export default function AdminSettingsPageWrapper() {
  return (
    <ProtectedRoute permission="system_settings">
      <AdminSettingsRedirect />
    </ProtectedRoute>
  )
}
