'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Megaphone, X, ChevronRight } from 'lucide-react'

interface Announcement {
  id: string
  title: string
  body: string
  priority: string
  created_at: string
  created_by_name?: string
}

export default function AnnouncementsBanner() {
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const sessionKey = `announcements_${user.id}`
    const cached = sessionStorage.getItem(sessionKey)
    const cachedAt = sessionStorage.getItem(`${sessionKey}_ts`)

    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        setAnnouncements(parsed)
        const age = Date.now() - Number(cachedAt || 0)
        if (age < 60 * 1000) {
          setLoading(false)
          return
        }
      } catch {
        sessionStorage.removeItem(sessionKey)
      }
    }

    fetchAnnouncements()
  }, [user])

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/announcements', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const result = await response.json()
      if (result.success && Array.isArray(result.data)) {
        setAnnouncements(result.data)
        if (user?.id) {
          const sessionKey = `announcements_${user.id}`
          sessionStorage.setItem(sessionKey, JSON.stringify(result.data))
          sessionStorage.setItem(`${sessionKey}_ts`, String(Date.now()))
        }
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  const dismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id))
  }

  const visible = announcements.filter((a) => !dismissed.has(a.id))

  if (loading || visible.length === 0) return null

  return (
    <div className="space-y-3">
      {visible.map((announcement) => (
        <div
          key={announcement.id}
          className={`flex items-start gap-4 p-4 rounded-lg border ${
            announcement.priority === 'high'
              ? 'bg-red-50 border-red-200'
              : announcement.priority === 'normal'
                ? 'bg-blue-50 border-blue-200'
                : 'bg-gray-50 border-gray-200'
          }`}
        >
          <Megaphone
            className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
              announcement.priority === 'high' ? 'text-red-600' : 'text-blue-600'
            }`}
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-gray-900">{announcement.title}</h4>
            <p className="text-sm text-gray-700 mt-1 line-clamp-2">{announcement.body}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              <span>{announcement.created_by_name || 'Admin'}</span>
              <span>•</span>
              <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <button
            onClick={() => dismiss(announcement.id)}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
